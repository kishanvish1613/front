import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Eye,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Move,
  Ruler,
  Sparkles,
  FileText,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Upload
} from 'lucide-react';
import { loadPdfDocument, renderPdfPageToCanvas, renderImageToCanvas } from '../utils/pdfRenderer';
import { BANK_PRESETS } from './calibrator/presets';
import CalibratorSidebar from './calibrator/CalibratorSidebar';

export default function TemplateCalibrator({ initialGeneratedBlob = null, onBack }) {
  const [origDoc, setOrigDoc] = useState(null);
  const [genDoc, setGenDoc] = useState(null);

  const [origPageNum, setOrigPageNum] = useState(1);
  const [genPageNum, setGenPageNum] = useState(1);

  const [origCanvas, setOrigCanvas] = useState(null);
  const [genCanvas, setGenCanvas] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [viewMode, setViewMode] = useState('overlay');
  const [opacity, setOpacity] = useState(50);
  const [splitPos, setSplitPos] = useState(50);
  const [zoom, setZoom] = useState(100);
  const [showWireframe, setShowWireframe] = useState(true);

  const [nudgeX, setNudgeX] = useState(0);
  const [nudgeY, setNudgeY] = useState(0);

  const [toolMode, setToolMode] = useState('inspect');
  const [caliperStart, setCaliperStart] = useState(null);
  const [caliperEnd, setCaliperEnd] = useState(null);
  const [hoverPt, setHoverPt] = useState({ ptX: 0, ptY: 0 });

  const [selectedPreset, setSelectedPreset] = useState('boi-current');
  const [params, setParams] = useState(BANK_PRESETS['boi-current']);

  const viewportRef = useRef(null);
  const mainCanvasRef = useRef(null);

  useEffect(() => {
    if (initialGeneratedBlob) {
      handleLoadGeneratedFile(initialGeneratedBlob);
    }
  }, [initialGeneratedBlob]);

  const handleSelectPreset = (key) => {
    setSelectedPreset(key);
    if (BANK_PRESETS[key]) {
      setParams(JSON.parse(JSON.stringify(BANK_PRESETS[key])));
    }
  };

  const processDocument = async (fileOrBlob) => {
    const isPdf = fileOrBlob.type === 'application/pdf' || (fileOrBlob.name && fileOrBlob.name.endsWith('.pdf'));
    if (isPdf) {
      const pdfDoc = await loadPdfDocument(fileOrBlob);
      const firstPage = await renderPdfPageToCanvas(pdfDoc, 1, 1.5);
      return {
        type: 'pdf',
        pdfDoc,
        numPages: pdfDoc.numPages,
        canvas: firstPage.canvas,
        ptWidth: firstPage.ptWidth,
        ptHeight: firstPage.ptHeight,
        scale: firstPage.scale
      };
    } else {
      const imgRes = await renderImageToCanvas(fileOrBlob);
      return {
        type: 'image',
        numPages: 1,
        canvas: imgRes.canvas,
        ptWidth: imgRes.ptWidth,
        ptHeight: imgRes.ptHeight,
        scale: imgRes.scale
      };
    }
  };

  const handleLoadOriginalFile = async (file) => {
    try {
      setLoading(true);
      setError(null);
      const res = await processDocument(file);
      setOrigDoc(res);
      setOrigCanvas(res.canvas);
      setOrigPageNum(1);
    } catch (err) {
      setError('Failed to load Original document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGeneratedFile = async (file) => {
    try {
      setLoading(true);
      setError(null);
      const res = await processDocument(file);
      setGenDoc(res);
      setGenCanvas(res.canvas);
      setGenPageNum(1);
    } catch (err) {
      setError('Failed to load Generated document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrigPageChange = async (newPage) => {
    if (!origDoc || origDoc.type !== 'pdf' || newPage < 1 || newPage > origDoc.numPages) return;
    try {
      setLoading(true);
      const pageRes = await renderPdfPageToCanvas(origDoc.pdfDoc, newPage, origDoc.scale || 1.5);
      setOrigPageNum(newPage);
      setOrigCanvas(pageRes.canvas);
    } catch (err) {
      setError('Failed to render page: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenPageChange = async (newPage) => {
    if (!genDoc || genDoc.type !== 'pdf' || newPage < 1 || newPage > genDoc.numPages) return;
    try {
      setLoading(true);
      const pageRes = await renderPdfPageToCanvas(genDoc.pdfDoc, newPage, genDoc.scale || 1.5);
      setGenPageNum(newPage);
      setGenCanvas(pageRes.canvas);
    } catch (err) {
      setError('Failed to render page: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseW = origCanvas?.width || genCanvas?.width || 800;
    const baseH = origCanvas?.height || genCanvas?.height || 1130;

    canvas.width = baseW;
    canvas.height = baseH;

    ctx.clearRect(0, 0, baseW, baseH);

    const ptWidth = params.pageW || 595.28;
    const pxPerPt = baseW / ptWidth;

    const nudgePxX = nudgeX * pxPerPt;
    const nudgePxY = nudgeY * pxPerPt;

    if (viewMode === 'overlay') {
      if (origCanvas) {
        ctx.drawImage(origCanvas, 0, 0, baseW, baseH);
      }
      if (genCanvas) {
        ctx.save();
        ctx.globalAlpha = opacity / 100;
        ctx.drawImage(genCanvas, nudgePxX, nudgePxY, baseW, baseH);
        ctx.restore();
      }
    } else if (viewMode === 'difference') {
      if (origCanvas) {
        ctx.drawImage(origCanvas, 0, 0, baseW, baseH);
      }
      if (genCanvas) {
        ctx.save();
        ctx.globalCompositeOperation = 'difference';
        ctx.drawImage(genCanvas, nudgePxX, nudgePxY, baseW, baseH);
        ctx.restore();
      }
    } else if (viewMode === 'split') {
      const splitPx = (splitPos / 100) * baseW;

      if (origCanvas) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitPx, baseH);
        ctx.clip();
        ctx.drawImage(origCanvas, 0, 0, baseW, baseH);
        ctx.restore();
      }

      if (genCanvas) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitPx, 0, baseW - splitPx, baseH);
        ctx.clip();
        ctx.drawImage(genCanvas, nudgePxX, nudgePxY, baseW, baseH);
        ctx.restore();
      }

      ctx.save();
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(splitPx, 0);
      ctx.lineTo(splitPx, baseH);
      ctx.stroke();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(splitPx, baseH / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (viewMode === 'tint') {
      if (origCanvas) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = baseW;
        offCanvas.height = baseH;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(origCanvas, 0, 0, baseW, baseH);
        offCtx.globalCompositeOperation = 'source-in';
        offCtx.fillStyle = '#00e5ff';
        offCtx.fillRect(0, 0, baseW, baseH);
        ctx.drawImage(offCanvas, 0, 0);
      }

      if (genCanvas) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = baseW;
        offCanvas.height = baseH;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(genCanvas, nudgePxX, nudgePxY, baseW, baseH);
        offCtx.globalCompositeOperation = 'source-in';
        offCtx.fillStyle = '#ff0055';
        offCtx.fillRect(0, 0, baseW, baseH);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(offCanvas, 0, 0);
        ctx.restore();
      }
    }

    if (showWireframe) {
      drawWireframe(ctx, pxPerPt);
    }

    if (caliperStart && caliperEnd) {
      drawCaliper(ctx, caliperStart, caliperEnd, pxPerPt);
    }
  }, [
    origCanvas,
    genCanvas,
    viewMode,
    opacity,
    splitPos,
    nudgeX,
    nudgeY,
    showWireframe,
    params,
    caliperStart,
    caliperEnd
  ]);

  const drawWireframe = (ctx, pxPerPt) => {
    ctx.save();

    const boxX = (params.tableX) * pxPerPt;
    const boxY = (params.boxTopY) * pxPerPt;
    const boxW = (params.tableW) * pxPerPt;
    const boxH = (params.boxH) * pxPerPt;

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.font = '11px monospace';
    ctx.fillText(`BOX: Y=${params.boxTopY}pt H=${params.boxH}pt`, boxX + 6, boxY + 14);

    const subHeaderY = (params.boxTopY + params.boxH + params.subHeaderGapTop) * pxPerPt;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(boxX, subHeaderY);
    ctx.lineTo(boxX + boxW, subHeaderY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.fillText(
      `SUBHEADER: Top Gap=${params.subHeaderGapTop}pt | Bottom Gap=${params.subHeaderGapBottom}pt`,
      boxX + 6,
      subHeaderY - 4
    );

    const tableTopPt = params.boxTopY + params.boxH + params.subHeaderGapTop + params.subHeaderGapBottom;
    const tableTopY = tableTopPt * pxPerPt;
    const headerRowH = params.headerRowH * pxPerPt;

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boxX, tableTopY, boxW, headerRowH);

    let curX = params.tableX;
    params.columns.forEach((col) => {
      const colX = curX * pxPerPt;

      ctx.beginPath();
      ctx.moveTo(colX, tableTopY);
      ctx.lineTo(colX, tableTopY + headerRowH + (params.page1Rows * params.rowH * pxPerPt));
      ctx.stroke();

      ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
      ctx.font = '10px monospace';
      ctx.fillText(`${col.name}`, colX + 4, tableTopY + 12);
      ctx.font = '9px monospace';
      ctx.fillText(`${col.width.toFixed(1)}pt [${col.align.toUpperCase()}]`, colX + 4, tableTopY + 22);

      curX += col.width;
    });

    const lastX = curX * pxPerPt;
    ctx.beginPath();
    ctx.moveTo(lastX, tableTopY);
    ctx.lineTo(lastX, tableTopY + headerRowH + (params.page1Rows * params.rowH * pxPerPt));
    ctx.stroke();

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
    ctx.lineWidth = 1;
    for (let r = 1; r <= params.page1Rows; r++) {
      const rowY = (tableTopPt + params.headerRowH + r * params.rowH) * pxPerPt;
      ctx.beginPath();
      ctx.moveTo(boxX, rowY);
      ctx.lineTo(boxX + boxW, rowY);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawCaliper = (ctx, start, end, pxPerPt) => {
    const sx = start.ptX * pxPerPt;
    const sy = start.ptY * pxPerPt;
    const ex = end.ptX * pxPerPt;
    const ey = end.ptY * pxPerPt;

    ctx.save();
    ctx.strokeStyle = '#ec4899';
    ctx.fillStyle = '#ec4899';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    const arm = 6;
    ctx.beginPath();
    ctx.moveTo(sx - arm, sy);
    ctx.lineTo(sx + arm, sy);
    ctx.moveTo(sx, sy - arm);
    ctx.lineTo(sx, sy + arm);

    ctx.moveTo(ex - arm, ey);
    ctx.lineTo(ex + arm, ey);
    ctx.moveTo(ex, ey - arm);
    ctx.lineTo(ex, ey + arm);
    ctx.stroke();

    const deltaX = Math.abs(end.ptX - start.ptX);
    const deltaY = Math.abs(end.ptY - start.ptY);
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;

    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#1e1b4b';
    const text = `ΔY: ${deltaY.toFixed(2)} pt | ΔX: ${deltaX.toFixed(2)} pt`;
    const metrics = ctx.measureText(text);

    ctx.fillRect(midX - 4, midY - 14, metrics.width + 8, 18);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(text, midX, midY);

    ctx.restore();
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleFactor = canvas.width / rect.width;
    const canvasPxX = clientX * scaleFactor;
    const canvasPxY = clientY * scaleFactor;

    const ptWidth = params.pageW || 595.28;
    const pxPerPt = canvas.width / ptWidth;

    const ptX = canvasPxX / pxPerPt;
    const ptY = canvasPxY / pxPerPt;

    setHoverPt({ ptX, ptY });
  };

  const handleCanvasMouseDown = () => {
    if (toolMode === 'caliper') {
      if (!caliperStart || (caliperStart && caliperEnd)) {
        setCaliperStart({ ptX: hoverPt.ptX, ptY: hoverPt.ptY });
        setCaliperEnd(null);
      } else {
        setCaliperEnd({ ptX: hoverPt.ptX, ptY: hoverPt.ptY });
      }
    }
  };

  const handleColumnWidthChange = (colId, newWidth) => {
    const parsed = Math.max(10, parseFloat(newWidth) || 0);
    const updatedCols = params.columns.map(c => (c.id === colId ? { ...c, width: parsed } : c));
    const newTotalW = updatedCols.reduce((sum, c) => sum + c.width, 0);
    setParams({
      ...params,
      columns: updatedCols,
      tableW: parseFloat(newTotalW.toFixed(2))
    });
  };

  const handleColumnAlignChange = (colId, align) => {
    const updatedCols = params.columns.map(c => (c.id === colId ? { ...c, align } : c));
    setParams({ ...params, columns: updatedCols });
  };

  const handleColumnOffsetChange = (colId, offset) => {
    const parsed = parseFloat(offset) || 0;
    const updatedCols = params.columns.map(c => (c.id === colId ? { ...c, offset: parsed } : c));
    setParams({ ...params, columns: updatedCols });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              title="Return"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20">
              🎯
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                PDF Template Calibrator & Diff Studio
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/30">
                  Precision Engine
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'overlay'
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Onion Skin
          </button>
          <button
            onClick={() => setViewMode('difference')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'difference'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Exact match turns black, discrepancies glow neon"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Diff Glow
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-indigo-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Swipe Curtain
          </button>
          <button
            onClick={() => setViewMode('tint')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'tint'
                ? 'bg-teal-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Cyan/Magenta
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPreset}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 px-3 py-1.5 rounded-xl focus:outline-none focus:border-orange-500"
          >
            {Object.entries(BANK_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
          <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-300 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Slot A (Original):
              </span>
              {origDoc ? (
                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg text-[11px]">
                  <span className="text-emerald-400 font-semibold">Loaded</span>
                  {origDoc.type === 'pdf' && origDoc.numPages > 1 && (
                    <div className="flex items-center gap-1 ml-1 border-l border-slate-700 pl-1">
                      <button
                        onClick={() => handleOrigPageChange(origPageNum - 1)}
                        disabled={origPageNum <= 1}
                        className="p-0.5 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <span>p.{origPageNum}/{origDoc.numPages}</span>
                      <button
                        onClick={() => handleOrigPageChange(origPageNum + 1)}
                        disabled={origPageNum >= origDoc.numPages}
                        className="p-0.5 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="text-slate-400 hover:text-white ml-2 cursor-pointer underline">
                    Replace
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleLoadOriginalFile(e.target.files[0])}
                    />
                  </label>
                </div>
              ) : (
                <label className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg cursor-pointer flex items-center gap-1 transition-all">
                  <Upload className="w-3 h-3" /> Upload Original PDF/Image
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLoadOriginalFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-400 flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" /> Slot B (Generated):
              </span>
              {genDoc ? (
                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg text-[11px]">
                  <span className="text-emerald-400 font-semibold">Loaded</span>
                  {genDoc.type === 'pdf' && genDoc.numPages > 1 && (
                    <div className="flex items-center gap-1 ml-1 border-l border-slate-700 pl-1">
                      <button
                        onClick={() => handleGenPageChange(genPageNum - 1)}
                        disabled={genPageNum <= 1}
                        className="p-0.5 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <span>p.{genPageNum}/{genDoc.numPages}</span>
                      <button
                        onClick={() => handleGenPageChange(genPageNum + 1)}
                        disabled={genPageNum >= genDoc.numPages}
                        className="p-0.5 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="text-slate-400 hover:text-white ml-2 cursor-pointer underline">
                    Replace
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleLoadGeneratedFile(e.target.files[0])}
                    />
                  </label>
                </div>
              ) : (
                <label className="px-2.5 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 rounded-lg cursor-pointer flex items-center gap-1 transition-all">
                  <Upload className="w-3 h-3" /> Upload Generated PDF/Image
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLoadGeneratedFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWireframe(!showWireframe)}
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                  showWireframe
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'text-slate-500 border-slate-700'
                }`}
              >
                Wireframe {showWireframe ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setToolMode(toolMode === 'caliper' ? 'inspect' : 'caliper')}
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  toolMode === 'caliper'
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Ruler className="w-3 h-3" />
                Caliper Tool
              </button>
            </div>
          </div>

          <div
            ref={viewportRef}
            className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-6 relative cursor-crosshair"
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleCanvasMouseDown}
          >
            {(!origCanvas && !genCanvas) ? (
              <div className="text-center p-12 max-w-md border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-4 border border-orange-500/20 text-2xl">
                  🎯
                </div>
                <h3 className="text-base font-bold text-white mb-2">Upload Statements to Compare</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Upload an <span className="text-amber-400 font-semibold">Original PDF or screenshot</span> in Slot A, and the <span className="text-orange-400 font-semibold">Generated PDF</span> in Slot B.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <label className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all">
                    Choose PDF or Image
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleLoadOriginalFile(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div
                className="relative shadow-2xl rounded-sm border border-slate-700 bg-white transition-transform"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              >
                <canvas ref={mainCanvasRef} className="block" />
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl text-[11px] font-mono text-slate-300 shadow-xl flex items-center gap-4 pointer-events-none z-20">
              <div>
                <span className="text-slate-500">X: </span>
                <span className="text-emerald-400 font-bold">{hoverPt.ptX.toFixed(1)} pt</span>
              </div>
              <div>
                <span className="text-slate-500">Y (top): </span>
                <span className="text-emerald-400 font-bold">{hoverPt.ptY.toFixed(1)} pt</span>
              </div>
              <div>
                <span className="text-slate-500">PDFBox Y: </span>
                <span className="text-cyan-400 font-bold">{(params.pageH - hoverPt.ptY).toFixed(1)} pt</span>
              </div>
              {toolMode === 'caliper' && (
                <div className="text-rose-400 font-bold">
                  {caliperStart && !caliperEnd ? 'Click 2nd point to measure' : 'Click 1st point'}
                </div>
              )}
            </div>

            <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-1.5 rounded-2xl shadow-xl flex items-center gap-1 z-20">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 15))}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-slate-300 px-2 min-w-14 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(300, zoom + 15))}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs font-semibold cursor-pointer"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>
          </div>

          <div className="h-14 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-4 w-96">
              {viewMode === 'overlay' && (
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    Opacity ({opacity}%):
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                </div>
              )}

              {viewMode === 'split' && (
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    Curtain ({splitPos}%):
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={splitPos}
                    onChange={(e) => setSplitPos(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span className="text-slate-400 font-semibold flex items-center gap-1">
                <Move className="w-3.5 h-3.5" /> Nudge Gen:
              </span>
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                <span className="text-slate-500">X:</span>
                <input
                  type="number"
                  step="0.25"
                  value={nudgeX}
                  onChange={(e) => setNudgeX(parseFloat(e.target.value) || 0)}
                  className="w-12 bg-transparent text-center font-mono text-emerald-400 focus:outline-none"
                />
                <span className="text-slate-500">pt</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                <span className="text-slate-500">Y:</span>
                <input
                  type="number"
                  step="0.25"
                  value={nudgeY}
                  onChange={(e) => setNudgeY(parseFloat(e.target.value) || 0)}
                  className="w-12 bg-transparent text-center font-mono text-emerald-400 focus:outline-none"
                />
                <span className="text-slate-500">pt</span>
              </div>
              <button
                onClick={() => { setNudgeX(0); setNudgeY(0); }}
                className="p-1 hover:text-white text-slate-500 cursor-pointer"
                title="Reset Nudge"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <CalibratorSidebar
          params={params}
          setParams={setParams}
          onColumnWidthChange={handleColumnWidthChange}
          onColumnAlignChange={handleColumnAlignChange}
          onColumnOffsetChange={handleColumnOffsetChange}
        />
      </div>
    </div>
  );
}
