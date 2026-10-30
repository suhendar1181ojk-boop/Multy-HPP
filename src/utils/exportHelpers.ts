import { CalculationResult, CostItem, ProjectData, formatIDR, formatPercent } from './calculations';

/**
 * Generates CSV content from project items and calculation results
 */
export function exportToCSV(project: ProjectData, result: CalculationResult): void {
  const headers = ['Kategori Komponen', 'Nama Komponen', 'Tipe Biaya (BEP)', 'Jumlah', 'Satuan', 'Harga Satuan (IDR)', 'Subtotal (IDR)'];
  
  const rows: string[][] = [];
  
  // Project info header
  rows.push(['Nama Proyek', `"${project.name}"`]);
  rows.push(['Kategori Usaha', `"${project.category.toUpperCase()}"`]);
  rows.push(['Target Volume', `"${project.productionVolume} ${project.volumeUnit}"`]);
  rows.push(['Tanggal', `"${new Date().toLocaleDateString('id-ID')}"`]);
  rows.push([]);
  rows.push(headers);

  // Items
  project.items.forEach((item) => {
    const subtotal = item.quantity * item.unitPrice;
    rows.push([
      item.type === 'material' ? 'Bahan Langsung' : item.type === 'labor' ? 'Tenaga Kerja' : 'Overhead',
      `"${item.name.replace(/"/g, '""')}"`,
      item.isFixedCost ? 'Biaya Tetap' : 'Biaya Variabel',
      item.quantity.toString(),
      item.unit,
      item.unitPrice.toString(),
      subtotal.toString(),
    ]);
  });

  // Summary rows
  rows.push([]);
  rows.push(['RINGKASAN BIAYA & HARGA']);
  rows.push(['Total Bahan Baku', '', '', '', '', '', result.totalMaterial.toString()]);
  rows.push(['Total Upah Tenaga Kerja', '', '', '', '', '', result.totalLabor.toString()]);
  rows.push(['Total Overhead', '', '', '', '', '', result.totalOverhead.toString()]);
  rows.push([`Kontingensi (${project.contingencyPercent}%)`, '', '', '', '', '', result.contingencyAmount.toString()]);
  rows.push(['TOTAL BIAYA PRODUKSI / RAB', '', '', '', '', '', result.totalCost.toString()]);
  rows.push(['HPP PER SATUAN', '', '', '', '', '', result.costPerUnit.toString()]);
  rows.push([`Target Margin / Markup (${project.targetMargin}%)`, '', '', '', '', '', result.suggestedPriceBeforeDiscount.toString()]);
  if (result.discountAmount > 0) {
    rows.push([`Diskon (${project.discountPercent}%)`, '', '', '', '', '', `-${result.discountAmount}`]);
  }
  rows.push(['HARGA JUAL NET', '', '', '', '', '', result.suggestedPriceNet.toString()]);
  if (project.includeTax) {
    rows.push([`PPN (${project.taxRatePercent}%)`, '', '', '', '', '', result.taxAmount.toString()]);
    rows.push(['HARGA JUAL AKHIR (INC. PPN)', '', '', '', '', '', result.finalPriceWithTax.toString()]);
  }
  rows.push(['LABA KOTOR PER SATUAN', '', '', '', '', '', result.profitPerUnit.toString()]);
  rows.push(['TOTAL LABA PROYEK', '', '', '', '', '', result.totalProfit.toString()]);
  rows.push([]);
  rows.push(['ANALISIS TITIK IMPAS (BEP)']);
  rows.push(['BEP Satuan (Unit)', '', '', '', '', '', `${result.bepUnits} ${project.volumeUnit}`]);
  rows.push(['BEP Omzet Rupiah', '', '', '', '', '', result.bepRevenue.toString()]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const safeFilename = (project.name || 'HPP_RAB_Kalkulasi').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `${safeFilename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format project summary into WhatsApp/Email ready clipboard text
 */
export function generateClipboardSummary(project: ProjectData, result: CalculationResult): string {
  const lines = [
    `📊 *RINGKASAN HPP & HARGA JUAL - ${project.name.toUpperCase()}*`,
    `🏢 Kategori: ${project.category.toUpperCase()} | Target: ${project.productionVolume} ${project.volumeUnit}`,
    `📅 Tanggal: ${new Date().toLocaleDateString('id-ID')}`,
    ``,
    `💰 *RINCIAN BIAYA PRODUKSI:*`,
    `• Bahan Baku Langsung: ${formatIDR(result.totalMaterial)}`,
    `• Upah Tenaga Kerja: ${formatIDR(result.totalLabor)}`,
    `• Overhead Operasional: ${formatIDR(result.totalOverhead)}`,
    `• Biaya Tak Terduga (${project.contingencyPercent}%): ${formatIDR(result.contingencyAmount)}`,
    `👉 *Total Biaya Proyek / RAB: ${formatIDR(result.totalCost)}*`,
    `👉 *HPP Pokok per ${project.volumeUnit}: ${formatIDR(result.costPerUnit)}*`,
    ``,
    `📈 *STRATEGI HARGA & MARGIN:*`,
    `• Metode: ${project.pricingMethod === 'margin' ? 'Margin Penjualan' : 'Markup Biaya'} (${project.targetMargin}%)`,
    `• Harga Jual Rekomendasi: ${formatIDR(result.suggestedPriceNet)} / ${project.volumeUnit}`,
    ...(project.includeTax ? [`• Harga Termasuk PPN (11%): ${formatIDR(result.finalPriceWithTax)}`] : []),
    `• Potensi Laba per ${project.volumeUnit}: ${formatIDR(result.profitPerUnit)} (${formatPercent(result.effectiveMarginPercent)})`,
    `• Proyeksi Total Laba: ${formatIDR(result.totalProfit)}`,
    ``,
    `🎯 *ANALISIS TITIK IMPAS (BEP):*`,
    `• Minimal Terjual: ${result.bepUnits} ${project.volumeUnit}`,
    `• Target Omzet BEP: ${formatIDR(result.bepRevenue)}`,
    ``,
    `Dihitung otomatis melalui *HPP-Pro Master* 🚀`,
  ];

  return lines.join('\n');
}
