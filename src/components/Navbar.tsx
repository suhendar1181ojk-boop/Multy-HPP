import React from 'react';
import { 
  Calculator, 
  Sparkles, 
  Bookmark, 
  History, 
  HelpCircle, 
  FileText, 
  Download, 
  Share2,
  Check
} from 'lucide-react';
import { BusinessCategory, ProjectData, CalculationResult } from '../utils/calculations';
import { CATEGORY_METADATA } from '../data/presets';
import { exportToCSV, generateClipboardSummary } from '../utils/exportHelpers';

interface NavbarProps {
  project: ProjectData;
  calculationResult: CalculationResult;
  onSelectCategory: (category: BusinessCategory) => void;
  onOpenPresets: () => void;
  onOpenHistory: () => void;
  onOpenEducation: () => void;
  onOpenQuotation: () => void;
  onOpenAIChat: () => void;
  isAiChatOpen: boolean;
  language: 'id' | 'en';
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  calculationResult,
  onSelectCategory,
  onOpenPresets,
  onOpenHistory,
  onOpenEducation,
  onOpenQuotation,
  onOpenAIChat,
  isAiChatOpen,
  language,
  onToggleLanguage,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySummary = () => {
    const text = generateClipboardSummary(project, calculationResult);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#070e1e]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors no-print">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-900/30 ring-1 ring-white/10">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white tracking-tight">HPP-Pro Master</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                PRO 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {language === 'id' 
                ? 'Kalkulator HPP, RAB & Simulasi Margin Cerdas' 
                : 'Smart Cost of Goods, BOQ & Margin Simulator'}
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Preset Button */}
          <button
            type="button"
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all cursor-pointer"
            title="Pilih Template Standar Industri atau Preset Anda"
          >
            <Bookmark className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">{language === 'id' ? 'Template & Preset' : 'Templates'}</span>
            <span className="md:hidden">Preset</span>
          </button>

          {/* History Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all cursor-pointer"
            title="Riwayat Proyek Tersimpan"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{language === 'id' ? 'Riwayat' : 'History'}</span>
          </button>

          {/* Quotation / Surat Penawaran */}
          <button
            type="button"
            onClick={onOpenQuotation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all cursor-pointer"
            title="Lihat & Cetak Surat Penawaran Resmi"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{language === 'id' ? 'Draft Penawaran' : 'Quotation'}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => exportToCSV(project, calculationResult)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all cursor-pointer"
            title="Unduh File CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline">CSV / Excel</span>
          </button>

          {/* Share / Copy Summary to WhatsApp */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all cursor-pointer"
            title="Salin Ringkasan Format WhatsApp"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden lg:inline">{language === 'id' ? 'Salin WA' : 'Copy'}</span>
              </>
            )}
          </button>

          {/* Guide / Education */}
          <button
            type="button"
            onClick={onOpenEducation}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all cursor-pointer"
            title="Panduan Konsep HPP, RAB & BEP"
            aria-label="Panduan Edukasi"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="px-2 py-1 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/60 transition-all cursor-pointer"
            title="Ganti Bahasa (ID / EN)"
          >
            {language.toUpperCase()}
          </button>

          {/* AI Consultant Trigger */}
          <button
            type="button"
            onClick={onOpenAIChat}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer ${
              isAiChatOpen
                ? 'bg-sky-500 text-white shadow-sky-500/25 ring-2 ring-sky-400/40'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-200 animate-pulse" />
            <span>{language === 'id' ? 'Konsultan AI' : 'AI Advisor'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
