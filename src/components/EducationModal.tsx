import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  Scale, 
  Target, 
  Lightbulb, 
  DollarSign,
  TrendingUp,
  Percent
} from 'lucide-react';

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
}

export const EducationModal: React.FC<EducationModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'hpp' | 'markup' | 'bep' | 'overhead'>('hpp');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {language === 'id' ? 'Panduan Analisis Biaya & Rumus Keuangan' : 'Financial & Cost Analysis Guide'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Memahami konsep dasar HPP, RAB, Margin vs Markup, dan Analisis Titik Impas (BEP).
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

        {/* Tab Pills */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('hpp')}
            className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'hpp'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Rumus HPP & RAB
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('markup')}
            className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'markup'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Beda Margin vs Markup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bep')}
            className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'bep'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Titik Impas (BEP)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('overhead')}
            className={`px-3 py-2 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overhead'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Mengendalikan Overhead
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {activeTab === 'hpp' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-sky-400" />
                  <span>Apa itu HPP (Harga Pokok Penjualan)?</span>
                </h4>
                <p>
                  HPP adalah total seluruh pengeluaran langsung dan tidak langsung yang dikeluarkan bisnis untuk memproduksi suatu barang atau menyelesaikan sebuah proyek sampai siap diserahkan ke pelanggan.
                </p>
                <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-sky-300 border border-slate-800">
                  Total Biaya (RAB) = Biaya Bahan Baku + Upah Tenaga Kerja + Biaya Overhead + Kontingensi
                  <br />
                  HPP Pokok per Satuan = Total Biaya / Target Volume Produksi
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white">4 Komponen Utama HPP:</h5>
                <ul className="space-y-2 pl-4 list-disc text-slate-400">
                  <li>
                    <strong className="text-slate-200">1. Biaya Bahan Baku Langsung:</strong> Bahan utama yang melekat pada produk (misal: beras & ayam pada katering; kain katun pada konveksi; cat & semen pada konstruksi).
                  </li>
                  <li>
                    <strong className="text-slate-200">2. Biaya Tenaga Kerja Langsung:</strong> Upah pekerja yang terlibat langsung dalam pembuatan (koki, penjahit, tukang cat, developer web).
                  </li>
                  <li>
                    <strong className="text-slate-200">3. Biaya Overhead Operasional:</strong> Pengeluaran pendukung seperti sewa tempat, listrik mesin, gas elpiji, packaging, dan transportasi.
                  </li>
                  <li>
                    <strong className="text-slate-200">4. Biaya Kontingensi (5%-10%):</strong> Dana cadangan wajib untuk mengantisipasi scrap/potongan bahan terbuang, kenaikan harga tak terduga, atau lembur tambahan.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'markup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>Perbedaan Fundamental: Markup vs Margin</span>
                </h4>
                <p>
                  Banyak pemilik usaha keliru menganggap Margin 30% sama dengan Markup 30%. Padahal, dasar pembaginya sangat berbeda!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/60 space-y-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                    Markup on Cost (Kenaikan dari Modal)
                  </span>
                  <p className="text-xs text-slate-300">
                    Berapa persen Anda menaikkan harga di atas modal pokok.
                  </p>
                  <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-blue-300">
                    Harga = Modal × (1 + Markup%)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Contoh: Modal Rp 100.000 dengan Markup 50% ➔ Harga Jual = <strong>Rp 150.000</strong> (Laba Rp 50.000).
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    Cocok untuk: Kontraktor, Agensi Jasa, Manufaktur custom.
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Margin on Price (Laba dari Harga Jual)
                  </span>
                  <p className="text-xs text-slate-300">
                    Berapa persen keuntungan yang tersisa dari setiap rupiah harga jual.
                  </p>
                  <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-emerald-300">
                    Harga = Modal / (1 - Margin%)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Contoh: Modal Rp 100.000 dengan Margin 50% ➔ Harga Jual = <strong>Rp 200.000</strong> (Laba Rp 100.000).
                  </p>
                  <span className="text-[10px] text-slate-500 block">
                    Cocok untuk: Retail, Kuliner & Cafe, Toko Online.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-xs">
                ⚠️ <strong>Peringatan Diskon:</strong> Jika Anda menggunakan Markup 30% lalu memberi diskon promo 25% ke pelanggan, Anda hampir dipastikan akan merugi karena laba kotor Anda tergerus habis.
              </div>
            </div>
          )}

          {activeTab === 'bep' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-sky-400" />
                  <span>Break-Even Point (Titik Impas)</span>
                </h4>
                <p>
                  BEP adalah kondisi di mana total pendapatan bisnis Anda persis sama dengan total biaya yang dikeluarkan (Laba = Rp 0). Penjualan di atas titik BEP adalah zona profit bersih.
                </p>
                <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-sky-300 border border-slate-800 space-y-1">
                  <div>Margin Kontribusi per Unit = Harga Jual - Biaya Variabel per Unit</div>
                  <div>BEP (Satuan) = Total Biaya Tetap / Margin Kontribusi per Unit</div>
                  <div>BEP (Omzet) = BEP Satuan × Harga Jual</div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white">Klasifikasi Biaya untuk BEP:</h5>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-sky-300 block mb-1">Biaya Variabel:</strong>
                    Berubah mengikuti jumlah produksi. Contoh: beras, daging, packaging per porsi, upah borongan per potong baju.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-purple-300 block mb-1">Biaya Tetap (Fixed Cost):</strong>
                    Harus dibayar berapapun barang yang terjual. Contoh: sewa ruko bulanan, gaji staf tetap, biaya hosting, depresiasi alat.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overhead' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Tips Praktis Mengendalikan Biaya Overhead UMKM</span>
              </h4>
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-white block">1. Masukkan Biaya Penyusutan Alat (Depresiasi)</strong>
                  <span className="text-slate-400 text-xs">
                    Wajan besar, mesin sablon, laptop desainer, dan mobil operasional akan aus. Alokasikan biaya penyusutan bulanan ke overhead agar Anda punya dana untuk mengganti alat saat rusak.
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-white block">2. Jangan Lupakan Biaya Kemasan & Transportasi</strong>
                  <span className="text-slate-400 text-xs">
                    Plastik pembungkus, bubble wrap, lakban, dan bensin sering dianggap sepele tapi jika diakumulasi dalam sebulan bisa memakan 8%-12% dari total omzet bisnis.
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <strong className="text-white block">3. Evaluasi Vendor Secara Berkala</strong>
                  <span className="text-slate-400 text-xs">
                    Gunakan fitur <em>Komparasi Vendor</em> di HPP-Pro Master untuk membandingkan harga beli bahan baku utama minimal setiap 3 bulan sekali.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
