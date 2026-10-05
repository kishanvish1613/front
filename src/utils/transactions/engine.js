// src/utils/transactions/engine.js
import {
  forceWholeRupees,
  rint,
  ymd,
  isWorkingDay,
  PSYCHO
} from './common.js';

import { buildKotakDesc } from './banks/kotak.js';
import { sbinewdesc, sbi2desc } from './banks/sbi.js';
import { buildHdfcDesc } from './banks/hdfc.js';
import { buildHdfcCurrentDesc } from './banks/hdfcCurrent.js';
import { buildAxisDesc } from './banks/axis.js';
import { buildBoiDesc } from './banks/boi.js';
import { genericdesc } from './banks/generic.js';

// ================== CATEGORY DEFINITIONS ==================
export const CATS = {
  rent:           { freq:[1,1],   avg:20000, min:10000, max:35000, dom:[10,11,12,13,14,15], time:[9,11] },
  electricity:    { freq:[1,1],   avg:2100,  min:500,   max:5000,  dom:[12,13,14,15,16,17,18,19,20], time:[9,17] },
  groceries:      { freq:[2,6],   avg:1500,  min:200,   max:5000,  dow:[5,6,0], time:[17,21] },
  fuel:           { freq:[4,8],   avg:500,   min:200,   max:3000,  dow:[1,2,3,4,5], time:[8,11] },
  food:           { freq:[20,40], avg:250,   min:50,    max:1200,  dow:[0,1,2,3,4,5,6], time:[12,14,19,22] },
  shopping:       { freq:[1,4],   avg:2500,  min:500,   max:15000, dow:[5,6,0], time:[11,20] },
  transport:      { freq:[5,15],  avg:300,   min:50,    max:800,   dow:[1,2,3,4,5], time:[7,22] },
  entertainment:  { freq:[1,3],   avg:1200,  min:200,   max:5000,  dow:[4,5,6,0], time:[18,23] },
  medical:        { freq:[0,1],   avg:2500,  min:200,   max:10000, time:[9,18] },
  education:      { freq:[0,1],   avg:2000,  min:300,   max:8000,  time:[10,20] },
  insurance:      { freq:[0,1],   avg:3000,  min:1000,  max:8000,  dom:[15], time:[9,17] },
  online:         { freq:[0,3],   avg:1500,  min:300,   max:8000,  dow:[5,6,0], time:[8,22] },
  atm:            { freq:[1,4],   avg:2000,  min:500,   max:5000,  dow:[1,2,3,4,5], time:[7,22] },
  misc:           { freq:[0,2],   avg:1000,  min:50,    max:5000 }
};

export function descForBank(type, cat, company, details, bank, rng) {
  const b = (bank || '').toUpperCase();
  if (type === 'INTEREST') {
    if (b.startsWith('SBINEW')) return { desc: 'INTEREST CREDIT', ref: '-' };
    return { desc: 'INTEREST', ref: '' };
  }
  if (b.startsWith('KOTAK')) return buildKotakDesc(type, cat, company, details, rng);
  if (b.startsWith('SBINEW')) return sbinewdesc(type, cat, company, details, rng);
  if (b.startsWith('SBI')) return sbi2desc(type, company, rng);
  if (b === 'HDFCCURRENT') return buildHdfcCurrentDesc(type, cat, company, details, rng);
  if (b.startsWith('HDFC')) return buildHdfcDesc(type, cat, company, details, rng);
  if (b.startsWith('AXIS')) return buildAxisDesc(type, cat, company, details, rng);
  if (b.startsWith('BOI')) return buildBoiDesc(type, cat, company, details, rng);
  return genericdesc(type, cat, company, rng);
}

export function getSalaryDay(year, month, targetDay = 1) {
  const d = new Date(Date.UTC(year, month, targetDay));
  while (!isWorkingDay(d)) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

export function distributeMonthlyTargets(monthCount, minTx, maxTx) {
  const targets = [];
  for (let i = 0; i < monthCount; i++) targets.push(Math.round((minTx + maxTx) / 2));
  return targets;
}

export function buildHumanizedBusinessCredits(requiredAmount, days, rng, months, startDate, isBusiness = false) {
  if (requiredAmount <= 0) return [];
  const workingDays = days.filter(d => d.working).map(d => d.date).sort((a,b)=>a-b);
  const monthBuckets = [];
  for (let m = 0; m < months; m++) {
    const monthStart = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + m, 1));
    const monthEnd = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + m + 1, 0));
    const monthDays = workingDays.filter(d => d >= monthStart && d <= monthEnd);
    monthBuckets.push({ days: monthDays, total: 0 });
  }
  const totalWorkingDays = monthBuckets.reduce((s, b) => s + b.days.length, 0);
  if (totalWorkingDays === 0) throw new Error('No working days in the statement period.');

  let allocated = 0;
  for (let i = 0; i < monthBuckets.length - 1; i++) {
    const share = Math.round(requiredAmount * monthBuckets[i].days.length / totalWorkingDays);
    monthBuckets[i].total = share;
    allocated += share;
  }
  monthBuckets[monthBuckets.length - 1].total = requiredAmount - allocated;

  const credits = [];
  for (const bucket of monthBuckets) {
    if (bucket.total <= 0 || bucket.days.length === 0) continue;
    
    if (!isBusiness) {
      // Personal / savings account: 1-2 realistic major inflows (e.g. primary inflow on 1st-5th, optional secondary on 15th-20th)
      const numCredits = (bucket.total > 1500000 && rng() < 0.45 && bucket.days.length >= 2) ? 2 : 1;
      if (numCredits === 1) {
        // Schedule on one of the first 5 working days of the month
        const earlyDays = bucket.days.slice(0, Math.min(5, bucket.days.length));
        const txDay = earlyDays[Math.floor(rng() * earlyDays.length)];
        credits.push({ date: txDay, amount: forceWholeRupees(bucket.total), type: 'CREDIT' });
      } else {
        const p1 = forceWholeRupees(Math.round(bucket.total * (0.65 + rng() * 0.15)));
        const p2 = bucket.total - p1;
        const earlyDays = bucket.days.slice(0, Math.min(5, bucket.days.length));
        const midDays = bucket.days.slice(Math.floor(bucket.days.length * 0.45), Math.floor(bucket.days.length * 0.75));
        const d1 = earlyDays[Math.floor(rng() * earlyDays.length)];
        const d2 = (midDays.length > 0) ? midDays[Math.floor(rng() * midDays.length)] : bucket.days[bucket.days.length - 1];
        credits.push({ date: d1, amount: p1, type: 'CREDIT' });
        credits.push({ date: d2, amount: p2, type: 'CREDIT' });
      }
    } else {
      // Business account: 3-8 realistic client settlements / vendor payouts
      const maxCredits = Math.min(12, bucket.days.length);
      const numCredits = Math.min(bucket.days.length, rint(3, Math.max(3, maxCredits), rng));
      const minPer = Math.min(100000, Math.floor(bucket.total / numCredits));
      const maxPer = Math.max(minPer, bucket.total - minPer * (numCredits - 1));
      const amounts = splitVariedAmount(bucket.total, numCredits, minPer, maxPer, rng);
      
      for (let i = 0; i < numCredits; i++) {
        const dayIdx = Math.min(bucket.days.length - 1, Math.floor(i * bucket.days.length / numCredits));
        const txDay = bucket.days[dayIdx];
        credits.push({ date: txDay, amount: amounts[i], type: 'CREDIT' });
      }
    }
  }
  return credits;
}

export function splitVariedAmount(total, n, min, max, rng, depth = 0) {
  if (depth > 5) {
    const part = Math.max(100, forceWholeRupees(total / n));
    return Array(n).fill(part);
  }
  if (n <= 0) throw new Error('Cannot split amount into 0 parts.');
  let safeMin = Math.max(100, forceWholeRupees(min));
  let safeMax = Math.max(safeMin, forceWholeRupees(max));
  if (total <= 0) return Array(n).fill(0);
  if (total < safeMin * n) {
    safeMin = Math.max(100, Math.floor(total / n));
  }
  if (total > safeMax * n) {
    safeMax = Math.max(safeMin, Math.ceil(total / n) * 2);
  }
  const parts = [];
  let remaining = total;
  for (let i = 0; i < n - 1; i++) {
    const left = n - i - 1;
    const low = Math.max(safeMin, remaining - safeMax * left);
    const high = Math.min(safeMax, remaining - safeMin * left);
    let amount;
    if (rng() < 0.4) {
      amount = low + Math.floor(rng() * (high - low + 1));
    } else {
      const psychCandidates = PSYCHO.map(v => v * 100).filter(v => v >= low && v <= high);
      if (psychCandidates.length > 0) {
        amount = psychCandidates[Math.floor(rng() * psychCandidates.length)];
      } else {
        amount = low + Math.floor(rng() * (high - low + 1));
      }
    }
    amount = forceWholeRupees(amount);
    if (amount < safeMin) amount = safeMin;
    if (amount > safeMax) amount = safeMax;
    parts.push(amount);
    remaining -= amount;
  }
  let last = forceWholeRupees(remaining);
  if (last < safeMin) last = safeMin;
  if (last > safeMax) last = safeMax;
  parts.push(last);
  const sum = parts.reduce((a,b)=>a+b,0);
  let diff = total - sum;
  if (diff !== 0) {
    let lastPart = parts[parts.length - 1];
    lastPart += diff;
    lastPart = forceWholeRupees(lastPart);
    if (lastPart < safeMin) {
      for (let i = parts.length - 2; i >= 0 && lastPart < safeMin; i--) {
        const needed = safeMin - lastPart;
        const take = Math.min(parts[i] - safeMin, needed);
        if (take > 0) {
          parts[i] -= take;
          lastPart += take;
        }
      }
      lastPart = Math.max(lastPart, safeMin);
    } else if (lastPart > safeMax) {
      for (let i = parts.length - 2; i >= 0 && lastPart > safeMax; i--) {
        const excess = lastPart - safeMax;
        const give = Math.min(safeMax - parts[i], excess);
        if (give > 0) {
          parts[i] += give;
          lastPart -= give;
        }
      }
      lastPart = Math.min(lastPart, safeMax);
    }
    parts[parts.length - 1] = lastPart;
  }
  for (let i = 0; i < parts.length; i++) {
    parts[i] = forceWholeRupees(parts[i]);
    if (parts[i] < safeMin) parts[i] = safeMin;
    if (parts[i] > safeMax) parts[i] = safeMax;
  }
  return parts;
}

export function buildDebitsExact(totalD, monthlyTxTargets, days, rng, empType, startDate) {
  const MONTHS = monthlyTxTargets.length;
  const weights = empType === 'salaried'
    ? monthlyTxTargets.map(() => 0.98 + rng()*0.04)
    : monthlyTxTargets.map(() => 0.85 + rng()*0.3);
  const totalWeight = weights.reduce((a,b)=>a+b,0);
  const monthlyBudgets = weights.map(w => Math.round(totalD * w / totalWeight));
  let sum = monthlyBudgets.reduce((a,b)=>a+b,0);
  let diff = totalD - sum;
  for (let i=0; i<MONTHS && diff !== 0; i++) {
    monthlyBudgets[i] += diff > 0 ? 1 : -1;
    sum += diff > 0 ? 1 : -1;
    if (sum === totalD) break;
  }
  monthlyBudgets[MONTHS-1] += totalD - monthlyBudgets.reduce((a,b)=>a+b,0);
  const allPlanned = [];
  for (let m=0; m<MONTHS; m++) {
    const ms = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth()+m, 1));
    const me = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth()+m+1, 0));
    generateMonthDebitsHumanized(monthlyBudgets[m], monthlyTxTargets[m], ms, me, days, allPlanned, rng, empType);
  }
  return allPlanned;
}

export function generateMonthDebitsHumanized(monthBudget, txTarget, monthStart, monthEnd, days, allPlanned, rng, empType) {
  const catList = Object.keys(CATS);
  const counts = {};

  // 1. Single-occurrence / low-frequency categories
  counts.rent = (empType === 'salaried' && monthBudget >= 400000) ? 1 : 0;
  counts.electricity = monthBudget >= 100000 ? 1 : 0;
  counts.insurance = (rng() < 0.25 && monthBudget >= 200000) ? 1 : 0;
  counts.medical = (rng() < 0.20 && monthBudget >= 150000) ? 1 : 0;
  counts.education = (rng() < 0.15 && monthBudget >= 150000) ? 1 : 0;

  const fixedCount = Object.values(counts).reduce((a,b)=>a+b, 0);
  let variableCount = Math.max(0, txTarget - fixedCount);

  // 2. Daily/regular spending frequencies
  const freqWeights = {
    food: 0.38,
    groceries: 0.18,
    transport: 0.14,
    fuel: 0.12,
    online: 0.06,
    atm: 0.04,
    shopping: 0.04,
    entertainment: 0.02,
    misc: 0.02
  };

  const varCats = Object.keys(freqWeights);
  let allocatedVar = 0;
  for (const c of varCats) {
    const raw = Math.floor(variableCount * freqWeights[c]);
    counts[c] = raw;
    allocatedVar += raw;
  }
  let remVar = variableCount - allocatedVar;
  const priorityOrder = ['food', 'groceries', 'transport', 'fuel', 'shopping'];
  let pIdx = 0;
  while (remVar > 0) {
    counts[priorityOrder[pIdx % priorityOrder.length]]++;
    remVar--;
    pIdx++;
  }

  // 3. Category budget allocations
  const catBudgets = {};
  let remainingBudget = monthBudget;

  if (counts.rent > 0) {
    const rentAmt = forceWholeRupees(Math.min(Math.round(monthBudget * 0.30), 2500000));
    catBudgets.rent = Math.max(100000, rentAmt);
    remainingBudget -= catBudgets.rent;
  }
  if (counts.electricity > 0) {
    const elec = forceWholeRupees(Math.min(Math.round(monthBudget * 0.06), 350000));
    catBudgets.electricity = Math.max(50000, elec);
    remainingBudget -= catBudgets.electricity;
  }
  if (counts.insurance > 0) {
    const ins = forceWholeRupees(Math.min(Math.round(monthBudget * 0.05), 300000));
    catBudgets.insurance = Math.max(50000, ins);
    remainingBudget -= catBudgets.insurance;
  }
  if (counts.medical > 0) {
    const med = forceWholeRupees(Math.min(Math.round(monthBudget * 0.04), 200000));
    catBudgets.medical = Math.max(30000, med);
    remainingBudget -= catBudgets.medical;
  }
  if (counts.education > 0) {
    const edu = forceWholeRupees(Math.min(Math.round(monthBudget * 0.04), 200000));
    catBudgets.education = Math.max(30000, edu);
    remainingBudget -= catBudgets.education;
  }

  if (remainingBudget < 0) remainingBudget = 0;

  const spendWeights = {
    food: 0.28,
    shopping: 0.20,
    groceries: 0.20,
    atm: 0.12,
    fuel: 0.10,
    online: 0.05,
    transport: 0.03,
    entertainment: 0.01,
    misc: 0.01
  };

  const activeVarCats = varCats.filter(c => (counts[c] || 0) > 0);
  const totalSpendWeight = activeVarCats.reduce((s, c) => s + (spendWeights[c] || 0.01), 0);

  let allocatedSpend = 0;
  for (const c of activeVarCats) {
    const w = (spendWeights[c] || 0.01) / totalSpendWeight;
    const b = forceWholeRupees(Math.round(remainingBudget * w));
    catBudgets[c] = b;
    allocatedSpend += b;
  }
  const diffSpend = remainingBudget - allocatedSpend;
  if (diffSpend !== 0 && activeVarCats.length > 0) {
    catBudgets[activeVarCats[0]] = Math.max(100, (catBudgets[activeVarCats[0]] || 0) + diffSpend);
  }

  // 4. Generate transaction amounts per category
  const monthDebits = [];
  for (const cat of catList) {
    const cnt = counts[cat] || 0;
    const bgt = catBudgets[cat] || 0;
    if (cnt <= 0 || bgt <= 0) continue;
    const spec = CATS[cat];
    const effectiveMin = Math.min(forceWholeRupees(Math.round(spec.min * 100)), Math.max(100, Math.floor(bgt / cnt)));
    const effectiveMax = Math.max(effectiveMin, Math.ceil(bgt / cnt) * 2, forceWholeRupees(Math.round(spec.max * 100)));
    const amounts = splitVariedAmount(bgt, cnt, effectiveMin, effectiveMax, rng);
    for (const amt of amounts) {
      const pref = getPreferredDate(cat, monthStart, monthEnd, days, spec, rng);
      monthDebits.push({ amount: amt, cat, prefDate: pref });
    }
  }

  while (monthDebits.length < txTarget) {
    const amt = forceWholeRupees(rint(10000, 30000, rng));
    monthDebits.push({ amount: amt, cat: 'misc', prefDate: getPreferredDate('misc', monthStart, monthEnd, days, CATS.misc, rng) });
  }
  while (monthDebits.length > txTarget) {
    const idx = monthDebits.findIndex(d => d.cat === 'misc' || d.cat === 'food');
    if (idx !== -1) monthDebits.splice(idx, 1);
    else monthDebits.pop();
  }
  allPlanned.push(...monthDebits);
}

export function simulate(days, plannedDebits, allCredits, openingBalance, MIN_BAL,
  DLIM, CLIM, MAX_SINGLE, bank, company, details, rng, getId) {
  const debitMap = new Map(), creditMap = new Map();
  for (const p of plannedDebits) {
    const k = ymd(p.prefDate);
    if (!debitMap.has(k)) debitMap.set(k, []);
    debitMap.get(k).push({ amount:p.amount, cat:p.cat });
  }
  for (const c of allCredits) {
    const k = ymd(c.date);
    if (!creditMap.has(k)) creditMap.set(k, []);
    creditMap.get(k).push({ amount:c.amount, type:c.type });
  }
  const txns = [];
  let bal = openingBalance;
  const dayD = new Map(), dayC = new Map();
  let pending = [];
  for (const day of days) {
    const d = day.date, key = day.key;
    const creds = creditMap.get(key) || [];
    for (const c of creds) {
      let rem = c.amount;
      while (rem > 0) {
        const todayC = dayC.get(key) || 0;
        const limit = c.type==='SALARY' ? Infinity : CLIM;
        const allow = Math.min(rem, limit - todayC);
        if (allow <= 0) {
          let next = new Date(d); next.setUTCDate(next.getUTCDate()+1);
          while (next <= days[days.length-1].date && !isWorkingDay(next)) next.setUTCDate(next.getUTCDate()+1);
          if (next <= days[days.length-1].date) {
            const nk = ymd(next);
            if (!creditMap.has(nk)) creditMap.set(nk, []);
            creditMap.get(nk).push({ amount:rem, type:c.type });
          }
          break;
        }
        dayC.set(key, todayC + allow);
        bal += allow;
        if (allow > 0) {
          const descObj = descForBank(c.type, null, company, details, bank, rng);
          txns.push({
            id: getId(),
            date: addTime(d, c.type, rng, true).toISOString(),
            description: descObj.desc,
            reference: descObj.ref || '',
            type: c.type === 'SALARY' ? 'SALARY' : 'CREDIT',
            category: c.type,
            debit:0, credit:allow,
            balance: bal
          });
        }
        rem -= allow;
      }
    }
    const plannedToday = debitMap.get(key) || [];
    const pendingToday = pending.filter(p => ymd(p.prefDate) === key);
    pending = pending.filter(p => ymd(p.prefDate) !== key);
    const allToday = plannedToday.concat(pendingToday).sort((a,b)=>{
      const prio={rent:3,electricity:3,insurance:3,fuel:2,groceries:2,atm:1};
      return (prio[b.cat]||0)-(prio[a.cat]||0);
    });
    for (const item of allToday) {
      let rem = item.amount;
      while (rem > 0) {
        const todayD = dayD.get(key) || 0;
        const room = Math.max(0, bal - MIN_BAL);
        const maxToday = Math.min(rem, MAX_SINGLE, DLIM - todayD, room);
        if (maxToday < 100) {
          let next = new Date(d); next.setUTCDate(next.getUTCDate()+1);
          while (next <= days[days.length-1].date && !isWorkingDay(next)) next.setUTCDate(next.getUTCDate()+1);
          const sameMonth = next <= days[days.length-1].date && next.getUTCMonth() === d.getUTCMonth();
          if (sameMonth) {
            pending.push({ amount:rem, cat:item.cat, prefDate:next });
          } else {
            const possible = Math.min(rem, Math.max(0, bal - MIN_BAL), DLIM - (dayD.get(key)||0));
            if (possible >= 100) {
              dayD.set(key, (dayD.get(key)||0) + possible);
              bal -= possible;
              const descObj = descForBank('DEBIT', item.cat, company, details, bank, rng);
              txns.push({
                id: getId(),
                date: addTime(d, item.cat, rng, false).toISOString(),
                description: descObj.desc,
                reference: descObj.ref || '',
                type:'DEBIT',
                category: item.cat,
                debit: possible,
                credit:0,
                balance: bal
              });
            }
            rem = 0;
          }
          break;
        }
        dayD.set(key, todayD + maxToday);
        bal -= maxToday;
        if (maxToday > 0) {
          const descObj = descForBank('DEBIT', item.cat, company, details, bank, rng);
          txns.push({
            id: getId(),
            date: addTime(d, item.cat, rng, false).toISOString(),
            description: descObj.desc,
            reference: descObj.ref || '',
            type:'DEBIT',
            category: item.cat,
            debit: maxToday,
            credit:0,
            balance: bal
          });
        }
        rem -= maxToday;
      }
    }
  }
  return txns;
}

export function buildMonthlyInterest(txns, openingBalance, startDate, endDate, rng, getId) {
  const interestTxns = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cur <= end) {
    const monthStart = new Date(cur);
    const monthEnd = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 0));
    if (monthEnd > end) {
      cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
      continue;
    }
    const history = [];
    let runningBal = openingBalance;
    for (const tx of txns) {
      runningBal += (tx.credit || 0) - (tx.debit || 0);
      if (new Date(tx.date) >= monthStart && new Date(tx.date) <= monthEnd) {
        history.push({ date: new Date(tx.date), balance: runningBal });
      }
    }
    if (history.length === 0) history.push({ balance: openingBalance });
    const avgDaily = history.reduce((sum, item) => sum + item.balance, 0) / history.length;

    const rate = 0.0002 + rng() * 0.0078;
    let interest = Math.round(avgDaily * rate / 12);
    interest = Math.max(1000, Math.min(interest, 20000));

    if (interest > 0) {
      let interestDate = new Date(Date.UTC(monthEnd.getUTCFullYear(), monthEnd.getUTCMonth(), Math.min(25, monthEnd.getUTCDate())));
      if (!isWorkingDay(interestDate)) {
        let d = new Date(interestDate);
        while (!isWorkingDay(d)) d.setUTCDate(d.getUTCDate() - 1);
        interestDate.setTime(d.getTime());
      }
      if (interestDate <= end) {
        interestTxns.push({
          id: getId(),
          date: addTime(interestDate, 'INTEREST', rng).toISOString(),
          description: 'CREDIT INTEREST--',
          reference: '',
          type: 'INTEREST',
          category: 'misc',
          debit: 0,
          credit: interest,
          balance: 0,
        });
      }
    }
    cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1));
  }
  return interestTxns;
}

export function getPreferredDate(cat, ms, me, days, spec, rng) {
  const monthDays = days.filter(d=>d.date>=ms && d.date<=me && d.working);
  const suit = monthDays.filter(d=>{
    const dow=d.date.getUTCDay(), dom=d.date.getUTCDate();
    return (!spec.dow||spec.dow.includes(dow)) && (!spec.dom||spec.dom.includes(dom));
  });
  if (suit.length) return suit[Math.floor(rng()*suit.length)].date;
  if (monthDays.length) return monthDays[Math.floor(rng()*monthDays.length)].date;
  return new Date(me);
}

export function addTime(date, type, rng, isCredit = undefined) {
  const d = new Date(date);
  if (isCredit === true || type === 'SALARY') {
    d.setUTCHours(rint(0, 11, rng), rint(0, 59, rng), rint(0, 59, rng), rint(0, 999, rng));
  } else if (isCredit === false) {
    d.setUTCHours(rint(12, 23, rng), rint(0, 59, rng), rint(0, 59, rng), rint(0, 999, rng));
  } else {
    const spec = CATS[type] || { time: [9, 20] };
    const time = Array.isArray(spec.time) && spec.time.length >= 2 ? spec.time : [9, 20];
    let h = rint(time[0], time[1], rng);
    if (type === 'food' && rng() < 0.4) h = rint(19, 22, rng);
    d.setUTCHours(h, rint(0, 59, rng), rint(0, 59, rng), rint(0, 999, rng));
  }
  return d;
}

export function validateStatement(txns, openingBalance, endBalance, expectedTx, months, minTx, maxTx, salary, salaryCnt, startDate, endDate, isBusiness = false) {
  let b = openingBalance;
  for (let i = 0; i < txns.length; i++) {
    b += (txns[i].credit || 0) - (txns[i].debit || 0);
    b = Math.round(b * 100) / 100;
    if (Math.abs(txns[i].balance - b) > 0.02) {
      throw new Error(`Balance mismatch at transaction #${i+1}.`);
    }
  }
  if (Math.abs(b - endBalance) > 1) {
    console.warn(`Closing balance difference: ₹${(b - endBalance).toFixed(2)}`);
  }
  const monthKeys = [];
  let cursor = new Date(startDate);
  const limit = new Date(endDate);
  while (cursor <= limit) {
    monthKeys.push(cursor.toISOString().slice(0, 7));
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  for (const monthKey of monthKeys) {
    const monthDebits = txns.filter(t => t.type === 'DEBIT' && t.date.startsWith(monthKey)).length;
    if (monthDebits < minTx || monthDebits > maxTx) {
      throw new Error(`Debit count for ${monthKey} is ${monthDebits}, must be between ${minTx} and ${maxTx}.`);
    }
  }
  let r = openingBalance;
  for (const tx of txns) {
    r += (tx.credit||0) - (tx.debit||0);
    r = Math.round(r * 100) / 100;
    if (r < 0) throw new Error(`Negative balance after transaction "${tx.description}".`);
  }
  const salTxns = txns.filter(t=>t.type==='SALARY');
  if (salTxns.length !== salaryCnt) throw new Error(`Salary count mismatch.`);
  for (const tx of salTxns) {
    if (Math.abs(tx.credit - salary) > 0.01) throw new Error(`Salary amount incorrect.`);
  }
  for (let i=1; i<txns.length; i++) {
    if (new Date(txns[i].date) < new Date(txns[i-1].date)) throw new Error(`Transactions not sorted.`);
  }
  const ids = new Set();
  for (const tx of txns) {
    if (ids.has(tx.id)) throw new Error(`Duplicate ID: ${tx.id}`);
    ids.add(tx.id);
  }
  const stamps = new Set();
  for (const tx of txns) {
    if (stamps.has(tx.date)) throw new Error(`Duplicate timestamp: ${tx.date}`);
    stamps.add(tx.date);
  }
  const maxScale = isBusiness ? Math.max(openingBalance * 100, endBalance * 100, 1000000000) / 100 : 20000000 / 100;
  const DAILY_LIMIT = isBusiness ? maxScale * 2 : 20000000 / 100;
  const dMap = new Map(), cMap = new Map();
  for (const tx of txns) {
    const dk = tx.date.slice(0,10);
    if (tx.debit) {
      const tot = (dMap.get(dk)||0) + tx.debit;
      if (tot > DAILY_LIMIT + 0.01) throw new Error(`Daily debit limit exceeded on ${dk}.`);
      dMap.set(dk, tot);
    }
    if (tx.credit && tx.type!=='SALARY') {
      const tot = (cMap.get(dk)||0) + tx.credit;
      if (tot > DAILY_LIMIT + 0.01) throw new Error(`Daily credit limit exceeded on ${dk}.`);
      cMap.set(dk, tot);
    }
  }
  console.log(`✓ Validation passed: ${txns.length} txn, ending ₹${b.toFixed(2)}`);
}

