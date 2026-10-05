import { createContext, useContext, useState, useCallback } from 'react';

const StatementContext = createContext(null);

export function StatementProvider({ children }) {
  const [step, setStep] = useState(1);
  const [statement, setStatementState] = useState({
    template: 'SBINEW',
    periodMonths: 3,
    employmentType: 'salaried',
    salary: 30000,
    salaryCompanyName: '',
    openingBalance: 5000,
    endBalance: 40000,
    fixedDebitPercent: 25,
    minTxMonth: 5,
    maxTxMonth: 15,
    transactions: [],
    manualDrCount: null,
    manualCrCount: null,
    manualTotalDebits: null,
    manualTotalCredits: null,
    details: {
      title: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      accountNumber: '',
      ifsc: '',
      accountType: '',
      accountStatus: 'OPEN',
      accountOpenDate: '',
      branchName: '',
      branchLocation: '',
      branchAddress: '',
      branchPhoneNo: '',
      branchEmail: '',
      micr: '',
      customerRelNo: '',
      ckycr: 'Not Available',
      nomineeName: '',
      pan: '',
      startingBalance: 5000,
      currency: 'INR',
      password: '',
      branchCode: '',
      crn: '',
      country: 'INDIA',
      unclearedAmount: '0.00',
      modBal: '0.00',
      lien: '0.0',
      limit: '0.00',
      monthlyAvgBalance: '0.00',
      interestRate: '2.50 % p.a.',
      drawingPower: '0.00',
      customerCareNo: '1800 4100',
    },
    meta: {
      userType: 'salaried',
      generatedAt: new Date().toISOString(),
      statementPeriodStart: '',
      statementPeriodEnd: '',
      configHash: 'auto',
      seed: Date.now(),
      password: '',
    },
  });

  const updateStatement = useCallback((updates) => {
    setStatementState(prev => {
      const updated = { ...prev };
      for (const key of Object.keys(updates)) {
        if (key === 'meta' && typeof updates[key] === 'object') {
          updated.meta = { ...updated.meta, ...updates[key] };
        } else if (key === 'details' && typeof updates[key] === 'object') {
          updated.details = { ...updated.details, ...updates[key] };
        } else {
          updated[key] = updates[key];
        }
      }
      return updated;
    });
  }, []);

  const updateDetails = useCallback((field, value) => {
    setStatementState(prev => ({
      ...prev,
      details: { ...prev.details, [field]: value },
    }));
  }, []);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <StatementContext.Provider value={{
      step,
      statement,
      updateStatement,
      updateDetails,
      nextStep,
      prevStep,
      setStep,
    }}>
      {children}
    </StatementContext.Provider>
  );
}

export const useStatement = () => useContext(StatementContext);