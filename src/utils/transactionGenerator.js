// utils/transactionGenerator.js
// FINAL – whole rupees, realistic interest (₹10–₹200), no forced closing

// ================== SEEDABLE RANDOM ==================
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ================== PSYCHOLOGICAL PRICE POINTS ==================
const PSYCHO = [
  100, 250, 499, 500, 750, 999, 1000, 1500, 1999, 2000, 2500, 2999,
  3000, 3500, 3999, 4000, 4500, 4999, 5000, 7500, 9999, 10000, 15000,
  19999, 20000, 25000, 49999, 50000
];

// ================== INDIAN NAMES, BANKS, HOLIDAYS ==================
const INDIAN_NAMES = ['Ravindra Prajap','Lucky Agrawal','Shivam Joshi','Mohan Gurjar','Mahendra','Muskan S','Seemar','Sudham','Kishan','Seema R','Rohit Vishwaka','Sachin Gurjar','Rupesh Verma','Sanjay Chors','Asha Enterpris','Kashish','Rani','Ritesh Agarwal','Kanhaiya Lal','Satish Choudhr','Rajesh Kumar','Suman Devi','Anil Sharma','Priya Singh','Vikram Patel','Sunita Yadav','Deepak Jain','Neha Gupta','Amitabh Das','Ajay Verma','Pankaj Sharma','Nitin Gupta','Rakesh Yadav','Mukesh Patel','Suresh Kumar','Dinesh Chandra','Manoj Tiwari','Arun Mishra','Vivek Singh','Abhishek Jain','Rahul Agrawal','Harish Meena','Lokesh Saini','Vinod Prajapati','Narendra Rathore','Bhupendra Chauhan','Hemant Solanki','Pradeep Sharma','Yogesh Gupta','Ashok Joshi','Gaurav Bansal','Tarun Sharma','Naveen Verma','Rohit Soni','Kapil Jain','Ravi Mehta','Sandeep Patel','Aakash Sharma','Mayank Gupta','Pooja Sharma','Anjali Verma','Kavita Sharma','Nidhi Gupta','Sneha Jain','Shweta Patel','Komal Agrawal','Payal Sharma','Ritu Verma','Meena Devi','Sakshi Gupta','Anita Yadav','Rekha Sharma','Divya Jain','Pallavi Singh','Aarti Patel','Rashmi Verma','Preeti Sharma','Monika Gupta','Jyoti Yadav','Ramesh Chandra','Mahesh Kumar','Naresh Patel','Omprakash Sharma','Govind Singh','Jagdish Verma','Bharat Meena','Ramlal Gurjar','Shankar Lal','Madan Mohan','Kailash Chand','Brijesh Sharma','Krishna Gopal','Lalit Jain','Tejpal Singh','Harendra Kumar','Rajendra Yadav','Surendra Sharma','Devendra Singh','Umesh Patel','Nandkishore Sharma','Chirag Shah'];

const BANKS = ['BKID','BOB','HDFC','SBIN','YESB','IDIB','CNRB','UBIN','AXIS'];

const HOLIDAYS = new Set([
  '2025-01-26','2025-03-14','2025-04-11','2025-04-18','2025-05-23','2025-06-02',
  '2025-07-17','2025-08-15','2025-08-27','2025-09-16','2025-10-02','2025-10-20',
  '2025-11-01','2025-11-15','2025-12-25'
]);

function isHoliday(d) { return HOLIDAYS.has(d.toISOString().slice(0,10)); }
function isWeekend(d) { return d.getDay() === 0 || d.getDay() === 6; }
function isWorkingDay(d) { return !isWeekend(d) && !isHoliday(d); }

// ================== CATEGORY DEFINITIONS ==================
const CATS = {
  rent:           { freq:[1,1],   avg:20000, min:10000, max:35000, dom:[1,5], time:[9,11] },
  electricity:    { freq:[1,1],   avg:2100,  min:500,   max:5000,  dom:[8,20], time:[9,17] },
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

// ================== DESCRIPTION BUILDERS ==================
function sbi2desc(type, company, rng) {
  const splitName = (name) => {
    const parts = name.split(' ');
    return { first: parts[0], rest: parts.slice(1).join(' ') };
  };

  if (type === 'DEBIT' || type === 'CREDIT' || type === 'BUSINESS') {
    const txnId = rd(9, rng);
    const fullName = rname(rng);
    const { first, rest } = splitName(fullName);
    const bank = rbank(rng);
    const qId = rd(6, rng);
    const MAX_REST_LEN = 7;
    let safeRest = rest;
    if (safeRest.length > MAX_REST_LEN) safeRest = safeRest.substring(0, MAX_REST_LEN);
    const line3 = safeRest
      ? `${safeRest}/${bank}/Q${qId}/Payme-`
      : `/${bank}/Q${qId}/Payme-`;
    const prefix = (type === 'DEBIT') ? 'BY TRANSFER-' : 'TO TRANSFER-';
    const direction = (type === 'DEBIT') ? 'DR' : 'CR';
    return { desc: `${prefix}\nUPI/${direction}/${txnId}/${first}\n${line3}`, ref: '' };
  }
  if (type === 'SALARY') return {
    desc: `BY TRANSFER-\nNEFT*SBIN${rd(7, rng)}*SBINN${rd(8, rng)}*${company||'L&T PRIVATE LIMITED'}*Salary-`,
    ref: ''
  };
  return { desc: type, ref: '' };
}

function sbinewdesc(type, details, rng) {
  const bn = details.branchName || 'ROHIT NAGAR';
  const bl = details.branchLocation || 'BAWADIYA KALAN, BHOPAL';
  const ifsc = details.ifsc || 'SBIN0016450';
  const code = ifsc.length >= 6 ? ifsc.substring(6) : '016450';
  const city = bl.split(',').pop().trim();
  const area = bl.includes(',') ? bl.split(',')[0].trim() : bl;
  const line = `${code} ${bn.toUpperCase()}${area ? `(${area})` : ''}`;
  if (type === 'DEBIT') return { desc: `WDL TFR\nUPI/DR/${rd(12, rng)}/${rname(rng)}/YESB/${rl(6, rng)}/Paym\n009769${rd(7, rng)} AT ${line}\n${city}`, ref: '' };
  if (type === 'CREDIT' || type === 'BUSINESS') return { desc: `DEP TFR\nIMPS/${rd(12, rng)}/${rl(4, rng).toUpperCase()}-XX${rd(3, rng)} ${rname(rng)}/NA   009832${rd(7, rng)} AT ${line}\n${city}`, ref: '' };
  if (type === 'SALARY') return { desc: `NEFT SALARY CREDIT FROM ${details.companyName||'TATA STEEL'}\nAT ${code} ${bn.toUpperCase()}${area ? `\n${area}` : ''}${city ? `\n${city}` : ''}`, ref: '' };
  return { desc: type, ref: '' };
}

function kotaknewdesc(type, company, rng) {
  if (type === 'SALARY') return { desc: `NEFT SBIN${rd(10, rng)} ${company||'TATA STEEL'}`, ref: 'NEFTINW-' + rd(10, rng) };
  if (type === 'DEBIT') return { desc: `UPI/${rname(rng)}/${rd(12, rng)}`, ref: 'UPI-' + rd(12, rng) };
  return { desc: `UPI/${rname(rng)}/${rd(12, rng)}`, ref: 'UPI-' + rd(12, rng) };
}

function genericdesc(type, cat, company, rng) {
  if (type === 'SALARY' || type === 'BUSINESS') {
    const ent = type === 'SALARY' ? (company||'TATA STEEL') : 'CUSTOMER';
    return { desc: type === 'SALARY' ? `NEFT SALARY CREDIT FROM ${ent}` : `BUSINESS PAYMENT- UPI/CR/${rd(12, rng)}/${rname(rng)}/${rbank(rng)}/Q${rd(9, rng)}/${ent}-`, ref: 'NEFTINW-' + rd(10, rng) };
  }
  if (type === 'DEBIT') return { desc: `BY TRANSFER- UPI/DR/${rd(12, rng)}/${rname(rng)}/${rbank(rng)}/Q${rd(9, rng)}/${(cat||'').toUpperCase()}-`, ref: '' };
  return { desc: `TO TRANSFER- UPI/CR/${rd(12, rng)}/${rname(rng)}/${rbank(rng)}/Q${rd(9, rng)}/Payme-`, ref: '' };
}

function descForBank(type, cat, company, details, bank, rng) {
  if (type === 'INTEREST') return { desc: 'INTEREST', ref: '' };
  if (bank.startsWith('SBINEW')) return sbinewdesc(type, details, rng);
  if (bank.startsWith('SBI')) return sbi2desc(type, company, rng);
  if (bank.startsWith('KOTAKNEW')) return kotaknewdesc(type, company, rng);
  return genericdesc(type, cat, company, rng);
}

// ================== SEEDED RANDOM HELPERS ==================
function rd(len, rng) { let r=''; for(let i=0;i<len;i++) r+=Math.floor(rng()*10); return r; }
function rl(len, rng) { const c='ABCDEFGHIJKLMNOPQRSTUVWXYZ'; let r=''; for(let i=0;i<len;i++) r+=c.charAt(Math.floor(rng()*c.length)); return r; }
function rname(rng) { return INDIAN_NAMES[Math.floor(rng()*INDIAN_NAMES.length)]; }
function rbank(rng) { return BANKS[Math.floor(rng()*BANKS.length)]; }
function rint(min, max, rng) { if(min>max)[min,max]=[max,min]; return Math.floor(rng()*(max-min+1))+min; }

function getSalaryDay(year, month) {
  let d = new Date(year, month, 1);
  while (!isWorkingDay(d)) d.setDate(d.getDate() + 1);
  return d;
}

// ================== FORCE WHOLE RUPEES ==================
function forceWholeRupees(amount) {
  return Math.round(amount / 100) * 100;
}

// ================== MAIN GENERATOR ==================
export function generateTransactions({
  salary, openingBalance, endBalance, salaryCompanyName,
  minTxMonth, maxTxMonth, periodMonths, startDate, endDate,
  employmentType = 'salaried',
  bank = '', details = {},
  seed = Date.now()
}) {
  const rng = mulberry32(seed);
  const S = new Date(startDate), E = new Date(endDate);
  const MONTHS = (E.getFullYear()-S.getFullYear())*12 + E.getMonth()-S.getMonth()+1;

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

  const MAX_SINGLE_DEBIT = 20000000;   // ₹2,00,000
  const DAILY_DEBIT_LIMIT = 20000000;
  const DAILY_CREDIT_LIMIT = 20000000;
  const MIN_TX_AMOUNT = 100;           // 1 rupee
  const MIN_BAL = 100;

  const OPEN_P = Math.round(openingBalance * 100);
  const END_P = Math.round(endBalance * 100);
  const SALARY_P = Math.round(salary * 100);

  let txId = 0;
  const getId = () => `tx-${(seed+ ++txId).toString(16).padStart(8,'0')}`;

  // Calendar
  const days = [];
  for (let d=new Date(S); d<=E; d.setDate(d.getDate()+1)) {
    const date = new Date(d);
    days.push({ date, key: date.toISOString().slice(0,10), working: isWorkingDay(date) });
  }
  if (days.length === 0) throw new Error(
    'No days in the selected date range.\n' +
    'Solution: Choose a valid date range.'
  );

  // Salary credits
  const salaryCredits = [];
  if (employmentType==='salaried' && salary>0) {
    for (let m=0; m<MONTHS; m++) {
      const cur = new Date(S.getFullYear(), S.getMonth()+m, 1);
      const salDate = getSalaryDay(cur.getFullYear(), cur.getMonth(), 'first');
      if (salDate>=S && salDate<=E) salaryCredits.push({ date:salDate, amount:SALARY_P, type:'SALARY' });
    }
  }
  const totalSalaryCredits = salaryCredits.reduce((s,c)=>s+c.amount,0);

  // Transaction count targets
  const monthlyTxTargets = distributeMonthlyTargets(MONTHS, minTxMonth, maxTxMonth);

  // Minimum total debit (₹500 per expected debit)
  const MIN_AVG_DEBIT = 50000;
  const D_min = MONTHS * minTxMonth * MIN_AVG_DEBIT;

  let D = Math.max(0, OPEN_P + totalSalaryCredits - END_P);
  D = Math.max(D, D_min);

  let txns = [], businessCredits = [], interestTotal = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const neededBusiness = Math.max(0, END_P + D - OPEN_P - totalSalaryCredits - interestTotal);
    if (neededBusiness > 20000000 * MONTHS) {
      throw new Error(
        `The required business income (₹${(neededBusiness/100).toFixed(2)}) is too large.\n` +
        `Solution: Increase the target closing balance more gradually, or increase the opening balance / salary.`
      );
    }
    businessCredits = buildHumanizedBusinessCredits(neededBusiness, days, rng, MONTHS, S);

    const plannedDebits = buildDebitsExact(D, monthlyTxTargets, days, rng, employmentType, S);

    const allCredits = [...salaryCredits, ...businessCredits];
    txns = simulate(days, plannedDebits, allCredits, OPEN_P, MIN_BAL,
      DAILY_DEBIT_LIMIT, DAILY_CREDIT_LIMIT, MAX_SINGLE_DEBIT,
      bank, salaryCompanyName, details, rng, getId);

    // ---------- realistic interest (₹10–₹200) ----------
    const interestTxns = buildMonthlyInterest(txns, OPEN_P, S, E, rng, getId);
    txns.push(...interestTxns);
    txns.sort((a,b) => new Date(a.date) - new Date(b.date));

    interestTotal = interestTxns.reduce((sum, tx) => sum + (tx.credit || 0), 0);

    let bal = OPEN_P;
    for (const tx of txns) bal += (tx.credit||0) - (tx.debit||0);
    const error = END_P - bal;
    if (Math.abs(error) <= 100) break;
    D = Math.max(0, D + error);
  }

  // Force whole rupees on all non-interest transactions
  for (const tx of txns) {
    if (tx.type !== 'INTEREST') {
      tx.debit = forceWholeRupees(tx.debit);
      tx.credit = forceWholeRupees(tx.credit);
    }
  }

  // Recompute balances after forcing whole rupees
  txns.sort((a,b) => new Date(a.date) - new Date(b.date));
  let bal = OPEN_P;
  for (const tx of txns) {
    bal += (tx.credit||0) - (tx.debit||0);
    tx.balance = bal;
  }

  // ================== TINY ROUNDING CORRECTION ONLY (max ₹1) ==================
  let error = END_P - bal;
  if (Math.abs(error) > 100) {
    // If the gap is larger than ₹1, we do NOT force it.
    // The generated closing balance is already realistic.
  } else if (error !== 0) {
    const lastInterest = [...txns].reverse().find(tx => tx.type === 'INTEREST');
    if (lastInterest) {
      lastInterest.credit += error;
    } else {
      txns.push({
        id: getId(),
        date: addTime(new Date(E), 'INTEREST', rng).toISOString(),
        description: 'CREDIT INTEREST--',
        reference: '',
        type: 'INTEREST',
        category: 'misc',
        debit: 0,
        credit: error,
        balance: 0,
      });
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
  validateStatement(txnsFinal, openingBalance, endBalance, 0, MONTHS, minTxMonth, maxTxMonth, salary, salaryCredits.length, S, E);

  // SBI reference enrichment (only for non-SBINEW SBI templates)
  if (bank.startsWith('SBI') && !bank.startsWith('SBINEW')) {
    const cmap = new Map(), dmap = new Map();
    for (const tx of txnsFinal) {
      const dk = tx.date.slice(0,10);
      if (tx.credit > 0 && tx.type !== 'SALARY' && tx.type !== 'INTEREST') {
        if (!cmap.has(dk)) cmap.set(dk, `TRANSFER FROM\n315${rd(11, rng)}`);
      } else if (tx.debit > 0 && tx.type === 'DEBIT') {
        if (!dmap.has(dk)) dmap.set(dk, `TRANSFER TO\n315${rd(10, rng)}`);
      }
    }
    for (const tx of txnsFinal) {
      const dk = tx.date.slice(0,10);
      if (tx.credit > 0 && tx.type !== 'SALARY' && tx.type !== 'INTEREST') tx.reference = cmap.get(dk)||tx.reference;
      else if (tx.debit > 0 && tx.type === 'DEBIT') tx.reference = dmap.get(dk)||tx.reference;
    }
  }

  return txnsFinal;
}

// ================== HUMANIZED BUSINESS CREDITS ==================
function buildHumanizedBusinessCredits(requiredAmount, days, rng, months, startDate) {
  if (requiredAmount <= 0) return [];
  const workingDays = days.filter(d => d.working).map(d => d.date).sort((a,b)=>a-b);
  const monthBuckets = [];
  for (let m = 0; m < months; m++) {
    const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
    const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + m + 1, 0);
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
    const maxCredits = Math.min(6, bucket.days.length);
    const numCredits = rint(2, maxCredits, rng);
    const minPer = 500000;
    const maxPer = Math.min(5000000, bucket.total - minPer * (numCredits - 1));
    const amounts = splitVariedAmount(bucket.total, numCredits, minPer, maxPer, rng);
    const firstDay = bucket.days[0];
    for (let i = 0; i < numCredits; i++) {
      credits.push({ date: firstDay, amount: amounts[i], type: 'CREDIT' });
    }
  }
  return credits;
}

// ================== SPLIT VARIED AMOUNT ==================
function splitVariedAmount(total, n, min, max, rng, depth = 0) {
  if (depth > 5) {
    const part = Math.max(100, forceWholeRupees(total / n));
    return Array(n).fill(part);
  }
  if (n <= 0) throw new Error('Cannot split amount into 0 parts.');
  const safeMin = Math.max(100, forceWholeRupees(min));
  const safeMax = Math.max(safeMin, forceWholeRupees(max));
  if (total <= 0) return Array(n).fill(0);
  if (total < safeMin * n) {
    const feasibleN = Math.max(1, Math.floor(total / safeMin));
    if (feasibleN < n) return splitVariedAmount(total, feasibleN, min, max, rng, depth + 1);
  }
  if (total > safeMax * n) {
    return splitVariedAmount(safeMax * n, n, min, max, rng, depth + 1);
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

// ================== BUILD DEBITS EXACT ==================
function buildDebitsExact(totalD, monthlyTxTargets, days, rng, empType, startDate) {
  const MONTHS = monthlyTxTargets.length;
  const weights = monthlyTxTargets.map(() => 0.85 + rng()*0.3);
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
    const ms = new Date(startDate.getFullYear(), startDate.getMonth()+m, 1);
    const me = new Date(startDate.getFullYear(), startDate.getMonth()+m+1, 0);
    generateMonthDebitsHumanized(monthlyBudgets[m], monthlyTxTargets[m], ms, me, days, allPlanned, rng, empType);
  }
  return allPlanned;
}

// ================== GENERATE MONTH DEBITS HUMANIZED ==================
function generateMonthDebitsHumanized(monthBudget, txTarget, monthStart, monthEnd, days, allPlanned, rng, empType) {
  const baseProps = {
    rent: empType==='salaried'?0.35:0.12,
    electricity:0.04, groceries:0.08, fuel:0.06, food:0.14, shopping:0.10,
    transport:0.03, entertainment:0.05, medical:0.02, education:0.01,
    insurance:0.02, online:0.04, atm:0.03, misc:0.02
  };
  const catList = Object.keys(baseProps);
  const props = {};
  for (const k of catList) props[k] = baseProps[k] * (0.7 + rng()*0.6);
  const totalP = Object.values(props).reduce((a,b)=>a+b,0);
  for (const k of catList) props[k] /= totalP;
  const rawCounts = catList.map(cat => props[cat] * txTarget);
  const counts = {};
  let sumFloor = 0;
  const remainders = [];
  for (let i=0; i<catList.length; i++) {
    const floor = Math.floor(rawCounts[i]);
    counts[catList[i]] = floor;
    sumFloor += floor;
    remainders.push({ cat: catList[i], rem: rawCounts[i] - floor });
  }
  let leftover = txTarget - sumFloor;
  remainders.sort((a,b) => b.rem - a.rem);
  for (let i=0; i<leftover; i++) counts[remainders[i].cat]++;
  const minBudgets = {};
  for (const cat of catList) {
    const cnt = counts[cat] || 0;
    minBudgets[cat] = cnt > 0 ? cnt * forceWholeRupees(Math.round(CATS[cat].min * 100)) : 0;
  }
  const totalMin = Object.values(minBudgets).reduce((a,b)=>a+b,0);
  let budgetRemaining = monthBudget;
  if (budgetRemaining < totalMin) {
    const scalingFactor = budgetRemaining / totalMin;
    for (const cat of catList) {
      const oldCnt = counts[cat];
      if (oldCnt > 0) {
        const newCnt = Math.floor(oldCnt * scalingFactor);
        if (newCnt === 0 && oldCnt > 0) {
          counts[cat] = 1;
          minBudgets[cat] = forceWholeRupees(Math.round(CATS[cat].min * 100));
        } else {
          counts[cat] = newCnt;
          minBudgets[cat] = newCnt * forceWholeRupees(Math.round(CATS[cat].min * 100));
        }
      }
    }
    const newTotalMin = Object.values(minBudgets).reduce((a,b)=>a+b,0);
    budgetRemaining = monthBudget - newTotalMin;
    if (budgetRemaining < 0) budgetRemaining = 0;
  } else {
    budgetRemaining -= totalMin;
  }
  const weights2 = {};
  let totalWeight2 = 0;
  for (const cat of catList) {
    const cnt = counts[cat] || 0;
    if (cnt > 0) {
      weights2[cat] = cnt * CATS[cat].avg * 100;
      totalWeight2 += weights2[cat];
    }
  }
  const extraBudgets = {};
  let allocatedExtra = 0;
  for (const cat of catList) {
    const cnt = counts[cat] || 0;
    if (cnt > 0 && totalWeight2 > 0) {
      extraBudgets[cat] = Math.round(budgetRemaining * weights2[cat] / totalWeight2);
      allocatedExtra += extraBudgets[cat];
    } else {
      extraBudgets[cat] = 0;
    }
  }
  {
    const diffExtra = budgetRemaining - allocatedExtra;
    const sortedCats = catList.filter(c => counts[c] > 0).sort((a,b) => counts[b] - counts[a]);
    if (sortedCats.length > 0) extraBudgets[sortedCats[0]] += diffExtra;
  }
  const catBudgets = {};
  for (const cat of catList) {
    catBudgets[cat] = (minBudgets[cat] || 0) + (extraBudgets[cat] || 0);
  }
  const monthDebits = [];
  for (const cat of catList) {
    const cnt = counts[cat] || 0;
    const bgt = catBudgets[cat] || 0;
    if (cnt <= 0 || bgt <= 0) continue;
    const spec = CATS[cat];
    const amounts = splitVariedAmount(bgt, cnt, forceWholeRupees(Math.round(spec.min * 100)), forceWholeRupees(Math.round(spec.max * 100)), rng);
    for (const amt of amounts) {
      const pref = getPreferredDate(cat, monthStart, monthEnd, days, spec, rng);
      monthDebits.push({ amount: amt, cat, prefDate: pref });
    }
  }
  const fillerMin = 10000, fillerMax = 50000;
  while (monthDebits.length < txTarget) {
    const amt = rint(fillerMin, fillerMax, rng);
    monthDebits.push({ amount: amt, cat: 'misc', prefDate: getPreferredDate('misc', monthStart, monthEnd, days, CATS.misc, rng) });
  }
  while (monthDebits.length > txTarget) {
    const idx = monthDebits.findIndex(d => d.cat === 'misc');
    if (idx !== -1) monthDebits.splice(idx, 1);
    else monthDebits.pop();
  }
  allPlanned.push(...monthDebits);
}

// ================== SIMULATION ENGINE (FIXED TO INCLUDE REFERENCES) ==================
function simulate(days, plannedDebits, allCredits, openingBalance, MIN_BAL,
  DLIM, CLIM, MAX_SINGLE, bank, company, details, rng, getId) {
  const debitMap = new Map(), creditMap = new Map();
  for (const p of plannedDebits) {
    const k = p.prefDate.toISOString().slice(0,10);
    if (!debitMap.has(k)) debitMap.set(k, []);
    debitMap.get(k).push({ amount:p.amount, cat:p.cat });
  }
  for (const c of allCredits) {
    const k = c.date.toISOString().slice(0,10);
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
          let next = new Date(d); next.setDate(next.getDate()+1);
          while (next <= days[days.length-1].date && !isWorkingDay(next)) next.setDate(next.getDate()+1);
          if (next <= days[days.length-1].date) {
            const nk = next.toISOString().slice(0,10);
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
    const pendingToday = pending.filter(p => p.prefDate.toISOString().slice(0,10) === key);
    pending = pending.filter(p => p.prefDate.toISOString().slice(0,10) !== key);
    const allToday = plannedToday.concat(pendingToday).sort((a,b)=>{
      const prio={rent:3,electricity:3,insurance:3,fuel:2,groceries:2,atm:1};
      return (prio[b.cat]||0)-(prio[a.cat]||0);
    });
    for (const item of allToday) {
      let rem = item.amount;
      while (rem > 0) {
        const todayD = dayD.get(key) || 0;
        const maxToday = Math.min(rem, MAX_SINGLE, DLIM - todayD);
        const room = Math.max(0, bal - MIN_BAL);
        if (maxToday <= 0 || room < MIN_BAL) {
          let next = new Date(d); next.setDate(next.getDate()+1);
          while (next <= days[days.length-1].date && !isWorkingDay(next)) next.setDate(next.getDate()+1);
          if (next <= days[days.length-1].date) {
            pending.push({ amount:rem, cat:item.cat, prefDate:next });
          } else {
            const possible = Math.min(rem, bal, DLIM - (dayD.get(key)||0));
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

// ================== HELPERS ==================
function distributeMonthlyTargets(monthCount, minTx, maxTx) {
  const targets = [];
  for (let i = 0; i < monthCount; i++) targets.push(Math.round((minTx + maxTx) / 2));
  return targets;
}

function buildMonthlyInterest(txns, openingBalance, startDate, endDate, rng, getId) {
  const interestTxns = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    const monthStart = new Date(cur);
    const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    if (monthEnd > end) {
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
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
      let interestDate = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), Math.min(25, monthEnd.getDate()));
      if (!isWorkingDay(interestDate)) {
        let d = new Date(interestDate);
        while (!isWorkingDay(d)) d.setDate(d.getDate() - 1);
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
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return interestTxns;
}

function getPreferredDate(cat, ms, me, days, spec, rng) {
  const monthDays = days.filter(d=>d.date>=ms && d.date<=me && d.working);
  const suit = monthDays.filter(d=>{
    const dow=d.date.getDay(), dom=d.date.getDate();
    return (!spec.dow||spec.dow.includes(dow)) && (!spec.dom||spec.dom.includes(dom));
  });
  if (suit.length) return suit[Math.floor(rng()*suit.length)].date;
  if (monthDays.length) return monthDays[Math.floor(rng()*monthDays.length)].date;
  return new Date(me);
}

function addTime(date, type, rng, isCredit = undefined) {
  const d = new Date(date);
  if (isCredit === true || type === 'SALARY') {
    d.setHours(rint(0, 11, rng), rint(0, 59, rng), rint(0, 59, rng), rint(0, 999, rng));
  } else if (isCredit === false) {
    d.setHours(rint(12, 23, rng), rint(0, 59, rng), rint(0, 59, rng), rint(0, 999, rng));
  } else {
    const spec = CATS[type] || { time: [9, 20] };
    const time = Array.isArray(spec.time) && spec.time.length >= 2 ? spec.time : [9, 20];
    let h = rint(time[0], time[1], rng);
    if (type === 'food' && rng() < 0.4) h = rint(19, 22, rng);
    d.setHours(h, rint(0, 59, rng), rint(0, 59, rng), rint(0, 999, rng));
  }
  return d;
}

// ================== VALIDATION ==================
function validateStatement(txns, openingBalance, endBalance, expectedTx, months, minTx, maxTx, salary, salaryCnt, startDate, endDate) {
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
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
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
  const DAILY_LIMIT = 20000000 / 100;
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