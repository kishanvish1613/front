// src/utils/transactions/banks/hdfcCurrent.js
import { rd, rl, rname, forceWholeRupees } from '../common.js';

export const HDFC_CURRENT_UTR_PREFIXES = ['HDFCH', 'BARBZ', 'SBIN', 'KKBKH', 'AXOIC', 'CMSH', 'INFT', 'N09', 'P09', 'IDFB'];

export const HDFC_CURRENT_PARTIES = [
  'ALPA CHEMICALS', 'J S CHEMICALS', 'CHEMI ZONE', 'BEST VALUE CHEM PRIVATE LTD',
  'MAA NAVDURGA CONSTRUCTION COMPANY', 'NEEL KANTH CHEMICALS', 'PATEL ENTERPRISES',
  'JAYVIR ENTERPRISE', 'LUNA CHEMICAL INDUSTRIES PRIVATE LI', 'TRUCHEM INDUSTRIES',
  'SHREYA CHEMICALS', 'METRO INDUSTRIES', 'ASPIRE CHEMICALS', 'BURHANPUR TEXTILES LTD',
  'MAYUR DYECHEM INTERMED', 'ARIES COLORCHEM PVT LTD', 'MAA BHAWANI TEXOFIN',
  'AGRAWAL TRADERS', 'SHIV SHAKTI ENTERPRISES', 'KHANDELWAL HARDWARE & MILL STORE',
  'GULAB CHAND TRADING CO', 'YAKUB KHAN TRADERS', 'ROYAL MOTORS & SPARES'
];

export const HDFC_CURRENT_CLEARING_LOCATIONS = [
  'MOHAN NAGAR HINDAUN', 'JAIPUR MAIN', 'DAUSA INDUSTRIAL AREA', 'ALWAR ROAD',
  'BHARATPUR CENTRAL', 'MAHWA ROAD', 'KOTA COMMERCE HUB', 'SIKAR ROAD'
];

export const HDFC_CURRENT_CLEARING_BANKS = [
  'KOTAK MAHINDRA BANK', 'STATE BANK OF INDIA', 'ICICI BANK', 'AXIS BANK',
  'BANK OF BARODA', 'PUNJAB NATIONAL BANK', 'INDUSIND BANK', 'YES BANK'
];

export const HDFC_CURRENT_VPA_BANKS = ['okhdfcbank', 'hdfcbank', 'axl', 'icici', 'ybl', 'oksbi', 'barb0alwdel'];

export function buildHdfcCurrentDesc(type, cat, company, details, rng) {
  const comp = (company || (details && details.companyName) || 'COMMERCIAL ENTERPRISES').toUpperCase().trim();
  const refNum = `0000${rd(12, rng)}`;

  if (type === 'SALARY') {
    const utr = HDFC_CURRENT_UTR_PREFIXES[Math.floor(rng() * HDFC_CURRENT_UTR_PREFIXES.length)] + rd(11, rng);
    return {
      desc: `NEFT CR-${utr}-${comp}`,
      ref: refNum
    };
  }

  if (type === 'INTEREST') {
    return {
      desc: `ACH/INT.PD/HDFC BANK`,
      ref: refNum
    };
  }

  if (type === 'CREDIT' || type === 'BUSINESS') {
    const roll = rng();
    if (roll < 0.40) {
      // Inward Cheque Clearing (CTS Clearing)
      const loc = HDFC_CURRENT_CLEARING_LOCATIONS[Math.floor(rng() * HDFC_CURRENT_CLEARING_LOCATIONS.length)];
      const party = HDFC_CURRENT_PARTIES[Math.floor(rng() * HDFC_CURRENT_PARTIES.length)];
      const bank = HDFC_CURRENT_CLEARING_BANKS[Math.floor(rng() * HDFC_CURRENT_CLEARING_BANKS.length)];
      return {
        desc: `CHQ DEP - CTS CLG1 - ${loc} : ${party} :${bank}`,
        ref: refNum
      };
    } else if (roll < 0.70) {
      // NEFT / RTGS Inward
      const mode = rng() < 0.6 ? 'NEFT' : 'RTGS';
      const utr = HDFC_CURRENT_UTR_PREFIXES[Math.floor(rng() * HDFC_CURRENT_UTR_PREFIXES.length)] + rd(11, rng);
      const party = HDFC_CURRENT_PARTIES[Math.floor(rng() * HDFC_CURRENT_PARTIES.length)];
      return {
        desc: `${mode} CR-${utr}-${party}`,
        ref: refNum
      };
    } else if (roll < 0.90) {
      // Commercial Inward UPI
      const nm = rname(rng);
      const vpaBank = HDFC_CURRENT_VPA_BANKS[Math.floor(rng() * HDFC_CURRENT_VPA_BANKS.length)];
      const handle = `${nm.toLowerCase().replace(/[^a-z]/g, '')}${rd(3, rng)}@${vpaBank}`;
      return {
        desc: `UPI-${nm.toUpperCase()}-${handle}-${refNum}-PAYMENT FROM PHONE`,
        ref: refNum
      };
    } else {
      // Branch Cash Deposit
      const br = (details && details.branchName) || 'BRANCH';
      return {
        desc: `CASH DEP - CTS CLG1 - ${br.toUpperCase()} BRANCH`,
        ref: refNum
      };
    }
  }

  // DEBITS
  const roll = rng();
  if (roll < 0.45) {
    // UPI Business Outward
    const nm = rname(rng);
    const vpaBank = HDFC_CURRENT_VPA_BANKS[Math.floor(rng() * HDFC_CURRENT_VPA_BANKS.length)];
    const handle = `${nm.toLowerCase().replace(/[^a-z]/g, '')}${rd(3, rng)}@${vpaBank}`;
    const action = rng() < 0.5 ? 'PAYMENT FROM PHONE' : 'PAYMENT';
    return {
      desc: `UPI-${nm.toUpperCase()}-${handle}-${refNum}-${action}`,
      ref: refNum
    };
  } else if (roll < 0.65) {
    // NEFT / RTGS Outward Vendor Payment
    const mode = rng() < 0.6 ? 'NEFT' : 'RTGS';
    const utr = HDFC_CURRENT_UTR_PREFIXES[Math.floor(rng() * HDFC_CURRENT_UTR_PREFIXES.length)] + rd(11, rng);
    const party = HDFC_CURRENT_PARTIES[Math.floor(rng() * HDFC_CURRENT_PARTIES.length)];
    return {
      desc: `${mode} DR-${utr}-${party}`,
      ref: refNum
    };
  } else if (roll < 0.80) {
    // Cheque Paid
    const party = HDFC_CURRENT_PARTIES[Math.floor(rng() * HDFC_CURRENT_PARTIES.length)];
    const chqNo = rd(6, rng);
    return {
      desc: `CHQ PAID - MULTICITY - ${party}`,
      ref: chqNo
    };
  } else if (roll < 0.90) {
    // Tax or GST payment
    if (rng() < 0.5) {
      return {
        desc: `ePAY/DIRECT TAX/IT/0000${rd(10, rng)}`,
        ref: refNum
      };
    } else {
      return {
        desc: `GST PAYMENT/08AAAAA${rd(4, rng)}Z5/${rd(10, rng)}`,
        ref: refNum
      };
    }
  } else {
    // Bank charges / CMS
    if (rng() < 0.5) {
      return {
        desc: `CONSOLIDATED CHARGES`,
        ref: `000000${rd(6, rng)}`
      };
    } else {
      return {
        desc: `CMS/NETBANKING/${rd(10, rng)}`,
        ref: refNum
      };
    }
  }
}

export function enrichHdfcCurrentTransactions(txns, details, companyName, rng) {
  const comp = (companyName || (details && details.companyName) || 'COMMERCIAL ENTERPRISES').toUpperCase().trim();

  for (const t of txns) {
    const refNum = t.reference || `0000${rd(12, rng)}`;

    if (t.type === 'SALARY') {
      const utr = HDFC_CURRENT_UTR_PREFIXES[Math.floor(rng() * HDFC_CURRENT_UTR_PREFIXES.length)] + rd(11, rng);
      t.description = `NEFT CR-${utr}-${comp}`;
      t.reference = refNum;
    } else if (t.type === 'INTEREST') {
      t.description = `ACH/INT.PD/HDFC BANK`;
      t.reference = refNum;
    } else if (t.credit > 0) {
      const descObj = buildHdfcCurrentDesc('CREDIT', null, comp, details, rng);
      t.description = descObj.desc;
      t.reference = descObj.ref || refNum;
    } else if (t.debit > 0) {
      const descObj = buildHdfcCurrentDesc('DEBIT', t.category || 'misc', comp, details, rng);
      t.description = descObj.desc;
      t.reference = descObj.ref || refNum;
    }
  }
}

