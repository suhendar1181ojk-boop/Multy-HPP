import React from 'react';
import { 
  X, 
  History, 
  FolderPlus, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { ProjectData, formatIDR } from '../utils/calculations';
import { CATEGORY_METADATA } from '../data/presets';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: ProjectData[];
  currentProjectId: string;
  onSaveCurrentProject: () => void;
  onLoadProject: (project: ProjectData) => void;
  onDeleteProject: (id: string) => void;
  language: 'id' | 'en';
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  currentProjectId,
  onSaveCurrentProject,
  onLoadProject,
  onDeleteProject,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {language === 'id' ? 'Riwayat Proyek & Kalkulasi' : 'Saved Projects & History'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Data tersimpan otomatis di browser lokal (localStorage) Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSaveCurrentProject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer shadow-sm"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Simpan Proyek Ini</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {savedProjects.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Belum Ada Proyek yang Disimpan</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Klik tombol <strong>"Simpan Proyek Ini"</strong> di atas untuk menyimpan kalkulasi aktif Anda.
              </p>
            </div>
          ) : (
            savedProjects.map((proj) => {
              const isCurrent = proj.id === currentProjectId;
              const dateStr = new Date(proj.updatedAt || proj.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={proj.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isCurrent
                      ? 'bg-blue-950/30 border-blue-600/50 ring-1 ring-blue-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          Aktif
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="capitalize">{CATEGORY_METADATA[proj.category]?.label || proj.category}</span>
                      <span>•</span>
                      <span>{proj.productionVolume} {proj.volumeUnit}</span>
                      <span>•</span>
                      <span>{proj.items.length} Komponen</span>
                    </div>

                    <span className="text-[11px] text-slate-500 block">
                      Terakhir diubah: {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadProject(proj);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      <span>Buka</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Hapus dari Riwayat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
