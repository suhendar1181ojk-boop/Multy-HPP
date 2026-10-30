import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Briefcase, 
  HardHat, 
  Factory, 
  ShoppingBag, 
  Sparkles, 
  Layers, 
  Users, 
  Calendar,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { BusinessCategory, ProjectData } from '../utils/calculations';
import { CATEGORY_METADATA } from '../data/presets';

interface ProjectHeaderProps {
  project: ProjectData;
  onChange: (updated: Partial<ProjectData>) => void;
  onApplyAIParsedData: (parsed: any) => void;
  language: 'id' | 'en';
}

const CATEGORY_ICONS: Record<BusinessCategory, React.ReactNode> = {
  kuliner: <UtensilsCrossed className="w-4 h-4" />,
  jasa: <Briefcase className="w-4 h-4" />,
  konstruksi: <HardHat className="w-4 h-4" />,
  manufaktur: <Factory className="w-4 h-4" />,
  retail: <ShoppingBag className="w-4 h-4" />,
};

const SAMPLE_PROMPTS = [
  {
    category: 'kuliner' as BusinessCategory,
    label: 'Katering Nasi Kotak Ayam Bakar',
    text: 'Saya mau buat katering 100 porsi nasi kotak ayam bakar komplit. Butuh beras ramos 12kg @16rb, ayam potong 10 ekor @36rb, bumbu marinasi & sambal 125rb, tahu tempe bacem 100pcs @800, kotak bento sekat 100 set @2200, upah masak 2 koki @125rb, gas dan minyak 85rb, ongkos delivery 50rb. Mau margin keuntungan 35%.',
  },
  {
    category: 'jasa' as BusinessCategory,
    label: 'Jasa Pembuatan Website & SEO',
    text: 'Proyek pembuatan website profil perusahaan & SEO 1 proyek. Desain figma UI/UX 1800000, coding frontend backend 4200000, domain & cloud hosting 1350000, plugin premium 650000, copywriting 900000, alokasi listrik internet 350000, QA testing 600000. Target margin 45%.',
  },
  {
    category: 'konstruksi' as BusinessCategory,
    label: 'RAB Cat Tembok Interior 36 m²',
    text: 'Pekerjaan pengecatan dinding ruangan seluas 36 m2. Cat Dulux 4 galon @285rb, cat dasar sealer 2 galon @165rb, plamir & amplas 180rb, kuas & roller 145rb, tukang cat 3 hari @200rb, kenek 3 hari @130rb, sewa tangga 3 hari @35rb, buang puing 150rb. Target markup 25%.',
  },
];

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onChange,
  onApplyAIParsedData,
  language,
}) => {
  const [promptText, setPromptText] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [showPromptArea, setShowPromptArea] = useState(false);

  const categories: BusinessCategory[] = ['kuliner', 'jasa', 'konstruksi', 'manufaktur', 'retail'];

  const handleParseWithAI = async () => {
    if (!promptText.trim()) return;

    setIsLoadingAI(true);
    setAiError(null);
    setAiSuccessMessage(null);

    try {
      const response = await fetch('/api/parse-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText,
          categoryHint: project.category,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses data dengan AI');
      }

      if (data.data) {
        onApplyAIParsedData(data.data);
        setAiSuccessMessage(
          data.data.aiSummary ||
            'Berhasil mengekstrak komponen biaya terstruktur dari deskripsi Anda!'
        );
      }
    } catch (err: any) {
      setAiError(err.message || 'Terjadi kesalahan saat memproses data AI.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <section className="mb-6 space-y-4">
      {/* Category Universal Tabs */}
      <div className="bg-[#0b1329] p-2 sm:p-2.5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            {language === 'id' ? 'Pilih Kategori Usaha' : 'Select Business Category'}
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {CATEGORY_METADATA[project.category].description}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {categories.map((cat) => {
            const isSelected = project.category === cat;
            const meta = CATEGORY_METADATA[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onChange({
                    category: cat,
                    volumeUnit: meta.defaultUnit,
                  });
                }}
                className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-700/30 border border-blue-400/40 ring-1 ring-sky-400/50'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <span className={isSelected ? 'text-sky-200' : 'text-slate-500'}>
                  {CATEGORY_ICONS[cat]}
                </span>
                <span className="truncate">{language === 'id' ? meta.label : meta.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Project Details Card */}
      <div className="bg-[#0b1329] p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Project Name */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>{language === 'id' ? 'Nama Proyek / Produk' : 'Project / Product Name'}</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={language === 'id' ? 'Contoh: Katering Nasi Kotak 100 Porsi' : 'Project Name'}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Target Production Volume & Unit */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span>{language === 'id' ? 'Target Volume' : 'Production Volume'}</span>
              <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0.01"
                step="any"
                value={project.productionVolume || ''}
                onChange={(e) => onChange({ productionVolume: parseFloat(e.target.value) || 0 })}
                className="w-1/2 bg-slate-900 border border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-3 py-2.5 text-sm text-white font-mono transition-colors"
                placeholder="100"
              />
              <input
                type="text"
                value={project.volumeUnit}
                onChange={(e) => onChange({ volumeUnit: e.target.value })}
                placeholder="porsi / pcs / m²"
                className="w-1/2 bg-slate-900 border border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-colors"
              />
            </div>
          </div>

          {/* Client & Date Toggle / Fields */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'id' ? 'Nama Klien / Pembeli' : 'Client Name'}</span>
            </label>
            <input
              type="text"
              value={project.clientName || ''}
              onChange={(e) => onChange({ clientName: e.target.value })}
              placeholder={language === 'id' ? 'Opsional: PT Mandiri Jaya' : 'Optional client name'}
              className="w-full bg-slate-900 border border-slate-700/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition-colors"
            />
          </div>
        </div>

        {/* AI Natural Language Assistant Box Toggle */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-200">
                  {language === 'id' ? 'Smart Input: Input Bebas via AI' : 'Smart Input: Free Text via AI'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {language === 'id'
                    ? 'Ketik deskripsi biaya sehari-hari, AI akan otomatis mengekstrak bahan baku, upah, dan overhead.'
                    : 'Describe your costs in plain text, AI will categorize materials, labor & overhead.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPromptArea(!showPromptArea)}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{showPromptArea ? (language === 'id' ? 'Tutup Asisten' : 'Close Assistant') : (language === 'id' ? 'Buka Input AI' : 'Open AI Input')}</span>
            </button>
          </div>

          {/* Collapsible Smart Text Prompt Area */}
          {showPromptArea && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-sky-500/20 space-y-3">
              {/* Sample Prompts */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400">Contoh Cepat:</span>
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPromptText(sample.text);
                      onChange({ category: sample.category });
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={
                    language === 'id'
                      ? 'Contoh: Saya mau produksi 100 pcs kaos sablon. Butuh kain combed 30s 28kg @125rb, ongkos jahit @7500, ongkos sablon @6500, plastik packing 100pcs @1800, listrik mesin 140rb. Target margin 30%...'
                      : 'Example: I want to produce 100 t-shirts. Need 28kg cotton @125k, sewing fee @7.5k...'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Action & Feedback */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-[11px] text-slate-500">
                  {language === 'id'
                    ? 'AI akan menyusun tabel biaya otomatis, menghitung kuantitas dan harga satuan.'
                    : 'AI will format the cost table with quantities and unit prices.'}
                </p>

                <button
                  type="button"
                  disabled={isLoadingAI || !promptText.trim()}
                  onClick={handleParseWithAI}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-600/30 transition-all cursor-pointer"
                >
                  {isLoadingAI ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'id' ? 'Menganalisis Biaya...' : 'Analyzing Costs...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sky-200" />
                      <span>{language === 'id' ? 'Ekstrak dengan AI' : 'Extract with AI'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status messages */}
              {aiError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Gagal Memproses: </span>
                    {aiError}
                  </div>
                </div>
              )}

              {aiSuccessMessage && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Analisis Selesai: </span>
                    {aiSuccessMessage}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
