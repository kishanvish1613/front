// src/utils/transactions/banks/boi.js
import { rd, rname, forceWholeRupees } from '../common.js';

export const BOI_UTR_PREFIXES = ['AXNPN', 'BKIDH', 'BKIDR', 'BARBZ', 'SBIN', 'CMSH', 'INFT'];

export const BOI_BANKS = ['YESB', 'SBIN', 'ICIC', 'UTIB', 'HDFC', 'BKID', 'PUNB', 'CNRB', 'BARB', 'KKBK', 'UCBA', 'FDRL', 'INDB', 'CBIN', 'IOBA', 'AUBL'];

export const BOI_PARTIES = [
  'NITIN', 'MAA SH', 'SHRI G', 'Suresh', 'VANSH', 'LAKSHA', 'ANKUR', 'PRASHA', 'DINESH', 
  'NAKUL', 'SUNITA', 'RAJEND', 'M S SH', 'SAFE G', 'VIMAL', 'MUKESH', 'DEVESH', 'Jeevan', 
  'Shubha', 'SAMREE', 'BHAGVA', 'CHAMPA', 'MOKSH', 'BALVEE', 'Sargam', 'Kirti', 'MAGANS'
];

export const BOI_TAGS = ['pay', 'Q01', 'Q02', 'Q03', 'Q04', 'Q11', 'Q16', 'Q20', 'Q21', 'Q23', 'Q25', 'Q26', 'Q27', 'Q28', 'Q29', 'Q31', 'Q34', 'Q36', 'Q37', 'Q38', 'Q39', 'Q40', 'Q41', 'Q42', 'Q47', 'Q51', 'Q52', 'Q53', 'Q55', 'Q58', 'Q59', 'Q61', 'Q62', 'Q64', 'Q65', 'Q66', 'Q67', 'Q68', 'Q69', 'Q70', 'Q71', 'Q72', 'Q73', 'Q74', 'Q76', 'Q78', 'Q79', 'Q80', 'Q82', 'Q83', 'Q89', 'Q94', 'Q95', 'Q98', 'Q99', 'SAF', 'BHA', '930', '989', '958', '917', '913', '903', '901', '896', '888', '882', '877', '871', '860', '846', '837', '834', '831', '826', '823', '822', '810', '798', '789', '780', '772', '769', '749', '747', '744', '741', '724', '704', '700', '626', 'eaz', 'ama', 'zom', 'pin', 'mob', 'gpa', 'BBP', 'DREAM11ON'];

export function getBoiSalaryDay() {
  return 1;
}

export function buildBoiDesc(type, cat, company, details, rng) {
  const comp = (company || (details && details.companyName) || 'COMMERCIAL CLIENT').toUpperCase().trim();
  const rrn = rd(12, rng);
  const bankCode = BOI_BANKS[Math.floor(rng() * BOI_BANKS.length)];
  const party = BOI_PARTIES[Math.floor(rng() * BOI_PARTIES.length)];
  const tag = BOI_TAGS[Math.floor(rng() * BOI_TAGS.length)];

  if (type === 'SALARY') {
    const utr = BOI_UTR_PREFIXES[Math.floor(rng() * BOI_UTR_PREFIXES.length)] + rd(11, rng);
    return {
      desc: `UNAMB/${party}/${rd(12, rng)}/Salary`,
      ref: ''
    };
  }

  if (type === 'INTEREST') {
    return {
      desc: `${(details && details.accountNumber) || '907020110000340'}:Int.Coll:${rd(2, rng)}-${rd(2, rng)}-2025`,
      ref: ''
    };
  }

  if (type === 'CREDIT' || type === 'BUSINESS') {
    const roll = rng();
    if (roll < 0.60) {
      // UPI Inward
      return {
        desc: `UPI/${rrn}/CR/${party} /${bankCode}/${tag}`,
        ref: ''
      };
    } else if (roll < 0.80) {
      // NEFT Inward
      const utr = BOI_UTR_PREFIXES[Math.floor(rng() * BOI_UTR_PREFIXES.length)] + rd(11, rng);
      return {
        desc: `NEFT/${utr}/UTIB/PHONEPE`,
        ref: ''
      };
    } else if (roll < 0.95) {
      // IMPS Inward
      return {
        desc: `IMPS/${rrn}/PHONEPEPRIVATEL`,
        ref: ''
      };
    } else {
      // Cash Deposit
      const brCode = (details && details.branchCode) || `R908${rd(4, rng)}`;
      return {
        desc: `Cash dep at ${brCode}`,
        ref: ''
      };
    }
  }

  // DEBITS
  const roll = rng();
  if (roll < 0.75) {
    // UPI Debit
    return {
      desc: `UPI/${rrn}/DR/${party}/${bankCode}/${tag}`,
      ref: ''
    };
  } else if (roll < 0.85) {
    // CWDR (ATM / Cash Withdrawal)
    return {
      desc: `CWDR//${rd(5, rng)}/${rd(8, rng)}`,
      ref: ''
    };
  } else if (roll < 0.92) {
    // IMPS / NEFT Outward
    return {
      desc: `IMPSUAMB/${rrn}/UAMB${party}`,
      ref: ''
    };
  } else if (roll < 0.97) {
    // Vendor Cheque Clearing
    const chq = rd(5, rng);
    return {
      desc: `${chq} CRYOVIVA BIOTECH PVT`,
      ref: chq
    };
  } else {
    // Bank Maintenance / SMS Charges
    return {
      desc: `ACCOUNT MAINTENANCE CHARGES`,
      ref: ''
    };
  }
}

export function enrichBoiTransactions(txns, details, companyName, rng) {
  const comp = (companyName || (details && details.companyName) || 'COMMERCIAL CLIENT').toUpperCase().trim();

  for (let i = 0; i < txns.length; i++) {
    const t = txns[i];
    t.sno = i + 1;
    if (t.type === 'SALARY') {
      const descObj = buildBoiDesc('SALARY', null, comp, details, rng);
      t.description = descObj.desc;
      t.reference = descObj.ref || '';
    } else if (t.type === 'INTEREST') {
      const descObj = buildBoiDesc('INTEREST', null, comp, details, rng);
      t.description = descObj.desc;
      t.reference = descObj.ref || '';
    } else if (t.credit > 0) {
      if (!t.description || t.description === 'CREDIT') {
        const descObj = buildBoiDesc('CREDIT', null, comp, details, rng);
        t.description = descObj.desc;
        t.reference = descObj.ref || '';
      }
    } else if (t.debit > 0) {
      if (!t.description || t.description === 'DEBIT') {
        const descObj = buildBoiDesc('DEBIT', t.category || 'misc', comp, details, rng);
        t.description = descObj.desc;
        t.reference = descObj.ref || '';
      }
    }
  }
}

