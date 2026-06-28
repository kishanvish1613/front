export const BANK_FIELD_CONFIG = {
  SBI: {
    name: 'State Bank of India',
    fields: ['accountNumber', 'ifsc', 'branchName', 'branchLocation', 'branchAddress', 'branchPhoneNo', 'branchEmail', 'micr', 'customerRelNo', 'ckycr', 'accountType', 'accountOpenDate', 'nomineeName'],
  },
  SBINEW: {
    name: 'State Bank of India (New)    ',
    fields: ['accountNumber', 'ifsc', 'branchName', 'branchLocation', 'branchAddress', 'branchPhoneNo', 'branchEmail', 'micr', 'customerRelNo', 'ckycr', 'accountType', 'accountOpenDate', 'nomineeName'],
  },
  KOTAK: {
    name: 'Kotak Mahindra Bank',
    fields: ['accountNumber', 'ifsc', 'branchName', 'branchLocation', 'branchAddress', 'branchPhoneNo', 'branchEmail', 'micr', 'customerRelNo', 'accountType'],
  },
  KOTAKNEW: {
    name: 'Kotak Mahindra Bank (New)',
    fields: ['accountNumber', 'ifsc', 'branchName', 'branchLocation', 'branchAddress', 'branchPhoneNo', 'branchEmail', 'micr', 'customerRelNo', 'accountType'],
  },
  AXIS: {
    name: 'Axis Bank',
    fields: ['accountNumber', 'ifsc', 'branchName', 'branchLocation', 'branchAddress', 'branchPhoneNo', 'micr', 'customerRelNo', 'accountType'],
  },
  HDFC: {
    name: 'HDFC Bank',
    fields: ['accountNumber', 'ifsc', 'branchName', 'branchLocation', 'branchAddress', 'branchPhoneNo', 'branchEmail', 'micr', 'customerRelNo', 'accountType'],
  },
  BOI: {
    name: 'Bank of India',
    fields: ['accountNumber', 'ifsc', 'branchName', 'branchLocation', 'branchAddress', 'branchPhoneNo', 'micr', 'customerRelNo', 'accountType'],
  },
  SBI2: {
    name: 'State Bank of India (Alt)',
    fields: ['accountNumber', 'ifsc', 'branchName', 'branchLocation', 'branchAddress', 'branchPhoneNo', 'branchEmail', 'micr', 'customerRelNo', 'ckycr', 'accountType', 'accountOpenDate', 'nomineeName'],
  },
};

export const FIELD_LABELS = {
  title: 'Title',
  fullName: 'Full Name',
  email: 'Email Address',
  phoneNumber: 'Phone Number',
  address: 'Residential Address',
  city: 'City',
  state: 'State',
  pincode: 'Pincode',
  accountNumber: 'Account Number',
  ifsc: 'IFSC Code',
  accountType: 'Account Type / Product',
  accountStatus: 'Account Status',
  accountOpenDate: 'Account Open Date',
  branchName: 'Branch Name',
  branchLocation: 'Branch Location',
  branchAddress: 'Branch Address',
  branchPhoneNo: 'Branch Phone No.',
  branchEmail: 'Branch Email',
  micr: 'MICR Code',
  customerRelNo: 'CIF Number',
  ckycr: 'CKYCR Number',
  nomineeName: 'Nominee Name',
  pan: 'PAN Number',
  currency: 'Currency',
};

export const STATEMENT_INFO_FIELDS = [
  { label: 'Clear Balance', field: 'openingBalance', type: 'number', readOnly: false },
  { label: 'Uncleared Amount', field: 'unclearedAmount', type: 'number', readOnly: true, defaultValue: '0.00' },
  { label: 'MOD Balance', field: 'modBalance', type: 'number', readOnly: true, defaultValue: '0.00' },
  { label: 'Lien Amount', field: 'lienAmount', type: 'number', readOnly: true, defaultValue: '0.0' },
  { label: 'Limit', field: 'limit', type: 'number', readOnly: true, defaultValue: '0.00' },
  { label: 'Monthly Avg Balance', field: 'monthlyAvgBalance', type: 'number', readOnly: true, defaultValue: '0.00' },
  { label: 'Drawing Power', field: 'drawingPower', type: 'number', readOnly: true, defaultValue: '0.00' },
  { label: 'Interest Rate (p.a.)', field: 'interestRate', type: 'text', readOnly: true, defaultValue: '2.50%' },
];