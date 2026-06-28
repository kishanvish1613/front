import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStatement } from '../context/StatementContext';
import { uploadOcr } from '../api/ocrApi';
import { generatePdf } from '../api/pdfApi';
import { generateTransactions } from '../utils/transactionGenerator';
import { BANK_FIELD_CONFIG, FIELD_LABELS, STATEMENT_INFO_FIELDS } from '../config/bankFieldConfig';
import PdfViewer from '../components/PdfViewer';
import TransactionTable from '../components/TransactionTable';

const Card = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_10px_40px_rgba(249,115,22,0.15)] border border-orange-200/30 ${className}`}
  >
    {children}
  </motion.div>
);

const Input = ({ label, value, onChange, type = 'text', placeholder, required, readOnly, disabled, defaultValue, min, max }) => (
  <div className="mb-6">
    {label && <label className="block text-sm font-medium text-gray-600 mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <input
      type={type}
      value={value ?? defaultValue ?? ''}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      min={min}
      max={max}
      className="w-full h-16 px-5 bg-gray-50 border border-gray-200 rounded-[18px] text-gray-800 text-base placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder, disabled }) => (
  <div className="mb-6">
    {label && <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>}
    <div className="relative">
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full h-16 px-5 bg-gray-50 border border-gray-200 rounded-[18px] text-gray-800 text-base placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all appearance-none pr-12"
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

export default function StatementWizard() {
  const { step, statement, updateStatement, updateDetails } = useStatement();

  const [activeTab, setActiveTab] = useState('home');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [lastFile, setLastFile] = useState(null);
  const [useOcrDates, setUseOcrDates] = useState(true);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [pdfFilename, setPdfFilename] = useState('statement.pdf');
  const [showPdf, setShowPdf] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [lockPdf, setLockPdf] = useState(false);

  useEffect(() => {
    const startDate = statement.meta.statementPeriodStart;
    const months = statement.periodMonths;
    if (startDate && months && !isNaN(new Date(startDate).getTime())) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + months);
      const y = end.getFullYear();
      const m = String(end.getMonth() + 1).padStart(2, '0');
      const d = String(end.getDate()).padStart(2, '0');
      const calculatedEnd = `${y}-${m}-${d}`;
      if (!statement.meta.statementPeriodEnd) {
        updateStatement({ meta: { ...statement.meta, statementPeriodEnd: calculatedEnd } });
      }
    }
  }, [statement.meta.statementPeriodStart, statement.periodMonths, statement.meta.statementPeriodEnd, updateStatement]);

  useEffect(() => {
    if (statement.employmentType === 'selfEmployed') {
      updateStatement({ salary: 0, salaryCompanyName: '' });
    }
  }, [statement.employmentType, updateStatement]);

  const visibleFields = useMemo(() => {
    const config = BANK_FIELD_CONFIG[statement.template];
    return config ? config.fields : [];
  }, [statement.template]);

  const handleFileUpload = async (file) => {
    setOcrLoading(true);
    setOcrError('');
    setShowPasswordInput(false);
    try {
      const data = await uploadOcr(file, password || undefined);
      if (data.encrypted) {
        setOcrError(data.error);
        setShowPasswordInput(true);
        setLastFile(file);
      } else {
        processOcrResult(data.result);
      }
    } catch (err) {
      setOcrError(err.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const processOcrResult = (res) => {
    updateDetails('fullName', res.name || '');
    updateDetails('email', res.email?.toLowerCase() || '');
    updateDetails('phoneNumber', res.phoneNumber || '');
    updateDetails('address', res.address || '');
    updateDetails('accountNumber', res.accountNumber || '');
    updateDetails('ifsc', res.ifsc || '');
    updateDetails('accountType', res.accountType || 'Savings Account');
    updateDetails('accountOpenDate', res.accountOpenDate || '');
    updateDetails('branchName', res.branch || '');
    updateDetails('branchLocation', res.branchLocation || '');
    updateDetails('branchAddress', res.branchAddress || '');
    updateDetails('branchPhoneNo', res.branchPhoneNo || '');
    updateDetails('micr', res.micr || '');
    updateDetails('customerRelNo', res.customerRelNo || '');
    updateDetails('ckycr', res.ckycr || 'Not Available');
    updateDetails('nomineeName', res.nomineeName || '');
    updateDetails('pan', res.pan || '');

    updateStatement({ template: res.bankName || statement.template });

    if (useOcrDates && res.statementPeriodStart && res.statementPeriodEnd) {
      const formatDate = (ddmmyyyy) => {
        const [d, m, y] = ddmmyyyy.split('-');
        return `${y}-${m}-${d}`;
      };
      updateStatement({
        meta: { ...statement.meta, statementPeriodStart: formatDate(res.statementPeriodStart), statementPeriodEnd: formatDate(res.statementPeriodEnd) },
      });
    }

    if (res.openingBalance) {
      const num = parseFloat(res.openingBalance.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) {
        updateDetails('startingBalance', num);
        updateStatement({ openingBalance: num });
      }
    }
    setShowPasswordInput(false);
  };

  const handlePasswordRetry = async () => {
    if (!lastFile || !password) return;
    setOcrLoading(true);
    setOcrError('');
    try {
      const data = await uploadOcr(lastFile, password);
      if (data.encrypted) setOcrError('Incorrect password');
      else {
        processOcrResult(data.result);
        setPassword('');
      }
    } catch (err) {
      setOcrError(err.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleGenerateTransactions = () => {
    const startDate = statement.meta.statementPeriodStart;
    const endDate = statement.meta.statementPeriodEnd;
    if (!startDate || !endDate) {
      alert('Please fill in the From Date and To Date first.');
      return;
    }
    try {
      const txns = generateTransactions({
        salary: statement.salary,
        openingBalance: statement.openingBalance,
        endBalance: statement.endBalance,
        fixedDebitPercent: statement.fixedDebitPercent,
        salaryCompanyName: statement.salaryCompanyName,
        minTxMonth: statement.minTxMonth,
        maxTxMonth: statement.maxTxMonth,
        periodMonths: statement.periodMonths,
        startDate,
        endDate,
        bank: statement.template,
        branchCode: statement.details.ifsc.substring(6),
        branchName: statement.details.branchName,
        branchLocation: statement.details.branchLocation || '',
        employmentType: statement.employmentType,
        manualDrCount: statement.manualDrCount,
        manualCrCount: statement.manualCrCount,
        manualTotalDebits: statement.manualTotalDebits,
        manualTotalCredits: statement.manualTotalCredits,
      });
      updateStatement({ transactions: txns });
      if (txns.length === 0) alert('No transactions generated.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handlePreviewPdf = async () => {
    setPdfLoading(true);
    try {
      const toIsoDate = (dateStr) => dateStr ? new Date(dateStr + 'T00:00:00').toISOString() : new Date().toISOString();
      const details = {
        title: statement.details.title || '',
        name: statement.details.fullName || '',
        fullName: statement.details.fullName || '',
        accountNumber: statement.details.accountNumber || '',
        ifsc: statement.details.ifsc || '',
        startingBalance: statement.details.startingBalance || statement.openingBalance || 0,
        address: statement.details.address || '',
        branch: statement.details.branchName || '',
        branchAddress: statement.details.branchAddress || '',
        phoneNumber: statement.details.phoneNumber || '',
        email: statement.details.email || '',
        micr: statement.details.micr || '',
        branchPhoneNo: statement.details.branchPhoneNo || '',
        customerRelNo: statement.details.customerRelNo || '0000000',
        pan: statement.details.pan || '',
        cykr: statement.details.ckycr || '',
        accountType: statement.details.accountType || '',
        password: statement.details.password || '',
      };
      const meta = {
        template: (statement.template || 'KOTAK').toUpperCase(),
        userType: statement.meta.userType || 'salaried',
        generatedAt: new Date().toISOString(),
        statementPeriodStart: toIsoDate(statement.meta.statementPeriodStart),
        statementPeriodEnd: toIsoDate(statement.meta.statementPeriodEnd),
        configHash: statement.meta.configHash || 'auto',
        seed: statement.meta.seed || Date.now(),
        password: statement.meta.password || '',
      };

      // Lock PDF password logic
      if (lockPdf) {
        const bank = statement.template.toUpperCase();
        if (bank.startsWith('SBI')) {
          meta.password = statement.details.customerRelNo || '';
        } else if (bank.startsWith('KOTAK')) {
          meta.password = statement.details.micr || '';
        }
      } else {
        meta.password = '';
      }

      const stmt = { id: 'frontend-generated', details, meta, transactions: statement.transactions || [] };

      const { blob, filename } = await generatePdf(stmt);
      setPdfBlob(blob);
      setPdfFilename(filename);
      setShowPdf(true);
    } catch (err) {
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const banks = ['SBI', 'KOTAK', 'AXIS', 'HDFC', 'BOI', 'SBI2', 'KOTAKNEW', 'SBINEW'].map(b => ({ value: b, label: b }));
  const periodOptions = [1, 3, 6, 12].map(m => ({ value: m, label: `${m} Month${m > 1 ? 's' : ''}` }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-rose-50 text-gray-800 font-sans pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 via-red-500 to-blue-600 bg-clip-text text-transparent">
            Bank Statements
          </h1>
          <div className="flex gap-2 bg-orange-50 rounded-full p-1 border border-orange-200">
            <button onClick={() => setActiveTab('home')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'home' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'text-gray-600 hover:text-orange-600'}`}>Home</button>
            <button onClick={() => setActiveTab('generate')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'generate' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600'}`}>Generate</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="rounded-[28px] bg-gradient-to-br from-orange-500 via-red-500 to-blue-600 p-8 text-white shadow-xl">
              <p className="text-sm font-medium opacity-90">Trusted & Secure</p>
              <h2 className="text-3xl font-bold mt-2 leading-tight">Generate Bank Statements in Seconds</h2>
              <p className="text-white/90 mt-3 text-base">AI‑powered realistic statements for 8+ Indian banks with instant PDF export</p>
              <div className="flex gap-3 mt-6">
                {['⚡ Instant', '🔒 Secure', '📄 Realistic'].map(tag => (
                  <span key={tag} className="px-4 py-2 bg-white/25 rounded-full text-sm font-medium backdrop-blur-sm">{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Choose your profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => { updateStatement({ employmentType: 'salaried' }); setActiveTab('generate'); }} className="bg-white rounded-2xl p-6 text-left border border-orange-200 hover:border-orange-500 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4 text-2xl">💼</div>
                  <h4 className="font-bold text-gray-800 text-lg">Salaried Professional</h4>
                  <p className="text-gray-600 text-sm mt-1">Auto‑generate salary credits, allowances and realistic spending patterns</p>
                </button>
                <button onClick={() => { updateStatement({ employmentType: 'selfEmployed' }); setActiveTab('generate'); }} className="bg-white rounded-2xl p-6 text-left border border-blue-200 hover:border-blue-500 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 text-2xl">🏢</div>
                  <h4 className="font-bold text-gray-800 text-lg">Self Employed / Business</h4>
                  <p className="text-gray-600 text-sm mt-1">Generate merchant payments, turnover entries and business transactions</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'generate' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-center">
              <div className="bg-white rounded-3xl p-1.5 inline-flex gap-1 border border-gray-200 shadow-sm">
                {[{ key: 'salaried', label: '💼 Salaried' }, { key: 'selfEmployed', label: '🏢 Self-Employed' }].map(opt => (
                  <button key={opt.key} onClick={() => updateStatement({ employmentType: opt.key })} className={`px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all ${statement.employmentType === opt.key ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : 'text-gray-600 hover:text-orange-600'}`}>{opt.label}</button>
                ))}
              </div>
            </div>

            <Card>
              <h2 className="text-xl font-bold text-gray-800 mb-1">{statement.employmentType === 'salaried' ? 'Salaried Statement' : 'Self‑Employed Statement'}</h2>
              <p className="text-gray-500 text-sm mb-6">Fill in the details below or upload a PDF for auto‑fill</p>

              <div className="mb-8">
                <div className="border-2 border-dashed border-orange-300 rounded-2xl p-6 text-center bg-orange-50/50 hover:bg-orange-50 transition-colors">
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp" onChange={e => e.target.files[0] && handleFileUpload(e.target.files[0])} className="hidden" id="ocr-upload" />
                  <label htmlFor="ocr-upload" className="cursor-pointer">
                    <div className="text-3xl mb-2">📄</div>
                    <p className="text-orange-600 font-semibold">Auto‑fill from PDF</p>
                    <p className="text-xs text-gray-500 mt-1">Upload a bank statement to extract data</p>
                  </label>
                  {ocrLoading && <p className="text-orange-600 mt-2 animate-pulse">Extracting data…</p>}
                  {ocrError && !showPasswordInput && <p className="text-red-500 mt-2">{ocrError}</p>}
                  {showPasswordInput && (
                    <div className="mt-4 space-y-2">
                      <Input type="password" value={password} onChange={setPassword} placeholder="PDF password" />
                      <button onClick={handlePasswordRetry} className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold text-white hover:shadow-lg transition-all">Unlock & Extract</button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <input type="checkbox" id="useOcrDates" checked={useOcrDates} onChange={e => setUseOcrDates(e.target.checked)} className="accent-orange-500" />
                  <label htmlFor="useOcrDates" className="text-xs text-gray-500">Use extracted dates</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
                <div>
                  <Select label="Bank" value={statement.template} onChange={val => updateStatement({ template: val })} options={banks} />
                  <Select label="Period" value={statement.periodMonths} onChange={val => updateStatement({ periodMonths: Number(val) })} options={periodOptions} />
                  <Input label="From Date" type="date" value={statement.meta.statementPeriodStart} onChange={val => updateStatement({ meta: { ...statement.meta, statementPeriodStart: val } })} />
                  <Input label="To Date (auto)" type="date" value={statement.meta.statementPeriodEnd} onChange={val => updateStatement({ meta: { ...statement.meta, statementPeriodEnd: val } })} />
                  <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Account Holder</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Title" value={statement.details.title} onChange={val => updateDetails('title', val)} options={['Mr', 'Mrs', 'Ms', 'Dr'].map(t => ({ value: t, label: t }))} />
                    <Input label="Full Name" value={statement.details.fullName} onChange={val => updateDetails('fullName', val)} required />
                  </div>
                  <Input label="Email" type="email" value={statement.details.email} onChange={val => updateDetails('email', val)} />
                  <Input label="Phone" type="tel" value={statement.details.phoneNumber} onChange={val => updateDetails('phoneNumber', val)} />
                  <Input label="Address" value={statement.details.address} onChange={val => updateDetails('address', val)} />
                  <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Bank Account & Branch</h3>
                  <Input label="Account Number" value={statement.details.accountNumber} onChange={val => updateDetails('accountNumber', val)} required />
                  <Input label="IFSC" value={statement.details.ifsc} onChange={val => updateDetails('ifsc', val)} required />
                  {visibleFields.includes('branchName') && <Input label="Branch Name" value={statement.details.branchName} onChange={val => updateDetails('branchName', val)} />}
                  {visibleFields.includes('branchLocation') && <Input label="Branch Location" value={statement.details.branchLocation} onChange={val => updateDetails('branchLocation', val)} />}
                  {visibleFields.includes('branchAddress') && <Input label="Branch Address" value={statement.details.branchAddress} onChange={val => updateDetails('branchAddress', val)} />}
                  {visibleFields.includes('branchPhoneNo') && <Input label="Branch Phone" type="tel" value={statement.details.branchPhoneNo} onChange={val => updateDetails('branchPhoneNo', val)} />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mt-0 md:mt-8 mb-4">Additional Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {visibleFields.includes('accountType') && <Input label="Account Type" value={statement.details.accountType} onChange={val => updateDetails('accountType', val)} />}
                    <Input label="Status" value="OPEN" readOnly />
                    {visibleFields.includes('accountOpenDate') && <Input label="Account Open Date" type="date" value={statement.details.accountOpenDate} onChange={val => updateDetails('accountOpenDate', val)} />}
                    {visibleFields.includes('customerRelNo') && <Input label="CIF Number" value={statement.details.customerRelNo} onChange={val => updateDetails('customerRelNo', val)} />}
                    {visibleFields.includes('ckycr') && <Input label="CKYCR Number" value={statement.details.ckycr} onChange={val => updateDetails('ckycr', val)} />}
                    {visibleFields.includes('nomineeName') && <Input label="Nominee Name" value={statement.details.nomineeName} onChange={val => updateDetails('nomineeName', val)} />}
                    <Input label="Currency" value="INR" readOnly />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Statement Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Clear Balance" type="number" value={statement.openingBalance} onChange={val => { updateStatement({ openingBalance: Number(val) }); updateDetails('startingBalance', Number(val)); }} />
                    {STATEMENT_INFO_FIELDS.map(field => (
                      <Input key={field.field} label={field.label} type={field.type} readOnly={field.readOnly} defaultValue={field.defaultValue} />
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Transaction Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Monthly Salary" type="number" value={statement.salary} onChange={val => updateStatement({ salary: Number(val) })} disabled={statement.employmentType === 'selfEmployed'} />
                    <Input label="Opening Balance" type="number" value={statement.openingBalance} onChange={val => updateStatement({ openingBalance: Number(val) })} />
                    <Input label="Target Closing" type="number" value={statement.endBalance} onChange={val => updateStatement({ endBalance: Number(val) })} />
                    <Input label="Debit %" type="number" value={statement.fixedDebitPercent} onChange={val => updateStatement({ fixedDebitPercent: Number(val) })} />
                    <Input label="Company Name" value={statement.salaryCompanyName} onChange={val => updateStatement({ salaryCompanyName: val })} disabled={statement.employmentType === 'selfEmployed'} />
                    <Input label="Min Tx/Month" type="number" value={statement.minTxMonth} onChange={val => updateStatement({ minTxMonth: Number(val) })} />
                    <Input label="Max Tx/Month" type="number" value={statement.maxTxMonth} onChange={val => updateStatement({ maxTxMonth: Number(val) })} />
                  </div>
                </div>
              </div>

              {/* Manual Summary */}
              <Card className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Manual Summary (optional)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input label="Dr Count" type="number" value={statement.manualDrCount ?? ''} onChange={val => updateStatement({ manualDrCount: val ? Number(val) : null })} placeholder="28" />
                  <Input label="Cr Count" type="number" value={statement.manualCrCount ?? ''} onChange={val => updateStatement({ manualCrCount: val ? Number(val) : null })} placeholder="11" />
                  <Input label="Total Debits" type="number" value={statement.manualTotalDebits ?? ''} onChange={val => updateStatement({ manualTotalDebits: val ? Number(val) : null })} placeholder="294801" />
                  <Input label="Total Credits" type="number" value={statement.manualTotalCredits ?? ''} onChange={val => updateStatement({ manualTotalCredits: val ? Number(val) : null })} placeholder="296280" />
                </div>
              </Card>

              <button onClick={handleGenerateTransactions} className="mt-8 w-full h-16 bg-gradient-to-r from-orange-500 via-red-500 to-blue-600 hover:from-orange-600 hover:via-red-600 hover:to-blue-700 text-white text-lg font-bold rounded-2xl transition-all hover:-translate-y-0.5 active:scale-[0.98] shadow-lg">
                Generate Transaction History
              </button>
              {statement.transactions.length > 0 && <p className="text-green-600 text-center mt-3 font-medium">{statement.transactions.length} transactions ready</p>}
            </Card>

            {statement.transactions.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Transactions</h3>
                <TransactionTable transactions={statement.transactions} />
              </Card>
            )}

            {/* Export PDF Card (with lock feature) */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Export PDF</h3>
              <div className="flex flex-col gap-4">
                {/* Lock PDF checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="lockPdf"
                    checked={lockPdf}
                    onChange={e => setLockPdf(e.target.checked)}
                    disabled={
                      !statement.template.toUpperCase().startsWith('SBI') &&
                      !statement.template.toUpperCase().startsWith('KOTAK')
                    }
                    className="accent-orange-500 w-4 h-4"
                  />
                  <label htmlFor="lockPdf" className="text-sm text-gray-700">
                    Lock PDF with password{' '}
                    {statement.template.toUpperCase().startsWith('SBI')
                      ? '(CIF Number)'
                      : '(MICR Number)'}
                  </label>
                </div>

                <button
                  onClick={handlePreviewPdf}
                  disabled={pdfLoading}
                  className="w-full h-14 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-semibold disabled:opacity-50 transition-all shadow-md"
                >
                  {pdfLoading ? 'Generating…' : 'Preview PDF'}
                </button>
                <div className="grid grid-cols-2 gap-4">
                  {/* Download */}
                  <button
                    onClick={() => {
                      if (pdfBlob && pdfFilename) {
                        const url = URL.createObjectURL(pdfBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = pdfFilename;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    disabled={!pdfBlob}
                    className="h-14 border-2 border-orange-500 text-orange-600 rounded-2xl font-semibold hover:bg-orange-50 disabled:opacity-30 transition-all"
                  >
                    Download PDF
                  </button>
                  {/* Share */}
                  <button
                    onClick={async () => {
                      if (pdfBlob && pdfFilename && navigator.share) {
                        try {
                          await navigator.share({
                            files: [new File([pdfBlob], pdfFilename, { type: 'application/pdf' })],
                          });
                        } catch (e) {}
                      }
                    }}
                    disabled={!pdfBlob}
                    className="h-14 border-2 border-gray-300 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 disabled:opacity-30 transition-all"
                  >
                    Share PDF
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {showPdf && pdfBlob && <PdfViewer blob={pdfBlob} onClose={() => setShowPdf(false)} />}
      </div>
    </div>
  );
}