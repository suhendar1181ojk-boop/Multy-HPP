/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ProjectData, 
  CostItem, 
  BusinessCategory, 
  calculateHPP, 
  evaluateVendors,
  formatIDR 
} from './utils/calculations';
import { STANDARD_PRESETS, PresetTemplate } from './data/presets';
import { Navbar } from './components/Navbar';
import { ProjectHeader } from './components/ProjectHeader';
import { CostItemsTable } from './components/CostItemsTable';
import { PricingSimulation } from './components/PricingSimulation';
import { BEPAnalysis } from './components/BEPAnalysis';
import { ScenarioAnalysis } from './components/ScenarioAnalysis';
import { AIConsultantChat } from './components/AIConsultantChat';
import { QuotationPreviewModal } from './components/QuotationPreviewModal';
import { VendorComparisonModal } from './components/VendorComparisonModal';
import { PresetModal } from './components/PresetModal';
import { HistoryModal } from './components/HistoryModal';
import { EducationModal } from './components/EducationModal';
import { Sparkles, FileText, Download, Share2, Bookmark, Check } from 'lucide-react';
import { exportToCSV, generateClipboardSummary } from './utils/exportHelpers';

const STORAGE_ACTIVE_KEY = 'hpp_pro_active_project_v1';
const STORAGE_HISTORY_KEY = 'hpp_pro_saved_projects_v1';
const STORAGE_PRESETS_KEY = 'hpp_pro_custom_presets_v1';

export default function App() {
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  // Initialize active project from localStorage or standard preset
  const [project, setProject] = useState<ProjectData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load active project from storage', e);
    }
    const defaultTemplate = STANDARD_PRESETS[0];
    return {
      ...defaultTemplate.data,
      id: 'proj_' + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });

  // Saved projects in history
  const [savedProjects, setSavedProjects] = useState<ProjectData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved projects', e);
    }
    return [];
  });

  // Custom user presets
  const [customPresets, setCustomPresets] = useState<PresetTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRESETS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load custom presets', e);
    }
    return [];
  });

  // Modals state
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const [isVendorComparisonOpen, setIsVendorComparisonOpen] = useState(false);
  const [selectedVendorItemId, setSelectedVendorItemId] = useState<string | undefined>();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Sync active project to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to persist active project', e);
    }
  }, [project]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(savedProjects));
    } catch (e) {
      console.error('Failed to persist history', e);
    }
  }, [savedProjects]);

  // Sync custom presets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(customPresets));
    } catch (e) {
      console.error('Failed to persist presets', e);
    }
  }, [customPresets]);

  // Core real-time calculation
  const calculationResult = calculateHPP(project);

  // Handlers for project updates
  const handleUpdateProject = (updated: Partial<ProjectData>) => {
    setProject((prev) => ({
      ...prev,
      ...updated,
      updatedAt: Date.now(),
    }));
  };

  const handleUpdateItems = (items: CostItem[]) => {
    handleUpdateProject({ items });
  };

  const handleUpdateContingency = (contingencyPercent: number) => {
    handleUpdateProject({ contingencyPercent });
  };

  // When AI parses natural language cost text
  const handleApplyAIParsedData = (data: any) => {
    if (!data) return;
    setProject((prev) => {
      const newItems: CostItem[] = (data.items || []).map((it: any, idx: number) => ({
        id: 'ai_' + Date.now() + '_' + idx,
        name: it.name || 'Komponen Biaya',
        type: it.type || 'material',
        quantity: Math.max(0.01, Number(it.quantity) || 1),
        unit: it.unit || 'pcs',
        unitPrice: Math.max(0, Number(it.unitPrice) || 0),
        isFixedCost: it.type === 'overhead',
      }));

      return {
        ...prev,
        name: data.projectName || prev.name,
        category: (data.category as BusinessCategory) || prev.category,
        productionVolume: Math.max(0.01, Number(data.productionVolume) || prev.productionVolume),
        volumeUnit: data.volumeUnit || prev.volumeUnit,
        targetMargin: typeof data.targetMargin === 'number' ? data.targetMargin : prev.targetMargin,
        items: newItems.length > 0 ? newItems : prev.items,
        updatedAt: Date.now(),
      };
    });
  };

  // Vendor comparison handlers
  const handleOpenVendorComparison = (item?: CostItem) => {
    setSelectedVendorItemId(item?.id);
    setIsVendorComparisonOpen(true);
  };

  const handleApplyVendorPrice = (itemId: string, newUnitPrice: number) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === itemId ? { ...it, unitPrice: newUnitPrice } : it)),
      updatedAt: Date.now(),
    }));
  };

  // Preset handlers
  const handleLoadPreset = (presetData: Omit<ProjectData, 'id' | 'createdAt' | 'updatedAt'>) => {
    setProject({
      ...presetData,
      id: 'proj_' + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const handleSaveAsCustomPreset = () => {
    const newPreset: PresetTemplate = {
      id: 'preset_' + Date.now(),
      category: project.category,
      categoryLabel: project.category.toUpperCase(),
      name: project.name,
      description: `Preset kustom: ${project.items.length} komponen, margin ${project.targetMargin}%`,
      icon: 'Bookmark',
      data: {
        ...project,
      },
    };
    setCustomPresets((prev) => [newPreset, ...prev]);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleDeleteCustomPreset = (id: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== id));
  };

  // History handlers
  const handleSaveCurrentProject = () => {
    setSavedProjects((prev) => {
      const existingIdx = prev.findIndex((p) => p.id === project.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...project, updatedAt: Date.now() };
        return copy;
      }
      return [{ ...project, updatedAt: Date.now() }, ...prev];
    });
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleLoadSavedProject = (loaded: ProjectData) => {
    setProject(loaded);
  };

  const handleDeleteSavedProject = (id: string) => {
    setSavedProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        project={project}
        calculationResult={calculationResult}
        onSelectCategory={(cat) => handleUpdateProject({ category: cat })}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenEducation={() => setIsEducationOpen(true)}
        onOpenQuotation={() => setIsQuotationOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        isAiChatOpen={isAIChatOpen}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'id' ? 'en' : 'id')}
      />

      {/* Main One-Page Scroll Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-8">
        {/* Save Toast Notification */}
        {showSaveToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-900/50 flex items-center gap-2.5 animate-bounce">
            <Check className="w-5 h-5" />
            <span className="text-xs sm:text-sm font-bold">
              Proyek berhasil disimpan ke memori lokal!
            </span>
          </div>
        )}

        {/* 1. Universal Form & Natural Language AI Extractor */}
        <ProjectHeader
          project={project}
          onChange={handleUpdateProject}
          onApplyAIParsedData={handleApplyAIParsedData}
          language={language}
        />

        {/* 2. Komponen Biaya Table (Bahan, Upah, Overhead, Kontingensi) */}
        <CostItemsTable
          items={project.items}
          contingencyPercent={project.contingencyPercent}
          result={calculationResult}
          volumeUnit={project.volumeUnit}
          onUpdateItems={handleUpdateItems}
          onUpdateContingency={handleUpdateContingency}
          onOpenVendorComparison={handleOpenVendorComparison}
          onSaveAsCustomPreset={handleSaveAsCustomPreset}
          language={language}
        />

        {/* 3. Dashboard Hasil Kalkulasi & Simulasi Margin Real-Time */}
        <PricingSimulation
          project={project}
          result={calculationResult}
          onChange={handleUpdateProject}
          language={language}
        />

        {/* 4. Analisis Titik Impas (Break Even Point / BEP) */}
        <BEPAnalysis
          project={project}
          result={calculationResult}
          language={language}
        />

        {/* 5. Simulasi 3 Skenario Bisnis (Base, Optimis, Pesimis) */}
        <ScenarioAnalysis project={project} language={language} />

        {/* 6. Quick Action Bottom Banner */}
        <section className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 p-6 rounded-2xl border border-blue-900/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Butuh Rekomendasi Efisiensi Biaya Mendalam?</span>
            </h3>
            <p className="text-xs text-slate-400">
              Konsultan Keuangan AI siap membantu Anda memangkas pengeluaran overhead dan mengoptimalkan harga jual.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setIsAIChatOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-700/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-200" />
              <span>Buka Konsultan AI</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQuotationOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cetak Dokumen RAB</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-900 bg-[#040813] text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-400">
            HPP-Pro Master • Solusi Cerdas Perhitungan HPP, RAB & Analisis Margin Akuntansi Indonesia
          </p>
          <p className="text-[11px] text-slate-600">
            Dirancang untuk Pemilik UMKM, Kontraktor Properti, Developer, Manajer Retail & Freelancer Profesional.
          </p>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <AIConsultantChat
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        project={project}
        calculationResult={calculationResult}
        language={language}
      />

      <VendorComparisonModal
        isOpen={isVendorComparisonOpen}
        onClose={() => setIsVendorComparisonOpen(false)}
        items={project.items}
        selectedItemId={selectedVendorItemId}
        onApplyVendorPrice={handleApplyVendorPrice}
        language={language}
      />

      <QuotationPreviewModal
        isOpen={isQuotationOpen}
        onClose={() => setIsQuotationOpen(false)}
        project={project}
        result={calculationResult}
        language={language}
      />

      <PresetModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onLoadPreset={handleLoadPreset}
        customPresets={customPresets}
        onDeleteCustomPreset={handleDeleteCustomPreset}
        language={language}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedProjects={savedProjects}
        currentProjectId={project.id}
        onSaveCurrentProject={handleSaveCurrentProject}
        onLoadProject={handleLoadSavedProject}
        onDeleteProject={handleDeleteSavedProject}
        language={language}
      />

      <EducationModal
        isOpen={isEducationOpen}
        onClose={() => setIsEducationOpen(false)}
        language={language}
      />
    </div>
  );
}
