import { BusinessCategory, CostItemType } from './calculations';

export interface LocalParsedResult {
  projectName: string;
  category: BusinessCategory;
  productionVolume: number;
  volumeUnit: string;
  targetMargin: number;
  items: Array<{
    name: string;
    type: CostItemType;
    quantity: number;
    unit: string;
    unitPrice: number;
  }>;
  aiSummary: string;
}

/**
 * Parses numeric price with IDR notations like "15rb", "15.000", "35k", "1.5jt", "Rp 15.000", "@16rb"
 */
export function parseIndonesianPrice(priceStr: string): number {
  if (!priceStr) return 0;
  let clean = priceStr.toLowerCase().replace(/[@\s]/g, '');
  if (clean.startsWith('rp')) clean = clean.substring(2);

  let multiplier = 1;
  if (clean.includes('jt') || clean.includes('juta')) {
    clean = clean.replace(/jt|juta/g, '');
    multiplier = 1000000;
  } else if (clean.includes('rb') || clean.includes('ribu') || clean.includes('k')) {
    clean = clean.replace(/rb|ribu|k/g, '');
    multiplier = 1000;
  }

  // Remove dots and convert comma to dot
  clean = clean.replace(/\./g, '').replace(',', '.');
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : Math.round(val * multiplier);
}

/**
 * Intelligent local Indonesian parser for business costs.
 * Acts as an instant fallback when cloud AI experiences temporary 503 high demand or network outages.
 */
export function parseCostTextLocally(
  text: string,
  categoryHint?: BusinessCategory
): LocalParsedResult {
  const normalized = text.toLowerCase();

  // 1. Detect Category
  let category: BusinessCategory = categoryHint || 'kuliner';
  if (!categoryHint) {
    if (normalized.match(/katering|nasi|ayam|kue|roti|makan|minum|kopi|cafe|warung|kuliner|restoran|daging|telur/)) {
      category = 'kuliner';
    } else if (normalized.match(/website|desain|aplikasi|seo|jasa|konsultan|fotografi|video|freelance|coding|ui\/ux/)) {
      category = 'jasa';
    } else if (normalized.match(/cat|tembok|renovasi|bangun|rumah|semen|pasir|plamir|tukang|batu|rab|genteng|baja/)) {
      category = 'konstruksi';
    } else if (normalized.match(/kaos|konveksi|sablon|kain|jahit|distro|produksi|pabrik|manufaktur|cetak/)) {
      category = 'manufaktur';
    } else if (normalized.match(/retail|toko|hampers|grosir|jual|reseller|paket|stok/)) {
      category = 'retail';
    }
  }

  // 2. Detect Volume & Unit
  let productionVolume = 100;
  let volumeUnit = category === 'kuliner' ? 'porsi' : category === 'konstruksi' ? 'm²' : category === 'jasa' ? 'proyek' : 'pcs';

  const volMatch = normalized.match(/(\d+[\d.,]*)\s*(porsi|pcs|paket|m2|m²|unit|ekor|box|rim|proyek|lembar|orang)/i);
  if (volMatch) {
    const rawVal = parseFloat(volMatch[1].replace(/\./g, '').replace(',', '.'));
    if (!isNaN(rawVal) && rawVal > 0) {
      productionVolume = rawVal;
      volumeUnit = volMatch[2].toLowerCase();
      if (volumeUnit === 'm2') volumeUnit = 'm²';
    }
  }

  // 3. Detect Target Margin / Markup
  let targetMargin = 30;
  const marginMatch = normalized.match(/(?:margin|markup|laba|keuntungan|profit)\s*(?:target)?\s*(?:sebesar)?\s*(\d+)%/i);
  if (marginMatch) {
    const m = parseInt(marginMatch[1], 10);
    if (!isNaN(m) && m > 0 && m <= 95) {
      targetMargin = m;
    }
  }

  // 4. Project Name
  let projectName = 'Kalkulasi Usaha Mandiri';
  if (normalized.includes('katering') || normalized.includes('nasi kotak')) {
    projectName = `Katering Nasi Kotak (${productionVolume} ${volumeUnit})`;
  } else if (normalized.includes('kaos') || normalized.includes('sablon')) {
    projectName = `Produksi Kaos Sablon (${productionVolume} ${volumeUnit})`;
  } else if (normalized.includes('renovasi') || normalized.includes('cat')) {
    projectName = `Pekerjaan Renovasi & Pengecatan (${productionVolume} ${volumeUnit})`;
  } else if (normalized.includes('website')) {
    projectName = `Proyek Pembuatan Website & SEO`;
  } else if (normalized.includes('hampers')) {
    projectName = `Paket Hampers Lebaran (${productionVolume} ${volumeUnit})`;
  } else {
    const words = text.trim().split(/\s+/).slice(0, 5).join(' ');
    if (words) projectName = words.charAt(0).toUpperCase() + words.slice(1);
  }

  // 5. Split clauses by punctuation and conjunctions
  const items: Array<{
    name: string;
    type: CostItemType;
    quantity: number;
    unit: string;
    unitPrice: number;
  }> = [];

  const chunks = text
    .replace(/^(saya mau buat|saya mau buka|saya mau produksi|proyek|butuh)/i, '')
    .split(/[,;\n\+]|\bdan\b|\bbutuh\b|\bserta\b/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 2);

  for (const chunk of chunks) {
    // Skip clauses that only describe volume or margin
    if (chunk.match(/^(mau|target|dengan)?\s*(margin|markup|profit|laba)/i)) continue;
    if (chunk.match(/^(untuk|selama|sebanyak)?\s*\d+\s*(porsi|pcs|paket|m2|unit)$/i)) continue;

    // Pattern 1: "[item name] [quantity] [unit] @ [price]"
    // e.g. "beras ramos 12kg @16rb" or "ayam potong 10 ekor @36rb" or "kotak bento sekat 100 set @2200"
    const m1 = chunk.match(
      /(.+?)\s+(\d+[\d.,]*)\s*(kg|gram|gr|ons|liter|l|ekor|pcs|set|potong|galon|sak|lembar|hari|jam|orang|bulan|box|paket|trip|modul|lisensi|rol)\s*(?:@|at|harga)?\s*(?:rp\.?\s*)?(\d+[\d.,]*(?:rb|ribu|k|jt|juta)?)/i
    );

    // Pattern 2: "[item name] @ [price]" with default 1 unit
    // e.g. "bumbu marinasi 125rb" or "gas dan minyak 85rb"
    const m2 = chunk.match(
      /(.+?)\s*(?:@|harga)?\s*(?:rp\.?\s*)?(\d+[\d.,]*(?:rb|ribu|k|jt|juta))\b/i
    );

    let itemName = '';
    let qty = 1;
    let unit = 'pcs';
    let unitPrice = 0;
    let type: CostItemType = 'material';

    if (m1) {
      itemName = m1[1].trim();
      qty = parseFloat(m1[2].replace(/\./g, '').replace(',', '.')) || 1;
      unit = m1[3].toLowerCase();
      unitPrice = parseIndonesianPrice(m1[4]);
    } else if (m2) {
      itemName = m2[1].trim();
      qty = 1;
      unit = 'paket';
      unitPrice = parseIndonesianPrice(m2[2]);
    }

    if (itemName && unitPrice > 0) {
      const lowerName = itemName.toLowerCase();

      // Classify type
      if (lowerName.match(/upah|gaji|koki|tukang|kenek|asisten|jahit|sablon|coding|desain|dev|seo|copywriting|tenaga|honor|qa/)) {
        type = 'labor';
      } else if (lowerName.match(/gas|listrik|bensin|transport|sewa|overhead|internet|packing|packaging|kardus|kantong|antar|delivery|kebersihan|alat|scaffolding|tangga/)) {
        type = 'overhead';
      } else {
        type = 'material';
      }

      const cleanName = itemName.replace(/^[-•*@\s]+/, '').trim();
      items.push({
        name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        type,
        quantity: qty,
        unit,
        unitPrice,
      });
    }
  }

  // Fallback defaults if nothing parsed
  if (items.length === 0) {
    items.push({
      name: 'Bahan Pokok Utama',
      type: 'material',
      quantity: productionVolume,
      unit: volumeUnit,
      unitPrice: 15000,
    });
    items.push({
      name: 'Upah Tenaga Kerja',
      type: 'labor',
      quantity: 1,
      unit: 'hari',
      unitPrice: 150000,
    });
    items.push({
      name: 'Overhead & Operasional',
      type: 'overhead',
      quantity: 1,
      unit: 'paket',
      unitPrice: 75000,
    });
  }

  return {
    projectName,
    category,
    productionVolume,
    volumeUnit,
    targetMargin,
    items,
    aiSummary: `Data berhasil diekstrak (${items.length} komponen: ${items.filter((i) => i.type === 'material').length} Bahan, ${items.filter((i) => i.type === 'labor').length} Upah, ${items.filter((i) => i.type === 'overhead').length} Overhead).`,
  };
}
