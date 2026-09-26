// src/utils/transactions/banks/hdfc.js
import { rd, rname, forceWholeRupees } from '../common.js';

export const HDFC_UTR_PREFIXES = ['HDFCH', 'HDFCR', 'CMSH', 'INFT', 'N09', 'P09'];

export const HDFC_FALLBACK_COMPANIES = [
  'TATA CONSULTANCY SERVICES LTD', 'INFOSYS LIMITED', 'WIPRO LIMITED',
  'HCL TECHNOLOGIES LTD', 'RELIANCE INDUSTRIES LTD', 'LARSEN AND TOUBRO LTD',
  'ACCENTURE SOLUTIONS PVT LTD', 'BHARTI AIRTEL LIMITED', 'TECH MAHINDRA LTD'
];

export const HDFC_VPA_HANDLES = ['@okhdfcbank', '@hdfcbank', '@paytm', '@okaxis', '@ybl', '@oksbi'];

export const HDFC_MERCHANTS_BY_CAT = {
  groceries: [
    { name: 'SMART BAZAAR', vpa: 'smartbazaar@hdfcbank', action: 'GROCERY' },
    { name: 'BLINKIT COMMERCE', vpa: 'blinkit@hdfcbank', action: 'UPIINTENT' },
    { name: 'ZEPTO CONSUMER', vpa: 'zepto@icici', action: 'ORDER' },
    { name: 'DMART RETAIL', vpa: 'dmart@axisbank', action: 'RETAIL' },
    { name: 'RELIANCE FRESH', vpa: 'relfresh@icici', action: 'PURCHASE' },
  ],
  food: [
    { name: 'ZOMATO LIMITED', vpa: 'zomato@hdfcbank', action: 'PAYMENT' },
    { name: 'SWIGGY BUNDL', vpa: 'swiggy@icici', action: 'FOODORDER' },
    { name: 'DOMINOS PIZZA', vpa: 'dominos@hdfcbank', action: 'PAYMENT' },
    { name: 'MCDONALDS INDIA', vpa: 'mcd@yesbank', action: 'POS' },
    { name: 'CHAI POINT', vpa: 'chaipoint@hdfcbank', action: 'STORE' },
  ],
  shopping: [
    { name: 'AMAZON PAY INDIA', vpa: 'amazon@apl', action: 'PURCHASE' },
    { name: 'FLIPKART INTERNET', vpa: 'flipkart@axisbank', action: 'PAYMENT' },
    { name: 'MYNTRA DESIGNS', vpa: 'myntra@hdfcbank', action: 'SHOP' },
    { name: 'NYKAA E-RETAIL', vpa: 'nykaa@icici', action: 'CHECKOUT' },
  ],
  fuel: [
    { name: 'INDIAN OIL CORP', vpa: 'indianoil@hdfcbank', action: 'FUEL' },
    { name: 'BHARAT PETROLEUM', vpa: 'bpcl@icici', action: 'PETROL' },
    { name: 'HPCL FUEL STATION', vpa: 'hpcl@sbi', action: 'PUMP' },
  ],
  entertainment: [
    { name: 'BOOKMYSHOW BIGTREE', vpa: 'bms@hdfcbank', action: 'TICKETS' },
    { name: 'NETFLIX INDIA', vpa: 'netflix@citibank', action: 'MANDATE' },
    { name: 'PVR INOX LTD', vpa: 'pvrinox@icici', action: 'CINEMA' },
  ],
  medical: [
    { name: 'APOLLO PHARMACY', vpa: 'apollo@hdfcbank', action: 'MEDICINE' },
    { name: 'PHARMEASY API', vpa: 'pharmeasy@icici', action: 'HEALTH' },
    { name: 'MEDPLUS HEALTH', vpa: 'medplus@axisbank', action: 'PHARMA' },
  ],
  transport: [
    { name: 'UBER INDIA SYSTEMS', vpa: 'uber@icici', action: 'RIDES' },
    { name: 'OLA CABS ANI', vpa: 'olacabs@yesbank', action: 'CAB' },
    { name: 'IRCTC ETICKETING', vpa: 'irctc@hdfcbank', action: 'RAILWAY' },
  ],
  online: [
    { name: 'AIRTEL PREPAID', vpa: 'airtel@airtelbank', action: 'RECHARGE' },
    { name: 'JIO RECHARGE', vpa: 'jio@axisbank', action: 'MOBILITY' },
  ],
};

export const HDFC_FLAT_MERCHANTS = Object.values(HDFC_MERCHANTS_BY_CAT).flat();

export function getHdfcSalaryDay() {
  return 1;
}

export function buildHdfcDesc(type, cat, company, details, rng) {
  const comp = (company || (details && details.companyName) || HDFC_FALLBACK_COMPANIES[Math.floor(rng() * HDFC_FALLBACK_COMPANIES.length)]).toUpperCase().trim();

  if (type === 'SALARY') {
    const utr = HDFC_UTR_PREFIXES[Math.floor(rng() * HDFC_UTR_PREFIXES.length)] + rd(11, rng);
    return {
      desc: `NEFT CR-${utr}-${comp}`,
      ref: `000000${rd(10, rng)}`
    };
  }

  if (type === 'INTEREST') {
    return {
      desc: `ACH/INT.PD/HDFC BANK`,
      ref: `000000${rd(8, rng)}`
    };
  }

  if (type === 'CREDIT' || type === 'BUSINESS') {
    const roll = rng();
    const refNum = rd(12, rng);
    if (roll < 0.35) {
      const nm = rname(rng);
      const vpa = `${nm.toLowerCase().replace(/[^a-z]/g, '')}${HDFC_VPA_HANDLES[Math.floor(rng() * HDFC_VPA_HANDLES.length)]}`;
      return { desc: `UPI-${nm}-${vpa}-${refNum}-PAYMENT`, ref: `000000${rd(10, rng)}` };
    } else if (roll < 0.70) {
      const nm = rname(rng);
      return { desc: `IMPS-${refNum}-${nm}-TRANSFER`, ref: `000000${rd(10, rng)}` };
    } else {
      return { desc: `NEFT CR-HDFCH${refNum}-${comp}`, ref: `000000${rd(10, rng)}` };
    }
  }

  // DEBITS
  const catList = HDFC_MERCHANTS_BY_CAT[cat];
  const refNum = rd(12, rng);
  if (catList && rng() < 0.75) {
    const m = catList[Math.floor(rng() * catList.length)];
    return {
      desc: `UPI-${m.name}-${m.vpa}-${refNum}-${m.action}`,
      ref: `000000${rd(10, rng)}`
    };
  }

  const nm = rname(rng);
  const roll = rng();
  if (roll < 0.5) {
    const vpa = `${nm.toLowerCase().replace(/[^a-z]/g, '')}${HDFC_VPA_HANDLES[Math.floor(rng() * HDFC_VPA_HANDLES.length)]}`;
    return { desc: `UPI-${nm}-${vpa}-${refNum}-PAYMENT`, ref: `000000${rd(10, rng)}` };
  } else if (roll < 0.8) {
    return { desc: `POS ${rd(6, rng)} ${nm.toUpperCase()} STORE`, ref: `000000${rd(10, rng)}` };
  } else {
    return { desc: `NET TXN: ${nm.toUpperCase()} SERVICES`, ref: `000000${rd(10, rng)}` };
  }
}

export function enrichHdfcTransactions(txns, details, companyName, rng) {
  const comp = (companyName || (details && details.companyName) || HDFC_FALLBACK_COMPANIES[Math.floor(rng() * HDFC_FALLBACK_COMPANIES.length)]).toUpperCase().trim();

  for (const t of txns) {
    if (t.type === 'SALARY') {
      const utr = HDFC_UTR_PREFIXES[Math.floor(rng() * HDFC_UTR_PREFIXES.length)] + rd(11, rng);
      t.description = `NEFT CR-${utr}-${comp}`;
      if (!t.reference) t.reference = `000000${rd(10, rng)}`;
    } else if (t.type === 'INTEREST') {
      t.description = `ACH/INT.PD/HDFC BANK`;
      if (!t.reference) t.reference = `000000${rd(8, rng)}`;
    } else if (t.credit > 0) {
      if (!t.reference) t.reference = `000000${rd(10, rng)}`;
      if (!t.description || t.description === 'CREDIT') {
        const descObj = buildHdfcDesc('CREDIT', null, comp, details, rng);
        t.description = descObj.desc;
      }
    } else if (t.debit > 0) {
      if (!t.reference) t.reference = `000000${rd(10, rng)}`;
      if (!t.description || t.description === 'DEBIT') {
        const descObj = buildHdfcDesc('DEBIT', t.category || 'misc', comp, details, rng);
        t.description = descObj.desc;
      }
    }
  }
}

