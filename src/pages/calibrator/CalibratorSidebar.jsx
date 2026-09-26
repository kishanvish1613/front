import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CalibratorSidebar({
  params,
  setParams,
  onColumnWidthChange,
  onColumnAlignChange,
  onColumnOffsetChange
}) {
  const [sidebarTab, setSidebarTab] = useState('adjust');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const generateJavaCode = () => {
    const colLines = params.columns.map(
      (c) => `    private static final float COL_${c.name.replace(/[^A-Za-z0-9]/g, '_').toUpperCase()}_W = ${c.width.toFixed(2)}f;`
    ).join('\n');

    return `// =========================================================================
// CALIBRATED COORDINATES FOR ${params.name.toUpperCase()}
// Generated automatically by Visual PDF Template Calibrator Studio
// =========================================================================

    private static final float PAGE_W = ${params.pageW.toFixed(2)}f;
    private static final float PAGE_H = ${params.pageH.toFixed(2)}f;

    // Table & Columns
    private static final float TABLE_X = ${params.tableX.toFixed(2)}f;
    private static final float TABLE_W = ${params.tableW.toFixed(2)}f;
${colLines}

    private static final float ROW_H = ${params.rowH.toFixed(2)}f;
    private static final float HEADER_ROW_H = ${params.headerRowH.toFixed(2)}f;

    // Header & Details Box
    private static final float BOX_TOP_Y = ${params.boxTopY.toFixed(2)}f;
    private static final float BOX_H = ${params.boxH.toFixed(2)}f;

    // Sub-Header Spacing (Statement of Account ... FROM ... TO ...)
    private static final float SUBHEADER_GAP_TOP = ${params.subHeaderGapTop.toFixed(2)}f;
    private static final float SUBHEADER_GAP_BOTTOM = ${params.subHeaderGapBottom.toFixed(2)}f;

    // Page Rows
    private static final int PAGE_1_ROWS = ${params.page1Rows};
    private static final int SUBSEQUENT_ROWS = ${params.subsequentRows};

    // Footer
    private static final float FOOTER_Y = ${params.footerY.toFixed(2)}f;`;
  };

  const generateAiPrompt = () => {
    const colSpecs = params.columns.map(
      c => `  - **${c.name}**: Width = ${c.width.toFixed(2)} pt, Alignment = ${c.align.toUpperCase()} (offset: ${c.offset} pt)`
    ).join('\n');

    return `Please update the **${params.name}** PDF generator template with these exact calibrated coordinates:

1. **Table Dimensions**:
   - Table X: \`${params.tableX.toFixed(2)} pt\`
   - Table Total Width: \`${params.tableW.toFixed(2)} pt\`
   - Header Row Height: \`${params.headerRowH.toFixed(2)} pt\`
   - Transaction Row Height: \`${params.rowH.toFixed(2)} pt\`
   - Page 1 Rows: \`${params.page1Rows}\`
   - Subsequent Page Rows: \`${params.subsequentRows}\`

2. **Column Specifications**:
${colSpecs}

3. **Header Details Box & Spacing**:
   - Box Top Y: \`${params.boxTopY.toFixed(2)} pt\`
   - Box Height: \`${params.boxH.toFixed(2)} pt\`
   - Subheader Top Gap (from box bottom): \`${params.subHeaderGapTop.toFixed(2)} pt\`
   - Subheader Bottom Gap (to table header): \`${params.subHeaderGapBottom.toFixed(2)} pt\`

4. **Footer**:
   - Page number baseline Y: \`${params.footerY.toFixed(2)} pt\`
`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-30">
      <div className="flex border-b border-slate-800 bg-slate-950/50">
        <button
          onClick={() => setSidebarTab('adjust')}
          className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            sidebarTab === 'adjust'
              ? 'border-orange-500 text-orange-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📐 Columns & Gaps
        </button>
        <button
          onClick={() => setSidebarTab('code')}
          className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            sidebarTab === 'code'
              ? 'border-orange-500 text-orange-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          💻 Java Code
        </button>
        <button
          onClick={() => setSidebarTab('diff')}
          className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            sidebarTab === 'diff'
              ? 'border-orange-500 text-orange-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🤖 AI Prompt
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sidebarTab === 'adjust' && (
          <>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Details Box & Gaps</span>
                <span className="text-[10px] text-slate-500 font-mono">pt</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Box Top Y</label>
                  <input
                    type="number"
                    step="0.5"
                    value={params.boxTopY}
                    onChange={(e) => setParams({ ...params, boxTopY: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Box Height (H)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={params.boxH}
                    onChange={(e) => setParams({ ...params, boxH: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Subheader Top Gap</label>
                  <input
                    type="number"
                    step="0.5"
                    value={params.subHeaderGapTop}
                    onChange={(e) => setParams({ ...params, subHeaderGapTop: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-amber-400 text-xs focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Subheader Bottom Gap</label>
                  <input
                    type="number"
                    step="0.5"
                    value={params.subHeaderGapBottom}
                    onChange={(e) => setParams({ ...params, subHeaderGapBottom: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-amber-400 text-xs focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Table Row Geometry</span>
                <span className="text-[10px] text-slate-500 font-mono">pt</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Table X Offset</label>
                  <input
                    type="number"
                    step="0.5"
                    value={params.tableX}
                    onChange={(e) => setParams({ ...params, tableX: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Total Table Width</label>
                  <input
                    type="number"
                    step="0.5"
                    value={params.tableW}
                    onChange={(e) => setParams({ ...params, tableW: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Header Row Height</label>
                  <input
                    type="number"
                    step="0.25"
                    value={params.headerRowH}
                    onChange={(e) => setParams({ ...params, headerRowH: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-emerald-400 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Data Row Height</label>
                  <input
                    type="number"
                    step="0.25"
                    value={params.rowH}
                    onChange={(e) => setParams({ ...params, rowH: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-emerald-400 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Page 1 Rows Count</label>
                  <input
                    type="number"
                    value={params.page1Rows}
                    onChange={(e) => setParams({ ...params, page1Rows: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-emerald-400 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Subsequent Rows</label>
                  <input
                    type="number"
                    value={params.subsequentRows}
                    onChange={(e) => setParams({ ...params, subsequentRows: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 font-mono text-emerald-400 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Columns ({params.columns.length})
                </h3>
                <span className="text-[11px] font-mono text-emerald-400">
                  Sum: {params.columns.reduce((a, b) => a + b.width, 0).toFixed(1)} pt
                </span>
              </div>

              <div className="space-y-3">
                {params.columns.map((col, idx) => (
                  <div
                    key={col.id || idx}
                    className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {idx + 1}. {col.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">W:</span>
                        <input
                          type="number"
                          step="0.5"
                          value={col.width}
                          onChange={(e) => onColumnWidthChange(col.id, e.target.value)}
                          className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-0.5 font-mono text-emerald-400 text-xs text-right focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500">pt</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Align:</span>
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            onClick={() => onColumnAlignChange(col.id, align)}
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold cursor-pointer ${
                              col.align === align
                                ? 'bg-orange-500 text-white'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {align[0]}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Offset:</span>
                        <input
                          type="number"
                          step="0.25"
                          value={col.offset || 0}
                          onChange={(e) => onColumnOffsetChange(col.id, e.target.value)}
                          className="w-12 bg-slate-950 border border-slate-700 rounded px-1 text-right font-mono text-slate-300 text-[10px]"
                        />
                        <span className="text-[10px] text-slate-500">pt</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {sidebarTab === 'code' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Ready to paste into *Template.java</span>
              <button
                onClick={() => copyToClipboard(generateJavaCode(), 'code')}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied!' : 'Copy Java'}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed select-all">
              {generateJavaCode()}
            </pre>
          </div>
        )}

        {sidebarTab === 'diff' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Copy & paste to AI / chat</span>
              <button
                onClick={() => copyToClipboard(generateAiPrompt(), 'prompt')}
                className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPrompt ? 'Copied Prompt!' : 'Copy AI Prompt'}
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {generateAiPrompt()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
