import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Plus, 
  Trash2, 
  CheckCircle, 
  TrendingDown, 
  Clock, 
  Star, 
  Package, 
  Truck,
  Sparkles
} from 'lucide-react';
import { CostItem, VendorOption, evaluateVendors, formatIDR, formatPercent } from '../utils/calculations';

interface VendorComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CostItem[];
  selectedItemId?: string;
  onApplyVendorPrice: (itemId: string, newUnitPrice: number) => void;
  language: 'id' | 'en';
}

const DEFAULT_VENDORS_SAMPLE: VendorOption[] = [
  {
    id: 'v1',
    vendorName: 'Distributor Pusat Glodok',
    unitPrice: 0,
    shippingCost: 35000,
    minOrderQuantity: 10,
    deliveryDays: 1,
    rating: 4.8,
    notes: 'Stok ready, garansi resmi toko',
  },
  {
    id: 'v2',
    vendorName: 'Grosir Mitra Online',
    unitPrice: 0,
    shippingCost: 15000,
    minOrderQuantity: 1,
    deliveryDays: 3,
    rating: 4.5,
    notes: 'Free ongkir jika belanja > 500rb',
  },
  {
    id: 'v3',
    vendorName: 'Pabrik Langsung (Bulk)',
    unitPrice: 0,
    shippingCost: 75000,
    minOrderQuantity: 50,
    deliveryDays: 5,
    rating: 4.9,
    notes: 'Harga pabrik termurah untuk volume besar',
  },
];

export const VendorComparisonModal: React.FC<VendorComparisonModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedItemId,
  onApplyVendorPrice,
  language,
}) => {
  const materialItems = items.filter((i) => i.type === 'material');
  const [activeItemId, setActiveItemId] = useState<string>(
    selectedItemId || (materialItems[0]?.id ?? '')
  );

  const currentItem = items.find((i) => i.id === activeItemId) || materialItems[0];

  const [vendors, setVendors] = useState<VendorOption[]>(() => {
    const basePrice = currentItem ? currentItem.unitPrice : 10000;
    return [
      {
        id: 'v1',
        vendorName: 'Supplier A (Distributor Utama)',
        unitPrice: Math.round(basePrice * 0.93),
        shippingCost: 25000,
        minOrderQuantity: Math.max(1, Math.round((currentItem?.quantity || 10) * 0.5)),
        deliveryDays: 1,
        rating: 4.8,
        notes: 'Pengiriman sameday, mutu terjamin',
      },
      {
        id: 'v2',
        vendorName: 'Supplier B (Grosir Online)',
        unitPrice: Math.round(basePrice * 0.88),
        shippingCost: 50000,
        minOrderQuantity: currentItem?.quantity || 10,
        deliveryDays: 3,
        rating: 4.4,
        notes: 'Harga unit murah, minimal order tinggi',
      },
      {
        id: 'v3',
        vendorName: 'Supplier C (Toko Retail Lokal)',
        unitPrice: basePrice,
        shippingCost: 0,
        minOrderQuantity: 1,
        deliveryDays: 1,
        rating: 4.6,
        notes: 'Bisa ambil sendiri ke toko',
      },
    ];
  });

  if (!isOpen) return null;

  const comparison = currentItem
    ? evaluateVendors({
        itemId: currentItem.id,
        itemName: currentItem.name,
        requiredQuantity: currentItem.quantity,
        unit: currentItem.unit,
        baselineUnitPrice: currentItem.unitPrice,
        vendors,
      })
    : null;

  const handleUpdateVendor = (id: string, updates: Partial<VendorOption>) => {
    setVendors(vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const handleAddVendor = () => {
    const newV: VendorOption = {
      id: 'v_' + Date.now(),
      vendorName: `Vendor Baru ${vendors.length + 1}`,
      unitPrice: currentItem ? currentItem.unitPrice : 10000,
      shippingCost: 20000,
      minOrderQuantity: 1,
      deliveryDays: 2,
      rating: 4.5,
    };
    setVendors([...vendors, newV]);
  };

  const handleDeleteVendor = (id: string) => {
    setVendors(vendors.filter((v) => v.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {language === 'id' ? 'Komparasi Vendor & Pemasok Bahan' : 'Vendor & Supplier Price Comparison'}
              </h3>
              <p className="text-xs text-slate-400">
                Bandingkan total pengeluaran (harga unit + ongkir + lead time) antar vendor.
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

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Item Selector */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Pilih Bahan yang Ingin Dibandingkan:
              </label>
              <select
                value={activeItemId}
                onChange={(e) => setActiveItemId(e.target.value)}
                className="w-full sm:w-72 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                {materialItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.quantity} {item.unit} @ {formatIDR(item.unitPrice)})
                  </option>
                ))}
              </select>
            </div>

            {currentItem && (
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Kebutuhan Proyek:</span>
                <span className="text-sm font-bold text-white font-mono">
                  {currentItem.quantity} {currentItem.unit}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Biaya Eksisting: {formatIDR(currentItem.quantity * currentItem.unitPrice)}
                </span>
              </div>
            )}
          </div>

          {/* Vendor Cards Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparison?.vendors.map((vendor, idx) => {
              const isBest = vendor.isBestDeal;
              return (
                <div
                  key={vendor.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between relative transition-all ${
                    isBest
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  {isBest && (
                    <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Pilihan Terbaik
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Vendor Name & Rating */}
                    <div className="flex items-start justify-between gap-2">
                      <input
                        type="text"
                        value={vendor.vendorName}
                        onChange={(e) => handleUpdateVendor(vendor.id, { vendorName: e.target.value })}
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-sky-500 text-xs font-bold text-white w-full py-0.5"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Hapus Vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Pricing Inputs */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Harga Satuan (IDR)</label>
                        <input
                          type="number"
                          value={vendor.unitPrice}
                          onChange={(e) =>
                            handleUpdateVendor(vendor.id, {
                              unitPrice: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1 text-xs text-white font-mono text-right"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Ongkir (IDR)</label>
                          <input
                            type="number"
                            value={vendor.shippingCost}
                            onChange={(e) =>
                              handleUpdateVendor(vendor.id, {
                                shippingCost: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-xs text-white font-mono text-right"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 block">Waktu Kirim</label>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={vendor.deliveryDays}
                              onChange={(e) =>
                                handleUpdateVendor(vendor.id, {
                                  deliveryDays: parseInt(e.target.value, 10) || 1,
                                })
                              }
                              className="w-full bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-xs text-white text-right font-mono"
                            />
                            <span className="text-[10px] text-slate-400">hari</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calculated Grand Total for Project */}
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total Belanja:</span>
                        <span className="font-mono font-bold text-white">
                          {formatIDR(vendor.grandTotal)}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Selisih Biaya:</span>
                        <span
                          className={`font-mono font-bold ${
                            vendor.difference < 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {vendor.difference < 0
                            ? `Hemat ${formatIDR(Math.abs(vendor.difference))} (${formatPercent(vendor.savingsPercent)})`
                            : `Lebih Mahal +${formatIDR(vendor.difference)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Apply Price Button */}
                  <div className="mt-4 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentItem) {
                          onApplyVendorPrice(currentItem.id, vendor.unitPrice);
                          onClose();
                        }
                      }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isBest
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-700/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Terapkan Harga Ini</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Vendor Button */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddVendor}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-sky-950/40 border border-sky-800/50 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Opsi Vendor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
