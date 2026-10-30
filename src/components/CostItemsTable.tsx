import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Layers, 
  Sliders, 
  TrendingUp, 
  Package, 
  Hammer, 
  Building2, 
  HelpCircle,
  Store,
  BookmarkPlus
} from 'lucide-react';
import { CostItem, CostItemType, CalculationResult, formatIDR } from '../utils/calculations';

interface CostItemsTableProps {
  items: CostItem[];
  contingencyPercent: number;
  result: CalculationResult;
  volumeUnit: string;
  onUpdateItems: (items: CostItem[]) => void;
  onUpdateContingency: (percent: number) => void;
  onOpenVendorComparison: (item?: CostItem) => void;
  onSaveAsCustomPreset: () => void;
  language: 'id' | 'en';
}

const COMMON_UNITS = [
  'pcs', 'kg', 'gram', 'liter', 'ekor', 'paket', 'set', 'potong', 
  'hari', 'jam', 'orang', 'bulan', 'm²', 'm³', 'sak', 'rol', 'proyek'
];

export const CostItemsTable: React.FC<CostItemsTableProps> = ({
  items,
  contingencyPercent,
  result,
  volumeUnit,
  onUpdateItems,
  onUpdateContingency,
  onOpenVendorComparison,
  onSaveAsCustomPreset,
  language,
}) => {
  const [filterType, setFilterType] = useState<'all' | CostItemType>('all');
  
  // New item draft state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CostItemType>('material');
  const [newQuantity, setNewQuantity] = useState<number | ''>(1);
  const [newUnit, setNewUnit] = useState('pcs');
  const [newUnitPrice, setNewUnitPrice] = useState<number | ''>('');
  const [newIsFixed, setNewIsFixed] = useState(false);

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim() || newQuantity === '' || newUnitPrice === '') return;

    const newItem: CostItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: newName.trim(),
      type: newType,
      quantity: Number(newQuantity),
      unit: newUnit.trim() || 'pcs',
      unitPrice: Number(newUnitPrice),
      isFixedCost: newType === 'overhead' ? true : newIsFixed,
    };

    onUpdateItems([...items, newItem]);
    setNewName('');
    setNewQuantity(1);
    setNewUnitPrice('');
  };

  const handleUpdateItem = (id: string, updates: Partial<CostItem>) => {
    onUpdateItems(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  const handleDuplicateItem = (item: CostItem) => {
    const duplicated: CostItem = {
      ...item,
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: `${item.name} (Copy)`,
    };
    onUpdateItems([...items, duplicated]);
  };

  const filteredItems = items.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const materialCount = items.filter((i) => i.type === 'material').length;
  const laborCount = items.filter((i) => i.type === 'labor').length;
  const overheadCount = items.filter((i) => i.type === 'overhead').length;

  return (
    <section className="bg-[#0b1329] p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
      {/* Table Section Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>{language === 'id' ? 'Daftar Komponen Biaya (HPP & RAB)' : 'Cost Items Breakdown'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'id' 
              ? 'Kelompokkan ke Bahan Baku Langsung, Tenaga Kerja, atau Overhead Operasional.'
              : 'Categorize into Direct Materials, Direct Labor, or Operating Overhead.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'id' ? 'Semua' : 'All'} ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('material')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'material'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'id' ? 'Bahan' : 'Materials'} ({materialCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('labor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'labor'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'id' ? 'Upah' : 'Labor'} ({laborCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('overhead')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'overhead'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overhead ({overheadCount})
          </button>
        </div>
      </div>

      {/* Interactive Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-3 px-3 sm:px-4">Komponen Biaya</th>
              <th className="py-3 px-2 sm:px-3">Kategori</th>
              <th className="py-3 px-2 sm:px-3 text-center" title="Sifat biaya untuk analisis titik impas (BEP)">
                Tipe BEP
              </th>
              <th className="py-3 px-2 sm:px-3 text-right">Kuantitas</th>
              <th className="py-3 px-2 sm:px-3">Satuan</th>
              <th className="py-3 px-2 sm:px-3 text-right">Harga Satuan (IDR)</th>
              <th className="py-3 px-3 sm:px-4 text-right">Subtotal</th>
              <th className="py-3 px-2 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500">
                  <p className="text-sm font-medium">Belum ada komponen biaya dalam kategori ini.</p>
                  <p className="text-xs text-slate-600 mt-1">Gunakan formulir tambah di bawah untuk memasukkan komponen baru.</p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const subtotal = item.quantity * item.unitPrice;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors group">
                    {/* Item Name */}
                    <td className="py-2.5 px-3 sm:px-4">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                        className="w-full bg-transparent hover:bg-slate-900/80 focus:bg-slate-900 border border-transparent hover:border-slate-700 focus:border-sky-500 rounded px-2 py-1 text-slate-100 font-medium transition-colors"
                      />
                    </td>

                    {/* Category Type */}
                    <td className="py-2.5 px-2 sm:px-3 whitespace-nowrap">
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleUpdateItem(item.id, {
                            type: e.target.value as CostItemType,
                            isFixedCost: e.target.value === 'overhead',
                          })
                        }
                        className={`text-[11px] font-bold px-2 py-1 rounded-md border cursor-pointer outline-none ${
                          item.type === 'material'
                            ? 'bg-blue-950/60 text-blue-400 border-blue-800/60'
                            : item.type === 'labor'
                            ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                            : 'bg-purple-950/60 text-purple-400 border-purple-800/60'
                        }`}
                      >
                        <option value="material">Bahan Langsung</option>
                        <option value="labor">Tenaga Kerja</option>
                        <option value="overhead">Overhead</option>
                      </select>
                    </td>

                    {/* BEP Nature (Fixed vs Variable) */}
                    <td className="py-2.5 px-2 sm:px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleUpdateItem(item.id, { isFixedCost: !item.isFixedCost })}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          item.isFixedCost
                            ? 'bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-sky-950 text-sky-400 border-sky-800/60'
                        }`}
                        title={
                          item.isFixedCost
                            ? 'Biaya Tetap (tidak berubah walau volume produksi naik)'
                            : 'Biaya Variabel (bertambah seiring bertambahnya volume)'
                        }
                      >
                        {item.isFixedCost ? 'Tetap' : 'Variabel'}
                      </button>
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 px-2 sm:px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                        }
                        className="w-20 bg-transparent hover:bg-slate-900/80 focus:bg-slate-900 border border-transparent hover:border-slate-700 focus:border-sky-500 rounded px-2 py-1 text-right text-slate-200 font-mono transition-colors"
                      />
                    </td>

                    {/* Unit */}
                    <td className="py-2.5 px-2 sm:px-3">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                        className="w-16 bg-transparent hover:bg-slate-900/80 focus:bg-slate-900 border border-transparent hover:border-slate-700 focus:border-sky-500 rounded px-1.5 py-1 text-slate-300 transition-colors"
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="py-2.5 px-2 sm:px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-28 bg-transparent hover:bg-slate-900/80 focus:bg-slate-900 border border-transparent hover:border-slate-700 focus:border-sky-500 rounded px-2 py-1 text-right text-slate-200 font-mono transition-colors"
                      />
                    </td>

                    {/* Subtotal */}
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono font-semibold text-slate-100 whitespace-nowrap">
                      {formatIDR(subtotal)}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {item.type === 'material' && (
                          <button
                            type="button"
                            onClick={() => onOpenVendorComparison(item)}
                            className="p-1 rounded text-slate-400 hover:text-sky-400 hover:bg-sky-950/40 transition-colors cursor-pointer"
                            title="Bandingkan Penawaran Vendor untuk Bahan Ini"
                          >
                            <Store className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDuplicateItem(item)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Duplikat Komponen"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Hapus Komponen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Add Form Row */}
      <form
        onSubmit={handleAddItem}
        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-2.5"
      >
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1 shrink-0">
          <Plus className="w-3.5 h-3.5 text-sky-400" />
          <span>Tambah Komponen:</span>
        </span>

        {/* Input Name */}
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nama komponen (contoh: Daging Sapi)"
          className="flex-1 min-w-[160px] bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500"
          required
        />

        {/* Select Type */}
        <select
          value={newType}
          onChange={(e) => {
            const val = e.target.value as CostItemType;
            setNewType(val);
            if (val === 'overhead') setNewIsFixed(true);
          }}
          className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:ring-1 focus:ring-sky-500 cursor-pointer"
        >
          <option value="material">Bahan Langsung</option>
          <option value="labor">Tenaga Kerja</option>
          <option value="overhead">Overhead Operasional</option>
        </select>

        {/* Input Qty */}
        <input
          type="number"
          min="0.001"
          step="any"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
          placeholder="Qty"
          className="w-16 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-white text-right font-mono"
          required
        />

        {/* Input Unit */}
        <input
          type="text"
          list="common-units"
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          placeholder="Satuan"
          className="w-20 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs text-slate-200"
        />
        <datalist id="common-units">
          {COMMON_UNITS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>

        {/* Input Unit Price */}
        <div className="relative w-28">
          <input
            type="number"
            min="0"
            step="any"
            value={newUnitPrice}
            onChange={(e) => setNewUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="Harga (Rp)"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white text-right font-mono"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all cursor-pointer shrink-0"
        >
          + Tambah Baris
        </button>
      </form>

      {/* Contingency / Biaya Tak Terduga Slider & Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-slate-800">
        {/* Contingency Controller */}
        <div className="md:col-span-5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              <span>Biaya Tak Terduga (Kontingensi)</span>
            </label>
            <span className="text-xs font-mono font-bold text-rose-400">
              {contingencyPercent}% ({formatIDR(result.contingencyAmount)})
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="25"
            step="1"
            value={contingencyPercent}
            onChange={(e) => onUpdateContingency(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <p className="text-[10px] text-slate-500">
            Cadangan risiko untuk kerusakan bahan, lembur tak terjadwal, atau kenaikan harga mendadak.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-7 flex items-center justify-end flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpenVendorComparison()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-sky-300 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/50 transition-colors cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-sky-400" />
            <span>Bandingkan Vendor Bahan</span>
          </button>

          <button
            type="button"
            onClick={onSaveAsCustomPreset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors cursor-pointer"
            title="Simpan komponen ini sebagai preset untuk proyek berikutnya"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>Simpan Jadi Preset Favorit</span>
          </button>
        </div>
      </div>

      {/* 5-Column Subtotal Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-blue-400 block">1. Bahan Langsung</span>
          <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">
            {formatIDR(result.totalMaterial)}
          </span>
        </div>

        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">2. Tenaga Kerja</span>
          <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">
            {formatIDR(result.totalLabor)}
          </span>
        </div>

        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-purple-400 block">3. Overhead</span>
          <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">
            {formatIDR(result.totalOverhead)}
          </span>
        </div>

        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-rose-400 block">4. Kontingensi</span>
          <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">
            {formatIDR(result.contingencyAmount)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-blue-950/80 to-slate-900 p-2.5 rounded-xl border border-blue-800/80 shadow-md">
          <span className="text-[10px] uppercase font-extrabold text-sky-400 block">TOTAL BIAYA / RAB</span>
          <span className="text-xs sm:text-sm font-mono font-extrabold text-white">
            {formatIDR(result.totalCost)}
          </span>
        </div>
      </div>
    </section>
  );
};
