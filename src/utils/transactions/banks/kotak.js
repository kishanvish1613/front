// src/utils/transactions/banks/kotak.js
import { rd, rname, forceWholeRupees } from '../common.js';

export const KOTAK_VPA_BANKS = [
  'YESB', 'UTIB', 'HDFC', 'SBIN', 'UBIN', 'BARB', 'KKBK', 'BKID',
  'PUNB', 'AIRP', 'FDRL', 'PPIW', 'IPOS', 'IOBA', 'CBIN', 'FINO', 'INDB', 'ICIC'
];

export const KOTAK_UTR_PREFIXES = ['AUBLH', 'HDFCH', 'SBIN', 'KKBKH', 'UTIBH', 'PUNBH', 'BARBH', 'ICICH'];

export const KOTAK_FALLBACK_COMPANIES = [
  'TCS LIMITED', 'INFOSYS LIMITED', 'TECH MAHINDRA LTD', 'RELIANCE RETAIL LTD',
  'HCL TECHNOLOGIES LTD', 'WIPRO LIMITED', 'LARSEN AND TOUBRO LTD', 'BHARTI AIRTEL LIMITED',
  'ACCENTURE SOLUTIONS PVT LTD', 'CAPGEMINI TECHNOLOGY SERVICES INDIA',
  'COGNIZANT TECHNOLOGY SOLUTIONS', 'IBM INDIA PRIVATE LIMITED', 'TATA MOTORS FINANCE LIMITED'
];

export const KOTAK_MERCHANTS_BY_CAT = {
  groceries: [
    { name: 'Blinkit', bank: 'HDFC', action: 'Pay via Razo' },
    { name: 'Blinkit', bank: 'YESB', action: 'Blinkit Paym' },
    { name: 'Zepto Consumer', bank: 'UTIB', action: 'UPIIntent' },
    { name: 'BigBasket Super', bank: 'HDFC', action: 'Order Pay' },
    { name: 'AVENUE SUPERMA', bank: 'HDFC', action: 'Payment from' },
    { name: 'SMART BAZAAR', bank: 'SBIN', action: 'Payment from' },
    { name: 'RELIANCE RETAIL', bank: 'KKBK', action: 'Payment from' },
    { name: 'AJAY KIRANA ST', bank: 'YESB', action: 'Payment from' },
    { name: 'SHREE BALAJI TR', bank: 'YESB', action: 'Payment from' },
    { name: 'GUPTA PROVISION', bank: 'SBIN', action: 'Payment from' },
  ],
  food: [
    { name: 'Swiggy Ltd', bank: 'UTIB', action: 'Pay for Intent' },
    { name: 'ZOMATO LIMITED', bank: 'YESB', action: 'Zomato Payme' },
    { name: 'Zomato', bank: 'HDFC', action: 'UPIIntent' },
    { name: 'Dominos Pizza', bank: 'YESB', action: 'Payment from' },
    { name: 'MCDONALDS INDIA', bank: 'HDFC', action: 'Payment from' },
    { name: 'BURGER KING', bank: 'UTIB', action: 'Payment from' },
    { name: 'HALDIRAMS REST', bank: 'SBIN', action: 'Payment from' },
    { name: 'CHAI POINT', bank: 'HDFC', action: 'Payment from' },
    { name: 'JUICE MASTER', bank: 'HDFC', action: 'Payment from' },
    { name: 'MAHAKAL T NAST', bank: 'YESB', action: 'Payment from' },
    { name: 'Chaileela', bank: 'YESB', action: 'Payment from' },
    { name: 'Burger Singh', bank: 'YESB', action: 'Payment from' },
    { name: 'PA SE PARATHA', bank: 'HDFC', action: 'Payment from' },
    { name: 'Luckhnow veg k', bank: 'YESB', action: 'Payment from' },
  ],
  shopping: [
    { name: 'Amazon India', bank: 'UTIB', action: 'You are payi' },
    { name: 'AMAZON PAY IN', bank: 'ICIC', action: 'Payment from' },
    { name: 'FLIPKART INTERN', bank: 'HDFC', action: 'Payment from' },
    { name: 'MYNTRA DESIGNS', bank: 'HDFC', action: 'Shopping' },
    { name: 'AJIO RETAIL', bank: 'KKBK', action: 'Payment from' },
    { name: 'LENSKART', bank: '', action: 'Payment for 103' },
    { name: 'DECATHLON SPORT', bank: 'HDFC', action: 'Payment from' },
    { name: 'CROMA RETAIL', bank: 'SBIN', action: 'Payment from' },
    { name: 'RELIANCE DIGIT', bank: 'KKBK', action: 'Payment from' },
    { name: 'MR DIY', bank: 'HDFC', action: 'Payment from' },
    { name: 'URBAN GIFT HOUS', bank: '', action: 'Payment from Ph' },
  ],
  fuel: [
    { name: 'INDIAN OIL CORP', bank: 'HDFC', action: 'Fuel Payment' },
    { name: 'BHARAT PETROLEU', bank: 'ICIC', action: 'Petrol Pump' },
    { name: 'HPCL FUEL STN', bank: 'SBIN', action: 'Fuel Dispense' },
    { name: 'SHELL INDIA', bank: 'UTIB', action: 'Payment from' },
    { name: 'FASTAG RECHARGE', bank: 'KKBK', action: 'Toll Pay' },
  ],
  utilities: [
    { name: 'Jio Recharge', bank: 'YESB', action: 'Payment from' },
    { name: 'Airtel Mobility', bank: 'UTIB', action: 'Bill Payment' },
    { name: 'TATA POWER LTD', bank: 'HDFC', action: 'Electricity' },
    { name: 'ADANI ELECTRI', bank: 'KKBK', action: 'Power Bill' },
    { name: 'BESCOM BILLPAY', bank: 'SBIN', action: 'Utility' },
    { name: 'CRED CLUB', bank: 'UTIB', action: 'CC Payment' },
    { name: 'BILLDESK BBPS', bank: 'HDFC', action: 'Bill Pay' },
  ],
  entertainment: [
    { name: 'bookmyshow', bank: 'YESB', action: 'BIG20TREE20E' },
    { name: 'PVR INOX', bank: 'AIRP', action: 'Payment from' },
    { name: 'NETFLIX INDIA', bank: 'HDFC', action: 'Mandate' },
    { name: 'SPOTIFY INDIA', bank: 'UTIB', action: 'Subscription' },
    { name: 'JioHotstar', bank: 'UTIB', action: 'Payment for' },
    { name: 'MUKTA A2 CINEMA', bank: '', action: 'UPI' },
  ],
  transport: [
    { name: 'UBER INDIA SYST', bank: 'HDFC', action: 'Rides' },
    { name: 'OLA CABS ANI', bank: 'YESB', action: 'Payment from' },
    { name: 'RAPIDO RIDES', bank: 'UTIB', action: 'Payment from' },
    { name: 'IRCTC ETICKET', bank: 'SBIN', action: 'Railway' },
  ],
  medical: [
    { name: 'APOLLO PHARMACY', bank: 'HDFC', action: 'Pharmacy' },
    { name: 'PHARMEASY API', bank: 'UTIB', action: 'Healthcare' },
    { name: 'MEDPLUS HEALTH', bank: 'SBIN', action: 'Medicines' },
    { name: 'PRATIBHA MEDICA', bank: 'HDFC', action: 'Payment from' },
    { name: 'Kirti medical', bank: 'YESB', action: 'Payment from' },
  ],
  online: [
    { name: 'PhonePe', bank: 'YESB', action: 'Payment from' },
    { name: 'Google Pay', bank: 'HDFC', action: 'Payment from' },
    { name: 'Paytm Payments', bank: 'KKBK', action: 'Payment from' },
  ],
};

export const KOTAK_FLAT_MERCHANTS = Object.values(KOTAK_MERCHANTS_BY_CAT).flat();

export function getKotakSalaryDay() {
  return 1;
}

export function buildKotakDesc(type, cat, company, details, rng) {
  const comp = (company || (details && details.companyName) || KOTAK_FALLBACK_COMPANIES[Math.floor(rng() * KOTAK_FALLBACK_COMPANIES.length)]).toUpperCase().trim();

  if (type === 'SALARY') {
    const utr = KOTAK_UTR_PREFIXES[Math.floor(rng() * KOTAK_UTR_PREFIXES.length)] + rd(11, rng);
    return {
      desc: `NEFT ${utr} ${comp}`,
      ref: `NEFTINW-${rd(10, rng)}`
    };
  }

  if (type === 'INTEREST') {
    const acc = (details && details.accountNumber) ? details.accountNumber : rd(10, rng);
    return {
      desc: `Int.Pd:${acc}:01-04-2026 to 30-06-2026`,
      ref: ''
    };
  }

  if (type === 'CREDIT' || type === 'BUSINESS') {
    const roll = rng();
    if (roll < 0.55) {
      const nm = rname(rng);
      const vb = KOTAK_VPA_BANKS[Math.floor(rng() * KOTAK_VPA_BANKS.length)];
      return { desc: `UPI/${nm}/${vb}/${rd(12, rng)}/Payment from`, ref: `UPI-6${rd(11, rng)}` };
    } else if (roll < 0.80) {
      const nm = rname(rng);
      return { desc: `UPI/${nm}/${rd(12, rng)}/UPI`, ref: `UPI-6${rd(11, rng)}` };
    } else if (roll < 0.95) {
      const nm = rname(rng);
      return { desc: `IMPS/${rd(12, rng)}/${nm}/Transfer`, ref: `IMPS-${rd(12, rng)}` };
    } else {
      return { desc: `UPI/Google Pay/HDFC/${rd(12, rng)}/Cashback`, ref: `UPI-6${rd(11, rng)}` };
    }
  }

  // DEBITS
  const catList = KOTAK_MERCHANTS_BY_CAT[cat];
  if (catList && rng() < 0.75) {
    const m = catList[Math.floor(rng() * catList.length)];
    const dStr = m.bank
      ? `UPI/${m.name}/${m.bank}/${rd(12, rng)}/${m.action}`
      : `UPI/${m.name}/${rd(12, rng)}/${m.action}`;
    return { desc: dStr, ref: `UPI-6${rd(11, rng)}` };
  }

  const nm = rname(rng);
  const roll = rng();
  if (roll < 0.50) {
    const vb = KOTAK_VPA_BANKS[Math.floor(rng() * KOTAK_VPA_BANKS.length)];
    return { desc: `UPI/${nm}/${vb}/${rd(12, rng)}/Payment from`, ref: `UPI-6${rd(11, rng)}` };
  } else if (roll < 0.85) {
    return { desc: `UPI/${nm}/${rd(12, rng)}/Payment from Ph`, ref: `UPI-6${rd(11, rng)}` };
  } else {
    return { desc: `UPI/${nm}/${rd(12, rng)}/Pay to BharatPe`, ref: `UPI-6${rd(11, rng)}` };
  }
}

export function enrichKotakTransactions(txns, details, companyName, rng) {
  const comp = (companyName || (details && details.companyName) || KOTAK_FALLBACK_COMPANIES[Math.floor(rng() * KOTAK_FALLBACK_COMPANIES.length)]).toUpperCase().trim();
  const accNo = (details && details.accountNumber) ? details.accountNumber : rd(10, rng);

  for (const t of txns) {
    if (t.type === 'SALARY') {
      const utr = KOTAK_UTR_PREFIXES[Math.floor(rng() * KOTAK_UTR_PREFIXES.length)] + rd(11, rng);
      t.description = `NEFT ${utr} ${comp}`;
      t.reference = `NEFTINW-${rd(10, rng)}`;
    } else if (t.type === 'INTEREST') {
      const d = new Date(t.date);
      const qMonth = d.getUTCMonth();
      const qStartMonth = Math.floor(qMonth / 3) * 3;
      const qStart = new Date(Date.UTC(d.getUTCFullYear(), qStartMonth, 1));
      const qEnd = new Date(Date.UTC(d.getUTCFullYear(), qStartMonth + 3, 0));
      const fmt = (dt) => {
        const dd = String(dt.getUTCDate()).padStart(2, '0');
        const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
        const yy = dt.getUTCFullYear();
        return `${dd}-${mm}-${yy}`;
      };
      t.description = `Int.Pd:${accNo}:${fmt(qStart)} to ${fmt(qEnd)}`;
      t.reference = '';
    } else if (t.credit > 0) {
      if (!t.reference || (!t.reference.startsWith('UPI-') && !t.reference.startsWith('NEFTINW-') && !t.reference.startsWith('IMPS-'))) {
        const roll = rng();
        if (roll < 0.55) {
          const nm = rname(rng);
          const vb = KOTAK_VPA_BANKS[Math.floor(rng() * KOTAK_VPA_BANKS.length)];
          t.description = `UPI/${nm}/${vb}/${rd(12, rng)}/Payment from`;
          t.reference = `UPI-6${rd(11, rng)}`;
        } else if (roll < 0.80) {
          const nm = rname(rng);
          t.description = `UPI/${nm}/${rd(12, rng)}/UPI`;
          t.reference = `UPI-6${rd(11, rng)}`;
        } else if (roll < 0.95) {
          const nm = rname(rng);
          t.description = `IMPS/${rd(12, rng)}/${nm}/Transfer`;
          t.reference = `IMPS-${rd(12, rng)}`;
        } else {
          t.description = `UPI/Google Pay/HDFC/${rd(12, rng)}/Cashback`;
          t.reference = `UPI-6${rd(11, rng)}`;
        }
      }
    } else if (t.debit > 0) {
      if (!t.reference || !t.reference.startsWith('UPI-')) {
        const roll = rng();
        if (roll < 0.55) {
          const m = KOTAK_FLAT_MERCHANTS[Math.floor(rng() * KOTAK_FLAT_MERCHANTS.length)];
          t.description = m.bank
            ? `UPI/${m.name}/${m.bank}/${rd(12, rng)}/${m.action}`
            : `UPI/${m.name}/${rd(12, rng)}/${m.action}`;
          t.reference = `UPI-6${rd(11, rng)}`;
        } else if (roll < 0.85) {
          const nm = rname(rng);
          t.description = `UPI/${nm}/${rd(12, rng)}/Payment from Ph`;
          t.reference = `UPI-6${rd(11, rng)}`;
        } else {
          const nm = rname(rng);
          t.description = `UPI/${nm}/${rd(12, rng)}/Pay to BharatPe`;
          t.reference = `UPI-6${rd(11, rng)}`;
        }
      }
    }
  }
}


