import React, { useState } from 'react';
import {
  AlertCircle,
  Bot,
  Check,
  ChevronRight,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  AIEstimatedItem,
  AIEstimationResult,
  CostCategoryKey,
} from '../types/calculator';
import { formatRupiah } from '../utils/calculator';
import { CurrencyInput } from './CurrencyInput';

interface AIEstimationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEstimation: (data: {
    productName: string;
    quantity: number;
    rawMaterial: number;
    packaging: number;
    labor: number;
    transport: number;
    other: number;
    items: AIEstimatedItem[];
  }) => void;
  initialProductName?: string;
  initialQuantity?: number;
}

export const CATEGORY_LABELS: Record<CostCategoryKey, string> = {
  rawMaterial: 'Bahan Baku',
  packaging: 'Kemasan',
  labor: 'Tenaga Kerja',
  transport: 'Transportasi',
  other: 'Biaya Lainnya',
};

export const AIEstimationModal: React.FC<AIEstimationModalProps> = ({
  isOpen,
  onClose,
  onApplyEstimation,
  initialProductName = '',
  initialQuantity = 20,
}) => {
  const [productName, setProductName] = useState(initialProductName || '');
  const [quantity, setQuantity] = useState<number>(initialQuantity || 20);
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [estimationResult, setEstimationResult] =
    useState<AIEstimationResult | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setErrorMessage('Silakan isi nama produk terlebih dahulu.');
      return;
    }
    if (quantity <= 0) {
      setErrorMessage('Jumlah produk harus lebih dari 0.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/estimate-hpp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productName.trim(),
          quantity,
          context: context.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Server merespons dengan status error (${response.status})`
        );
      }

      const data: AIEstimationResult = await response.json();
      setEstimationResult(data);
    } catch (err: any) {
      console.warn('AI Estimation API error, using smart fallback generator:', err);
      // Smart offline fallback generator if server/AI encounters an issue
      const fallbackItems: AIEstimatedItem[] = generateFallbackEstimation(
        productName.trim(),
        quantity,
        context.trim()
      );
      setEstimationResult({
        productName: productName.trim(),
        quantity,
        context: context.trim(),
        disclaimer:
          'Harga merupakan estimasi AI dan dapat berbeda berdasarkan lokasi, merek, toko, dan waktu. Silakan sesuaikan dengan harga sebenarnya.',
        items: fallbackItems,
        notes:
          'Estimasi biaya dasar dibuat berdasarkan standar acuan harga UMKM Indonesia.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = (
    id: string,
    field: keyof AIEstimatedItem,
    value: any
  ) => {
    if (!estimationResult) return;
    const updated = estimationResult.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setEstimationResult({ ...estimationResult, items: updated });
  };

  const handleDeleteItem = (id: string) => {
    if (!estimationResult) return;
    const updated = estimationResult.items.filter((item) => item.id !== id);
    setEstimationResult({ ...estimationResult, items: updated });
  };

  const handleAddItem = (category: CostCategoryKey = 'rawMaterial') => {
    if (!estimationResult) return;
    const newItem: AIEstimatedItem = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      category,
      name: 'Item Baru',
      quantity: '1',
      unit: 'satuan',
      estimatedCost: 10000,
    };
    setEstimationResult({
      ...estimationResult,
      items: [...estimationResult.items, newItem],
    });
  };

  // Calculate totals by category from the edited list
  const totalsByCategory = {
    rawMaterial:
      estimationResult?.items
        .filter((i) => i.category === 'rawMaterial')
        .reduce((sum, i) => sum + (i.estimatedCost || 0), 0) || 0,
    packaging:
      estimationResult?.items
        .filter((i) => i.category === 'packaging')
        .reduce((sum, i) => sum + (i.estimatedCost || 0), 0) || 0,
    labor:
      estimationResult?.items
        .filter((i) => i.category === 'labor')
        .reduce((sum, i) => sum + (i.estimatedCost || 0), 0) || 0,
    transport:
      estimationResult?.items
        .filter((i) => i.category === 'transport')
        .reduce((sum, i) => sum + (i.estimatedCost || 0), 0) || 0,
    other:
      estimationResult?.items
        .filter((i) => i.category === 'other')
        .reduce((sum, i) => sum + (i.estimatedCost || 0), 0) || 0,
  };

  const totalProductionCost =
    totalsByCategory.rawMaterial +
    totalsByCategory.packaging +
    totalsByCategory.labor +
    totalsByCategory.transport +
    totalsByCategory.other;

  const costPerUnit =
    quantity > 0 ? Math.round(totalProductionCost / quantity) : 0;

  const handleApply = () => {
    if (!estimationResult) return;
    onApplyEstimation({
      productName: estimationResult.productName || productName,
      quantity: estimationResult.quantity || quantity,
      rawMaterial: totalsByCategory.rawMaterial,
      packaging: totalsByCategory.packaging,
      labor: totalsByCategory.labor,
      transport: totalsByCategory.transport,
      other: totalsByCategory.other,
      items: estimationResult.items,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Estimasi HPP dengan AI
              </h2>
              <p className="text-xs text-slate-500">
                AI menghitung rincian modal produksi awal berdasarkan pasar UMKM Indonesia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* STEP 1: Form Input Produk & Konteks (Always visible or compact) */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              <div className="sm:col-span-7 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Pisang Goreng"
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Jumlah Produk Dibuat <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={quantity === 0 ? '' : quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setQuantity(isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    placeholder="20"
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden tabular-nums pr-12"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 font-medium">
                    unit/pcs
                  </span>
                </div>
              </div>

              <div className="sm:col-span-12 space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Konteks Usaha <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Contoh: Dijual di kantin sekolah dengan kemasan mika sederhana"
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            {!estimationResult && !isLoading && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span className="text-slate-400">Contoh Cepat:</span>
                {[
                  { name: 'Pisang Goreng', qty: 20, ctx: 'Dijual di sekolah dengan kemasan sederhana' },
                  { name: 'Kopi Susu Botol', qty: 50, ctx: 'Kopi susu literan kemasan botol kale 250ml' },
                  { name: 'Sambal Cumi Botol', qty: 15, ctx: 'Sambal kemasan toples plastik 150 gram' },
                  { name: 'Kaos Sablon DTF', qty: 30, ctx: 'Bahan cotton combed 24s dengan sablon' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setProductName(item.name);
                      setQuantity(item.qty);
                      setContext(item.ctx);
                    }}
                    className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-2xs font-medium text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                  >
                    {item.name} ({item.qty} pcs)
                  </button>
                ))}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Tombol Buat Estimasi dengan AI */}
            {!estimationResult && (
              <div className="pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sedang Menganalisis Biaya Produksi...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      <span>Buat Estimasi dengan AI</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* LOADING STATE */}
          {isLoading && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 animate-pulse">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">
                  AI sedang merancang estimasi biaya untuk "{productName}"...
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Menghitung bahan baku, kemasan, alokasi waktu kerja, ongkos belanja, serta operasional lainnya.
                </p>
              </div>
            </div>
          )}

          {/* RESULTS STATE: HASIL ESTIMASI DAPAT DIEDIT */}
          {estimationResult && !isLoading && (
            <div className="space-y-5">
              {/* Mandatory Disclaimer Note */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 space-y-1 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>Catatan Estimasi AI:</span>
                </div>
                <p className="leading-relaxed">
                  <strong>
                    "Harga merupakan estimasi AI dan dapat berbeda berdasarkan lokasi, merek, toko, dan waktu. Silakan sesuaikan dengan harga sebenarnya."
                  </strong>
                </p>
                {estimationResult.notes && (
                  <p className="text-2xs text-amber-800 pt-1 border-t border-amber-200/60">
                    💡 {estimationResult.notes}
                  </p>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-0.5">
                  <span className="text-slate-400 block">Total Estimasi Modal:</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {formatRupiah(totalProductionCost)}
                  </span>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-0.5">
                  <span className="text-emerald-800 font-medium block">
                    Perkiraan HPP / Unit:
                  </span>
                  <span className="text-sm font-extrabold text-emerald-950 tabular-nums">
                    {formatRupiah(costPerUnit)}
                  </span>
                  <span className="text-2xs text-emerald-700 block">
                    Untuk {quantity} unit
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-0.5">
                  <span className="text-slate-400 block">Bahan Baku:</span>
                  <span className="text-xs font-semibold text-slate-800 tabular-nums">
                    {formatRupiah(totalsByCategory.rawMaterial)}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-0.5">
                  <span className="text-slate-400 block">Kemasan & Lainnya:</span>
                  <span className="text-xs font-semibold text-slate-800 tabular-nums">
                    {formatRupiah(
                      totalsByCategory.packaging +
                        totalsByCategory.labor +
                        totalsByCategory.transport +
                        totalsByCategory.other
                    )}
                  </span>
                </div>
              </div>

              {/* Editable Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Rincian Komponen Biaya ({estimationResult.items.length} item)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Anda dapat mengubah nama, jumlah, satuan, kategori, maupun harga langsung di bawah ini
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddItem('rawMaterial')}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Biaya</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
                  {estimationResult.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs"
                    >
                      {/* Category selector */}
                      <div className="w-full sm:w-32 shrink-0">
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              'category',
                              e.target.value as CostCategoryKey
                            )
                          }
                          className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:outline-hidden"
                        >
                          <option value="rawMaterial">Bahan Baku</option>
                          <option value="packaging">Kemasan</option>
                          <option value="labor">Tenaga Kerja</option>
                          <option value="transport">Transportasi</option>
                          <option value="other">Biaya Lainnya</option>
                        </select>
                      </div>

                      {/* Name input */}
                      <div className="flex-1 min-w-[140px]">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'name', e.target.value)
                          }
                          placeholder="Nama biaya..."
                          className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                        />
                      </div>

                      {/* Quantity & Unit */}
                      <div className="flex items-center gap-1.5 w-full sm:w-36 shrink-0">
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              'quantity',
                              e.target.value
                            )
                          }
                          placeholder="Jml"
                          className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 tabular-nums focus:border-emerald-600 focus:outline-hidden text-center"
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'unit', e.target.value)
                          }
                          placeholder="satuan"
                          className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:border-emerald-600 focus:outline-hidden text-center"
                        />
                      </div>

                      {/* Cost Input */}
                      <div className="w-full sm:w-36 shrink-0">
                        <CurrencyInput
                          value={item.estimatedCost}
                          onChange={(val) =>
                            handleUpdateItem(item.id, 'estimatedCost', val)
                          }
                          placeholder="0"
                        />
                      </div>

                      {/* Delete item button */}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="self-end sm:self-center p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Re-generate / Reset Button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setEstimationResult(null)}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Ubah Input / Hitung Ulang AI</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>

          {estimationResult && (
            <button
              onClick={handleApply}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              <Check className="h-4 w-4" />
              <span>Gunakan Estimasi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Smart heuristic generator used if AI network is unavailable
 */
function generateFallbackEstimation(
  productName: string,
  quantity: number,
  context: string
): AIEstimatedItem[] {
  const pName = productName.toLowerCase();
  const qty = Math.max(1, quantity);

  if (pName.includes('pisang') || pName.includes('goreng')) {
    return [
      {
        id: 'fb_1',
        category: 'rawMaterial',
        name: 'Pisang Kepok / Uli',
        quantity: `${qty}`,
        unit: 'buah',
        estimatedCost: Math.round(qty * 750),
      },
      {
        id: 'fb_2',
        category: 'rawMaterial',
        name: 'Tepung Terigu & Beras',
        quantity: `${Math.max(250, qty * 25)}`,
        unit: 'gram',
        estimatedCost: 8000,
      },
      {
        id: 'fb_3',
        category: 'rawMaterial',
        name: 'Minyak Goreng',
        quantity: '1',
        unit: 'liter',
        estimatedCost: 16000,
      },
      {
        id: 'fb_4',
        category: 'packaging',
        name: 'Kemasan Kertas Mika / Kantong Snack',
        quantity: `${qty}`,
        unit: 'pcs',
        estimatedCost: Math.round(qty * 300),
      },
      {
        id: 'fb_5',
        category: 'labor',
        name: 'Upah Menggoreng & Persiapan',
        quantity: '1',
        unit: 'sesi',
        estimatedCost: 15000,
      },
      {
        id: 'fb_6',
        category: 'transport',
        name: 'Transportasi Belanja Bahan',
        quantity: '1',
        unit: 'trip',
        estimatedCost: 5000,
      },
      {
        id: 'fb_7',
        category: 'other',
        name: 'Gas LPG 3kg & Kebersihan',
        quantity: '0.2',
        unit: 'tabung',
        estimatedCost: 6000,
      },
    ];
  }

  // Default generic food or goods breakdown
  return [
    {
      id: 'fb_gen_1',
      category: 'rawMaterial',
      name: `Bahan Mentah Utama ${productName}`,
      quantity: `${qty}`,
      unit: 'porsi',
      estimatedCost: Math.round(qty * 2500),
    },
    {
      id: 'fb_gen_2',
      category: 'rawMaterial',
      name: 'Bumbu & Bahan Pelengkap',
      quantity: '1',
      unit: 'paket',
      estimatedCost: Math.round(qty * 800),
    },
    {
      id: 'fb_gen_3',
      category: 'packaging',
      name: 'Kemasan & Stiker Label',
      quantity: `${qty}`,
      unit: 'pcs',
      estimatedCost: Math.round(qty * 600),
    },
    {
      id: 'fb_gen_4',
      category: 'labor',
      name: 'Ongkos Produksi / Waktu Pengerjaan',
      quantity: '1',
      unit: 'batch',
      estimatedCost: Math.round(qty * 1000),
    },
    {
      id: 'fb_gen_5',
      category: 'transport',
      name: 'Transportasi Pengambilan Bahan',
      quantity: '1',
      unit: 'trip',
      estimatedCost: 7500,
    },
    {
      id: 'fb_gen_6',
      category: 'other',
      name: 'Gas, Listrik & Utilitas',
      quantity: '1',
      unit: 'batch',
      estimatedCost: 8000,
    },
  ];
}
