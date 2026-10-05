import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStatement } from '../context/StatementContext';
import { uploadOcr } from '../api/ocrApi';
import { generatePdf } from '../api/pdfApi';
import { useAuth } from '../context/AuthContext';
import { 
  BANKS_LIST, 
  GROUPED_BANKS_LIST, 
  getBankConfig, 
  isCurrentAccountTemplate, 
  getDefaultTemplateForProfile 
} from '../config/bankFieldConfig';
import PdfViewer from '../components/PdfViewer';
import TransactionTable from '../components/TransactionTable';
import { generateTransactions } from '../utils/transactionGenerator';

// ==================== REUSABLE UI PRIMITIVES ====================
const SectionCard = ({ title, subtitle, icon, badge, children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className={`bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow ${className}`}
  >
    {(title || icon) && (
      <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg font-bold border border-orange-100 shadow-xs">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-snug">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
            {badge}
          </span>
        )}
      </div>
    )}
    {children}
  </motion.div>
);

const FormInput = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  readOnly = false,
  disabled = false,
  rows = 3,
  prefix = null,
  suffix = null,
  helperText = null,
  className = ''
}) => (
  <div className={`mb-5 ${className}`}>
    {label && (
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
        {readOnly && <span className="text-[10px] text-slate-400 uppercase tracking-wider">System Default</span>}
      </div>
    )}
    <div className="relative flex items-center">
      {prefix && (
        <div className="absolute left-4 pointer-events-none text-slate-400 text-sm font-medium">
          {prefix}
        </div>
      )}
      {type === 'textarea' ? (
        <textarea
          value={value ?? ''}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          disabled={disabled}
          className={`w-full px-4 py-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''} ${readOnly ? 'bg-slate-100/70 text-slate-500 cursor-not-allowed' : ''}`}
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className={`w-full h-12 px-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${prefix ? 'pl-9' : ''} ${suffix ? 'pr-9' : ''} ${readOnly ? 'bg-slate-100/70 text-slate-500 cursor-not-allowed' : ''}`}
        />
      )}
      {suffix && (
        <div className="absolute right-4 pointer-events-none text-slate-400 text-xs font-semibold">
          {suffix}
        </div>
      )}
    </div>
    {helperText && <p className="text-[11px] text-slate-400 mt-1.5">{helperText}</p>}
  </div>
);

const FormSelect = ({ label, value, onChange, options, placeholder, required, disabled, className = '' }) => (
  <div className={`mb-5 ${className}`}>
    {label && (
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
        {label}
        {required && <span className="text-rose-500 font-bold ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        value={value || ''}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full h-12 px-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all appearance-none pr-10 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        <option value="">{placeholder || 'Select...'}</option>
        {options.map((opt, i) => {
          if (opt.options) {
            return (
              <optgroup key={opt.label || i} label={opt.label}>
                {opt.options.map(sub => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </optgroup>
            );
          }
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================
export default function StatementWizard({ onOpenAdmin }) {
  const { statement, updateStatement, updateDetails } = useStatement();
  const { user, logout, isAdmin } = useAuth();

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
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-calculate To Date from Start Date & Period Months (skipped when Custom period is active)
  useEffect(() => {
    if (statement.periodMonths === 'custom' || statement.periodMonths === 0 || !statement.periodMonths) return;
    const startDate = statement.meta.statementPeriodStart;
    const months = Number(statement.periodMonths);
    if (startDate && months && !isNaN(new Date(startDate).getTime())) {
      const parts = startDate.split('-').map(Number);
      if (parts.length === 3) {
        const [y, m, d] = parts;
        let endYear = y;
        let endMonth = m + months - 1;
        while (endMonth > 12) {
          endYear++;
          endMonth -= 12;
        }
        let endDay;
        if (d === 1) {
          endDay = new Date(Date.UTC(endYear, endMonth, 0)).getUTCDate();
        } else {
          const maxDays = new Date(Date.UTC(endYear, endMonth, 0)).getUTCDate();
          endDay = Math.min(d - 1, maxDays);
          if (endDay <= 0) endDay = maxDays;
        }
        const calculatedEnd = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
        if (statement.meta.statementPeriodEnd !== calculatedEnd) {
          updateStatement({ meta: { ...statement.meta, statementPeriodEnd: calculatedEnd } });
        }
      }
    }
  }, [statement.meta.statementPeriodStart, statement.periodMonths, statement.meta.statementPeriodEnd, updateStatement]);

  const normalizeDateToYmd = (dateStr) => {
    if (!dateStr) return '';
    dateStr = dateStr.trim();
    const mText = dateStr.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
    if (mText) {
      const day = mText[1].padStart(2, '0');
      const monthMap = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
      const month = monthMap[mText[2].toLowerCase()] || '01';
      const year = mText[3];
      return `${year}-${month}-${day}`;
    }
    const mSlash = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (mSlash) {
      const day = mSlash[1].padStart(2, '0');
      const month = mSlash[2].padStart(2, '0');
      let year = mSlash[3];
      if (year.length === 2) {
        year = (Number(year) > 70 ? '19' : '20') + year;
      }
      return `${year}-${month}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return dateStr;
  };

  const processOcrResult = (res) => {
    updateDetails('fullName', res.name || '');
    updateDetails('email', res.email?.toLowerCase() || '');
    updateDetails('phoneNumber', res.phoneNumber || '');
    const cleanAddr = (res.address || '').trim();
    updateDetails('address', cleanAddr);
    updateDetails('city', res.city || '');
    updateDetails('state', res.state || '');
    updateDetails('pincode', res.pincode || '');
    updateDetails('country', res.country || 'INDIA');
    updateDetails('accountNumber', res.accountNumber || '');
    updateDetails('ifsc', res.ifsc || '');
    updateDetails('accountType', res.accountType || 'Savings');
    updateDetails('accountOpenDate', normalizeDateToYmd(res.accountOpenDate) || '');
    updateDetails('branchName', res.branch || '');
    updateDetails('branchLocation', res.branchLocation || '');
    updateDetails('branchAddress', (res.branchAddress || '').trim());
    updateDetails('branchPhoneNo', res.branchPhoneNo || '');
    updateDetails('micr', res.micr || '');
    updateDetails('customerRelNo', res.customerRelNo || '');
    updateDetails('ckycr', res.ckycr || 'Not Available');
    updateDetails('nomineeName', res.nomineeName || '');
    updateDetails('pan', res.pan || '');
    updateDetails('branchCode', res.branchCode || '');
    updateDetails('branchEmail', res.branchEmail || '');
    updateDetails('crn', res.crn || res.customerRelNo || '');
    if (res.interestRate) updateDetails('interestRate', res.interestRate);
    if (res.unclearedAmount) updateDetails('unclearedAmount', res.unclearedAmount);
    if (res.modBal) updateDetails('modBal', res.modBal);
    if (res.lien) updateDetails('lien', res.lien);
    if (res.limit) updateDetails('limit', res.limit);
    if (res.monthlyAvgBalance) updateDetails('monthlyAvgBalance', res.monthlyAvgBalance);
    if (res.drawingPower) updateDetails('drawingPower', res.drawingPower);
    if (res.accountStatus) updateDetails('accountStatus', res.accountStatus);
    if (res.customerCareNo) updateDetails('customerCareNo', res.customerCareNo);

    if (res.companyName) {
      updateStatement({ salaryCompanyName: res.companyName });
    }
    if (res.monthlySalary) {
      const num = parseFloat(String(res.monthlySalary).replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0) {
        updateStatement({ salary: num });
      }
    }

    let bankTpl = (res.bankName || statement.template || 'SBINEW').toUpperCase();
    if (bankTpl === 'KOTAK') bankTpl = 'KOTAKNEW';
    if (bankTpl === 'SBI') bankTpl = 'SBINEW';
    if (bankTpl === 'UNIONBANK' || bankTpl === 'UNION') bankTpl = 'UNIONBANK';

    const currentMode = statement.employmentType || 'salaried';

    if (currentMode === 'salaried' || currentMode === 'selfEmployed') {
      // In Salaried or Self-Employed mode, keep HDFC as classic savings
      if (bankTpl.startsWith('HDFC') || bankTpl === 'HDFCCURRENT') {
        bankTpl = 'HDFC';
      }
      updateStatement({ template: bankTpl, employmentType: currentMode });
    } else {
      // In Current Account mode, use commercial template
      if (bankTpl.startsWith('HDFC') || bankTpl === 'HDFCCURRENT') {
        bankTpl = 'HDFCCURRENT';
      }
      updateStatement({ template: bankTpl, employmentType: 'currentAccount' });
    }

    if (useOcrDates && res.statementPeriodStart && res.statementPeriodEnd) {
      updateStatement({
        meta: {
          ...statement.meta,
          statementPeriodStart: normalizeDateToYmd(res.statementPeriodStart),
          statementPeriodEnd: normalizeDateToYmd(res.statementPeriodEnd),
        },
      });
    }

    if (res.openingBalance) {
      const num = parseFloat(String(res.openingBalance).replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) {
        updateDetails('startingBalance', num);
        updateStatement({ openingBalance: num });
      }
    }

    if (res.closingBalance) {
      const num = parseFloat(String(res.closingBalance).replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) {
        updateStatement({ endBalance: num });
      }
    }
    setShowPasswordInput(false);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
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

  const handlePasswordRetry = async () => {
    if (!lastFile || !password) return;
    setOcrLoading(true);
    setOcrError('');
    try {
      const data = await uploadOcr(lastFile, password);
      if (data.encrypted) {
        setOcrError('Incorrect password');
      } else {
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
      const isCustom = statement.periodMonths === 'custom' || !Number(statement.periodMonths);
      let effectiveMonths = Number(statement.periodMonths);
      if (isCustom) {
        const startD = new Date(startDate);
        const endD = new Date(endDate);
        const diffDays = Math.max(1, Math.round((endD - startD) / (1000 * 60 * 60 * 24)));
        effectiveMonths = Math.max(1, Math.round(diffDays / 30.4375));
      }
      const txns = generateTransactions({
        salary: statement.salary,
        openingBalance: statement.openingBalance,
        endBalance: statement.endBalance,
        salaryCompanyName: statement.salaryCompanyName,
        minTxMonth: statement.minTxMonth,
        maxTxMonth: statement.maxTxMonth,
        periodMonths: effectiveMonths || 1,
        startDate,
        endDate,
        employmentType: statement.employmentType,
        bank: statement.template,
        details: statement.details,
      });
      updateStatement({ transactions: txns });
      if (txns.length === 0) alert('No transactions generated.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleCompanyNameChange = (newName) => {
    updateStatement({ salaryCompanyName: newName });
    if (statement.transactions && statement.transactions.length > 0) {
      const upper = (newName || '').toUpperCase().trim();
      const updatedTxns = statement.transactions.map(t => {
        if (t.type === 'SALARY') {
          const desc = t.description || '';
          if (desc.includes('NEFT*')) {
            return { ...t, description: desc.replace(/(NEFT\*[^*]+\*[^*]+\*)([^\n]+)/, `$1${upper}`) };
          }
          const m = desc.match(/^(NEFT(?:\/INW|-|\s+CR-|\s+[A-Z0-9]+)\s+)(.+)$/i);
          if (m) {
            return { ...t, description: `${m[1]}${upper}` };
          }
          return { ...t, description: `NEFT ${upper}` };
        }
        return t;
      });
      updateStatement({ transactions: updatedTxns });
    }
  };

  const handlePreviewPdf = async () => {
    if (!statement.details.fullName || !statement.details.accountNumber || !statement.details.ifsc) {
      alert('Please fill in Full Name, Account Number and IFSC.');
      return;
    }
    if (!statement.transactions.length) {
      alert('No transactions to export. Generate or enter them manually first.');
      return;
    }

    setPdfLoading(true);
    try {
      const toIsoDate = (dateStr) => {
        if (!dateStr) return new Date().toISOString();
        if (dateStr.includes('T')) return dateStr;
        return `${dateStr}T00:00:00Z`;
      };
      const details = {
        title: statement.details.title || '',
        name: statement.details.fullName || '',
        fullName: statement.details.fullName || '',
        accountNumber: statement.details.accountNumber || '',
        ifsc: statement.details.ifsc || '',
        startingBalance: statement.details.startingBalance || statement.openingBalance || 0,
        address: statement.details.address || '',
        city: statement.details.city || '',
        state: statement.details.state || '',
        pincode: statement.details.pincode || '',
        nomineeName: statement.details.nomineeName || '',
        branch: statement.details.branchName || statement.details.branch || '',
        branchLocation: statement.details.branchLocation || '',
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
        branchCode: statement.details.branchCode || '',
        branchEmail: statement.details.branchEmail || '',
        crn: statement.details.crn || statement.details.customerRelNo || '',
        customerType: statement.details.customerType || 'Sole Propertary',
        companyName: statement.salaryCompanyName || '',
      };
      const meta = {
        template: (statement.template || 'KOTAKNEW').toUpperCase(),
        userType: statement.meta.userType || 'salaried',
        generatedAt: new Date().toISOString(),
        statementPeriodStart: toIsoDate(statement.meta.statementPeriodStart),
        statementPeriodEnd: toIsoDate(statement.meta.statementPeriodEnd),
        configHash: statement.meta.configHash || 'auto',
        seed: statement.meta.seed || Date.now(),
        password: statement.meta.password || '',
      };

      if (lockPdf) {
        const bank = statement.template.toUpperCase();
        if (bank.startsWith('SBI')) {
          meta.password = statement.details.customerRelNo || '';
        } else if (bank.startsWith('KOTAK')) {
          meta.password = statement.details.micr || '';
        } else if (bank.startsWith('HDFC')) {
          meta.password = statement.details.customerRelNo || statement.details.phoneNumber || '1234';
        } else if (bank === 'AU') {
          meta.password = statement.details.customerRelNo || statement.details.accountNumber || '1234';
        }
      } else {
        meta.password = '';
      }

      const currentCompany = (statement.salaryCompanyName || '').toUpperCase().trim();
      const finalTxns = (statement.transactions || []).map(t => {
        if (t.type === 'SALARY' && currentCompany) {
          const desc = t.description || '';
          if (desc.includes('NEFT*')) {
            return { ...t, description: desc.replace(/(NEFT\*[^*]+\*[^*]+\*)([^\n]+)/, `$1${currentCompany}`) };
          }
          const m = desc.match(/^(NEFT(?:\/INW|-|\s+CR-|\s+[A-Z0-9]+)\s+)(.+)$/i);
          if (m) {
            return { ...t, description: `${m[1]}${currentCompany}` };
          }
          return { ...t, description: `NEFT ${currentCompany}` };
        }
        return t;
      });

      const stmt = { id: 'frontend-generated', details, meta, transactions: finalTxns };
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

  const banks = GROUPED_BANKS_LIST;
  const currentBankConfig = getBankConfig(statement.template);

  const periodOptions = [
    { value: 1, label: '1 Month' },
    { value: 3, label: '3 Months (Quarterly)' },
    { value: 6, label: '6 Months (Half-Yearly)' },
    { value: 12, label: '12 Months (Full Financial Year)' },
    { value: 'custom', label: 'Custom (Custom Date Range)' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-16">
      {/* Top Floating Glass Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-orange-500/20">
              🏦
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                FinStatement <span className="text-orange-600">Studio</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Engine v2.0 • Exact Penny Math</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
              <button
                onClick={() => setActiveTab('home')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🏠 Home & Profiles
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'generate'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ Generator
                {statement.transactions?.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-white/25 rounded-full text-[10px] font-bold">
                    {statement.transactions.length}
                  </span>
                )}
              </button>
            </div>

            {isAdmin && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>🛡️ Admin Dashboard</span>
              </button>
            )}

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-800">{user?.displayName || user?.username}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-600 rounded-md uppercase font-bold">
                {user?.role === 'ADMIN' ? 'Admin' : 'User'}
              </span>
            </div>

            <button
              onClick={logout}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer font-medium"
              title="Logout"
            >
              Sign Out ➔
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* ======================================================== */}
        {/* HOME & PROFILE OVERVIEW TAB */}
        {/* ======================================================== */}
        {activeTab === 'home' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
              <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-32 top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-orange-400 text-xs font-semibold backdrop-blur-md border border-white/10 mb-4">
                  ✨ Bank Statement AI Generator
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                  Authentic Bank Statements with Perfect Mathematical Precision
                </h2>
                <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
                  Generate realistic, pixel-aligned bank statements for major Indian banks with exact running balances, authentic transaction narrations, and OCR auto-fill.
                </p>

                <div className="flex flex-wrap gap-2.5 mt-6">
                  {['⚡ Penny-accurate Math', '📄 PDF Auto-Fill OCR', '🔒 Password Protection', '🏦 8+ Indian Banks'].map(pill => (
                    <span key={pill} className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-slate-200">
                      {pill}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <button
                    onClick={() => {
                      const newTemplate = getDefaultTemplateForProfile('salaried', statement.template);
                      updateStatement({
                        employmentType: 'salaried',
                        template: newTemplate,
                        salary: statement.salary > 0 ? statement.salary : 30000,
                      });
                      setActiveTab('generate');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    Open Generator Studio ➔
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Selection Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Select Profile Archetype</h3>
                  <p className="text-xs text-slate-500">Choose the transaction profile matching your use-case</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    key: 'salaried',
                    icon: '💼',
                    title: 'Salaried Professional',
                    desc: 'Scheduled monthly salary credits, NEFT salary narrations, automated household bills, utilities, rent, and lifestyle spending.',
                    badge: 'Recommended',
                    color: 'orange'
                  },
                  {
                    key: 'selfEmployed',
                    icon: '🏢',
                    title: 'Self-Employed / Freelancer',
                    desc: 'Simulated business inward IMPS/UPI turnover, merchant payouts, software subscriptions, and commercial expenses.',
                    badge: 'Turnover Mode',
                    color: 'blue'
                  },
                  {
                    key: 'currentAccount',
                    icon: '🏦',
                    title: 'Current Account',
                    desc: 'High-volume business cash flow, RTGS/NEFT vendor settlements, tax payments, and commercial transaction volumes.',
                    badge: 'Commercial',
                    color: 'emerald'
                  }
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => {
                      const newTemplate = getDefaultTemplateForProfile(p.key, statement.template);
                      const updates = { 
                        employmentType: p.key,
                        template: newTemplate,
                      };
                      if (p.key === 'salaried' && (!statement.salary || statement.salary <= 0)) {
                        updates.salary = 30000;
                      }
                      updateStatement(updates);
                      setActiveTab('generate');
                    }}
                    className="bg-white rounded-3xl p-6 text-left border border-slate-200/80 hover:border-orange-500 hover:shadow-xl transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {p.icon}
                        </div>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[11px] font-semibold border border-slate-200">
                          {p.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-slate-500 text-xs mt-2 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-orange-600">
                      <span>Launch with this profile</span>
                      <span>➔</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* GENERATOR STUDIO TAB */}
        {/* ======================================================== */}
        {activeTab === 'generate' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Top Profile Switcher */}
            <div className="flex justify-center">
              <div className="bg-white p-1.5 rounded-2xl inline-flex gap-1.5 border border-slate-200 shadow-sm">
                {[
                  { key: 'salaried', label: '💼 Salaried' },
                  { key: 'selfEmployed', label: '🏢 Self-Employed' },
                  { key: 'currentAccount', label: '🏦 Current Account' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      const newTemplate = getDefaultTemplateForProfile(opt.key, statement.template);
                      const updates = {
                        employmentType: opt.key,
                        template: newTemplate,
                      };
                      if (opt.key === 'salaried' && (!statement.salary || statement.salary <= 0)) {
                        updates.salary = 30000;
                      }
                      updateStatement(updates);
                    }}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      statement.employmentType === opt.key
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart OCR Auto-Fill Dropzone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-7 text-center transition-all bg-white ${
                isDragOver
                  ? 'border-orange-500 bg-orange-50/50 scale-[0.99]'
                  : 'border-slate-200/90 hover:border-orange-400 hover:bg-orange-50/20 shadow-xs'
              }`}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp"
                onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="ocr-file-upload"
              />
              <label htmlFor="ocr-file-upload" className="cursor-pointer block">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl mb-3 shadow-xs">
                  📄
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Drop existing bank statement here, or <span className="text-orange-600 underline">Browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PDF, JPG, PNG — Automatically extracts account numbers, IFSC, address, balances, and period
                </p>
              </label>

              {ocrLoading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-orange-600 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  Extracting and parsing statement metadata…
                </div>
              )}

              {ocrError && !showPasswordInput && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
                  ⚠️ {ocrError}
                </div>
              )}

              {showPasswordInput && (
                <div className="mt-4 max-w-sm mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <p className="text-xs font-semibold text-slate-700">Protected PDF: Enter Statement Password</p>
                  <FormInput
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Enter password..."
                    className="mb-0"
                  />
                  <button
                    onClick={handlePasswordRetry}
                    className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Unlock & Extract
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <input
                  type="checkbox"
                  id="useOcrDatesCheckbox"
                  checked={useOcrDates}
                  onChange={e => setUseOcrDates(e.target.checked)}
                  className="accent-orange-500 w-3.5 h-3.5 rounded"
                />
                <label htmlFor="useOcrDatesCheckbox" className="text-xs font-medium text-slate-500 cursor-pointer">
                  Sync statement From & To dates from uploaded PDF
                </label>
              </div>
            </div>

            {/* 2-Column Dynamic Bank Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN: Bank Selection, Period & Dynamic Sections */}
              <div className="space-y-6">
                <SectionCard 
                  title="Bank & Statement Period" 
                  subtitle={`Template: ${currentBankConfig.name}`} 
                  icon="🏦"
                  badge={currentBankConfig.badge}
                >
                  <FormSelect
                    label="Bank Template"
                    value={statement.template}
                    onChange={val => {
                      const isCurrent = isCurrentAccountTemplate(val);
                      const updates = { template: val };
                      if (isCurrent && statement.employmentType !== 'currentAccount') {
                        updates.employmentType = 'currentAccount';
                      } else if (!isCurrent && statement.employmentType === 'currentAccount') {
                        updates.employmentType = 'salaried';
                        if (!statement.salary || statement.salary <= 0) {
                          updates.salary = 30000;
                        }
                      }
                      updateStatement(updates);
                    }}
                    options={banks}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormSelect
                      label="Period"
                      value={statement.periodMonths}
                      onChange={val => updateStatement({ periodMonths: val === 'custom' ? 'custom' : Number(val) })}
                      options={periodOptions}
                    />
                    <FormInput
                      label="From Date"
                      type="date"
                      value={statement.meta.statementPeriodStart}
                      onChange={val => updateStatement({ meta: { ...statement.meta, statementPeriodStart: val } })}
                      required
                    />
                    <FormInput
                      label="To Date"
                      type="date"
                      value={statement.meta.statementPeriodEnd}
                      onChange={val => updateStatement({ meta: { ...statement.meta, statementPeriodEnd: val } })}
                      helperText={statement.periodMonths === 'custom' ? 'Custom Date Range' : 'Auto-computed'}
                      required
                    />
                  </div>
                </SectionCard>

                {/* Bank-Tailored Customer Information */}
                {currentBankConfig.sections?.customer && (
                  <SectionCard
                    title={currentBankConfig.sections.customer.title}
                    subtitle={currentBankConfig.sections.customer.subtitle}
                    icon={currentBankConfig.sections.customer.icon || '👤'}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {currentBankConfig.sections.customer.fields.map(f => {
                        const spanClass = f.colSpan === 4 ? 'sm:col-span-4' :
                                          f.colSpan === 3 ? 'sm:col-span-3' :
                                          f.colSpan === 2 ? 'sm:col-span-2' :
                                          f.colSpan === 1 ? 'sm:col-span-1' : 'sm:col-span-2';
                        const val = statement.details[f.key] !== undefined ? statement.details[f.key] : (f.defaultValue || '');

                        return (
                          <FormInput
                            key={f.key}
                            label={f.label}
                            value={val}
                            onChange={v => updateDetails(f.key, v)}
                            type={f.type || 'text'}
                            rows={f.rows || 2}
                            placeholder={f.placeholder}
                            required={f.required}
                            readOnly={f.readOnly}
                            helperText={f.helperText}
                            className={spanClass}
                          />
                        );
                      })}
                    </div>
                  </SectionCard>
                )}

                {/* Bank-Tailored Branch Information */}
                {currentBankConfig.sections?.branch && (
                  <SectionCard
                    title={currentBankConfig.sections.branch.title}
                    subtitle={currentBankConfig.sections.branch.subtitle}
                    icon={currentBankConfig.sections.branch.icon || '🏛️'}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {currentBankConfig.sections.branch.fields.map(f => {
                        const spanClass = f.colSpan === 4 ? 'sm:col-span-4' :
                                          f.colSpan === 3 ? 'sm:col-span-3' :
                                          f.colSpan === 2 ? 'sm:col-span-2' :
                                          f.colSpan === 1 ? 'sm:col-span-1' : 'sm:col-span-2';
                        const val = statement.details[f.key] !== undefined ? statement.details[f.key] : (f.defaultValue || '');

                        return (
                          <FormInput
                            key={f.key}
                            label={f.label}
                            value={val}
                            onChange={v => updateDetails(f.key, v)}
                            type={f.type || 'text'}
                            rows={f.rows || 2}
                            placeholder={f.placeholder}
                            required={f.required}
                            readOnly={f.readOnly}
                            helperText={f.helperText}
                            className={spanClass}
                          />
                        );
                      })}
                    </div>
                  </SectionCard>
                )}
              </div>

              {/* RIGHT COLUMN: Balances, Density, Regulatory & Bank Codes */}
              <div className="space-y-6">
                {/* Financial Balances & Simulation Targets */}
                <SectionCard title="Financial Balances & Cash Flow" subtitle="Exact mathematical targets & simulation" icon="💰">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label={statement.template?.toUpperCase().startsWith('SBI') ? 'Clear / Opening Balance' : 'Opening Balance'}
                      type="number"
                      prefix="₹"
                      value={statement.openingBalance}
                      onChange={val => {
                        updateStatement({ openingBalance: Number(val) });
                        updateDetails('startingBalance', Number(val));
                      }}
                      placeholder="17514.71"
                      required
                    />
                    <FormInput
                      label="Target Closing Balance"
                      type="number"
                      prefix="₹"
                      value={statement.endBalance}
                      onChange={val => updateStatement({ endBalance: Number(val) })}
                      placeholder="202.88"
                      required
                    />
                  </div>

                  {statement.employmentType === 'salaried' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <FormInput
                        label="Monthly Net Salary"
                        type="number"
                        prefix="₹"
                        value={statement.salary}
                        onChange={val => updateStatement({ salary: Number(val) })}
                        placeholder="75000"
                        helperText="Credited on Day 1 of each month"
                      />
                      <FormInput
                        label="Employer / Company Name"
                        value={statement.salaryCompanyName}
                        onChange={handleCompanyNameChange}
                        placeholder="TATA CONSULTANCY SERVICES"
                        helperText="Dynamically updates NEFT narrations"
                      />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                      Monthly Transaction Density
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {[
                        { label: 'Light', min: 15, max: 30 },
                        { label: 'Standard', min: 30, max: 60 },
                        { label: 'Active', min: 50, max: 90 },
                        { label: 'Heavy', min: 80, max: 130 },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateStatement({ minTxMonth: preset.min, maxTxMonth: preset.max })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            statement.minTxMonth === preset.min && statement.maxTxMonth === preset.max
                              ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label} ({preset.min}-{preset.max})
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormInput
                        label="Min Txns / Month"
                        type="number"
                        value={statement.minTxMonth}
                        onChange={val => updateStatement({ minTxMonth: Number(val) })}
                      />
                      <FormInput
                        label="Max Txns / Month"
                        type="number"
                        value={statement.maxTxMonth}
                        onChange={val => updateStatement({ maxTxMonth: Number(val) })}
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* Bank-Tailored Account Section */}
                {currentBankConfig.sections?.account && (
                  <SectionCard
                    title={currentBankConfig.sections.account.title}
                    subtitle={currentBankConfig.sections.account.subtitle}
                    icon={currentBankConfig.sections.account.icon || '🏛️'}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {currentBankConfig.sections.account.fields.map(f => {
                        const spanClass = f.colSpan === 4 ? 'sm:col-span-4' :
                                          f.colSpan === 3 ? 'sm:col-span-3' :
                                          f.colSpan === 2 ? 'sm:col-span-2' :
                                          f.colSpan === 1 ? 'sm:col-span-1' : 'sm:col-span-2';
                        const val = statement.details[f.key] !== undefined ? statement.details[f.key] : (f.defaultValue || '');

                        return (
                          <FormInput
                            key={f.key}
                            label={f.label}
                            value={val}
                            onChange={v => updateDetails(f.key, v)}
                            type={f.type || 'text'}
                            rows={f.rows || 2}
                            placeholder={f.placeholder}
                            required={f.required}
                            readOnly={f.readOnly}
                            helperText={f.helperText}
                            className={spanClass}
                          />
                        );
                      })}
                    </div>
                  </SectionCard>
                )}

                {/* Bank-Tailored Regulatory Section */}
                {currentBankConfig.sections?.regulatory && (
                  <SectionCard
                    title={currentBankConfig.sections.regulatory.title}
                    subtitle={currentBankConfig.sections.regulatory.subtitle}
                    icon={currentBankConfig.sections.regulatory.icon || '📋'}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {currentBankConfig.sections.regulatory.fields.map(f => {
                        const spanClass = f.colSpan === 4 ? 'sm:col-span-4' :
                                          f.colSpan === 3 ? 'sm:col-span-3' :
                                          f.colSpan === 2 ? 'sm:col-span-2' :
                                          f.colSpan === 1 ? 'sm:col-span-1' : 'sm:col-span-2';
                        const val = statement.details[f.key] !== undefined ? statement.details[f.key] : (f.defaultValue || '');

                        return (
                          <FormInput
                            key={f.key}
                            label={f.label}
                            value={val}
                            onChange={v => updateDetails(f.key, v)}
                            type={f.type || 'text'}
                            rows={f.rows || 2}
                            placeholder={f.placeholder}
                            required={f.required}
                            readOnly={f.readOnly}
                            helperText={f.helperText}
                            className={spanClass}
                          />
                        );
                      })}
                    </div>
                  </SectionCard>
                )}

                {/* Bank-Tailored Assistance Section */}
                {currentBankConfig.sections?.assistance && (
                  <SectionCard
                    title={currentBankConfig.sections.assistance.title}
                    subtitle={currentBankConfig.sections.assistance.subtitle}
                    icon={currentBankConfig.sections.assistance.icon || '📞'}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      {currentBankConfig.sections.assistance.fields.map(f => {
                        const spanClass = f.colSpan === 4 ? 'sm:col-span-4' :
                                          f.colSpan === 3 ? 'sm:col-span-3' :
                                          f.colSpan === 2 ? 'sm:col-span-2' :
                                          f.colSpan === 1 ? 'sm:col-span-1' : 'sm:col-span-2';
                        const val = statement.details[f.key] !== undefined ? statement.details[f.key] : (f.defaultValue || '');

                        return (
                          <FormInput
                            key={f.key}
                            label={f.label}
                            value={val}
                            onChange={v => updateDetails(f.key, v)}
                            type={f.type || 'text'}
                            rows={f.rows || 2}
                            placeholder={f.placeholder}
                            required={f.required}
                            readOnly={f.readOnly}
                            helperText={f.helperText}
                            className={spanClass}
                          />
                        );
                      })}
                    </div>
                  </SectionCard>
                )}

                {/* Primary Action Button */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl text-white space-y-4 shadow-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Generate Simulation</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Calculates multi-month cash flow & balances</p>
                    </div>
                    {statement.transactions?.length > 0 && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                        ✓ {statement.transactions.length} Txns Ready
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleGenerateTransactions}
                    className="w-full h-14 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:via-amber-600 hover:to-orange-600 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>⚡ Run Transaction Engine</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* TRANSACTION TABLE EXPLORER */}
            {/* ======================================================== */}
            {statement.transactions?.length > 0 && (
              <SectionCard
                title="Transaction Explorer & Audit"
                subtitle="Review generated transactions with running balance checks"
                icon="📊"
                badge={`${statement.transactions.length} Total Rows`}
              >
                <TransactionTable transactions={statement.transactions} />
              </SectionCard>
            )}

            {/* ======================================================== */}
            {/* EXPORT & PDF GENERATION CARD */}
            {/* ======================================================== */}
            <SectionCard title="PDF Export & Security" subtitle="Render pixel-aligned official bank PDF" icon="📄">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                      🔒
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Password Protect Exported PDF</p>
                      <p className="text-[11px] text-slate-500">
                        {statement.template?.toUpperCase().startsWith('SBI')
                          ? 'Protected with CIF Number'
                          : statement.template?.toUpperCase().startsWith('KOTAK')
                          ? 'Protected with MICR Code'
                          : statement.template?.toUpperCase().startsWith('HDFC')
                          ? 'Protected with Customer ID (Cust ID)'
                          : 'Password protection supported for SBI, Kotak & HDFC'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="lockPdfToggle"
                    checked={lockPdf}
                    onChange={e => setLockPdf(e.target.checked)}
                    disabled={!statement.template?.toUpperCase().startsWith('SBI') && !statement.template?.toUpperCase().startsWith('KOTAK') && !statement.template?.toUpperCase().startsWith('HDFC')}
                    className="accent-orange-500 w-5 h-5 rounded cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={handlePreviewPdf}
                    disabled={pdfLoading || !statement.transactions?.length}
                    className="h-13 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {pdfLoading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Rendering PDF…</span>
                      </>
                    ) : (
                      <>
                        <span>👁️</span>
                        <span>Preview PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (pdfBlob && pdfFilename) {
                        const url = URL.createObjectURL(pdfBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = pdfFilename;
                        a.click();
                        URL.revokeObjectURL(url);
                      } else {
                        handlePreviewPdf();
                      }
                    }}
                    disabled={!statement.transactions?.length}
                    className="h-13 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-2xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>⬇️</span>
                    <span>Download PDF</span>
                  </button>

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
                    className="h-13 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-2xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>📤</span>
                    <span>Share PDF</span>
                  </button>
                </div>
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* PDF Modal Viewer */}
        {showPdf && pdfBlob && (
          <PdfViewer blob={pdfBlob} filename={pdfFilename} onClose={() => setShowPdf(false)} />
        )}
      </main>
    </div>
  );
}