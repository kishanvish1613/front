// src/utils/transactions/banks/unionBank.js
import { rd, rl, rname } from '../common.js';

export function enrichUnionBank(txns, details, companyName, rng) {
  const comp = (companyName || (details && details.companyName) || 'TATA CONSULTANCY SERVICES LTD').toUpperCase().trim();
  const LETTERS = ['S', 'T', 'U', 'V', 'W', 'X', 'Y'];
  const UTR_PREFIXES = ['BARBZ', 'BARBY', 'BARBW', 'HDFCH', 'SBIN', 'KKBKH', 'AXOIC', 'IDFB', 'CMS', 'PUNBH', 'IN2'];
  const PARTIES = [
    'ALPA CHEMICALS', 'J S CHEMICALS', 'CHEMI ZONE', 'BEST VALUE CHEM PRIVATE LTD',
    'MAA NAVDURGA CONSTRUCTION COMPANY', 'NEEL KANTH CHEMICALS', 'PATEL ENTERPRISES',
    'JAYVIR ENTERPRISE', 'LUNA CHEMICAL INDUSTRIES PRIVATE LI', 'TRUCHEM INDUSTRIES',
    'SHREYA CHEMICALS', 'METRO INDUSTRIES', 'ASPIRE CHEMICALS', 'BURHANPUR TEXTILES LTD',
    'MAYUR DYECHEM INTERMED', 'ARIES COLORCHEM PVT LTD', 'MAA BHAWANI TEXOFIN'
  ];
  const VPA_BANKS = ['BARB', 'SBIN', 'UBIN', 'PUNB', 'idib', 'HDFC', 'ICIC', 'YESB', 'KKBK', 'AUBL', 'IPOS', 'AMCB'];
  const BILLERS = ['BILLDESK', 'Razor Pay Pvt. Ltd', 'e-DIRECT TAX COLLE', 'IBIBO WEB PVT LTD', 'AVENUES INDIA PVT.'];

  let idx = 0;
  for (const t of txns) {
    t.tranId = LETTERS[Math.floor(idx / 40) % LETTERS.length] + rd(7, rng);
    t.instrId = '';
    idx++;

    if (t.debit > 0) {
      const roll = rng();
      if (roll < 0.68) {
        // UPI debit
        const nm = rname(rng).split(' ')[0];
        const vb = VPA_BANKS[Math.floor(rng() * VPA_BANKS.length)];
        t.description = `UPIAR/${rd(12, rng)}/DR/${nm}/${vb}/${rl(6, rng).toLowerCase()}${rd(3, rng)}`;
      } else if (roll < 0.82) {
        // NACH / mandate debit
        t.description = `NACH/10/${rd(10, rng)}/KMBLDRAOPER`;
      } else if (roll < 0.93) {
        // Biller ePAY
        t.description = `ePAY/To:${BILLERS[Math.floor(rng() * BILLERS.length)]} PAYMENT S/${rd(9, rng)}/`;
      } else {
        t.description = `ATM Usage Charges`;
      }
      t.utr = '-';
    } else if (t.credit > 0) {
      const code = UTR_PREFIXES[Math.floor(rng() * UTR_PREFIXES.length)] + rd(11, rng);
      if (t.type === 'SALARY') {
        t.description = `NEFT:${comp} ${code}`;
      } else {
        const party = PARTIES[Math.floor(rng() * PARTIES.length)];
        const mode = rng() < 0.78 ? 'NEFT' : 'RTGS';
        t.description = `${mode}:${party} ${code}`;
      }
      t.utr = 'Sender No:' + code;
    } else {
      t.utr = '-';
    }
  }
}

