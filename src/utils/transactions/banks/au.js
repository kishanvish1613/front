// src/utils/transactions/banks/au.js
import { rd, rname, forceWholeRupees } from '../common.js';

export const AU_BANKS = ['SBIN', 'ICIC', 'UTIB', 'HDFC', 'BKID', 'PUNB', 'CNRB', 'BARB', 'KKBK', 'UBIN', 'UCBA', 'AIRP', 'AUBL', 'IDFB', 'IDIB', 'NESF', 'CBIN', 'IOBA', 'YESB', 'FDRL', 'PSIB', 'BDBL'];

export const AU_VENDORS = [
  'PENJAA LIFE SCIENCE', 'MS AVI PHARMACEUTICALS', 'M/S.J M K MEDICAL AGENCY', 
  'JMK MEDICAL AGENCY', 'SAGAR PHARMA GENERICS', 'MAHI PHARMA', 'RIHANT PHARMA', 
  'RAJ DRUG AND SURGICAL', 'MAA VESHNAV AGENCIES', 'KAPOOR PHARMA', 'MEERA MEDICAL AGENCIES', 
  'R K SALES', 'PRUTHI DAIRY FARM', 'GLENSTAR HEALTHCARE LLP', 'VARDHMAN PHARMA', 
  'GENOVA PHARMACEUTICALS', 'ZEON HEALTHCARE', 'MEDIVASTRA', 'DEEP AGENCIES', 
  'NM MOBILE STORE', 'DREAMS PHARMA', 'KHANAK MEDICAL STORE', 'SAMRIDHI MEDICAL AGENCIES',
  'GLOBAL MARKETING', 'NEW LIFE HOMOEO DISTRIBUTORS', 'SAIFY MEDICAL AGENCY'
];

export const AU_INDIVIDUALS = [
  'SOHAIL MANSOORI', 'ARZAN KHAN', 'AYRA COLLECTION', 'AHTESHAM SO MOHTASHIM MOHD KHAN',
  'SUBHAAN', 'MD FAIZ', 'KHALID MIYAN S O MOHAMMAD MIYAN', 'AMIT KUMAR JAIN',
  'HAMEED KHAN', 'SABA SHENAZ', 'MR IZHAR MAKRANI', 'ABSAR ANSARI SO MH ABRAR',
  'SYED ATEEQUE HUSSAIN', 'HUZEFA SAJID', 'TEBA SHAIKH', 'NADEEM ANSARI',
  'MOHAMMAD ANAS QUREESHI', 'ABHISHEK SHARMA', 'PAAVAN SHAH S O RAJEEV SHAH',
  'MOHD FAISAL SO NIYAMATULLAH KHAN', 'MOHD SALEEM KHAN', 'TAUSIF', 'JUGAL RATHOUR',
  'KAMALJEET SINGH SALUJA', 'SHUBHAM PARMAR', 'MANISH SO MR NANHELAL YADAV',
  'SANJEEV BATHLA S O LATE SHRI B BATHLA', 'ABDUL RAMEEZ SO ABDUL RASHEED',
  'NARENDRA', 'MOHD SAEED SIDDIQ', 'MUEEN ALI', 'SHAHZEB ALI', 'SOURABH JAIN SO PADAM JAIN'
];

export const AU_UPI_APPS = ['PAYMENT FROM PHONEPE AU JAGATPURA', 'PAID VIA CRED AU JAGATPURA', 'UPI AU JAGATPURA', 'SENT USING PAYTM UPI AU JAGATPURA', 'PAID VIA NAVI UPI AU JAGATPURA'];

export const AU_REF_PREFIXES = ['AXL', 'YBL', 'IBL', 'PTM', 'SBI', 'HDF', 'K811T', 'ICI', 'AXB'];

function randomHex(length, rng) {
  const chars = '0123456789abcdef';
  let res = '';
  for (let i = 0; i < length; i++) {
    res += chars[Math.floor(rng() * chars.length)];
  }
  return res;
}

export function getAuSalaryDay() {
  return 1;
}

export function buildAuDesc(type, cat, company, details, rng) {
  const comp = (company || (details && details.companyName) || 'M S PHARMA').toUpperCase().trim();
  const accNo = (details && details.accountNumber) || '2502248474908993';
  const rrn = rd(12, rng);
  const bankCode = AU_BANKS[Math.floor(rng() * AU_BANKS.length)];
  const party = AU_INDIVIDUALS[Math.floor(rng() * AU_INDIVIDUALS.length)];
  const vendor = AU_VENDORS[Math.floor(rng() * AU_VENDORS.length)];
  const app = AU_UPI_APPS[Math.floor(rng() * AU_UPI_APPS.length)];
  const prefix = AU_REF_PREFIXES[Math.floor(rng() * AU_REF_PREFIXES.length)];
  const hashRef = prefix + randomHex(32, rng);

  if (type === 'SALARY') {
    return {
      desc: `UPI/CR/${rrn}/${comp}/PAYMENT FROM PHONEPE AU JAGATPURA`,
      ref: hashRef
    };
  }

  if (type === 'INTEREST') {
    return {
      desc: `INT.COLL:${rd(2, rng)}-${rd(2, rng)}-2026_AU BANK`,
      ref: ''
    };
  }

  if (type === 'CREDIT' || type === 'BUSINESS') {
    const roll = rng();
    if (roll < 0.35) {
      // AUQR QR Code Settlement
      const entPrefix = comp.replace(/[^A-Z0-9]/g, '').substring(0, 8) || 'MSPHARMA';
      const qrDate = `${rd(2, rng)}${rd(2, rng)}26`;
      return {
        desc: `AUQR C2 ${qrDate}\n${entPrefix}0891 CR -\n${accNo} - AU\nSMALL FINANCE BANK\nLIMITED QR SETTLEM - AU\nBANK`,
        ref: `MR6${rd(11, rng)}${randomHex(6, rng)}`
      };
    } else if (roll < 0.90) {
      // UPI Inward
      const accOrVpa = roll < 0.6 ? `${bankCode}/${rd(11, rng)}` : `${rd(10, rng)}`;
      return {
        desc: `UPI/CR/${rrn}/${party}/${accOrVpa}/${app}`,
        ref: hashRef
      };
    } else {
      // Cheque return or IMPS Credit
      return {
        desc: `IMPS-${rrn} - APIBANKING - RATN0000001 - ************0168 - ACCOUNTVALIDATION`,
        ref: rrn
      };
    }
  }

  // DEBITS
  const roll = rng();
  if (roll < 0.65) {
    // UPI Outward Vendor/Individual Payment
    const recipient = rng() < 0.5 ? vendor : party;
    const accOrVpa = rng() < 0.6 ? `${bankCode}/${rd(11, rng)}` : `${rd(10, rng)}`;
    return {
      desc: `UPI/DR/${rrn}/${recipient}/${accOrVpa}/PAYMENT FROM PHONEPE AU JAGATPURA`,
      ref: hashRef
    };
  } else if (roll < 0.80) {
    // Inward Cheque Clearing
    const chq = rd(6, rng);
    return {
      desc: `I/W CHEQUE PAID-${vendor}-${chq}`,
      ref: `000000${chq}`
    };
  } else if (roll < 0.90) {
    // ATM Cash Withdrawal
    const branch = (details && details.branch) || 'HAMIDIYA ROAD BHOPAL';
    return {
      desc: `ATW-8221-ABHMP007 - ${branch.toUpperCase()} MPIN`,
      ref: rd(4, rng)
    };
  } else if (roll < 0.96) {
    // Loan / ACH Debit
    return {
      desc: `ACH DR 10IDFC FIRST BANK${rd(10, rng)}`,
      ref: rd(9, rng)
    };
  } else {
    // SMS Alert or Return Charges
    if (rng() < 0.5) {
      return {
        desc: 'SMS_ALERT_CHARGE_JAN26_MAR26',
        ref: ''
      };
    } else {
      return {
        desc: `CHEQUE RETURN CHARGES 10-06-26_${rd(6, rng)}`,
        ref: ''
      };
    }
  }
}

export function enrichAuTransactions(txns, details, companyName, rng) {
  txns.forEach(tx => {
    const { desc, ref } = buildAuDesc(tx.type, tx.category, companyName, details, rng);
    tx.description = desc;
    tx.reference = ref;
  });
}

