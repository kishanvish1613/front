import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTransactions } from '../src/utils/transactionGenerator.js';

test('generateTransactions closes to the requested end balance for a salaried sample', () => {
  const txns = generateTransactions({
    salary: 25000,
    openingBalance: 12000,
    endBalance: 48000,
    salaryCompanyName: 'Test Co',
    minTxMonth: 3,
    maxTxMonth: 8,
    periodMonths: 3,
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    employmentType: 'salaried',
    bank: 'SBINEW',
    details: { branchName: 'Main', branchLocation: 'Bhopal', ifsc: 'SBIN0016450' },
    seed: 1,
  });

  assert.ok(txns.length > 0, 'expected at least one transaction');
  const finalBalance = txns[txns.length - 1].balance;
  assert.ok(Math.abs(finalBalance - 48000) < 0.01, `expected ending balance 48000, received ${finalBalance}`);
});

test('generateTransactions does not emit sub-rupee transactions for self-employed samples', () => {
  const txns = generateTransactions({
    salary: 0,
    openingBalance: 100000,
    endBalance: 400000,
    salaryCompanyName: 'Test Co',
    minTxMonth: 3,
    maxTxMonth: 8,
    periodMonths: 6,
    startDate: '2025-08-01',
    endDate: '2025-12-31',
    employmentType: 'selfEmployed',
    bank: 'SBINEW',
    details: { branchName: 'Main', branchLocation: 'Bhopal', ifsc: 'SBIN0016450' },
    seed: 3,
  });

  const subRupee = txns.filter((tx) => (tx.debit > 0 && tx.debit < 1) || (tx.credit > 0 && tx.credit < 1));
  assert.equal(subRupee.length, 0, 'expected no sub-rupee transaction amounts');
});
