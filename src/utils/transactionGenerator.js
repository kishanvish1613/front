// ===================== REALISTIC TRANSACTION GENERATOR v5.0 =====================
// FIXED: Proper balance calculation, salary, interest, and debit/credit logic

function generateId() {
  return Math.random().toString(36).substr(2, 9) + '-' + Date.now();
}

function randomDigits(length) {
  let result = '';
  for (let i = 0; i < length; i++) result += Math.floor(Math.random() * 10);
  return result;
}

function randomLetters(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function randomIntBetween(min, max) {
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------- INDIAN NAMES ----------
const INDIAN_NAMES = [
  'Ravindra Prajap','Lucky Agrawal','Shivam Joshi','Mohan Gurjar','Mahendra','Muskan S',
  'Seemar','Sudham','Kishan','Seema R','Rohit Vishwaka','Sachin Gurjar','Rupesh Verma',
  'Sanjay Chors','Asha Enterpris','Kashish','Rani','Ritesh Agarwal','Kanhaiya Lal',
  'Satish Choudhr','Rajesh Kumar','Suman Devi','Anil Sharma','Priya Singh','Vikram Patel',
  'Sunita Yadav','Deepak Jain','Neha Gupta','Amitabh Das','Ajay Verma','Pankaj Sharma',
  'Nitin Gupta','Rakesh Yadav','Mukesh Patel','Suresh Kumar','Dinesh Chandra','Manoj Tiwari',
  'Arun Mishra','Vivek Singh','Abhishek Jain','Rahul Agrawal','Harish Meena','Lokesh Saini',
  'Vinod Prajapati','Narendra Rathore','Bhupendra Chauhan','Hemant Solanki','Pradeep Sharma',
  'Yogesh Gupta','Ashok Joshi','Gaurav Bansal','Tarun Sharma','Naveen Verma','Rohit Soni',
  'Kapil Jain','Ravi Mehta','Sandeep Patel','Aakash Sharma','Mayank Gupta','Pooja Sharma',
  'Anjali Verma','Kavita Sharma','Nidhi Gupta','Sneha Jain','Shweta Patel','Komal Agrawal',
  'Payal Sharma','Ritu Verma','Meena Devi','Sakshi Gupta','Anita Yadav','Rekha Sharma',
  'Divya Jain','Pallavi Singh','Aarti Patel','Rashmi Verma','Preeti Sharma','Monika Gupta',
  'Jyoti Yadav','Ramesh Chandra','Mahesh Kumar','Naresh Patel','Omprakash Sharma','Govind Singh',
  'Jagdish Verma','Bharat Meena','Ramlal Gurjar','Shankar Lal','Madan Mohan','Kailash Chand',
  'Brijesh Sharma','Krishna Gopal','Lalit Jain','Tejpal Singh','Harendra Kumar','Rajendra Yadav',
  'Surendra Sharma','Devendra Singh','Umesh Patel','Nandkishore Sharma','Chirag Shah',
];

function randomIndianName() {
  return INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
}

function randomAlphaNum(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

const BANK_CODES = ['BKID','BOB','HDFC','SBIN','YESB','IDIB','CNRB','UBIN','AXIS'];
function randomBankCode() {
  return BANK_CODES[Math.floor(Math.random() * BANK_CODES.length)];
}

const MAX_TXN = 99999;
const DAILY_DEBIT_LIMIT = 99999;

const NEFT_IFSC_PREFIXES = [
  'SBIN','HDFC','ICIC','AXIS','YESB','IDIB','CNRB','UBIN','BKID','BOB',
  'PUNB','UTBI','INDB','CIUB','KVBL','SYNB','ORBC','ALLA','BARB','CBIN'
];

function pickRandomIfscPrefix() {
  return NEFT_IFSC_PREFIXES[Math.floor(Math.random() * NEFT_IFSC_PREFIXES.length)];
}

// ---------- INDIAN HOLIDAYS (2024-2026) ----------
const INDIAN_HOLIDAYS = [
  '2024-01-26', '2024-03-08', '2024-03-25', '2024-04-11', '2024-04-17', '2024-04-21',
  '2024-05-23', '2024-06-17', '2024-07-17', '2024-08-15', '2024-08-26', '2024-09-16',
  '2024-10-02', '2024-10-12', '2024-10-31', '2024-11-01', '2024-11-15', '2024-12-25',
  '2025-01-26', '2025-03-14', '2025-04-11', '2025-04-18', '2025-05-23', '2025-06-02',
  '2025-07-17', '2025-08-15', '2025-08-27', '2025-09-16', '2025-10-02', '2025-10-20',
  '2025-11-01', '2025-11-15', '2025-12-25',
  '2026-01-26', '2026-03-25', '2026-04-02', '2026-04-10', '2026-05-01', '2026-06-02',
  '2026-07-17', '2026-08-15', '2026-08-19', '2026-09-16', '2026-10-02', '2026-10-30',
  '2026-11-01', '2026-11-15', '2026-12-25',
];

function isHoliday(date) {
  const dateStr = date.toISOString().slice(0, 10);
  return INDIAN_HOLIDAYS.includes(dateStr);
}

function isWeekend(date) { return date.getDay() === 0 || date.getDay() === 6; }
function isWeekday(date) { return !isWeekend(date); }
function isWorkingDay(date) { return isWeekday(date) && !isHoliday(date); }
function getDayOfMonth(date) { return date.getDate(); }
function getDayOfWeek(date) { return date.getDay(); }

function getFirstWorkingDayOfMonth(year, month) {
  const date = new Date(year, month, 1);
  while (!isWorkingDay(date)) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function branchAreaFrom(location) {
  if (!location) return '';
  const parts = location.split(',').map(p => p.trim());
  return parts.length > 1 ? parts.slice(0, -1).join(', ') : parts[0] || '';
}

function branchCityFrom(location) {
  if (!location) return '';
  const parts = location.split(',').map(p => p.trim());
  return parts.length > 1 ? parts[parts.length - 1] : parts[0] || '';
}

// ---------- CATEGORY STATS ----------
const CATEGORY_STATS = {
  salary:     { avg: 0, std: 0, min: 0, max: 0, daysWeek: [], daysMonth: [], freq: 0 },
  interest:   { avg: 200, std: 150, min: 10, max: 500, daysWeek: [], daysMonth: [15], freq: 1 },
  rent:       { avg: 20000, std: 5000, min: 10000, max: 35000, daysWeek: [], daysMonth: [1,2,3,4,5], freq: 1 },
  groceries:  { avg: 1500, std: 800, min: 200, max: 5000, daysWeek: [5,6,0], daysMonth: [], freq: 3 },
  fuel:       { avg: 3000, std: 500, min: 500, max: 6000, daysWeek: [1,2,3,4,5], daysMonth: [], freq: 2 },
  food:       { avg: 800, std: 300, min: 100, max: 2000, daysWeek: [0,1,2,3,4,5,6], daysMonth: [], freq: 4 },
  utilities:  { avg: 1200, std: 400, min: 300, max: 3000, daysWeek: [], daysMonth: [8,20], freq: 1 },
  shopping:   { avg: 4000, std: 2000, min: 500, max: 15000, daysWeek: [5,6,0], daysMonth: [], freq: 1 },
  transport:  { avg: 400, std: 200, min: 50, max: 1000, daysWeek: [1,2,3,4,5], daysMonth: [], freq: 3 },
  entertainment: { avg: 1500, std: 1000, min: 200, max: 5000, daysWeek: [4,5,6,0], daysMonth: [], freq: 1 },
  medical:    { avg: 2500, std: 1500, min: 200, max: 10000, daysWeek: [], daysMonth: [], freq: 1 },
  education:  { avg: 2000, std: 1000, min: 300, max: 8000, daysWeek: [], daysMonth: [], freq: 1 },
  insurance:  { avg: 3000, std: 1000, min: 1000, max: 8000, daysWeek: [], daysMonth: [15], freq: 1 },
  misc:       { avg: 1000, std: 500, min: 50, max: 5000, daysWeek: [], daysMonth: [], freq: 1 },
};

const TIME_RANGES = {
  groceries:  { min: 17, max: 21 },
  fuel:       { min: 8, max: 11 },
  food:       { min: 12, max: 14, alt: { min: 19, max: 22 } },
  utilities:  { min: 9, max: 17 },
  shopping:   { min: 11, max: 20 },
  transport:  { min: 7, max: 22 },
  entertainment: { min: 18, max: 23 },
  medical:    { min: 9, max: 18 },
  education:  { min: 10, max: 20 },
  rent:       { min: 9, max: 17 },
  insurance:  { min: 9, max: 17 },
  misc:       { min: 9, max: 20 },
  salary:     { min: 0, max: 23 },
  interest:   { min: 0, max: 23 },
};

function computeTotalMonths(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end) || start > end)
    throw new Error('Invalid date range: start date must be before end date.');
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
}

function pickCategoryForDate(date) {
  const dow = getDayOfWeek(date), dom = getDayOfMonth(date);
  const eligible = [];
  for (const [cat, stats] of Object.entries(CATEGORY_STATS)) {
    if (cat === 'salary' || cat === 'interest') continue;
    if ((stats.daysWeek.length === 0 || stats.daysWeek.includes(dow)) &&
        (stats.daysMonth.length === 0 || stats.daysMonth.includes(dom))) eligible.push(cat);
  }
  if (eligible.length === 0) return 'misc';
  const weights = eligible.map(cat => CATEGORY_STATS[cat].freq || 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < eligible.length; i++) {
    r -= weights[i];
    if (r <= 0) return eligible[i];
  }
  return eligible[eligible.length - 1];
}

function addTimeOfDay(date, category) {
  const range = TIME_RANGES[category] || TIME_RANGES.misc;
  let hour, minute;
  if (range.alt && Math.random() < 0.4) {
    hour = randomIntBetween(range.alt.min, range.alt.max);
  } else {
    hour = randomIntBetween(range.min, range.max);
  }
  minute = randomIntBetween(0, 59);
  const result = new Date(date);
  result.setHours(hour, minute, 0, 0);
  return result;
}

function generateAmountForCategory(category) {
  const stats = CATEGORY_STATS[category];
  if (!stats) return Math.round(Math.random() * 1000 + 100);
  const { avg, std, min, max } = stats;
  if (avg === 0) return 0;
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const sigma = Math.sqrt(Math.log(1 + (std * std) / (avg * avg)));
  const mu = Math.log(avg) - 0.5 * sigma * sigma;
  let amount = Math.exp(mu + sigma * z);
  amount = Math.round(amount);
  if (min !== undefined) amount = Math.max(min, amount);
  if (max !== undefined) amount = Math.min(max, amount);
  return amount;
}

// ---------- DESCRIPTION BUILDERS ----------
function buildDescription(type, bank, branchCode, branchName, branchArea, branchCity, companyName, neftIfsc) {
  const isSbiNew = bank === 'SBINEW';
  const isSbi2 = bank === 'SBI2';
  const isSbi = bank === 'SBI';
  const isKotakNew = bank === 'KOTAKNEW';

  if (isSbiNew) return buildSbiNewDescription(type, branchCode, branchName, branchArea, branchCity, companyName);
  if (isSbi2 || isSbi) return buildSbi2Description(type, companyName);
  if (isKotakNew) return buildKotakNewDescription(type, companyName, neftIfsc);
  return buildGenericDescription(type, bank, companyName);
}

function buildKotakNewDescription(type, companyName, neftIfsc) {
  if (type === 'SALARY') {
    const ifscPrefix = pickRandomIfscPrefix();
    const randomNum = randomDigits(10);
    const company = companyName || 'TATA STEEL';
    return { desc: `NEFT ${ifscPrefix}${randomNum} ${company}`, ref: 'NEFTINW-' + randomDigits(10) };
  }
  if (type === 'DEBIT') {
    const names = ['Ravindra Prajap','Lucky Agrawal','Shivam Joshi','Mohan Gurjar'];
    const name = names[Math.floor(Math.random() * names.length)];
    const upiId = randomDigits(12);
    return { desc: `UPI/${name}/${upiId}`, ref: 'UPI-' + randomDigits(12) };
  }
  if (type === 'CREDIT') {
    const names = ['Ravindra Prajap','Lucky Agrawal','Rupesh Verma','Sanjay Chors'];
    const name = names[Math.floor(Math.random() * names.length)];
    const upiId = randomDigits(12);
    return { desc: `UPI/${name}/${upiId}`, ref: 'UPI-' + randomDigits(12) };
  }
  if (type === 'NEFT_CREDIT') {
    const ifsc = neftIfsc || 'SBIN';
    const neftRef = ifsc + 'H' + randomDigits(10);
    const company = companyName || 'TATA STEEL';
    return { desc: `NEFT ${neftRef} ${company}`, ref: 'NEFTINW-' + randomDigits(10) };
  }
  return { desc: type === 'INTEREST' ? 'INTEREST CREDIT' : type, ref: '' };
}

function buildSbiNewDescription(type, branchCode, branchName, area, city, companyName) {
  const locationLine = `${branchCode} ${branchName}${area ? `(${area})` : ''}`;
  const cityLine = city || '';
  if (type === 'DEBIT') {
    const upiId = randomDigits(12);
    const name = randomIndianName();
    const payeeCode = randomAlphaNum(6);
    const txnRef = '009769' + randomDigits(7);
    return { desc: `WDL TFR\nUPI/DR/${upiId}/${name}/YESB/${payeeCode}/Paym\n${txnRef} AT ${locationLine}\n${cityLine}`, ref: '' };
  }
  if (type === 'CREDIT') {
    const impsId = randomDigits(12);
    const bankCode = randomLetters(4).toUpperCase() + '-XX' + randomDigits(3);
    const name = randomIndianName();
    const txnRef = '009832' + randomDigits(7);
    return { desc: `DEP TFR\nIMPS/${impsId}/${bankCode} ${name}/NA   ${txnRef} AT ${locationLine}\n${cityLine}`, ref: '' };
  }
  if (type === 'SALARY') {
    return { desc: `NEFT SALARY CREDIT FROM ${companyName || 'TATA STEEL'}\nAT ${branchCode} ${branchName}${area ? `\n${area}` : ''}${city ? `\n${city}` : ''}`, ref: '' };
  }
  return { desc: type, ref: '' };
}

function buildSbi2Description(type, companyName) {
  if (type === 'DEBIT') {
    const upiId = randomDigits(12);
    const name = randomIndianName();
    const bank = randomBankCode();
    const payeeCode = 'Q' + randomDigits(9) + '/Payme-';
    const refNum = '315' + randomDigits(10);
    return { desc: `BY TRANSFER-\nUPI/DR/${upiId}/${name}/${bank}/${payeeCode}`, ref: `TRANSFER TO\n${refNum}` };
  }
  if (type === 'CREDIT') {
    const upiId = randomDigits(12);
    const name = randomIndianName();
    const bank = randomBankCode();
    const payeeCode = 'Q' + randomDigits(9) + '/Payme-';
    const refNum = '315' + randomDigits(11);
    return { desc: `TO TRANSFER-\nUPI/CR/${upiId}/${name}/${bank}/${payeeCode}`, ref: `TRANSFER FROM\n${refNum}` };
  }
  if (type === 'SALARY') {
    const neftRef = `NEFT*SBIN${randomDigits(7)}*SBINN${randomDigits(8)}*${companyName || 'L&T PRIVATE LIMITED'}*Salary-`;
    return { desc: `BY TRANSFER-\n${neftRef}`, ref: 'TRANSFER FROM\n4824900023' };
  }
  return { desc: type, ref: '' };
}

function buildGenericDescription(type, bank, companyName) {
  const isKotak = bank === 'KOTAK' || bank === 'KOTAKNEW';
  if (type === 'SALARY') {
    if (isKotak) {
      const ifscPrefix = pickRandomIfscPrefix();
      const randomNum = randomDigits(10);
      const company = companyName || 'TATA STEEL';
      return { desc: `NEFT ${ifscPrefix}${randomNum} ${company}`, ref: 'NEFTINW-' + randomDigits(10) };
    }
    return { desc: `NEFT SALARY CREDIT FROM ${companyName || 'TATA STEEL'}`, ref: '' };
  }
  if (type === 'DEBIT') {
    if (isKotak) {
      const names = ['Ravindra Prajap','Lucky Agrawal','Shivam Joshi','Mohan Gurjar'];
      const name = names[Math.floor(Math.random() * names.length)];
      const upiId = randomDigits(12);
      return { desc: `UPI/${name}/${upiId}`, ref: 'UPI-' + randomDigits(12) };
    }
    return { desc: 'WDL TFR', ref: '' };
  }
  if (type === 'CREDIT') {
    if (isKotak) {
      if (Math.random() < 0.5) {
        const ifscPrefix = pickRandomIfscPrefix();
        const randomNum = randomDigits(10);
        const company = companyName || 'TATA STEEL';
        return { desc: `NEFT ${ifscPrefix}${randomNum} ${company}`, ref: 'NEFTINW-' + randomDigits(10) };
      } else {
        const names = ['Ravindra Prajap','Lucky Agrawal','Rupesh Verma','Sanjay Chors'];
        const name = names[Math.floor(Math.random() * names.length)];
        const upiId = randomDigits(12);
        return { desc: `UPI/${name}/${upiId}`, ref: 'UPI-' + randomDigits(12) };
      }
    }
    return { desc: 'DEP TFR', ref: '' };
  }
  return { desc: type, ref: '' };
}

// ===================== MAIN GENERATOR =====================
export function generateTransactions({
  salary,
  openingBalance,
  endBalance,
  interestRatePA = 4,
  fixedDebitPercent,
  salaryCompanyName,
  minTxMonth,
  maxTxMonth,
  periodMonths,
  startDate,
  endDate,
  bank = '',
  branchCode = '',
  branchName = '',
  branchLocation = '',
  employmentType = 'salaried',
  manualDrCount,
  manualCrCount,
  manualTotalDebits,
  manualTotalCredits,
}) {
  try {
    if (manualDrCount != null && manualCrCount != null &&
        manualTotalDebits != null && manualTotalCredits != null) {
      return generateFromSummary({
        openingBalance, endBalance, periodMonths, startDate, endDate,
        bank, branchCode, branchName, branchLocation,
        drCount: manualDrCount, crCount: manualCrCount,
        totalDebits: manualTotalDebits, totalCredits: manualTotalCredits,
        salaryCompanyName, employmentType, salary, interestRatePA,
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || start > end) {
      throw new Error('Invalid date range. Please select a valid start and end date.');
    }

    const neftIfsc = pickRandomIfscPrefix();
    const totalMonths = computeTotalMonths(startDate, endDate);
    const MIN_BALANCE = Math.round(openingBalance / 2);

    // ---------- 1. Fixed credits (salary, interest) ----------
    let fixedCredits = [];
    let balance = openingBalance;

    // Salary – guaranteed for each complete month (first working day only)
    if (employmentType === 'salaried' && salary > 0) {
      for (let m = 0; m < totalMonths; m++) {
        const year = start.getFullYear();
        const month = start.getMonth() + m;
        const salaryDate = getFirstWorkingDayOfMonth(year, month);
        
        // Only include salary if first working day is within statement period
        // (Skip if first working day is before startDate - partial month)
        if (salaryDate >= start && salaryDate <= end) {
          const amt = Math.min(Math.round(salary), MAX_TXN);
          fixedCredits.push({ date: new Date(salaryDate), amount: amt, type: 'SALARY' });
          balance += amt;
        }
      }
    }

    // Interest – calculated based on p.a. rate (compound daily, credited monthly)
    if (salary > 0 || openingBalance > 0) {
      const paRate = interestRatePA || 4;
      
      for (let m = 0; m < totalMonths; m++) {
        const dt = new Date(start.getFullYear(), start.getMonth() + m, 15);
        if (dt >= start && dt <= end && isWorkingDay(dt)) {
          // Calculate interest on average balance of the month
          const monthStart = new Date(start.getFullYear(), start.getMonth() + m, 1);
          const monthEnd = new Date(start.getFullYear(), start.getMonth() + m + 1, 0);
          
          // Simplified: use opening balance as base for interest (realistic behavior)
          const interestAmount = Math.round((balance * paRate / 12 / 100) * 100) / 100;
          if (interestAmount > 0) {
            const amt = Math.min(interestAmount, MAX_TXN);
            fixedCredits.push({ date: dt, amount: amt, type: 'INTEREST' });
            balance += amt;
          }
        } else if (dt >= start && dt <= end && !isWorkingDay(dt)) {
          // Move to next working day if falls on weekend/holiday
          const nextWorkingDate = new Date(dt);
          while (!isWorkingDay(nextWorkingDate)) {
            nextWorkingDate.setDate(nextWorkingDate.getDate() + 1);
          }
          const monthEnd = new Date(start.getFullYear(), start.getMonth() + m + 1, 0);
          if (nextWorkingDate <= monthEnd) {
            const interestAmount = Math.round((balance * paRate / 12 / 100) * 100) / 100;
            if (interestAmount > 0) {
              const amt = Math.min(interestAmount, MAX_TXN);
              fixedCredits.push({ date: nextWorkingDate, amount: amt, type: 'INTEREST' });
              balance += amt;
            }
          }
        }
      }
    }

    // Extra NEFT credit for Kotak New - REMOVED (causing duplicate salary confusion)
    // if (employmentType === 'salaried' && bank === 'KOTAKNEW') { ... }

    // ---------- 2. Recurring mandatory outflows (monthly patterns) ----------
    const monthlyTransactions = [];

    for (let m = 0; m < totalMonths; m++) {
      const monthYear = new Date(start.getFullYear(), start.getMonth() + m);
      const lastDayOfMonth = new Date(monthYear.getFullYear(), monthYear.getMonth() + 1, 0).getDate();

      // Rent (early month)
      const rentDay = randomIntBetween(1, 5);
      const rentDate = new Date(monthYear);
      rentDate.setDate(Math.min(rentDay, lastDayOfMonth));
      if (rentDate >= start && rentDate <= end) {
        const amt = generateAmountForCategory('rent');
        if (amt > 0) monthlyTransactions.push({ date: new Date(rentDate), amount: amt, type: 'DEBIT', category: 'rent' });
      }

      // Utilities (8th and 20th)
      for (const utilDay of [8, 20]) {
        const utilDate = new Date(monthYear);
        utilDate.setDate(Math.min(utilDay, lastDayOfMonth));
        if (utilDate >= start && utilDate <= end) {
          const amt = generateAmountForCategory('utilities');
          if (amt > 0) monthlyTransactions.push({ date: new Date(utilDate), amount: amt, type: 'DEBIT', category: 'utilities' });
        }
      }

      // Insurance (15th)
      const insDate = new Date(monthYear);
      insDate.setDate(Math.min(15, lastDayOfMonth));
      if (insDate >= start && insDate <= end) {
        const amt = generateAmountForCategory('insurance');
        if (amt > 0) monthlyTransactions.push({ date: new Date(insDate), amount: amt, type: 'DEBIT', category: 'insurance' });
      }
    }

    // ---------- 3. Variable everyday spending (weekday/weekend patterns) ----------
    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const candidateDays = [];
    for (let d = 0; d < totalDays; d++) {
      const date = new Date(start);
      date.setDate(date.getDate() + d);
      if (isWeekend(date) ? Math.random() < 0.3 : Math.random() < 0.5) {
        candidateDays.push(d);
      }
    }
    shuffleArray(candidateDays);

    const targetVariableTx = Math.max(5, Math.floor(totalMonths * ((minTxMonth + maxTxMonth) / 2) * 0.4));
    const selectedDays = candidateDays.slice(0, Math.min(targetVariableTx, candidateDays.length));
    selectedDays.sort((a, b) => a - b);

    for (const dayOffset of selectedDays) {
      const date = new Date(start);
      date.setDate(date.getDate() + dayOffset);
      const category = pickCategoryForDate(date);
      const amount = generateAmountForCategory(category);
      if (amount > 0) {
        monthlyTransactions.push({ date: new Date(date), amount, type: 'DEBIT', category });
      }
    }

    // ---------- 4. Random credits ----------
    const extraCredits = Math.max(0, Math.floor(monthlyTransactions.filter(t => t.type === 'DEBIT').length * 0.1));
    for (let i = 0; i < extraCredits; i++) {
      const dayOffset = randomIntBetween(0, totalDays - 1);
      const date = new Date(start);
      date.setDate(date.getDate() + dayOffset);
      const amount = generateAmountForCategory('misc');
      if (amount > 0) monthlyTransactions.push({ date: new Date(date), amount, type: 'CREDIT', category: 'misc' });
    }

    let allPlanned = [...fixedCredits, ...monthlyTransactions];
    allPlanned.sort((a, b) => a.date - b.date);

    // ---------- 5. Build final transactions (CORRECT BALANCE CALCULATION) ----------
    const transactions = [];
    let running = openingBalance;

    // Sort all planned transactions by date
    allPlanned.sort((a, b) => a.date - b.date);

    const dailyDebitMap = new Map();

    for (const planned of allPlanned) {
      let amt = Math.min(planned.amount, MAX_TXN);
      if (amt <= 0) continue;

      const type = planned.type;
      const category = planned.category || 'misc';
      const dateWithTime = addTimeOfDay(new Date(planned.date), category);
      const dateKey = dateWithTime.toISOString().slice(0, 10);

      const { desc, ref } = buildDescription(
        type, bank, branchCode, branchName,
        branchAreaFrom(branchLocation), branchCityFrom(branchLocation),
        salaryCompanyName, neftIfsc
      );

      // CREDITS: Always add to balance
      if (type === 'SALARY' || type === 'INTEREST' || type === 'CREDIT' || type === 'NEFT_CREDIT') {
        running += amt;
        transactions.push({
          id: generateId(),
          date: dateWithTime.toISOString(),
          description: desc,
          reference: ref,
          type: type === 'SALARY' ? 'SALARY' : (type === 'INTEREST' ? 'INTEREST' : 'CREDIT'),
          debit: 0,
          credit: amt,
          balance: Math.round(running * 100) / 100,
        });
      } 
      // DEBITS: Check limits, then deduct from balance
      else if (type === 'DEBIT') {
        const todayDebits = dailyDebitMap.get(dateKey) || 0;
        const availableBalance = running - MIN_BALANCE;
        const allowed = Math.min(amt, DAILY_DEBIT_LIMIT - todayDebits, Math.max(0, availableBalance));
        
        if (allowed > 0) {
          dailyDebitMap.set(dateKey, todayDebits + allowed);
          running -= allowed;
          transactions.push({
            id: generateId(),
            date: dateWithTime.toISOString(),
            description: desc,
            reference: ref,
            type: 'DEBIT',
            debit: allowed,
            credit: 0,
            balance: Math.round(running * 100) / 100,
          });
        }
      }
    }

    // Sort transactions by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Recalculate balances to ensure they're correct
    let recalcBalance = openingBalance;
    for (const tx of transactions) {
      if (tx.credit > 0) {
        recalcBalance += tx.credit;
      } else if (tx.debit > 0) {
        recalcBalance -= tx.debit;
      }
      tx.balance = Math.round(recalcBalance * 100) / 100;
    }

    // ---------- 6. Final balance adjustment (DISTRIBUTED) ----------
    const currentFinal = transactions.length > 0 ? transactions[transactions.length - 1].balance : openingBalance;
    const diff = endBalance - currentFinal;

    if (Math.abs(diff) > 1) { // Allow 1 rupee rounding difference
      const adjustmentStart = new Date(end);
      adjustmentStart.setDate(adjustmentStart.getDate() - 6);
      if (adjustmentStart < start) adjustmentStart.setTime(start.getTime());

      const days = [];
      for (let d = new Date(adjustmentStart); d <= end; d.setDate(d.getDate() + 1)) {
        if (isWeekday(d)) days.push(new Date(d));
      }
      if (days.length === 0) days.push(new Date(end));

      let remaining = Math.abs(diff);
      const sign = diff > 0 ? 1 : -1;
      const chunkSize = 25000;

      for (let i = 0; i < days.length && remaining > 1; i++) {
        const day = days[i];
        const chunk = Math.min(remaining, chunkSize);
        const dateWithTime = addTimeOfDay(day, 'misc');
        const dateKey = dateWithTime.toISOString().slice(0, 10);

        const { desc, ref } = buildDescription(
          sign > 0 ? 'CREDIT' : 'DEBIT',
          bank, branchCode, branchName,
          branchAreaFrom(branchLocation), branchCityFrom(branchLocation),
          salaryCompanyName, neftIfsc
        );

        if (sign > 0) {
          // Add credit adjustment
          recalcBalance += chunk;
          transactions.push({
            id: generateId(),
            date: dateWithTime.toISOString(),
            description: desc,
            reference: ref,
            type: 'CREDIT',
            debit: 0,
            credit: Math.round(chunk),
            balance: Math.round(recalcBalance * 100) / 100,
          });
          remaining -= chunk;
        } else {
          // Add debit adjustment
          const todayDebits = dailyDebitMap.get(dateKey) || 0;
          const allowed = Math.min(chunk, DAILY_DEBIT_LIMIT - todayDebits, Math.max(0, recalcBalance - MIN_BALANCE));
          if (allowed > 0) {
            dailyDebitMap.set(dateKey, todayDebits + allowed);
            recalcBalance -= allowed;
            transactions.push({
              id: generateId(),
              date: dateWithTime.toISOString(),
              description: desc,
              reference: ref,
              type: 'DEBIT',
              debit: Math.round(allowed),
              credit: 0,
              balance: Math.round(recalcBalance * 100) / 100,
            });
            remaining -= allowed;
          }
        }
      }
    }

    // Final sort by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Recalculate final balances one more time
    recalcBalance = openingBalance;
    for (const tx of transactions) {
      if (tx.credit > 0) {
        recalcBalance += tx.credit;
      } else if (tx.debit > 0) {
        recalcBalance -= tx.debit;
      }
      tx.balance = Math.round(recalcBalance * 100) / 100;
    }

    // ---------- 7. SBI/SBI2 reference grouping ----------
    if (bank === 'SBI2' || bank === 'SBI') {
      const dateCreditMap = new Map();
      const dateDebitMap = new Map();
      for (const tx of transactions) {
        const dateKey = tx.date.slice(0, 10);
        if (tx.credit > 0 && tx.type !== 'SALARY' && tx.type !== 'INTEREST') {
          if (!dateCreditMap.has(dateKey)) {
            const refNum = '315' + randomDigits(11);
            dateCreditMap.set(dateKey, `TRANSFER FROM\n${refNum}`);
          }
        } else if (tx.debit > 0 && tx.type === 'DEBIT') {
          if (!dateDebitMap.has(dateKey)) {
            const refNum = '315' + randomDigits(10);
            dateDebitMap.set(dateKey, `TRANSFER TO\n${refNum}`);
          }
        }
      }
      for (const tx of transactions) {
        const dateKey = tx.date.slice(0, 10);
        if (tx.credit > 0 && tx.type !== 'SALARY' && tx.type !== 'INTEREST') {
          tx.reference = dateCreditMap.get(dateKey) || tx.reference;
        } else if (tx.debit > 0 && tx.type === 'DEBIT') {
          tx.reference = dateDebitMap.get(dateKey) || tx.reference;
        }
      }
    }

    return transactions;
  } catch (error) {
    console.error('Error generating transactions:', error);
    throw error;
  }
}

// ===================== MANUAL SUMMARY MODE =====================
function generateFromSummary({
  openingBalance, endBalance, periodMonths, startDate, endDate,
  bank, branchCode, branchName, branchLocation,
  drCount, crCount, totalDebits, totalCredits,
  salaryCompanyName, employmentType, salary, interestRatePA = 4,
}) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || start > end) throw new Error('Invalid date range.');

    const MIN_BALANCE = Math.round(openingBalance / 2);
    const area = branchAreaFrom(branchLocation);
    const city = branchCityFrom(branchLocation);
    const transactions = [];
    let running = openingBalance;
    const neftIfsc = pickRandomIfscPrefix();
    const dailyDebitMap = new Map();

    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const totalTx = crCount + drCount;
    const candidateDays = [];
    for (let d = 0; d < totalDays; d++) {
      const date = new Date(start);
      date.setDate(date.getDate() + d);
      if (isWeekend(date) ? Math.random() < 0.2 : Math.random() < 0.6) candidateDays.push(d);
    }
    shuffleArray(candidateDays);
    const selected = candidateDays.slice(0, Math.min(totalTx, candidateDays.length));
    selected.sort((a, b) => a - b);

    const allDates = selected.map(d => {
      const date = new Date(start);
      date.setDate(date.getDate() + d);
      return date;
    });

    const creditDates = allDates.slice(0, crCount);
    const debitDates = allDates.slice(crCount);

    let creditAmounts = [], debitAmounts = [];
    for (let i = 0; i < creditDates.length; i++) {
      creditAmounts.push(generateAmountForCategory(pickCategoryForDate(creditDates[i])));
    }
    const sumCredits = creditAmounts.reduce((a, b) => a + b, 0);
    if (sumCredits > 0) {
      const scale = totalCredits / sumCredits;
      creditAmounts = creditAmounts.map(a => Math.min(Math.round(a * scale), MAX_TXN));
    } else {
      creditAmounts = new Array(creditDates.length).fill(Math.min(Math.round(totalCredits / creditDates.length), MAX_TXN));
    }

    for (let i = 0; i < debitDates.length; i++) {
      debitAmounts.push(generateAmountForCategory(pickCategoryForDate(debitDates[i])));
    }
    const sumDebits = debitAmounts.reduce((a, b) => a + b, 0);
    if (sumDebits > 0) {
      const scale = totalDebits / sumDebits;
      debitAmounts = debitAmounts.map(a => Math.min(Math.round(a * scale), MAX_TXN));
    } else {
      debitAmounts = new Array(debitDates.length).fill(Math.min(Math.round(totalDebits / debitDates.length), MAX_TXN));
    }

    const txList = [];
    creditDates.forEach((date, i) => {
      const cat = pickCategoryForDate(date);
      txList.push({ isCredit: true, date: addTimeOfDay(date, cat), amount: creditAmounts[i], category: cat });
    });
    debitDates.forEach((date, i) => {
      const cat = pickCategoryForDate(date);
      txList.push({ isCredit: false, date: addTimeOfDay(date, cat), amount: debitAmounts[i], category: cat });
    });
    shuffleArray(txList);

    for (const tx of txList) {
      let amt = Math.min(tx.amount, MAX_TXN);
      if (amt <= 0) continue;
      const dateKey = tx.date.toISOString().slice(0, 10);
      const { desc, ref } = buildDescription(
        tx.isCredit ? 'CREDIT' : 'DEBIT',
        bank, branchCode, branchName, area, city,
        salaryCompanyName, neftIfsc
      );
      
      if (tx.isCredit) {
        // CREDIT: add to balance
        running += amt;
        transactions.push({
          id: generateId(),
          date: tx.date.toISOString(),
          description: desc,
          reference: ref,
          type: 'CREDIT',
          debit: 0,
          credit: amt,
          balance: Math.round(running * 100) / 100
        });
      } else {
        // DEBIT: check limits and subtract
        const todayDebits = dailyDebitMap.get(dateKey) || 0;
        const availableBalance = running - MIN_BALANCE;
        const allowed = Math.min(amt, DAILY_DEBIT_LIMIT - todayDebits, Math.max(0, availableBalance));
        if (allowed > 0) {
          dailyDebitMap.set(dateKey, todayDebits + allowed);
          running -= allowed;
          transactions.push({
            id: generateId(),
            date: tx.date.toISOString(),
            description: desc,
            reference: ref,
            type: 'DEBIT',
            debit: allowed,
            credit: 0,
            balance: Math.round(running * 100) / 100
          });
        }
      }
    }

    // Sort and recalculate balances
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let recalcBalance = openingBalance;
    for (const tx of transactions) {
      if (tx.credit > 0) {
        recalcBalance += tx.credit;
      } else if (tx.debit > 0) {
        recalcBalance -= tx.debit;
      }
      tx.balance = Math.round(recalcBalance * 100) / 100;
    }

    // Final balance adjustment
    const currentBalance = transactions.length > 0 ? transactions[transactions.length - 1].balance : openingBalance;
    const diff = endBalance - currentBalance;

    if (Math.abs(diff) > 1) {
      const adjustmentStart = new Date(end);
      adjustmentStart.setDate(adjustmentStart.getDate() - 6);
      if (adjustmentStart < start) adjustmentStart.setTime(start.getTime());

      const days = [];
      for (let d = new Date(adjustmentStart); d <= end; d.setDate(d.getDate() + 1)) {
        if (isWeekday(d)) days.push(new Date(d));
      }
      if (days.length === 0) days.push(new Date(end));

      let remaining = Math.abs(diff);
      const sign = diff > 0 ? 1 : -1;
      const chunkSize = 25000;

      for (let i = 0; i < days.length && remaining > 1; i++) {
        const day = days[i];
        const chunk = Math.min(remaining, chunkSize);
        const dateWithTime = addTimeOfDay(day, 'misc');
        const dateKey = dateWithTime.toISOString().slice(0, 10);

        const { desc, ref } = buildDescription(
          sign > 0 ? 'CREDIT' : 'DEBIT',
          bank, branchCode, branchName, area, city,
          salaryCompanyName, neftIfsc
        );

        if (sign > 0) {
          recalcBalance += chunk;
          transactions.push({
            id: generateId(),
            date: dateWithTime.toISOString(),
            description: desc,
            reference: ref,
            type: 'CREDIT',
            debit: 0,
            credit: Math.round(chunk),
            balance: Math.round(recalcBalance * 100) / 100
          });
          remaining -= chunk;
        } else {
          const todayDebits = dailyDebitMap.get(dateKey) || 0;
          const allowed = Math.min(chunk, DAILY_DEBIT_LIMIT - todayDebits, Math.max(0, recalcBalance - MIN_BALANCE));
          if (allowed > 0) {
            dailyDebitMap.set(dateKey, todayDebits + allowed);
            recalcBalance -= allowed;
            transactions.push({
              id: generateId(),
              date: dateWithTime.toISOString(),
              description: desc,
              reference: ref,
              type: 'DEBIT',
              debit: Math.round(allowed),
              credit: 0,
              balance: Math.round(recalcBalance * 100) / 100
            });
            remaining -= allowed;
          }
        }
      }
    }

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Final recalculation
    recalcBalance = openingBalance;
    for (const tx of transactions) {
      if (tx.credit > 0) {
        recalcBalance += tx.credit;
      } else if (tx.debit > 0) {
        recalcBalance -= tx.debit;
      }
      tx.balance = Math.round(recalcBalance * 100) / 100;
    }

    if (bank === 'SBI2' || bank === 'SBI') {
      const dateCreditMap = new Map(), dateDebitMap = new Map();
      for (const tx of transactions) {
        const dateKey = tx.date.slice(0, 10);
        if (tx.credit > 0 && tx.type !== 'SALARY' && tx.type !== 'INTEREST') {
          if (!dateCreditMap.has(dateKey)) dateCreditMap.set(dateKey, `TRANSFER FROM\n315${randomDigits(11)}`);
        } else if (tx.debit > 0 && tx.type === 'DEBIT') {
          if (!dateDebitMap.has(dateKey)) dateDebitMap.set(dateKey, `TRANSFER TO\n315${randomDigits(10)}`);
        }
      }
      for (const tx of transactions) {
        const dateKey = tx.date.slice(0, 10);
        if (tx.credit > 0 && tx.type !== 'SALARY' && tx.type !== 'INTEREST')
          tx.reference = dateCreditMap.get(dateKey) || tx.reference;
        else if (tx.debit > 0 && tx.type === 'DEBIT')
          tx.reference = dateDebitMap.get(dateKey) || tx.reference;
      }
    }

    return transactions;
  } catch (error) {
    console.error('Error generating transactions from summary:', error);
    throw error;
  }
}