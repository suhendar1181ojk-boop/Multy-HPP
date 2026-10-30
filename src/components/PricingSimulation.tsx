import React from 'react';
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Tag, 
  Receipt, 
  HelpCircle, 
  Coins, 
  Scale, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { CalculationResult, ProjectData, formatIDR, formatPercent } from '../utils/calculations';

interface PricingSimulationProps {
  project: ProjectData;
  result: CalculationResult;
  onChange: (updated: Partial<ProjectData>) => void;
  language: 'id' | 'en';
}

export const PricingSimulation: React.FC<PricingSimulationProps> = ({
  project,
  result,
  onChange,
  language,
}) => {
  // Calculate percentage shares of selling price
  const sellingPrice = result.suggestedPriceNet || 1;
  const materialUnit = result.totalMaterial / project.productionVolume;
  const laborUnit = result.totalLabor / project.productionVolume;
  const overheadUnit = result.totalOverhead / project.productionVolume;
  const contingencyUnit = result.contingencyAmount / project.productionVolume;
  const profitUnit = Math.max(0, result.profitPerUnit);

  const matPct = Math.min(100, Math.round((materialUnit / sellingPrice) * 100));
  const labPct = Math.min(100, Math.round((laborUnit / sellingPrice) * 100));
  const ovhPct = Math.min(100, Math.round((overheadUnit / sellingPrice) * 100));
  const ctgPct = Math.min(100, Math.round((contingencyUnit / sellingPrice) * 100));
  const prfPct = Math.max(0, 100 - (matPct + labPct + ovhPct + ctgPct));

  return (
    <section className="bg-[#0b1329] p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <span>{language === 'id' ? 'Simulasi Harga Jual & Margin Keuntungan' : 'Pricing & Margin Simulator'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'id'
              ? 'Tentukan target profit, bandingkan Margin vs Markup, dan simulasikan diskon serta pajak secara real-time.'
              : 'Set profit target, compare Margin vs Markup, and simulate discounts & taxes.'}
          </p>
        </div>

        {/* Pricing Method Toggle */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onChange({ pricingMethod: 'margin' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              project.pricingMethod === 'margin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Margin on Price
          </button>
          <button
            type="button"
            onClick={() => onChange({ pricingMethod: 'markup' })}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              project.pricingMethod === 'markup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Markup on Cost
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: HPP per Unit */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>HPP Modal per {project.volumeUnit}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-400 border border-blue-800/60 font-semibold">
              Modal Pokok
            </span>
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-extrabold text-white">
            {formatIDR(result.costPerUnit)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Total RAB: {formatIDR(result.totalCost)} / {project.productionVolume} {project.volumeUnit}
          </p>
        </div>

        {/* KPI 2: Selling Price */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-emerald-500/30 ring-1 ring-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
            <span>Harga Jual per {project.volumeUnit}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
              Rekomendasi
            </span>
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-extrabold text-emerald-400">
            {formatIDR(result.suggestedPriceNet)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {project.includeTax ? `Inc. PPN (11%): ${formatIDR(result.finalPriceWithTax)}` : 'Sebelum Pajak / Non-PPN'}
          </p>
        </div>

        {/* KPI 3: Laba per Unit */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Laba per {project.volumeUnit}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-950 text-sky-400 border border-sky-800/60 font-semibold">
              {formatPercent(result.effectiveMarginPercent)} Margin
            </span>
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-extrabold text-sky-300">
            {formatIDR(result.profitPerUnit)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Markup: {formatPercent(result.effectiveMarkupPercent)} dari modal
          </p>
        </div>

        {/* KPI 4: Total Laba Proyek */}
        <div className="bg-gradient-to-br from-slate-900 to-[#0c1a38] p-4 rounded-xl border border-blue-900/60 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/15 rounded-full blur-2xl group-hover:bg-blue-600/25 transition-colors pointer-events-none" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 flex items-center justify-between">
            <span>Total Proyeksi Laba</span>
            <span className="flex items-center text-[10px] text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Net Profit
            </span>
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-extrabold text-white">
            {formatIDR(result.totalProfit)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Potensi Omzet: {formatIDR(result.suggestedPriceNet * project.productionVolume)}
          </p>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
        {/* Margin / Markup Slider */}
        <div className="md:col-span-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>
                Target {project.pricingMethod === 'margin' ? 'Margin Keuntungan' : 'Markup Biaya'}
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="90"
                step="0.5"
                value={project.targetMargin}
                onChange={(e) => onChange({ targetMargin: parseFloat(e.target.value) || 0 })}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-right font-mono font-bold text-emerald-400"
              />
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="85"
            step="1"
            value={project.targetMargin}
            onChange={(e) => onChange({ targetMargin: parseFloat(e.target.value) || 0 })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0% (BEP)</span>
            <span>20% (Standar)</span>
            <span>35% (Sehat)</span>
            <span>50%+ (Premium)</span>
          </div>

          {/* Quick Explanation Callout */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            {project.pricingMethod === 'margin' ? (
              <p>
                💡 <strong className="text-slate-300">Margin on Price:</strong> Laba dihitung dari{' '}
                <em>persentase harga jual</em>. Formula:{' '}
                <code className="text-emerald-400">Harga = Modal / (1 - {project.targetMargin}%)</code>.
              </p>
            ) : (
              <p>
                💡 <strong className="text-slate-300">Markup on Cost:</strong> Laba dihitung dari{' '}
                <em>kenaikan persentase di atas modal</em>. Formula:{' '}
                <code className="text-blue-400">Harga = Modal × (1 + {project.targetMargin}%)</code>.
              </p>
            )}
          </div>
        </div>

        {/* Promo Discount & Tax Controls */}
        <div className="md:col-span-6 space-y-4">
          {/* Promo Discount Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Diskon Promosi / Negosiasi</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {project.discountPercent}% ({formatIDR(result.discountAmount)})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={project.discountPercent}
              onChange={(e) => onChange({ discountPercent: parseFloat(e.target.value) || 0 })}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Tax PPN 11% Toggle */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Kenakan PPN (Pajak Pertambahan Nilai)
                </span>
                <span className="text-[11px] text-slate-400">
                  {project.includeTax
                    ? `Tarif ${project.taxRatePercent}% = ${formatIDR(result.taxAmount)} per ${project.volumeUnit}`
                    : 'Non-PKP / Bebas Pajak'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {project.includeTax && (
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={project.taxRatePercent}
                  onChange={(e) => onChange({ taxRatePercent: parseFloat(e.target.value) || 11 })}
                  className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right font-mono text-sky-400"
                />
              )}
              <button
                type="button"
                onClick={() => onChange({ includeTax: !project.includeTax })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  project.includeTax ? 'bg-sky-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    project.includeTax ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Proportional Cost Breakdown Stack Bar */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">
            Struktur Proporsi Harga Jual ({formatIDR(result.suggestedPriceNet)})
          </span>
          <span className="text-slate-400 text-[11px]">
            Modal: {formatPercent((result.costPerUnit / (result.suggestedPriceNet || 1)) * 100)} | Margin Laba: {formatPercent(result.effectiveMarginPercent)}
          </span>
        </div>

        {/* Visual Multi-Color Stack Bar */}
        <div className="h-6 w-full rounded-xl bg-slate-950 overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${matPct}%` }}
            className="bg-blue-600 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-white overflow-hidden whitespace-nowrap"
            title={`Bahan Langsung: ${matPct}% (${formatIDR(materialUnit)})`}
          >
            {matPct > 8 && `${matPct}%`}
          </div>
          <div
            style={{ width: `${labPct}%` }}
            className="bg-amber-600 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-white overflow-hidden whitespace-nowrap"
            title={`Tenaga Kerja: ${labPct}% (${formatIDR(laborUnit)})`}
          >
            {labPct > 8 && `${labPct}%`}
          </div>
          <div
            style={{ width: `${ovhPct}%` }}
            className="bg-purple-600 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-white overflow-hidden whitespace-nowrap"
            title={`Overhead: ${ovhPct}% (${formatIDR(overheadUnit)})`}
          >
            {ovhPct > 8 && `${ovhPct}%`}
          </div>
          <div
            style={{ width: `${ctgPct}%` }}
            className="bg-rose-600 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-white overflow-hidden whitespace-nowrap"
            title={`Kontingensi: ${ctgPct}% (${formatIDR(contingencyUnit)})`}
          >
            {ctgPct > 8 && `${ctgPct}%`}
          </div>
          <div
            style={{ width: `${prfPct}%` }}
            className="bg-emerald-500 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-slate-950 overflow-hidden whitespace-nowrap"
            title={`Laba Bersih: ${prfPct}% (${formatIDR(profitUnit)})`}
          >
            {prfPct > 8 && `${prfPct}% Laba`}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Bahan ({matPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
            <span>Tenaga Kerja ({labPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>Overhead ({ovhPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>Kontingensi ({ctgPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-400">Laba Bersih ({prfPct}%)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
