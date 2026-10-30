import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// 1. Natural Language Parser Endpoint: Turn free text into structured cost items
app.post('/api/parse-cost', async (req: Request, res: Response) => {
  try {
    const { promptText, categoryHint } = req.body;
    if (!promptText || typeof promptText !== 'string' || !promptText.trim()) {
      res.status(400).json({ error: 'Deskripsi teks tidak boleh kosong.' });
      return;
    }

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
Jika ada komponen penting yang biasanya wajib (seperti packaging makanan, atau gas untuk masak) tapi belum disebut pengguna, cantumkan estimasi wajar di items dan beri catatan di aiSummary.
Semua unitPrice harus berupa angka murni (misal 35000, bukan Rp 35.000).`;

    const userPrompt = `Analisis deskripsi proyek berikut${categoryHint ? ` (Kategori yang dipilih: ${categoryHint})` : ''}:\n"${promptText}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Fallback extract json from text if necessary
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Gagal memformat JSON dari hasil AI');
      }
    }

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in /api/parse-cost:', error);
    if (error.message === 'GEMINI_API_KEY_MISSING') {
      res.status(503).json({
        error: 'Kunci API Gemini belum dikonfigurasi. Silakan periksa panel pengaturan Secrets.',
      });
      return;
    }
    res.status(500).json({
      error: error.message || 'Terjadi kesalahan saat memproses data dengan AI.',
    });
  }
});

// 2. Interactive AI Financial Advisor Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Format pesan tidak valid.' });
      return;
    }

    const ai = getGeminiClient();

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'Maaf, saya tidak dapat menghasilkan respon saat ini.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    if (error.message === 'GEMINI_API_KEY_MISSING') {
      res.status(503).json({
        error: 'Kunci API Gemini belum dikonfigurasi. Silakan periksa panel Secrets.',
      });
      return;
    }
    res.status(500).json({
      error: error.message || 'Terjadi kesalahan pada layanan AI.',
    });
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
