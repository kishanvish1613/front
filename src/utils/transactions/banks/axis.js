// src/utils/transactions/banks/axis.js
import { rd, rname, forceWholeRupees } from '../common.js';

export const AXIS_UTR_PREFIXES = ['UTIB', 'AXISCN', 'AXISINW', 'UTIBR'];

export const AXIS_FALLBACK_COMPANIES = [
  'TATA CONSULTANCY SERVICES LTD', 'INFOSYS LIMITED', 'WIPRO LIMITED',
  'HCL TECHNOLOGIES LTD', 'RELIANCE INDUSTRIES LTD', 'LARSEN AND TOUBRO LTD',
  'ACCENTURE SOLUTIONS PVT LTD', 'BHARTI AIRTEL LIMITED', 'TECH MAHINDRA LTD'
];

export const AXIS_MERCHANTS_BY_CAT = {
  groceries: [
    { name: 'BLINKIT', action: 'GROCERY' },
    { name: 'ZEPTO', action: 'QUICKCOMM' },
    { name: 'DMART', action: 'SUPERMARKET' },
    { name: 'BIGBASKET', action: 'ORDER' },
  ],
  food: [
    { name: 'ZOMATO', action: 'FOODORDER' },
    { name: 'SWIGGY', action: 'PAYMENT' },
    { name: 'DOMINOS', action: 'PIZZA' },
    { name: 'STARBUCKS', action: 'CAFE' },
  ],
  shopping: [
    { name: 'AMAZON', action: 'PURCHASE' },
    { name: 'FLIPKART', action: 'PAYMENT' },
    { name: 'MYNTRA', action: 'APPAREL' },
  ],
  fuel: [
    { name: 'IOCL', action: 'PETROL' },
    { name: 'BPCL', action: 'FUEL' },
    { name: 'HPCL', action: 'RETAIL' },
  ],
  entertainment: [
    { name: 'BOOKMYSHOW', action: 'ENTERTAINMENT' },
    { name: 'PVR', action: 'CINEMA' },
  ],
  medical: [
    { name: 'APOLLO', action: 'PHARMACY' },
    { name: 'MEDPLUS', action: 'CHEMIST' },
  ],
  transport: [
    { name: 'UBER', action: 'RIDES' },
    { name: 'OLA', action: 'CABS' },
    { name: 'IRCTC', action: 'TICKETING' },
  ],
  online: [
    { name: 'AIRTEL', action: 'RECHARGE' },
    { name: 'JIO', action: 'TELECOM' },
  ],
};

export const AXIS_FLAT_MERCHANTS = Object.values(AXIS_MERCHANTS_BY_CAT).flat();

export function getAxisSalaryDay() {
  return 1;
}

export function buildAxisDesc(type, cat, company, details, rng) {
  const comp = (company || (details && details.companyName) || AXIS_FALLBACK_COMPANIES[Math.floor(rng() * AXIS_FALLBACK_COMPANIES.length)]).toUpperCase().trim();

  if (type === 'SALARY') {
    const utr = AXIS_UTR_PREFIXES[Math.floor(rng() * AXIS_UTR_PREFIXES.length)] + rd(11, rng);
    return {
      desc: `NEFT/INW/${utr}/${comp}`,
      ref: `000000`
    };
  }

  if (type === 'INTEREST') {
    return {
      desc: `INT.PD:CAPITALIZED`,
      ref: `000000`
    };
  }

  if (type === 'CREDIT' || type === 'BUSINESS') {
    const roll = rng();
    const refNum = rd(12, rng);
    if (roll < 0.4) {
      const nm = rname(rng);
      return { desc: `UPI/${nm}/${refNum}/PAYMENT`, ref: `000000` };
    } else if (roll < 0.7) {
      const nm = rname(rng);
      return { desc: `IMPS/${refNum}/${nm}/TRANSFER`, ref: `000000` };
    } else {
      return { desc: `NEFT/INW/UTIB${refNum}/${comp}`, ref: `000000` };
    }
  }

  // DEBITS
  const catList = AXIS_MERCHANTS_BY_CAT[cat];
  const refNum = rd(12, rng);
  if (catList && rng() < 0.75) {
    const m = catList[Math.floor(rng() * catList.length)];
    return {
      desc: `UPI/${m.name}/${refNum}/${m.action}`,
      ref: `000000`
    };
  }

  const nm = rname(rng);
  const roll = rng();
  if (roll < 0.5) {
    return { desc: `UPI/${nm}/${refNum}/PAYMENT`, ref: `000000` };
  } else if (roll < 0.8) {
    return { desc: `POS/${nm.toUpperCase()}/MUMBAI`, ref: `000000` };
  } else {
    return { desc: `ICONNECT/${refNum}/${nm.toUpperCase()}`, ref: `000000` };
  }
}

export function enrichAxisTransactions(txns, details, companyName, rng) {
  const comp = (companyName || (details && details.companyName) || AXIS_FALLBACK_COMPANIES[Math.floor(rng() * AXIS_FALLBACK_COMPANIES.length)]).toUpperCase().trim();

  for (const t of txns) {
    if (t.type === 'SALARY') {
      const utr = AXIS_UTR_PREFIXES[Math.floor(rng() * AXIS_UTR_PREFIXES.length)] + rd(11, rng);
      t.description = `NEFT/INW/${utr}/${comp}`;
      if (!t.reference) t.reference = `000000`;
    } else if (t.type === 'INTEREST') {
      t.description = `INT.PD:CAPITALIZED`;
      if (!t.reference) t.reference = `000000`;
    } else if (t.credit > 0) {
      if (!t.reference) t.reference = `000000`;
      if (!t.description || t.description === 'CREDIT') {
        const descObj = buildAxisDesc('CREDIT', null, comp, details, rng);
        t.description = descObj.desc;
      }
    } else if (t.debit > 0) {
      if (!t.reference) t.reference = `000000`;
      if (!t.description || t.description === 'DEBIT') {
        const descObj = buildAxisDesc('DEBIT', t.category || 'misc', comp, details, rng);
        t.description = descObj.desc;
      }
    }
  }
}

