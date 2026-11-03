import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCostTextLocally } from './src/utils/localParser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client Utility with Telemetry Header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Candidate models in priority order for resilience
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout: Model took too long to respond')), timeoutMs)
    ),
  ]);
};

/**
 * Execute Gemini generateContent with automatic multi-model fallback and exponential retry
 */
async function generateContentWithFallback(ai: GoogleGenAI, params: {
  contents: any;
  systemInstruction: string;
  responseMimeType?: string;
}) {
  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
          },
        }),
        8000 // 8 second timeout per model attempt
      );

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || '';
      console.warn(`[Gemini Failover] Model ${model} failed: ${errMsg}. Trying next model...`);
    }
  }

  throw lastError || new Error('Semua model AI sedang mengalami lonjakan beban.');
}

// 1. Natural Language Parser Endpoint
app.post('/api/parse-cost', async (req: Request, res: Response) => {
  const { promptText, categoryHint } = req.body;
  if (!promptText || typeof promptText !== 'string' || !promptText.trim()) {
    res.status(400).json({ error: 'Deskripsi teks tidak boleh kosong.' });
    return;
  }

  try {
    const ai = getGeminiClient();

    const systemPrompt = `Kamu adalah analis keuangan dan akuntan biaya profesional Indonesia.
Tugasmu adalah menganalisis deskripsi bebas pengguna tentang usaha, proyek, atau produksi mereka, lalu mengekstraknya menjadi data kalkulasi HPP/RAB terstruktur.

Format Output WAJIB JSON murni tanpa markdown triple backticks (atau JSON valid), dengan struktur:
{
  "projectName": "Nama Proyek / Produk (string singkat)",
  "category": "kuliner" | "jasa" | "konstruksi" | "manufaktur" | "retail",
  "productionVolume": number (misal jumlah porsi, unit produk, luas m2, default 1 jika tidak disebut),
  "volumeUnit": "porsi" | "unit" | "pcs" | "m2" | "proyek" | "paket",
  "targetMargin": number (persentase margin target, misal 30),
  "items": [
    {
      "name": "Nama item biaya",
      "type": "material" | "labor" | "overhead",
      "quantity": number,
      "unit": "kg" | "gram" | "liter" | "pcs" | "lembar" | "sak" | "jam" | "hari" | "orang" | "bulan" | "batch" | "m2" | "lot",
      "unitPrice": number (harga per unit dalam Rupiah tanpa titik/koma)
    }
  ],
  "aiSummary": "Catatan singkat 1-2 kalimat dari analis tentang profil biaya ini dan potensi risiko yang perlu diperhatikan."
}

Aturan klasifikasi:
- "material": Bahan baku langsung, material konstruksi, bahan cetak, stok barang dagang.
- "labor": Upah tukang, gaji tim masak, fee teknisi, honor desainer/freelancer.
- "overhead": Sewa tempat, listrik, gas, packaging, transportasi, depresiasi alat, langganan software, marketing.
Jika ada komponen penting yang biasanya wajib tapi belum disebut pengguna, cantumkan estimasi wajar di items dan beri catatan di aiSummary.
Semua unitPrice harus berupa angka murni (misal 35000, bukan Rp 35.000).`;

    const userPrompt = `Analisis deskripsi proyek berikut${categoryHint ? ` (Kategori yang dipilih: ${categoryHint})` : ''}:\n"${promptText}"`;

    const result = await generateContentWithFallback(ai, {
      contents: userPrompt,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    });

    const rawText = result.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Gagal memformat JSON dari hasil AI');
      }
    }

    res.json({ success: true, data: parsedData, model: result.modelUsed });
  } catch (error: any) {
    console.warn('Gemini API unavailable or busy, activating smart local parser fallback:', error?.message);

    // ZERO BLOCKING GUARANTEE: Fall back to intelligent local parser
    try {
      const localData = parseCostTextLocally(promptText, categoryHint);
      res.json({
        success: true,
        data: localData,
        source: 'local_resilience_engine',
        notice: 'Layanan AI cloud sedang mengalami antrean beban tinggi. Data berhasil diproses secara instan melalui mesin analisis cerdas lokal.',
      });
    } catch (fallbackError: any) {
      res.status(500).json({
        error: 'Terjadi kendala saat menganalisis biaya. Silakan coba kembali sesaat lagi.',
      });
    }
  }
});

// 2. Interactive AI Financial Advisor Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Format pesan tidak valid.' });
    return;
  }

  let contextString = '';
  if (context) {
    contextString = `
[DATA PROYEK AKTIF SAAT INI]
Nama Proyek: ${context.projectName || 'Proyek Tanpa Nama'}
Kategori: ${context.category || '-'}
Volume Target: ${context.productionVolume || 1} ${context.volumeUnit || 'unit'}
Target Margin: ${context.targetMargin || 0}%
Biaya Bahan Langsung (Direct Material): Rp ${(context.totalMaterial || 0).toLocaleString('id-ID')}
Biaya Upah Langsung (Direct Labor): Rp ${(context.totalLabor || 0).toLocaleString('id-ID')}
Biaya Overhead Operasional: Rp ${(context.totalOverhead || 0).toLocaleString('id-ID')}
Biaya Kontingensi/Tak Terduga: Rp ${(context.contingencyAmount || 0).toLocaleString('id-ID')} (${context.contingencyPercent || 0}%)
Total Biaya Proyek: Rp ${(context.totalCost || 0).toLocaleString('id-ID')}
HPP per Satuan: Rp ${(context.costPerUnit || 0).toLocaleString('id-ID')}
Harga Jual Rekomendasi: Rp ${(context.sellingPrice || 0).toLocaleString('id-ID')}
Laba Kotor per Satuan: Rp ${(context.profitPerUnit || 0).toLocaleString('id-ID')}
BEP (Titik Impas): ${context.bepUnits || 0} ${context.volumeUnit || 'unit'} (Nilai Omzet BEP: Rp ${(context.bepRevenue || 0).toLocaleString('id-ID')})
Rincian Komponen Biaya:
${(context.items || [])
  .map(
    (i: any) =>
      `- [${i.type.toUpperCase()}] ${i.name}: ${i.quantity} ${i.unit} @ Rp ${(i.unitPrice || 0).toLocaleString('id-ID')} = Rp ${(i.quantity * i.unitPrice).toLocaleString('id-ID')}`
  )
  .join('\n')}
`;
  }

  const systemInstruction = `Kamu adalah Konsultan Keuangan dan Analis Biaya Senior (CMA/CPA standard) untuk UMKM, Kontraktor, dan Profesional Indonesia di aplikasi "HPP-Pro Master".
Karakter: Profesional, suportif, sangat teliti secara matematika akuntansi, dan menggunakan bahasa Indonesia formal yang jelas serta mudah dimengerti pemilik bisnis.

Aturan Wajib:
1. Selalu berikan rincian biaya yang transparan dan perhitungkan implikasi cash flow.
2. Ketika pengguna meminta efisiensi atau penurunan HPP, berikan saran logis nyata (misal: negosiasi volume tier dengan supplier, eliminasi scrap/pemborosan, standarisasi porsi, sub-kontrak vs in-house) tanpa mengorbankan kualitas produk atau keselamatan kerja.
3. Gunakan format tabel Markdown untuk perbandingan opsi, angka, atau kalkulasi skenario.
4. Jika data pengguna berisiko (misalnya belum memperhitungkan susut bahan 5-10%, biaya bensin/transportasi, atau tarif listrik), berikan pertanyaan klarifikasi atau peringatan solutif.
5. Pastikan semua hitungan matematis persentase markup, margin, dan BEP 100% akurat.
6. Berikan rekomendasi yang bisa langsung dieksekusi hari ini.`;

  try {
    const ai = getGeminiClient();

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Berikut adalah konteks proyek saat ini:\n${contextString}\n\nSilakan jawab pertanyaan berikut berdasarkan data di atas.`,
          },
        ],
      },
      ...messages.map((m: { role: string; text: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
    ];

    const result = await generateContentWithFallback(ai, {
      contents: contents as any,
      systemInstruction,
    });

    res.json({ reply: result.text });
  } catch (error: any) {
    console.warn('Gemini chat unavailable, generating structured financial advisor fallback:', error?.message);

    // Fallback response generated from project context so user always gets actionable advice
    const latestUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
    let fallbackReply = `Halo! Server AI sedang mengalami antrean beban jaringan yang tinggi. Namun, berikut adalah analisis langsung dari sistem untuk proyek **${context?.projectName || 'Anda'}**:

### 📊 Ringkasan Finansial Proyek
| Metrik | Nilai | Status |
| :--- | :--- | :--- |
| **HPP Pokok per ${context?.volumeUnit || 'unit'}** | Rp ${(context?.costPerUnit || 0).toLocaleString('id-ID')} | Modal Dasar |
| **Harga Jual Rekomendasi** | Rp ${(context?.sellingPrice || 0).toLocaleString('id-ID')} | Margin ${context?.targetMargin || 0}% |
| **Titik Impas (BEP)** | ${context?.bepUnits || 0} ${context?.volumeUnit || 'unit'} | Target Minimum |

### 💡 Rekomendasi Efisiensi Langsung:
1. **Negosiasi Bahan Baku (Direct Material):** Biaya bahan menyumbang Rp ${(context?.totalMaterial || 0).toLocaleString('id-ID')}. Gunakan fitur *Komparasi Vendor* di aplikasi untuk mencari supplier dengan selisih harga 5–10% lebih hemat.
2. **Kendalikan Biaya Overhead:** Pastikan biaya utilitas dan packaging tidak melebihi 15% dari total HPP untuk menjaga margin tetap aman.
3. **Amankan Uang Muka (DP):** Terapkan pembayaran DP minimal 50% di awal sebelum produksi dimulai untuk mengamankan *cash flow* operasional.

*(Silakan kirim pesan kembali dalam beberapa saat ketika antrean server AI telah normal).*`;

    res.json({ reply: fallbackReply });
  }
});

// Vite middleware in dev, static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`HPP-Pro Master server is running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
