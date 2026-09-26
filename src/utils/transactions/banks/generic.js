// src/utils/transactions/banks/generic.js
import { rd, rname, rbank } from '../common.js';

export function genericdesc(type, cat, company, rng) {
  if (type === 'SALARY' || type === 'BUSINESS') {
    const ent = type === 'SALARY' ? (company || 'TATA STEEL') : 'CUSTOMER';
    return {
      desc: type === 'SALARY'
        ? `NEFT SALARY CREDIT FROM ${ent}`
        : `BUSINESS PAYMENT- UPI/CR/${rd(12, rng)}/${rname(rng)}/${rbank(rng)}/Q${rd(9, rng)}/${ent}-`,
      ref: 'NEFTINW-' + rd(10, rng)
    };
  }
  if (type === 'DEBIT') {
    return {
      desc: `BY TRANSFER- UPI/DR/${rd(12, rng)}/${rname(rng)}/${rbank(rng)}/Q${rd(9, rng)}/${(cat || '').toUpperCase()}-`,
      ref: ''
    };
  }
  return {
    desc: `TO TRANSFER- UPI/CR/${rd(12, rng)}/${rname(rng)}/${rbank(rng)}/Q${rd(9, rng)}/Payme-`,
    ref: ''
  };
}

