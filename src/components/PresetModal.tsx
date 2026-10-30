import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  Check, 
  Layers, 
  UtensilsCrossed, 
  Briefcase, 
  HardHat, 
  Factory, 
  ShoppingBag, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { STANDARD_PRESETS, PresetTemplate } from '../data/presets';
import { ProjectData, BusinessCategory, formatIDR } from '../utils/calculations';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPreset: (data: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>) => void;
  customPresets: PresetTemplate[];
  onDeleteCustomPreset: (id: string) => void;
  language: 'id' | 'en';
}

const CATEGORY_ICONS: Record<BusinessCategory, React.ReactNode> = {
  kuliner: <UtensilsCrossed className="w-4 h-4 text-orange-400" />,
  jasa: <Briefcase className="w-4 h-4 text-blue-400" />,
  konstruksi: <HardHat className="w-4 h-4 text-amber-400" />,
  manufaktur: <Factory className="w-4 h-4 text-cyan-400" />,
  retail: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
};

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  onLoadPreset,
  customPresets,
  onDeleteCustomPreset,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'custom'>('standard');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {language === 'id' ? 'Template Standar & Preset Biaya' : 'Standard Templates & Presets'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Gunakan template standar industri yang sudah teruji atau preset kustom Anda.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('standard')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'standard'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Template Standar Industri ({STANDARD_PRESETS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Preset Saya ({customPresets.length})
          </button>
        </div>

        {/* Preset Cards List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {activeTab === 'standard' ? (
            STANDARD_PRESETS.map((preset) => {
              const totalItems = preset.data.items.length;
              return (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                        {CATEGORY_ICONS[preset.category]}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {preset.name}
                      </h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {preset.categoryLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Volume: {preset.data.productionVolume} {preset.data.volumeUnit}</span>
                      <span>•</span>
                      <span>Target Margin: {preset.data.targetMargin}%</span>
                      <span>•</span>
                      <span>{totalItems} Komponen Biaya</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadPreset(preset.data);
                      onClose();
                    }}
                    className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Pakai Template Ini
                  </button>
                </div>
              );
            })
          ) : customPresets.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Belum Ada Preset Kustom yang Disimpan</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Anda dapat menyimpan kombinasi biaya proyek saat ini dengan menekan tombol <strong>"Simpan Jadi Preset Favorit"</strong> di tabel biaya.
              </p>
            </div>
          ) : (
            customPresets.map((preset) => (
              <div
                key={preset.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-slate-800">
                      {CATEGORY_ICONS[preset.category]}
                    </span>
                    <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{preset.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadPreset(preset.data);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer"
                  >
                    Muat
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomPreset(preset.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
