// src/utils/transactions/banks/sbi.js
import { rd, rl, rname, rbank } from '../common.js';

const SBI_UPI_BANKS = ['SBIN', 'YESB', 'UTIB', 'HDFC', 'ICIC', 'BKID', 'CNRB', 'PUNB', 'BARB', 'MAHB', 'CBIN', 'AIRP', 'FDRL', 'UNBA', 'KKBK', 'BMCB', 'IPOS', 'JIOP', 'NSPB'];

const FOOD_MERCHANTS = [
  { name: 'ZOMATO', bank: 'HDFC', vpa: 'payzomato@/Paymen' },
  { name: 'SWIGGY', bank: 'ICIC', vpa: 'swiggy@/Paym' },
  { name: 'HALDIRAM', bank: 'HDFC', vpa: 'haldiram.4/Gene' },
  { name: 'BAKE N S', bank: 'HDFC', vpa: 'bakenshake/Paym' },
  { name: 'Bakers K', bank: 'YESB', vpa: 'paytmqr6k5/Paym' },
  { name: 'OM SWEET', bank: 'HDFC', vpa: 'omsweetspv/Paym' },
  { name: 'Kishor Tea', bank: 'AIRP', vpa: '4794681127/Pa' },
  { name: 'Chai Pt', bank: 'UTIB', vpa: 'chaipoint@/Paym' },
  { name: 'DOMINOS', bank: 'HDFC', vpa: 'dominos@/Paym' },
  { name: 'BURGER K', bank: 'ICIC', vpa: 'burgerking@/Paym' },
  { name: 'ZAM ZAM', bank: 'YESB', vpa: 'paytmqr6o0/Paym' },
  { name: 'HOTEL SH', bank: 'YESB', vpa: 'Q047488294/Paym' },
  { name: 'HOTEL PA', bank: 'YESB', vpa: 'Q643213446/Paym' },
  { name: 'Shiv Store', bank: 'YESB', vpa: 'paytm.s229/Pa' }
];

const SHOPPING_MERCHANTS = [
  { name: 'Flipkart', bank: 'YESB', vpa: 'wmibhopal4/Paym' },
  { name: 'Google P', bank: 'UTIB', vpa: 'playstore@/Mand' },
  { name: 'Google/uti', bank: 'UTIB', vpa: 'playstore1/Mandat' },
  { name: 'AMAZON P', bank: 'UTIB', vpa: 'amazonpay@/Paym' },
  { name: 'MEESHO T', bank: 'AIRP', vpa: 'meeshotech/Paym' },
  { name: 'RELIANCE/', bank: 'HDFC', vpa: 'reliancebp/Paym' },
  { name: 'Reliance/Y', bank: 'YESB', vpa: 'paytm.d923/Paym' },
  { name: 'AVENUE S', bank: 'ICIC', vpa: 'pinedmartm/Paym' },
  { name: 'DMART', bank: 'ICIC', vpa: 'dmartretail/Paym' },
  { name: 'NEW MANI', bank: 'YESB', vpa: 'Q667838830/Paym' },
  { name: 'SAFALYA', bank: 'SBIN', vpa: 'safalyanas/Paym' },
  { name: 'CRED', bank: 'UTIB', vpa: 'cred.club@/payment' },
  { name: 'Credit C', bank: 'IDFB', vpa: 'ccbillpay./Paym' },
  { name: 'DIAPER K', bank: 'HDFC', vpa: 'Vyapar.175/Paym' }
];

const BILL_MERCHANTS = [
  { name: 'PhonePe', bank: 'YESB', vpa: 'bbpsbp@ybl/Payme' },
  { name: 'PhonePe/Y', bank: 'YESB', vpa: 'SV25121122/Payme' },
  { name: 'Airtel R', bank: 'UTIB', vpa: 'AIRTELPRED/Paym' },
  { name: 'Airtel', bank: 'YESB', vpa: 'airtel-bil/Airtel' },
  { name: 'AIRTEL P', bank: 'INDB', vpa: 'AIRTELPAYM/Airt' },
  { name: 'JIO Post', bank: 'YESB', vpa: 'paytm-5381/Paym' },
  { name: 'Jio Rech', bank: 'YESB', vpa: 'JIOINAPPDI/Paym' },
  { name: 'Vodafone/', bank: 'YESB', vpa: 'VIINAPPMPC/Paym' },
  { name: 'Madhya P', bank: 'KKBK', vpa: 'mpmkvvcl1./coll' },
  { name: 'Tata Pow', bank: 'ICIC', vpa: 'tatapower@/Paym' }
];

const TRANSIT_MERCHANTS = [
  { name: 'IRCTC Ra', bank: 'UTIB', vpa: 'irctcpgonl/Coll' },
  { name: 'UBER IND', bank: 'HDFC', vpa: 'uber.pay@/Paym' },
  { name: 'OLA CABS', bank: 'ICIC', vpa: 'olamoney@/Paym' },
  { name: 'City Flo', bank: 'UTIB', vpa: 'gpay-12191/Paym' },
  { name: 'TELANGAN', bank: 'YESB', vpa: 'CHALOTSRTC/Paym' },
  { name: 'IOCL PET', bank: 'SBIN', vpa: 'ioclfuel@/Paym' },
  { name: 'HPCL PET', bank: 'HDFC', vpa: 'hpclauto@/Paym' }
];

const NACH_EMIS = [
  'NACH00000000003221 TP ACH\nADITYAB',
  'NACH00000000002558\nCTHEROFINC',
  'HDFC05813000028172\nLICHousingFina',
  'IBKL00686000013568 IDBI Bank\nLtd.',
  'YESB00707000028634 Yes Bank\nLimit',
  'NACH00000000008412\nBAJAJFINANCE'
];

function getBranchRouting(details, rng, prefix = '009769') {
  const bn = (details?.branchName || details?.branch || 'JAWAHAR CHOWK').toUpperCase();
  const bl = details?.branchLocation || details?.branchAddress || '';
  const ifsc = details?.ifsc || 'SBIN0030387';
  const code = details?.branchCode || (ifsc.length >= 6 ? ifsc.substring(ifsc.length - 5) : '30387');
  const termSuffixes = ['0162095', '1162095', '2162094', '3162093', '4162092', '5162091', '6162090'];
  const term = `${prefix}${termSuffixes[Math.floor(rng() * termSuffixes.length)]}`;

  let loc = bn;
  if (bl) {
    const parts = bl.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    if (parts.length >= 1) {
      const city = parts[parts.length - 1];
      if (!bn.includes(city) && !city.includes(bn)) {
        loc = `${bn}, ${city}`;
      }
    }
  }
  return `${term} AT ${code}\n${loc}`;
}

export function sbinewdesc(type, cat, company, details, rng) {
  const bn = (details?.branchName || details?.branch || 'JAWAHAR CHOWK').toUpperCase();
  const bl = details?.branchLocation || details?.branchAddress || 'BHOPAL';
  const city = bl.split(',').pop().trim().toUpperCase() || 'BHOPAL';
  const rrn = rd(12, rng);

  if (type === 'SALARY') {
    const comp = (company || details?.companyName || 'CEMTEX').toUpperCase().trim();
    if (rng() < 0.6) {
      // Direct CEMTEX DEP BY SALARY style
      return {
        desc: `${comp} DEP BY SALARY`,
        ref: '-'
      };
    } else {
      // NEFT Inward Salary style
      const utr = `SBIN${rd(8, rng)}`;
      const suffix = getBranchRouting(details, rng, '009950');
      return {
        desc: `DEP TFR\nNEFT*SBIN0000240*${utr}*${comp.slice(0, 20)}\n${suffix}`,
        ref: '-'
      };
    }
  }

  if (type === 'INTEREST') {
    return { desc: 'INTEREST CREDIT', ref: '-' };
  }

  if (type === 'CREDIT' || type === 'BUSINESS') {
    const roll = rng();
    if (roll < 0.50) {
      // UPI inward transfer from client/customer/contact
      const remitter = rname(rng).toUpperCase().slice(0, 14);
      const remitterBank = SBI_UPI_BANKS[Math.floor(rng() * SBI_UPI_BANKS.length)];
      const handleRoll = rng();
      let handle;
      if (handleRoll < 0.4) handle = `${rd(10, rng)}/Paym`;
      else if (handleRoll < 0.7) handle = `Q${rd(8, rng)}/Paym`;
      else handle = `gpay-${rd(5, rng)}/Paym`;
      const suffix = getBranchRouting(details, rng, '009773');
      return {
        desc: `DEP TFR\nUPI/CR/${rrn}/${remitter}\n/${remitterBank}/${handle}\n${suffix}`,
        ref: '-'
      };
    } else if (roll < 0.75) {
      // IMPS inward credit
      const banks = ['uob', 'axb', 'hdfc', 'icic', 'pnb', 'sbi'];
      const bankCode = banks[Math.floor(rng() * banks.length)];
      const accSuffix = `XX${rd(3, rng)}`;
      const remitter = rname(rng).toUpperCase().replace(/[^A-Z\s]/g, '').slice(0, 14);
      const suffix = getBranchRouting(details, rng, '009832');
      return {
        desc: `DEP TFR\nIMPS/${rrn}/${bankCode}-${accSuffix}-\n${remitter}/IMPS\n${suffix}`,
        ref: '-'
      };
    } else if (roll < 0.90) {
      // Cash Deposit via CDM (Cash Deposit Machine)
      const cdmId = rd(7, rng);
      const cdmRef = rd(4, rng);
      return {
        desc: `CSH DEP (CDM)\nCDM${cdmId}NEW MARKET\nHUZUR ${cdmRef}`,
        ref: '-'
      };
    } else {
      // Branch Cash Deposit Self or UPI Reward
      if (rng() < 0.5) {
        const ifsc = details?.ifsc || 'SBIN0030387';
        const code = details?.branchCode || (ifsc.length >= 6 ? ifsc.substring(ifsc.length - 5) : '30387');
        return {
          desc: `CASH DEPOSIT SELF AT ${code}\n${bn}`,
          ref: '-'
        };
      } else {
        const suffix = getBranchRouting(details, rng, '009773');
        return {
          desc: `DEP TFR\nUPI/CR/${rrn}/GUDDU/IP\nOS/guddu.252@/89NVZ6C\n${suffix}`,
          ref: '-'
        };
      }
    }
  }

  // DEBIT category-specific handling
  if (type === 'DEBIT') {
    if (cat === 'atm') {
      const rollAtm = rng();
      if (rollAtm < 0.7) {
        const atmId = rd(4, rng);
        return {
          desc: `ATM WDL ATM CASH ${atmId}\nPEER GATE ${city} BHOPA`,
          ref: '-'
        };
      } else {
        const atmId = rd(12, rng);
        return {
          desc: `ATM WDL ATM CASH\n${atmId} Immamigate\nBhop`,
          ref: '-'
        };
      }
    }

    if (cat === 'rent' || cat === 'insurance' || cat === 'loan') {
      if (rng() < 0.6) {
        const nach = NACH_EMIS[Math.floor(rng() * NACH_EMIS.length)];
        return {
          desc: `DEBIT ACHDr\n${nach}`,
          ref: '-'
        };
      }
    }

    if (cat === 'electricity' || cat === 'utility') {
      const bill = BILL_MERCHANTS[Math.floor(rng() * BILL_MERCHANTS.length)];
      const suffix = getBranchRouting(details, rng, '009769');
      return {
        desc: `WDL TFR\nUPI/DR/${rrn}/${bill.name}/${bill.bank}/${bill.vpa}\n${suffix}`,
        ref: '-'
      };
    }

    if (cat === 'food') {
      const item = FOOD_MERCHANTS[Math.floor(rng() * FOOD_MERCHANTS.length)];
      const suffix = getBranchRouting(details, rng, '009769');
      return {
        desc: `WDL TFR\nUPI/DR/${rrn}/${item.name}\n/${item.bank}/${item.vpa}\n${suffix}`,
        ref: '-'
      };
    }

    if (cat === 'shopping' || cat === 'online') {
      const item = SHOPPING_MERCHANTS[Math.floor(rng() * SHOPPING_MERCHANTS.length)];
      const suffix = getBranchRouting(details, rng, '009769');
      return {
        desc: `WDL TFR\nUPI/DR/${rrn}/${item.name}\n/${item.bank}/${item.vpa}\n${suffix}`,
        ref: '-'
      };
    }

    if (cat === 'transport' || cat === 'fuel') {
      if (rng() < 0.25) {
        // POS Fuel Station purchase
        return {
          desc: `POS ATM PURCH\nOTHPOS${rd(12, rng)}SHIVAM\nFILLING STATION${city}`,
          ref: '-'
        };
      }
      const item = TRANSIT_MERCHANTS[Math.floor(rng() * TRANSIT_MERCHANTS.length)];
      const suffix = getBranchRouting(details, rng, '009769');
      return {
        desc: `WDL TFR\nUPI/DR/${rrn}/${item.name}\n/${item.bank}/${item.vpa}\n${suffix}`,
        ref: '-'
      };
    }

    // Default UPI P2P / Daily Merchant Payment (Matching real statement distribution)
    const name = rname(rng).slice(0, 14);
    const bank = SBI_UPI_BANKS[Math.floor(rng() * SBI_UPI_BANKS.length)];
    const vpaRoll = rng();
    let vpa;
    if (vpaRoll < 0.35) {
      vpa = `paytmqr${rl(3, rng)}/Paym`;
    } else if (vpaRoll < 0.60) {
      const sCode = ['s1kv', 's25d', 's1hg', 's229', 's1sh', 's20m', 's273', 's25j', 's1t5', 's1wk', 's22m'][Math.floor(rng() * 11)];
      vpa = `paytm.${sCode}/Paym`;
    } else if (vpaRoll < 0.85) {
      vpa = `Q${rd(8, rng)}/Paym`;
    } else if (vpaRoll < 0.95) {
      vpa = `gpay-${rd(5, rng)}/Paym`;
    } else {
      vpa = `${rd(10, rng)}/Paym`;
    }

    const suffix = getBranchRouting(details, rng, '009769');
    return {
      desc: `WDL TFR\nUPI/DR/${rrn}/${name}\n/${bank}/${vpa}\n${suffix}`,
      ref: '-'
    };
  }

  return { desc: type, ref: '-' };
}

export function enrichSbinewTransactions(txns, details, company, rng) {
  const comp = (company || details?.companyName || 'CEMTEX').toUpperCase().trim();
  for (const tx of txns) {
    if (tx.type === 'SALARY') {
      if (rng() < 0.6) {
        tx.description = `${comp} DEP BY SALARY`;
      } else {
        const utr = `SBIN${rd(8, rng)}`;
        const suffix = getBranchRouting(details, rng, '009950');
        tx.description = `DEP TFR\nNEFT*SBIN0000240*${utr}*${comp.slice(0, 20)}\n${suffix}`;
      }
      tx.reference = '-';
    } else if (tx.type === 'INTEREST') {
      tx.description = 'INTEREST CREDIT';
      tx.reference = '-';
    } else if (!tx.reference) {
      tx.reference = '-';
    }
  }
}

export function sbi2desc(type, company, rng) {
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

export function enrichSbiTransactions(txns, details, rng) {
  const cmap = new Map(), dmap = new Map();
  for (const tx of txns) {
    const dk = tx.date.slice(0, 10);
    if (tx.credit > 0 && tx.type !== 'SALARY' && tx.type !== 'INTEREST') {
      if (!cmap.has(dk)) cmap.set(dk, `TRANSFER FROM\n315${rd(11, rng)}`);
    } else if (tx.debit > 0 && tx.type === 'DEBIT') {
      if (!dmap.has(dk)) dmap.set(dk, `TRANSFER TO\n315${rd(10, rng)}`);
    }
  }
  for (const tx of txns) {
    const dk = tx.date.slice(0, 10);
    if (tx.credit > 0 && tx.type !== 'SALARY' && tx.type !== 'INTEREST') tx.reference = cmap.get(dk) || tx.reference;
    else if (tx.debit > 0 && tx.type === 'DEBIT') tx.reference = dmap.get(dk) || tx.reference;
  }
}


