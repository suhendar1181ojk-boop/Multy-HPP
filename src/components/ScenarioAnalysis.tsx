import React from 'react';
import { 
  GitBranch, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  HelpCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { ProjectData, calculateScenarios, formatIDR, formatPercent } from '../utils/calculations';

interface ScenarioAnalysisProps {
  project: ProjectData;
  language: 'id' | 'en';
}

export const ScenarioAnalysis: React.FC<ScenarioAnalysisProps> = ({
  project,
  language,
}) => {
  const scenarios = calculateScenarios(project);
  const base = scenarios.base;
  const opt = scenarios.optimistic;
  const pes = scenarios.pessimistic;

  const profitDiffPes = pes.totalProfit - base.totalProfit;
  const profitDiffOpt = opt.totalProfit - base.totalProfit;

  return (
    <section className="bg-[#0b1329] p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>{language === 'id' ? 'Simulasi Skenario Bisnis (Stress Test)' : 'Scenario & Stress Test Simulation'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'id'
              ? 'Uji ketahanan bisnis terhadap fluktuasi harga bahan baku, efisiensi kerja, dan daya serap pasar.'
              : 'Test business resilience against material price hikes, labor efficiencies, and demand shifts.'}
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          Status: <strong className={pes.totalProfit > 0 ? 'text-emerald-400' : 'text-rose-400'}>
            {pes.totalProfit > 0 ? 'Tahan Guncangan (Masih Profit)' : 'Rentan Guncangan Pasar'}
          </strong>
        </div>
      </div>

      {/* 3 Scenario Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scenario 1: Optimistic */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-sky-950/30 to-slate-900 border border-sky-800/60 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-sky-300" />
              Skenario Optimis
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-900/60 text-sky-200 border border-sky-700/60">
              Diskon Bahan -8% | Volume +15%
            </span>
          </div>

          <div className="space-y-2 pt-1 font-sans">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">HPP Pokok:</span>
              <span className="font-mono font-bold text-slate-200">{formatIDR(opt.costPerUnit)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Biaya RAB:</span>
              <span className="font-mono font-bold text-slate-200">{formatIDR(opt.totalCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Harga Jual:</span>
              <span className="font-mono font-bold text-sky-300">{formatIDR(opt.suggestedPriceNet)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Titik Impas (BEP):</span>
              <span className="font-mono font-bold text-slate-300">{opt.bepUnits} {project.volumeUnit}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-xs font-bold text-sky-400">Total Laba Bersih:</span>
              <div className="text-right">
                <span className="text-base font-mono font-extrabold text-sky-300 block">
                  {formatIDR(opt.totalProfit)}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  +{formatIDR(profitDiffOpt)} vs Normal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario 2: Base (Normal) */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-600/50 ring-1 ring-blue-500/30 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Skenario Normal (Base)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              Rencana Saat Ini
            </span>
          </div>

          <div className="space-y-2 pt-1 font-sans">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">HPP Pokok:</span>
              <span className="font-mono font-bold text-slate-200">{formatIDR(base.costPerUnit)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Biaya RAB:</span>
              <span className="font-mono font-bold text-slate-200">{formatIDR(base.totalCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Harga Jual:</span>
              <span className="font-mono font-bold text-emerald-400">{formatIDR(base.suggestedPriceNet)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Titik Impas (BEP):</span>
              <span className="font-mono font-bold text-slate-300">{base.bepUnits} {project.volumeUnit}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-xs font-bold text-emerald-400">Total Laba Bersih:</span>
              <div className="text-right">
                <span className="text-base font-mono font-extrabold text-emerald-400 block">
                  {formatIDR(base.totalProfit)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatPercent(base.effectiveMarginPercent)} Margin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scenario 3: Pessimistic (Stress Test) */}
        <div className="p-4 rounded-xl bg-gradient-to-b from-rose-950/20 to-slate-900 border border-rose-900/50 relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Skenario Pesimis (Inflasi)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
              Bahan +12% | Pasar -15%
            </span>
          </div>

          <div className="space-y-2 pt-1 font-sans">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">HPP Pokok:</span>
              <span className="font-mono font-bold text-rose-300">{formatIDR(pes.costPerUnit)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Biaya RAB:</span>
              <span className="font-mono font-bold text-slate-200">{formatIDR(pes.totalCost)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Harga Jual:</span>
              <span className="font-mono font-bold text-slate-200">{formatIDR(pes.suggestedPriceNet)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Titik Impas (BEP):</span>
              <span className="font-mono font-bold text-slate-300">{pes.bepUnits} {project.volumeUnit}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-xs font-bold text-rose-400">Total Laba Bersih:</span>
              <div className="text-right">
                <span
                  className={`text-base font-mono font-extrabold block ${
                    pes.totalProfit >= 0 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {formatIDR(pes.totalProfit)}
                </span>
                <span className="text-[10px] text-rose-400 font-mono">
                  {formatIDR(profitDiffPes)} vs Normal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stress Test Conclusion Alert */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 shrink-0">
          <GitBranch className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white block">Evaluasi Sensitivitas Bisnis:</span>
          <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">
            {pes.totalProfit > 0
              ? `Model bisnis ini memiliki penyangga keamanan yang baik. Jika terjadi kenaikan harga bahan baku 12% dan volume penjualan turun 15%, proyek Anda tetap menghasilkan laba positif sebesar ${formatIDR(pes.totalProfit)}.`
              : `Peringatan Risiko: Pada skenario terburuk (bahan baku naik 12% dan permintaan turun 15%), laba berpotensi tergerus menjadi ${formatIDR(pes.totalProfit)}. Pertimbangkan untuk mengamankan kontrak harga dengan supplier atau menaikkan target margin minimal 5% lagi.`}
          </p>
        </div>
      </div>
    </section>
  );
};
