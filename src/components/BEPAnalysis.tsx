import React from 'react';
import { 
  Target, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  HelpCircle, 
  PieChart,
  BarChart3
} from 'lucide-react';
import { CalculationResult, ProjectData, formatIDR, formatPercent } from '../utils/calculations';

interface BEPAnalysisProps {
  project: ProjectData;
  result: CalculationResult;
  language: 'id' | 'en';
}

export const BEPAnalysis: React.FC<BEPAnalysisProps> = ({
  project,
  result,
  language,
}) => {
  const currentVolume = project.productionVolume;
  const bepUnits = result.bepUnits;
  const isAboveBEP = bepUnits > 0 && currentVolume >= bepUnits;
  const marginOfSafetyPercent =
    currentVolume > 0 && bepUnits > 0 && currentVolume >= bepUnits
      ? ((currentVolume - bepUnits) / currentVolume) * 100
      : 0;
  const unitsNeeded = bepUnits > 0 ? Math.max(0, bepUnits - currentVolume) : 0;

  // Percentage progress towards BEP
  const bepProgress = bepUnits > 0 ? Math.min(100, Math.round((currentVolume / bepUnits) * 100)) : 100;

  return (
    <section className="bg-[#0b1329] p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            <span>{language === 'id' ? 'Analisis Titik Impas (Break Even Point / BEP)' : 'Break-Even Point (BEP) Analysis'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'id'
              ? 'Ketahui volume dan omzet penjualan minimum yang wajib tercapai agar tidak mengalami kerugian.'
              : 'Identify minimum sales volume and revenue required to avoid operating losses.'}
          </p>
        </div>

        {/* Safety Zone Badge */}
        <div>
          {bepUnits === -1 ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-950/60 text-rose-400 border border-rose-800/60 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Harga Jual di Bawah Biaya Variabel
            </span>
          ) : isAboveBEP ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Zona Profit Aman ({formatPercent(marginOfSafetyPercent)} Margin of Safety)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Di Bawah Titik Impas (Kurang {unitsNeeded} {project.volumeUnit})
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* BEP Units */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            BEP Satuan (Unit)
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-extrabold text-sky-400">
            {bepUnits === -1 ? 'Tidak Tercapai' : `${bepUnits} ${project.volumeUnit}`}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Target saat ini: {currentVolume} {project.volumeUnit}
          </p>
        </div>

        {/* BEP Revenue */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            BEP Nilai Omzet (Rupiah)
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-extrabold text-emerald-400">
            {bepUnits === -1 ? '-' : formatIDR(result.bepRevenue)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Omzet minimum untuk menutup seluruh biaya
          </p>
        </div>

        {/* Fixed Cost Total */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Biaya Tetap (Fixed Cost)
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-extrabold text-slate-200">
            {formatIDR(result.fixedCostsTotal)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Sewa, gaji tetap, depresiasi, dan overhead
          </p>
        </div>

        {/* Contribution Margin */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Margin Kontribusi per {project.volumeUnit}
          </span>
          <div className="mt-2 text-xl sm:text-2xl font-mono font-extrabold text-amber-400">
            {formatIDR(result.contributionMarginPerUnit)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Rasio Kontribusi: {formatPercent(result.contributionMarginRatio * 100)}
          </p>
        </div>
      </div>

      {/* Visual Volume vs BEP Progress Bar */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Kapasitas Target vs Titik Impas</span>
          </span>
          <span className="font-mono text-slate-400">
            {currentVolume} / {bepUnits} {project.volumeUnit} ({bepProgress}%)
          </span>
        </div>

        {/* Multi-stage bar */}
        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
          <div
            style={{ width: `${Math.min(100, bepProgress)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              isAboveBEP ? 'bg-gradient-to-r from-sky-500 to-emerald-500' : 'bg-amber-500'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>0 (Mulai)</span>
          <span className="text-sky-400 font-bold">Titik Impas: {bepUnits} {project.volumeUnit}</span>
          <span className="text-emerald-400 font-bold">
            {isAboveBEP ? `Surplus +${currentVolume - bepUnits} ${project.volumeUnit} (Profit)` : `Kurang ${unitsNeeded}`}
          </span>
        </div>
      </div>

      {/* Financial Insight Note */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-sky-950 text-sky-400 shrink-0">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <span className="font-bold text-white block">Saran Analis Keuangan:</span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {isAboveBEP
              ? `Penjualan Anda berada di Zona Profit Aman. Setiap 1 ${project.volumeUnit} tambahan yang terjual di atas ${bepUnits} ${project.volumeUnit} akan langsung menyumbang laba bersih sebesar ${formatIDR(result.contributionMarginPerUnit)} karena seluruh biaya tetap sudah tertutup.`
              : `Penjualan target saat ini (${currentVolume} ${project.volumeUnit}) belum menutup total biaya tetap (${formatIDR(result.fixedCostsTotal)}). Pertimbangkan untuk meningkatkan volume penjualan sebesar ${unitsNeeded} ${project.volumeUnit}, menaikkan harga jual, atau menekan biaya overhead tetap.`}
          </p>
        </div>
      </div>
    </section>
  );
};
