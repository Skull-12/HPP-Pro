import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Dev server must always run on port 3000 as per environment constraints
  const port = process.env.NODE_ENV === 'production' && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize Gemini SDK with User-Agent header
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint for AI Cost Estimation
  app.post('/api/ai/estimate-hpp', async (req, res) => {
    try {
      const { productName, quantity, context } = req.body;

      if (!productName || typeof productName !== 'string' || !productName.trim()) {
        return res.status(400).json({
          error: 'Nama produk wajib diisi.',
        });
      }

      const qty = Math.max(1, parseInt(quantity, 10) || 1);
      const userContext = context && typeof context === 'string' ? context.trim() : '';

      const prompt = `Anda adalah asisten ahli kalkulasi biaya produksi (HPP) dan akuntansi UMKM di Indonesia.
Buat estimasi awal komponen biaya produksi yang realistis dan wajar di pasar Indonesia (dalam mata uang Rupiah) untuk:
- Produk: "${productName}"
- Jumlah Batch yang dibuat: ${qty} unit/porsi/pcs
${userContext ? `- Konteks usaha: "${userContext}"` : ''}

Perkirakan rincian biaya produksi untuk SELURUH batch (${qty} unit) tersebut.
Kategorikan setiap biaya ke dalam salah satu dari 5 kategori berikut:
1. "rawMaterial" (Bahan baku utama & bumbu/komponen mentah)
2. "packaging" (Kemasan, plastik, kotak, standing pouch, botol, stiker label)
3. "labor" (Upah tenaga kerja langsung / ongkos pembuatan / estimasi waktu kerja)
4. "transport" (Ongkos transportasi belanja bahan / logistik pengambilan bahan)
5. "other" (Biaya lainnya seperti gas LPG, listrik, air, penyusutan alat sederhana)

Setiap item harus memiliki:
- category: salah satu dari "rawMaterial", "packaging", "labor", "transport", "other"
- name: nama item biaya (misal: "Pisang Kepok", "Tepung Terigu", "Minyak Goreng", "Kotak Kemasan Kraft", "Gas LPG 3kg")
- quantity: jumlah kuantitas bahan yang dibutuhkan untuk batch ini (misal: "2", "500", "1")
- unit: satuan kuantitas (misal: "sisir", "gram", "kg", "liter", "pcs", "jam", "tabung", "trip")
- estimatedCost: estimasi total biaya dalam Rupiah (angka bulat tanpa titik/koma)

Berikan juga catatan singkat edukatif untuk pemilik usaha UMKM terkait estimasi ini.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'Anda adalah konsultan keuangan UMKM profesional Indonesia. Berikan estimasi biaya produksi riil pasar Indonesia dalam format JSON terstruktur. Seluruh angka biaya harus berupa integer positif dalam Rupiah.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productName: { type: Type.STRING },
              quantity: { type: Type.INTEGER },
              notes: {
                type: Type.STRING,
                description: 'Catatan tambahan atau tips efisiensi produksi dari AI',
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: {
                      type: Type.STRING,
                      description:
                        'Kategori: rawMaterial, packaging, labor, transport, atau other',
                    },
                    name: {
                      type: Type.STRING,
                      description: 'Nama komponen biaya',
                    },
                    quantity: {
                      type: Type.STRING,
                      description: 'Kuantitas bahan yang dibutuhkan',
                    },
                    unit: {
                      type: Type.STRING,
                      description: 'Satuan unit (misal: kg, gram, pcs, liter, jam, sisir)',
                    },
                    estimatedCost: {
                      type: Type.INTEGER,
                      description: 'Estimasi total biaya dalam Rupiah',
                    },
                  },
                  required: ['category', 'name', 'quantity', 'unit', 'estimatedCost'],
                },
              },
            },
            required: ['productName', 'quantity', 'items'],
          },
        },
      });

      const responseText = response.text?.trim() || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Gemini JSON output:', parseError, responseText);
        throw new Error('Format balasan AI tidak valid.');
      }

      // Add standard mandatory disclaimer
      const result = {
        productName: parsedData.productName || productName,
        quantity: parsedData.quantity || qty,
        context: userContext,
        notes: parsedData.notes || '',
        disclaimer:
          'Harga merupakan estimasi AI dan dapat berbeda berdasarkan lokasi, merek, toko, dan waktu. Silakan sesuaikan dengan harga sebenarnya.',
        items: (parsedData.items || []).map((item: any, idx: number) => ({
          id: `ai_item_${Date.now()}_${idx}`,
          category: ['rawMaterial', 'packaging', 'labor', 'transport', 'other'].includes(
            item.category
          )
            ? item.category
            : 'rawMaterial',
          name: item.name || `Biaya ${idx + 1}`,
          quantity: item.quantity || '1',
          unit: item.unit || 'unit',
          estimatedCost: Math.max(0, parseInt(item.estimatedCost, 10) || 0),
        })),
      };

      return res.json(result);
    } catch (error: any) {
      console.error('Error generating HPP estimate with Gemini:', error);
      return res.status(500).json({
        error:
          error.message ||
          'Gagal menghasilkan estimasi biaya dengan AI. Silakan coba kembali beberapa saat lagi.',
      });
    }
  });

  // Serve front-end
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server HPP Pro running at http://0.0.0.0:${port}`);
  });
}

startServer();
