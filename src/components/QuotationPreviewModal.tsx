import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  Check, 
  FileText, 
  Building, 
  Calendar, 
  CreditCard 
} from 'lucide-react';
import { ProjectData, CalculationResult, formatIDR, formatPercent } from '../utils/calculations';
import { exportToCSV, generateClipboardSummary } from '../utils/exportHelpers';

interface QuotationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  result: CalculationResult;
  language: 'id' | 'en';
}

export const QuotationPreviewModal: React.FC<QuotationPreviewModalProps> = ({
  isOpen,
  onClose,
  project,
  result,
  language,
}) => {
  const [docNumber, setDocNumber] = useState('QUO/HPP/' + new Date().getFullYear() + '/' + Math.floor(1000 + Math.random() * 9000));
  const [senderName, setSenderName] = useState('CV. Mandiri Karya Solusindo');
  const [senderContact, setSenderContact] = useState('0812-3456-7890 | info@mandirikarya.id');
  const [paymentTerms, setPaymentTerms] = useState('DP 50% saat persetujuan penawaran, Pelunasan 50% setelah pekerjaan/barang selesai dikirim.');
  const [bankInfo, setBankInfo] = useState('BCA 123-456-7890 a.n. Mandiri Karya');
  const [validDays, setValidDays] = useState(14);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text = generateClipboardSummary(project, result);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dueDate = new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 no-print">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Draft Surat Penawaran Harga (Quotation & RAB)
              </h3>
              <p className="text-[11px] text-slate-400">
                Format resmi siap cetak, simpan ke PDF, atau salin ringkasan ke klien.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={() => exportToCSV(project, result)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin WA'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-slate-900 text-slate-100 print-container">
          {/* Printable Container Card */}
          <div className="max-w-3xl mx-auto bg-slate-950 p-6 sm:p-8 rounded-xl border border-slate-800 shadow-md space-y-6 text-xs sm:text-sm font-sans">
            {/* Header Document */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-slate-800">
              <div>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="bg-transparent font-extrabold text-lg text-white border-b border-transparent hover:border-slate-700 focus:border-sky-500 w-full"
                />
                <input
                  type="text"
                  value={senderContact}
                  onChange={(e) => setSenderContact(e.target.value)}
                  className="bg-transparent text-xs text-slate-400 border-b border-transparent hover:border-slate-700 focus:border-sky-500 w-full mt-0.5"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Kategori Usaha: {project.category.toUpperCase()}
                </p>
              </div>

              <div className="text-right sm:self-start">
                <span className="text-xl font-black text-sky-400 tracking-wider block">
                  SURAT PENAWARAN HARGA
                </span>
                <span className="text-xs text-slate-400 font-mono block mt-1">
                  No: {docNumber}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Tanggal: {currentDate}
                </span>
              </div>
            </div>

            {/* Recipient & Project Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Ditujukan Kepada:</span>
                <span className="font-bold text-white text-sm block mt-0.5">
                  {project.clientName || 'Pelanggan / Rekanan Terhormat'}
                </span>
                <span className="text-xs text-slate-400 block">Klien Resmi</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Proyek / Pemesanan:</span>
                <span className="font-bold text-sky-300 text-sm block mt-0.5">
                  {project.name}
                </span>
                <span className="text-xs text-slate-400 block">
                  Volume: {project.productionVolume} {project.volumeUnit} | Masa Berlaku: s.d. {dueDate}
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Deskripsi Komponen</th>
                    <th className="py-2.5 px-3 text-right">Kuantitas</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan (IDR)</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {project.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-900/30">
                      <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-200">
                        {item.name}
                        <span className="text-[10px] text-slate-400 ml-1.5 uppercase">
                          ({item.type === 'material' ? 'Bahan' : item.type === 'labor' ? 'Jasa' : 'Overhead'})
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-300">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-300">
                        {formatIDR(item.unitPrice)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-white">
                        {formatIDR(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Total Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-800">
              <div className="space-y-2 text-xs sm:max-w-xs">
                <span className="font-bold text-slate-300 block">Syarat & Ketentuan:</span>
                <textarea
                  rows={3}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300"
                />
                <input
                  type="text"
                  value={bankInfo}
                  onChange={(e) => setBankInfo(e.target.value)}
                  placeholder="Rekening Pembayaran"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[11px] text-slate-300 font-mono"
                />
              </div>

              <div className="w-full sm:w-72 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Biaya Pokok:</span>
                  <span>{formatIDR(result.baseCost)}</span>
                </div>
                {result.contingencyAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Kontingensi ({project.contingencyPercent}%):</span>
                    <span>{formatIDR(result.contingencyAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300 font-bold pt-1 border-t border-slate-800">
                  <span>Harga Penawaran:</span>
                  <span className="text-emerald-400">{formatIDR(result.suggestedPriceNet * project.productionVolume)}</span>
                </div>
                {result.discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Diskon ({project.discountPercent}%):</span>
                    <span>-{formatIDR(result.discountAmount * project.productionVolume)}</span>
                  </div>
                )}
                {project.includeTax && (
                  <div className="flex justify-between text-slate-400">
                    <span>PPN ({project.taxRatePercent}%):</span>
                    <span>{formatIDR(result.taxAmount * project.productionVolume)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-white pt-2 border-t border-slate-700">
                  <span>TOTAL AKHIR:</span>
                  <span className="text-sky-400">
                    {formatIDR((project.includeTax ? result.finalPriceWithTax : result.suggestedPriceNet) * project.productionVolume)}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  Harga Satuan:{' '}
                  <strong>
                    {formatIDR(project.includeTax ? result.finalPriceWithTax : result.suggestedPriceNet)} / {project.volumeUnit}
                  </strong>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div className="space-y-12">
                <span className="text-slate-400 block">Diterima & Disetujui Oleh,</span>
                <div>
                  <div className="w-36 h-0.5 bg-slate-700 mx-auto" />
                  <span className="font-bold text-white mt-1 block">
                    {project.clientName || '(Tanda Tangan Klien)'}
                  </span>
                </div>
              </div>

              <div className="space-y-12">
                <span className="text-slate-400 block">Hormat Kami,</span>
                <div>
                  <div className="w-36 h-0.5 bg-slate-700 mx-auto" />
                  <span className="font-bold text-white mt-1 block">
                    {senderName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
