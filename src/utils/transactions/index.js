// src/utils/transactions/index.js
import {
  mulberry32,
  utcDay,
  ymd,
  isWorkingDay,
  forceWholeRupees,
  rd
} from './common.js';

import {
  distributeMonthlyTargets,
  getSalaryDay,
  buildHumanizedBusinessCredits,
  buildDebitsExact,
  simulate,
  buildMonthlyInterest,
  validateStatement
} from './engine.js';

import { enrichKotakTransactions, getKotakSalaryDay } from './banks/kotak.js';
import { enrichSbiTransactions, enrichSbinewTransactions } from './banks/sbi.js';
import { enrichUnionBank } from './banks/unionBank.js';
import { enrichHdfcTransactions } from './banks/hdfc.js';
import { enrichHdfcCurrentTransactions } from './banks/hdfcCurrent.js';
import { enrichAxisTransactions } from './banks/axis.js';
import { enrichBoiTransactions } from './banks/boi.js';
import { enrichAuTransactions } from './banks/au.js';

export function generateTransactions({
  salary, openingBalance, endBalance, salaryCompanyName,
  minTxMonth, maxTxMonth, periodMonths, startDate, endDate,
  employmentType = 'salaried',
  bank = '', details = {},
  seed = Date.now()
}) {
  const rng = mulberry32(seed);
  const S = utcDay(startDate), E = utcDay(endDate);
  const MONTHS = (E.getUTCFullYear()-S.getUTCFullYear())*12 + E.getUTCMonth()-S.getUTCMonth()+1;

  if (MONTHS <= 0) throw new Error(
    'The statement period must cover at least one month.\n' +
    'Solution: Ensure the "From Date" is before the "To Date".'
  );
  if (minTxMonth > maxTxMonth) throw new Error(
    'Min Tx/Month cannot be greater than Max Tx/Month.\n' +
    'Solution: Set Min Tx/Month <= Max Tx/Month.'
  );
  if (openingBalance < 0 || endBalance < 0) throw new Error(
    'Opening and Closing balances must be non‑negative.\n' +
    'Solution: Enter valid amounts.'
  );

  const OPEN_P = Math.round(openingBalance * 100);
  const END_P = Math.round(endBalance * 100);
  const SALARY_P = Math.round(salary * 100);

  const isCurrentAccount = (employmentType === 'currentAccount' || bank === 'HDFCCURRENT' || (bank || '').toUpperCase().includes('CURRENT'));
  const isBusiness = isCurrentAccount || employmentType === 'selfEmployed';

  const maxScale = isBusiness ? Math.max(OPEN_P, END_P, 1000000000) : 50000000;   // Scale to commercial amounts
  const MAX_SINGLE_DEBIT = maxScale;
  const DAILY_DEBIT_LIMIT = isBusiness ? maxScale * 2 : 50000000;
  const DAILY_CREDIT_LIMIT = isBusiness ? maxScale * 2 : 50000000;
  const MIN_BAL = 100;

  let txId = 0;
  const getId = () => `tx-${(seed + ++txId).toString(16).padStart(8,'0')}`;

  // Calendar
  const days = [];
  for (let d = new Date(S); d <= E; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = new Date(d);
    days.push({ date, key: ymd(date), working: isWorkingDay(date) });
  }
  if (days.length === 0) throw new Error(
    'No days in the selected date range.\n' +
    'Solution: Choose a valid date range.'
  );

  // Salary credits
  const salaryCredits = [];
  if (employmentType === 'salaried' && salary > 0) {
    const isKotak = (bank || '').toUpperCase().startsWith('KOTAK');
    const preferredDay = isKotak ? getKotakSalaryDay() : 1;
    for (let m = 0; m < MONTHS; m++) {
      let salDate = getSalaryDay(S.getUTCFullYear(), S.getUTCMonth() + m, preferredDay);
      if (salDate < S && S.getUTCDate() <= preferredDay + 2) {
        salDate = new Date(S);
        while (!isWorkingDay(salDate)) salDate.setUTCDate(salDate.getUTCDate() + 1);
      }
      if (salDate >= S && salDate <= E) salaryCredits.push({ date: salDate, amount: SALARY_P, type: 'SALARY' });
    }
  }
  const totalSalaryCredits = salaryCredits.reduce((s, c) => s + c.amount, 0);

  // Transaction count targets
  const monthlyTxTargets = distributeMonthlyTargets(MONTHS, minTxMonth, maxTxMonth);

  // Minimum total debit
  const MIN_AVG_DEBIT = 50000;
  const D_min = MONTHS * minTxMonth * MIN_AVG_DEBIT;

  let D = Math.max(0, OPEN_P + totalSalaryCredits - END_P);
  D = Math.max(D, D_min);

  let txns = [], businessCredits = [], interestTotal = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const neededBusiness = Math.max(0, END_P + D - OPEN_P - totalSalaryCredits - interestTotal);
    const maxMonthlyBusiness = isBusiness ? Math.max(10000000000, maxScale * 5) : 50000000;
    if (neededBusiness > maxMonthlyBusiness * MONTHS) {
      throw new Error(
        `The required ${isBusiness ? 'business turnover' : 'income'} (₹${(neededBusiness/100).toFixed(2)}) is too large.\n` +
        `Solution: Increase the target closing balance more gradually, or increase the opening balance.`
      );
    }
    businessCredits = buildHumanizedBusinessCredits(neededBusiness, days, rng, MONTHS, S, isBusiness);

    const plannedDebits = buildDebitsExact(D, monthlyTxTargets, days, rng, employmentType, S);

    const allCredits = [...salaryCredits, ...businessCredits];
    txns = simulate(days, plannedDebits, allCredits, OPEN_P, MIN_BAL,
      DAILY_DEBIT_LIMIT, DAILY_CREDIT_LIMIT, MAX_SINGLE_DEBIT,
      bank, salaryCompanyName, details, rng, getId);

    const interestTxns = buildMonthlyInterest(txns, OPEN_P, S, E, rng, getId);
    txns.push(...interestTxns);
    txns.sort((a,b) => new Date(a.date) - new Date(b.date));

    interestTotal = interestTxns.reduce((sum, tx) => sum + (tx.credit || 0), 0);

    let bal = OPEN_P;
    for (const tx of txns) bal += (tx.credit||0) - (tx.debit||0);
    const error = END_P - bal;
    if (Math.abs(error) <= 100) break;
    D = Math.max(0, D + (bal - END_P));
  }

  // Force whole rupees on non-interest transactions
  for (const tx of txns) {
    if (tx.type !== 'INTEREST') {
      tx.debit = forceWholeRupees(tx.debit);
      tx.credit = forceWholeRupees(tx.credit);
    }
  }

  // Recompute balances
  txns.sort((a,b) => new Date(a.date) - new Date(b.date));
  let bal = OPEN_P;
  for (const tx of txns) {
    bal += (tx.credit||0) - (tx.debit||0);
    tx.balance = bal;
  }

  // Exact closing balance reconciliation
  const finalError = END_P - bal;
  if (finalError !== 0) {
    const lastDebit = [...txns].reverse().find(tx => tx.type === 'DEBIT');
    if (lastDebit && (lastDebit.debit - finalError) >= 100) {
      lastDebit.debit -= finalError;
    } else {
      const lastInterest = [...txns].reverse().find(tx => tx.type === 'INTEREST');
      if (lastInterest) {
        lastInterest.credit += finalError;
      }
    }
    txns.sort((a,b) => new Date(a.date) - new Date(b.date));
    bal = OPEN_P;
    for (const tx of txns) {
      bal += (tx.credit||0) - (tx.debit||0);
      tx.balance = bal;
    }
  }

  // Convert to rupees
  for (const tx of txns) {
    tx.debit = tx.debit / 100;
    tx.credit = tx.credit / 100;
    tx.balance = tx.balance / 100;
  }

  const filtered = txns.filter((tx) => (tx.debit > 0 || tx.credit > 0));
  const used = new Set();
  for (const tx of filtered) {
    while (used.has(tx.date)) {
      const d = new Date(tx.date);
      d.setMilliseconds(d.getMilliseconds() + 1);
      tx.date = d.toISOString();
    }
    used.add(tx.date);
  }

  const txnsFinal = filtered;
  validateStatement(txnsFinal, openingBalance, endBalance, 0, MONTHS, minTxMonth, maxTxMonth, salary, salaryCredits.length, S, E, isBusiness);

  // Bank-specific enrichments
  const b = (bank || '').toUpperCase();
  if (b.startsWith('KOTAK')) {
    enrichKotakTransactions(txnsFinal, details, salaryCompanyName, rng);
  } else if (b.startsWith('SBINEW')) {
    enrichSbinewTransactions(txnsFinal, details, salaryCompanyName, rng);
  } else if (b.startsWith('SBI')) {
    enrichSbiTransactions(txnsFinal, details, rng);
  } else if (b.startsWith('UNIONBANK')) {
    enrichUnionBank(txnsFinal, details, salaryCompanyName, rng);
  } else if (b === 'HDFCCURRENT') {
    enrichHdfcCurrentTransactions(txnsFinal, details, salaryCompanyName, rng);
  } else if (b.startsWith('HDFC')) {
    enrichHdfcTransactions(txnsFinal, details, salaryCompanyName, rng);
  } else if (b.startsWith('AXIS')) {
    enrichAxisTransactions(txnsFinal, details, salaryCompanyName, rng);
  } else if (b.startsWith('BOI')) {
    enrichBoiTransactions(txnsFinal, details, salaryCompanyName, rng);
  } else if (b.startsWith('AU')) {
    enrichAuTransactions(txnsFinal, details, salaryCompanyName, rng);
  }

  // Final mathematical integrity pass
  let runBal = Math.round(openingBalance * 100) / 100;
  for (const tx of txnsFinal) {
    runBal = Math.round((runBal + (tx.credit || 0) - (tx.debit || 0)) * 100) / 100;
    tx.balance = runBal;
  }

  return txnsFinal;
}

