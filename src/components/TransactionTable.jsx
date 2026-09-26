import { useState, useMemo } from 'react';

const formatInr = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0.00';
  return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function TransactionTable({ transactions }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const stats = useMemo(() => {
    if (!transactions || !transactions.length) return { count: 0, debits: 0, credits: 0, net: 0 };
    let debits = 0;
    let credits = 0;
    for (const t of transactions) {
      debits += t.debit || 0;
      credits += t.credit || 0;
    }
    return {
      count: transactions.length,
      debits,
      credits,
      net: credits - debits
    };
  }, [transactions]);

  const filtered = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => {
      if (typeFilter === 'DEBIT' && !(t.debit > 0)) return false;
      if (typeFilter === 'CREDIT' && !(t.credit > 0)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const ref = (t.reference || '').toLowerCase();
      const date = (t.date || '').toLowerCase();
      return desc.includes(q) || ref.includes(q) || date.includes(q);
    });
  }, [transactions, search, typeFilter]);

  if (!transactions || transactions.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Entries</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{stats.count} <span className="text-xs font-normal text-slate-500">txns</span></p>
        </div>
        <div className="bg-rose-50/60 border border-rose-200/60 rounded-2xl p-4">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Outflow</p>
          <p className="text-xl font-bold text-rose-700 mt-1">{formatInr(stats.debits)}</p>
        </div>
        <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Inflow</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{formatInr(stats.credits)}</p>
        </div>
        <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Net Cash Flow</p>
          <p className={`text-xl font-bold mt-1 ${stats.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {stats.net >= 0 ? '+' : ''}{formatInr(stats.net)}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-sm">
              ✕
            </button>
          )}
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200/80">
          {['ALL', 'DEBIT', 'CREDIT'].map(tab => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === tab
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Txns' : tab === 'DEBIT' ? 'Debits (-)' : 'Credits (+)'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/90 backdrop-blur sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Narration / Details</th>
                <th className="py-3.5 px-3 text-right">Debit (₹)</th>
                <th className="py-3.5 px-3 text-right">Credit (₹)</th>
                <th className="py-3.5 px-4 text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tx, idx) => (
                <tr key={tx.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium text-xs">
                    {formatDate(tx.date)}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-800 max-w-xs md:max-w-md">
                    <div className="font-mono text-[11px] leading-relaxed text-slate-700 whitespace-pre-line">
                      {tx.description}
                    </div>
                    {tx.reference && tx.reference !== '-' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono">
                        Ref: {tx.reference}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap font-medium text-xs">
                    {tx.debit > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200/50">
                        -{Number(tx.debit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap font-medium text-xs">
                    {tx.credit > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/50">
                        +{Number(tx.credit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-semibold text-slate-900 text-xs">
                    ₹{Number(tx.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    No transactions match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}