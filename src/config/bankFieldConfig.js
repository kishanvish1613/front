export const BANKS_LIST = [
  { value: 'HDFCCURRENT', label: 'HDFC Bank (Current / Biz Pro Plus)', shortName: 'HDFC Current', theme: 'blue', category: 'current' },
  { value: 'UNIONBANK', label: 'Union Bank of India (Current / Corporate)', shortName: 'Union Bank', theme: 'rose', category: 'current' },
  { value: 'BOI', label: 'Bank of India (Current / General)', shortName: 'Bank of India', theme: 'amber', category: 'current' },
  { value: 'AU', label: 'AU Small Finance Bank (Current / Basic)', shortName: 'AU Bank', theme: 'purple', category: 'current' },
  { value: 'SBINEW', label: 'State Bank of India (New Layout)', shortName: 'SBI New', theme: 'indigo', category: 'savings' },
  { value: 'SBI', label: 'State Bank of India (Classic)', shortName: 'SBI Classic', theme: 'indigo', category: 'savings' },
  { value: 'KOTAKNEW', label: 'Kotak Mahindra Bank (New / 811)', shortName: 'Kotak 811', theme: 'red', category: 'savings' },
  { value: 'KOTAK', label: 'Kotak Mahindra Bank (Classic)', shortName: 'Kotak Classic', theme: 'red', category: 'savings' },
  { value: 'HDFC', label: 'HDFC Bank (Classic Savings)', shortName: 'HDFC', theme: 'blue', category: 'savings' },
  { value: 'AXIS', label: 'Axis Bank', shortName: 'Axis', theme: 'purple', category: 'savings' },
  { value: 'SBI2', label: 'State Bank of India (Alt)', shortName: 'SBI Alt', theme: 'indigo', category: 'savings' },
];

export const GROUPED_BANKS_LIST = [
  {
    label: '🏦 Current & Commercial Accounts',
    options: BANKS_LIST.filter(b => b.category === 'current'),
  },
  {
    label: '👤 Savings & Retail Accounts',
    options: BANKS_LIST.filter(b => b.category === 'savings'),
  }
];

export const BANK_CONFIGS = {
  HDFCCURRENT: {
    name: 'HDFC Bank (Current / Biz Pro Plus)',
    subtitle: 'Current Account & Statement of Account',
    badge: 'HDFC Biz Pro Plus',
    theme: 'blue',
    sections: {
      customer: {
        title: 'Account Holder / Enterprise Entity',
        subtitle: 'Entity identity, premises address & communications',
        icon: '🏢',
        fields: [
          { key: 'fullName', label: 'Entity / Enterprise Name', placeholder: 'M/S. TALHA ENTERPRISES', required: true, colSpan: 4 },
          { key: 'address', label: 'Communication / Registered Address', placeholder: 'NA SHOP NO 03 BHARATPUR ROAD\nNEAR KHANDALWAL HOTEL NA MAHWA\nDAUSA RAJASTHAN 321608 KESARBAG\nMAHWA 321608\nRAJASTHAN INDIA', type: 'textarea', rows: 3, colSpan: 4 },
          { key: 'city', label: 'City & Pincode', placeholder: 'MAHWA 321608', colSpan: 2 },
          { key: 'state', label: 'State', placeholder: 'RAJASTHAN', defaultValue: 'RAJASTHAN', colSpan: 2 },
          { key: 'phoneNumber', label: 'Registered Mobile No', placeholder: '919601783479', type: 'tel', colSpan: 2 },
          { key: 'email', label: 'Registered Email ID', placeholder: 'AARISKHAN219545@GMAIL.COM', type: 'email', colSpan: 2 },
          { key: 'nomineeName', label: 'Nomination Status', placeholder: 'Registered', defaultValue: 'Registered', colSpan: 2 },
        ]
      },
      branch: {
        title: 'Branch Routing & Scheme Identifiers',
        subtitle: 'Branch location, routing codes, and account scheme',
        icon: '🏛️',
        fields: [
          { key: 'accountNumber', label: 'Account Number', placeholder: '50200115012821', required: true, colSpan: 2 },
          { key: 'customerRelNo', label: 'Customer ID (Cust ID)', placeholder: '338318140', required: true, colSpan: 2 },
          { key: 'branchName', label: 'Account Branch', placeholder: 'MAHWA', colSpan: 2 },
          { key: 'branchCode', label: 'Branch Code', placeholder: '9689', colSpan: 2 },
          { key: 'branchAddress', label: 'Branch Address', placeholder: 'HDFC BANK LTD,\nJAIPUR ROAD ,MAHWA DIST DAUSA\nRAJASTHAN', type: 'textarea', rows: 2, colSpan: 4 },
          { key: 'ifsc', label: 'RTGS/NEFT IFSC Code', placeholder: 'HDFC0009689', required: true, colSpan: 2 },
          { key: 'micr', label: 'MICR Code', placeholder: '321240004', colSpan: 2 },
          { key: 'accountType', label: 'Account Scheme / Type', placeholder: 'BIZ PRO PLUS ACCOUNT(1482)', defaultValue: 'BIZ PRO PLUS ACCOUNT(1482)', colSpan: 2 },
          { key: 'branchPhoneNo', label: 'Branch Phone Number', placeholder: '18002600/18001600', colSpan: 2 },
        ]
      }
    }
  },
  UNIONBANK: {
    name: 'Union Bank of India',
    subtitle: 'Current Account & Statement of Account',
    badge: 'Union Bank PBB',
    theme: 'rose',
    sections: {
      customer: {
        title: 'Account Holder / Corporate Entity',
        subtitle: 'Entity identity, address & communications',
        icon: '🏢',
        fields: [
          { key: 'fullName', label: 'Account Holder / Entity Name', placeholder: 'e.g. JAI HIND CARRIER SERVICES', required: true, colSpan: 4 },
          { key: 'address', label: 'Care Of & Address Premises', placeholder: 'C/O JAI HIND CARRIER SERVICES\nA 201 URVASHI APARTMENT\nBH SAMTA FLATS SUBHANPURA', type: 'textarea', rows: 3, colSpan: 4 },
          { key: 'city', label: 'City', placeholder: 'VADODARA', colSpan: 2 },
          { key: 'state', label: 'State', placeholder: 'GUJARAT', colSpan: 2 },
          { key: 'country', label: 'Country', placeholder: 'INDIA', defaultValue: 'INDIA', colSpan: 2 },
          { key: 'pincode', label: 'Zip / Pincode', placeholder: '390023', colSpan: 2 },
          { key: 'phoneNumber', label: 'Mobile No', placeholder: '919601783479', type: 'tel', colSpan: 2 },
          { key: 'email', label: 'E-mail', placeholder: 'jaihindcarrierservices@gmail.com', type: 'email', colSpan: 2 },
        ]
      },
      branch: {
        title: 'Bank & Branch Identifiers',
        subtitle: 'Branch location, routing & customer codes',
        icon: '🏛️',
        fields: [
          { key: 'accountNumber', label: 'Account No', placeholder: '510101001126333', required: true, colSpan: 2 },
          { key: 'customerRelNo', label: 'Customer Id', placeholder: '1000151959', colSpan: 2 },
          { key: 'branchName', label: 'Branch', placeholder: 'VADODARA - PBB', colSpan: 2 },
          { key: 'accountType', label: 'Account Type', placeholder: 'Current Account', defaultValue: 'Current Account', colSpan: 2 },
          { key: 'ifsc', label: 'IFSC Code', placeholder: 'UBIN0906166', required: true, colSpan: 2 },
          { key: 'micr', label: 'MICR Code', placeholder: '390026039', colSpan: 2 },
          { key: 'ckycr', label: 'CKYC Number', placeholder: '80037687902360', colSpan: 2 },
          { key: 'currency', label: 'Account Currency', placeholder: 'INR', defaultValue: 'INR', readOnly: true, colSpan: 2 },
        ]
      }
    }
  },

  AU: {
    name: 'AU Small Finance Bank (Current / Basic)',
    subtitle: 'AU Current Account & Statement of Account',
    badge: 'AU Current Account',
    theme: 'purple',
    sections: {
      customer: {
        title: 'Account Holder / Enterprise Entity',
        subtitle: 'Entity identity, business constitution & premises address',
        icon: '🏢',
        fields: [
          { key: 'fullName', label: 'Entity / Enterprise Name', placeholder: 'M S PHARMA', required: true, colSpan: 4 },
          { key: 'customerType', label: 'Customer Constitution / Type', placeholder: 'Sole Propertary', defaultValue: 'Sole Propertary', colSpan: 2 },
          { key: 'customerRelNo', label: 'Customer ID', placeholder: '39867327', required: true, colSpan: 2 },
          { key: 'address', label: 'Registered / Premises Address', placeholder: 'Shop No/plot No Shop No G-70\nGround, Floor Vardhman City Plaza\nDawa, Bazar, Hamidia Road Tehsil\nHuzur\nBhopal - 462001, Madhya Pradesh -\nIndia', type: 'textarea', rows: 4, colSpan: 4 },
          { key: 'city', label: 'City', placeholder: 'Bhopal', colSpan: 2 },
          { key: 'state', label: 'State', placeholder: 'Madhya Pradesh', defaultValue: 'Madhya Pradesh', colSpan: 2 },
          { key: 'nomineeName', label: 'Nominee Name', placeholder: 'Shabnam Qureshi', defaultValue: 'Shabnam Qureshi', colSpan: 2 },
        ]
      },
      branch: {
        title: 'Branch Routing & Scheme Identifiers',
        subtitle: 'Branch location, routing codes, and account scheme',
        icon: '🏛️',
        fields: [
          { key: 'accountNumber', label: 'Account Number (16 Digits)', placeholder: '2502248474908993', required: true, colSpan: 2 },
          { key: 'accountType', label: 'Account Scheme / Type', placeholder: 'AU Current Account-Basic', defaultValue: 'AU Current Account-Basic', colSpan: 2 },
          { key: 'branchName', label: 'Branch Name', placeholder: 'Hamidiya Road Bhopal', colSpan: 2 },
          { key: 'ifsc', label: 'RTGS/NEFT IFSC Code', placeholder: 'AUBL0002484', required: true, colSpan: 2 },
        ]
      }
    }
  },

  SBINEW: {
    name: 'State Bank of India (New Layout)',
    subtitle: 'Comprehensive Personal & Corporate Statement',
    badge: 'SBI New v2.0',
    theme: 'indigo',
    sections: {
      customer: {
        title: 'Account Holder Identity & Address',
        subtitle: 'Customer demographics and address',
        icon: '👤',
        fields: [
          { key: 'fullName', label: 'Account Holder Name', placeholder: 'RAVINDRA NASHIKKAR', required: true, colSpan: 3 },
          { key: 'accountOpenDate', label: 'Account Open Date', placeholder: '23/11/2004', colSpan: 1 },
          { key: 'email', label: 'Email Address', placeholder: 'ravindranashikkar01@gmail.com', type: 'email', colSpan: 2 },
          { key: 'phoneNumber', label: 'Registered Mobile No', placeholder: '8989791948', type: 'tel', colSpan: 2 },
          { key: 'address', label: 'Residential Address', placeholder: '34, SILVAR OAKS COLONY, ANNAPURNA ROAD, INDORE', type: 'textarea', rows: 2, colSpan: 4 },
        ]
      },
      branch: {
        title: 'Branch Routing & Location Information',
        subtitle: 'Full branch metadata, address and IFSC codes',
        icon: '🏛️',
        fields: [
          { key: 'branchCode', label: 'Branch Code', placeholder: '16450', colSpan: 1 },
          { key: 'branchName', label: 'Branch Name', placeholder: 'ROHIT NAGAR', colSpan: 1 },
          { key: 'branchLocation', label: 'Branch Location', placeholder: 'BAWADIYA KALAN, BHOPAL', colSpan: 2 },
          { key: 'branchAddress', label: 'Branch Full Address', placeholder: '466 ROHIT NAGAR NO 1, BAWADIYA KALAN, BHOPAL(MP)', colSpan: 4 },
          { key: 'branchEmail', label: 'Branch Email ID', placeholder: 'sbi.16450@sbi.co.in', type: 'email', colSpan: 2 },
          { key: 'branchPhoneNo', label: 'Branch Phone', placeholder: '8989791948', type: 'tel', colSpan: 2 },
          { key: 'ifsc', label: 'IFSC Code', placeholder: 'SBIN0016450', required: true, colSpan: 2 },
          { key: 'micr', label: 'MICR Code', placeholder: '462002093', colSpan: 2 },
        ]
      },
      regulatory: {
        title: 'Regulatory & Account Identifiers',
        subtitle: 'CIF, Product, CKYCR, and Nominee details',
        icon: '📋',
        fields: [
          { key: 'accountNumber', label: 'Account Number', placeholder: '10586227736', required: true, colSpan: 2 },
          { key: 'customerRelNo', label: 'CIF Number', placeholder: '80459914494', colSpan: 2 },
          { key: 'accountType', label: 'Product / Account Type', placeholder: 'Savings Account', defaultValue: 'Savings Account', colSpan: 2 },
          { key: 'accountStatus', label: 'Account Status', defaultValue: 'OPEN', colSpan: 2 },
          { key: 'ckycr', label: 'CKYCR Number', placeholder: 'Not Available', defaultValue: 'Not Available', colSpan: 2 },
          { key: 'nomineeName', label: 'Nominee Name', placeholder: 'XXXXXXXXXXXXXXX', colSpan: 2 },
          { key: 'currency', label: 'Currency', defaultValue: 'INR', readOnly: true, colSpan: 2 },
          { key: 'interestRate', label: 'Interest Rate', defaultValue: '2.50 % p.a.', readOnly: true, colSpan: 2 },
        ]
      }
    }
  },

  SBI: {
    name: 'State Bank of India (Classic)',
    subtitle: 'Standard SBI Statement Layout',
    badge: 'SBI Classic',
    theme: 'indigo',
    sections: {
      customer: {
        title: 'Account Holder Details',
        subtitle: 'Customer demographics and address',
        icon: '👤',
        fields: [
          { key: 'fullName', label: 'Account Holder Name', placeholder: 'RAVINDRA NASHIKKAR', required: true, colSpan: 3 },
          { key: 'accountOpenDate', label: 'Account Open Date', placeholder: '23/11/2004', colSpan: 1 },
          { key: 'email', label: 'Email Address', placeholder: 'customer@gmail.com', type: 'email', colSpan: 2 },
          { key: 'phoneNumber', label: 'Phone Number', placeholder: '9876543210', type: 'tel', colSpan: 2 },
          { key: 'address', label: 'Residential Address', placeholder: '34, SILVAR OAKS COLONY, ANNAPURNA ROAD, INDORE', type: 'textarea', rows: 2, colSpan: 4 },
        ]
      },
      branch: {
        title: 'Branch Routing & Codes',
        subtitle: 'Branch details and IFSC',
        icon: '🏛️',
        fields: [
          { key: 'branchCode', label: 'Branch Code', placeholder: '16450', colSpan: 1 },
          { key: 'branchName', label: 'Branch Name', placeholder: 'ROHIT NAGAR', colSpan: 1 },
          { key: 'branchLocation', label: 'Branch Location', placeholder: 'BAWADIYA KALAN, BHOPAL', colSpan: 2 },
          { key: 'branchAddress', label: 'Branch Address', placeholder: '466 ROHIT NAGAR NO 1, BAWADIYA KALAN, BHOPAL(MP)', colSpan: 4 },
          { key: 'ifsc', label: 'IFSC Code', placeholder: 'SBIN0016450', required: true, colSpan: 2 },
          { key: 'micr', label: 'MICR Code', placeholder: '462002093', colSpan: 2 },
          { key: 'branchPhoneNo', label: 'Branch Phone', placeholder: '8989791948', colSpan: 2 },
          { key: 'branchEmail', label: 'Branch Email ID', placeholder: 'sbi.16450@sbi.co.in', colSpan: 2 },
        ]
      },
      regulatory: {
        title: 'Account & Regulatory',
        subtitle: 'CIF, Account Type, CKYC',
        icon: '📋',
        fields: [
          { key: 'accountNumber', label: 'Account Number', placeholder: '10586227736', required: true, colSpan: 2 },
          { key: 'customerRelNo', label: 'CIF Number', placeholder: '80459914494', colSpan: 2 },
          { key: 'accountType', label: 'Account Type', placeholder: 'Savings Account', defaultValue: 'Savings Account', colSpan: 2 },
          { key: 'accountStatus', label: 'Account Status', defaultValue: 'OPEN', colSpan: 2 },
          { key: 'ckycr', label: 'CKYCR Number', placeholder: 'Not Available', defaultValue: 'Not Available', colSpan: 2 },
          { key: 'nomineeName', label: 'Nominee Name', placeholder: 'XXXXXXXXXXXXXXX', colSpan: 2 },
        ]
      }
    }
  },

  KOTAKNEW: {
    name: 'Kotak Mahindra Bank (New / 811)',
    subtitle: 'Kotak 811 & Retail Account Statement',
    badge: 'Kotak 811 New',
    theme: 'rose',
    sections: {
      customer: {
        title: 'Customer Details & CRN',
        subtitle: 'Account holder and relationship identifier',
        icon: '👤',
        fields: [
          { key: 'fullName', label: 'Customer Name', placeholder: 'Kishan Vishwakarma', required: true, colSpan: 2 },
          { key: 'crn', label: 'CRN (Customer Relationship No)', placeholder: 'xxxxxx478 / 994728107', colSpan: 2 },
          { key: 'address', label: 'Customer Address', placeholder: '118, Semra Kala Purushottam Nagar B\nBhopal - 462010\nMadhya Pradesh - India', type: 'textarea', rows: 3, colSpan: 4 },
          { key: 'pincode', label: 'Pincode', placeholder: '462010', colSpan: 2 },
          { key: 'phoneNumber', label: 'Mobile Number', placeholder: '9876543210', type: 'tel', colSpan: 2 },
          { key: 'email', label: 'Email ID', placeholder: 'customer@gmail.com', type: 'email', colSpan: 4 },
        ]
      },
      account: {
        title: 'Account & Branch Details',
        subtitle: 'Account number, branch and clearance codes',
        icon: '🏛️',
        fields: [
          { key: 'accountNumber', label: 'Account No', placeholder: '9947281077', required: true, colSpan: 2 },
          { key: 'accountType', label: 'Account Type', placeholder: 'Savings', defaultValue: 'Savings', colSpan: 2 },
          { key: 'branchName', label: 'Branch', placeholder: 'Bhopal - Hamedia Road', colSpan: 2 },
          { key: 'accountStatus', label: 'Account Status', defaultValue: 'Active', colSpan: 2 },
          { key: 'nomineeName', label: 'Nominee Registered', placeholder: 'No / Registered', defaultValue: 'No', colSpan: 2 },
          { key: 'currency', label: 'Currency', defaultValue: 'INDIAN RUPEE', readOnly: true, colSpan: 2 },
          { key: 'ifsc', label: 'IFSC Code', placeholder: 'KKBK0005891', required: true, colSpan: 2 },
          { key: 'micr', label: 'MICR Code', placeholder: '462485007', colSpan: 2 },
        ]
      },
      assistance: {
        title: 'Assistance & Branch Contact Information',
        subtitle: 'Branch address, contact numbers & assistance details',
        icon: '📞',
        fields: [
          { key: 'branchAddress', label: 'Branch Full Address (Footer)', placeholder: 'Kotak Mahindra Bank Ltd, Ground Floor, Mezzanine Floor, Hotel Blue Star, 62 Hamedia Road, Near Sangam Cinema, Bhopal - 462001, Madhya Pradesh, India', type: 'textarea', rows: 2, colSpan: 4 },
          { key: 'branchPhoneNo', label: 'Branch Phone Number', placeholder: '9522262613', type: 'tel', colSpan: 2 },
          { key: 'customerCareNo', label: 'Contact Us (Toll-free)', defaultValue: '1800 4100', readOnly: true, colSpan: 2 },
        ]
      }
    }
  },

  KOTAK: {
    name: 'Kotak Mahindra Bank (Classic)',
    subtitle: 'Standard Kotak Statement Layout',
    badge: 'Kotak Classic',
    theme: 'rose',
    sections: {
      customer: {
        title: 'Customer Details & CRN',
        subtitle: 'Account holder and relationship number',
        icon: '👤',
        fields: [
          { key: 'fullName', label: 'Customer Name', placeholder: 'Kishan Vishwakarma', required: true, colSpan: 2 },
          { key: 'crn', label: 'CRN Number', placeholder: 'xxxxxx478', colSpan: 2 },
          { key: 'address', label: 'Address', placeholder: '118, Semra Kala, Bhopal - 462010', type: 'textarea', rows: 2, colSpan: 4 },
          { key: 'phoneNumber', label: 'Phone Number', placeholder: '9876543210', type: 'tel', colSpan: 2 },
          { key: 'email', label: 'Email', placeholder: 'customer@gmail.com', type: 'email', colSpan: 2 },
        ]
      },
      account: {
        title: 'Account & Branch Codes',
        subtitle: 'Account, branch, and codes',
        icon: '🏛️',
        fields: [
          { key: 'accountNumber', label: 'Account No', placeholder: '9947281077', required: true, colSpan: 2 },
          { key: 'accountType', label: 'Account Type', placeholder: 'Savings', defaultValue: 'Savings', colSpan: 2 },
          { key: 'branchName', label: 'Branch', placeholder: 'Bhopal - Hamedia Road', colSpan: 2 },
          { key: 'ifsc', label: 'IFSC Code', placeholder: 'KKBK0005891', required: true, colSpan: 2 },
          { key: 'micr', label: 'MICR Code', placeholder: '462485007', colSpan: 2 },
          { key: 'branchAddress', label: 'Branch Address', placeholder: 'Hamedia Road, Bhopal', colSpan: 2 },
        ]
      }
    }
  },

  HDFC: {
    name: 'HDFC Bank',
    subtitle: 'Classic & Smart Statement of Account',
    badge: 'HDFC Bank',
    theme: 'blue',
    sections: {
      customer: {
        title: 'Account Holder Details',
        subtitle: 'Customer demographics and address',
        icon: '👤',
        fields: [
          { key: 'fullName', label: 'Account Holder Name', placeholder: 'e.g. Ramesh Sharma', required: true, colSpan: 3 },
          { key: 'customerRelNo', label: 'Customer ID', placeholder: '12345678', colSpan: 1 },
          { key: 'email', label: 'Email Address', placeholder: 'customer@gmail.com', type: 'email', colSpan: 2 },
          { key: 'phoneNumber', label: 'Phone Number', placeholder: '9876543210', type: 'tel', colSpan: 2 },
          { key: 'address', label: 'Residential Address', placeholder: 'Flat 101, Galaxy Apts, MG Road, Bangalore', type: 'textarea', rows: 2, colSpan: 4 },
        ]
      },
      branch: {
        title: 'Branch & Account Routing',
        subtitle: 'Branch, IFSC, and account details',
        icon: '🏛️',
        fields: [
          { key: 'accountNumber', label: 'Account Number', placeholder: '50100234567890', required: true, colSpan: 2 },
          { key: 'accountType', label: 'Account Type', placeholder: 'Savings Account', defaultValue: 'Savings Account', colSpan: 2 },
          { key: 'branchName', label: 'Branch Name', placeholder: 'KORAMANGALA', colSpan: 2 },
          { key: 'branchAddress', label: 'Branch Address', placeholder: '80 Feet Road, Koramangala 4th Block', colSpan: 2 },
          { key: 'ifsc', label: 'IFSC Code', placeholder: 'HDFC0000123', required: true, colSpan: 2 },
          { key: 'micr', label: 'MICR Code', placeholder: '560240002', colSpan: 2 },
        ]
      }
    }
  },

  AXIS: {
    name: 'Axis Bank',
    subtitle: 'Retail & Corporate Statement',
    badge: 'Axis Bank',
    theme: 'purple',
    sections: {
      customer: {
        title: 'Account Holder Information',
        subtitle: 'Customer details and address',
        icon: '👤',
        fields: [
          { key: 'fullName', label: 'Account Holder Name', placeholder: 'e.g. Rajesh Kumar', required: true, colSpan: 3 },
          { key: 'customerRelNo', label: 'Customer ID', placeholder: '987654321', colSpan: 1 },
          { key: 'email', label: 'Email ID', placeholder: 'customer@gmail.com', type: 'email', colSpan: 2 },
          { key: 'phoneNumber', label: 'Mobile Number', placeholder: '9876543210', type: 'tel', colSpan: 2 },
          { key: 'address', label: 'Communication Address', placeholder: '12, Sunrise Enclave, Sector 14, Gurgaon', type: 'textarea', rows: 2, colSpan: 4 },
        ]
      },
      branch: {
        title: 'Branch Routing & Scheme',
        subtitle: 'Branch details, IFSC, and scheme',
        icon: '🏛️',
        fields: [
          { key: 'accountNumber', label: 'Account Number', placeholder: '918010012345678', required: true, colSpan: 2 },
          { key: 'accountType', label: 'Scheme / Account Type', placeholder: 'SAVINGS ACCOUNT', defaultValue: 'SAVINGS ACCOUNT', colSpan: 2 },
          { key: 'branchName', label: 'Branch Name', placeholder: 'SECTOR 14 GURGAON', colSpan: 2 },
          { key: 'branchAddress', label: 'Branch Address', placeholder: 'SCO 23, Sector 14, Urban Estate', colSpan: 2 },
          { key: 'ifsc', label: 'IFSC Code', placeholder: 'UTIB0000123', required: true, colSpan: 2 },
          { key: 'micr', label: 'MICR Code', placeholder: '110211002', colSpan: 2 },
        ]
      }
    }
  },

  BOI: {
    name: 'Bank of India (Current / General)',
    subtitle: 'Current Account & Statement of Account',
    badge: 'BOI Current',
    theme: 'amber',
    sections: {
      customer: {
        title: 'Account Holder / Enterprise Entity',
        subtitle: 'Entity identity, address & communications',
        icon: '🏢',
        fields: [
          { key: 'fullName', label: 'Entity / Enterprise Name', placeholder: 'M/S SHIVAY ORTHO CARE CLINIC PHYSIOTHERAPY &', required: true, colSpan: 4 },
          { key: 'address', label: 'Registered / Premises Address', placeholder: 'SHOP NO 6\nSKY TOWER ROYAL MARKET\nBHOPAL-462001\nMADHYA PRADESH\nINDIA', type: 'textarea', rows: 4, colSpan: 4 },
          { key: 'jointHolder', label: 'Joint Holder', placeholder: '', colSpan: 2 },
          { key: 'nomineeName', label: 'Nominee Status', placeholder: 'YES', defaultValue: 'YES', colSpan: 2 },
        ]
      },
      branch: {
        title: 'Branch Routing & Account Scheme',
        subtitle: 'Branch location, IFSC, and account identifiers',
        icon: '🏛️',
        fields: [
          { key: 'customerRelNo', label: 'Customer ID (CUSTID)', placeholder: 'CC9396053', required: true, colSpan: 2 },
          { key: 'accountNumber', label: 'Account Number (A/C NO)', placeholder: '907020110000340', required: true, colSpan: 2 },
          { key: 'accountType', label: 'Account Type (TYPE)', placeholder: 'CURRENT- GENERAL', defaultValue: 'CURRENT- GENERAL', colSpan: 2 },
          { key: 'currency', label: 'Currency', placeholder: 'INR', defaultValue: 'INR', readOnly: true, colSpan: 2 },
          { key: 'branchName', label: 'Branch Name', placeholder: 'RATIBAD', required: true, colSpan: 2 },
          { key: 'ifsc', label: 'IFSC Code', placeholder: 'BKID0009070', required: true, colSpan: 2 },
          { key: 'micr', label: 'MICR Code', placeholder: '462013018', colSpan: 2 },
        ]
      }
    }
  }
};

export const isCurrentAccountTemplate = (templateCode) => {
  if (!templateCode) return false;
  const key = templateCode.toUpperCase().trim();
  const bank = BANKS_LIST.find(b => b.value === key);
  if (bank) return bank.category === 'current';
  return ['HDFCCURRENT', 'UNIONBANK', 'BOI', 'AU'].includes(key);
};

export const getDefaultTemplateForProfile = (profile, currentTemplate) => {
  const isCurrentTpl = isCurrentAccountTemplate(currentTemplate);
  if (profile === 'currentAccount') {
    if (isCurrentTpl && currentTemplate) return currentTemplate.toUpperCase().trim();
    if (currentTemplate === 'HDFC') return 'HDFCCURRENT';
    return 'HDFCCURRENT';
  } else {
    // salaried or selfEmployed
    if (!isCurrentTpl && currentTemplate) return currentTemplate.toUpperCase().trim();
    if (currentTemplate === 'HDFCCURRENT') return 'HDFC';
    return 'SBINEW';
  }
};

export const getBankConfig = (templateCode) => {
  if (!templateCode) return BANK_CONFIGS.SBINEW;
  const key = templateCode.toUpperCase().trim();
  return BANK_CONFIGS[key] || BANK_CONFIGS.SBINEW;
};