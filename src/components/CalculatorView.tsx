import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  BookmarkCheck,
  Bot,
  CheckCircle2,
  Copy,
  DollarSign,
  HelpCircle,
  Package,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Store,
  Trash2,
  TrendingDown,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  AIEstimatedItem,
  CalculationInputs,
  CalculationResults,
  PriceTestResult,
  SavedCalculation,
} from '../types/calculator';
import {
  calculateHPP,
  calculateTotalProductionCost,
  formatPercent,
  formatRupiah,
  PROMPT_EXAMPLE_PRESET,
  roundToNearest,
  testSellingPrice,
} from '../utils/calculator';
import { CurrencyInput } from './CurrencyInput';
import { AIEstimationModal } from './AIEstimationModal';

interface CalculatorViewProps {
  initialData?: CalculationInputs;
  onSaveCalculation: (
    inputs: CalculationInputs,
    results: CalculationResults
  ) => void;
  onViewHistory: () => void;
  openAIModal?: boolean;
  onCloseAIModal?: () => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  initialData,
  onSaveCalculation,
  onViewHistory,
  openAIModal = false,
  onCloseAIModal,
}) => {
  // Input states
  const [productName, setProductName] = useState<string>(
    initialData?.product.name || 'Keripik Singkong Renyah'
  );
  const [quantity, setQuantity] = useState<number>(
    initialData?.product.quantity || 20
  );

  // Production costs
  const [rawMaterial, setRawMaterial] = useState<number>(
    initialData?.productionCosts.rawMaterial ?? 30000
  );
  const [packaging, setPackaging] = useState<number>(
    initialData?.productionCosts.packaging ?? 10000
  );
  const [labor, setLabor] = useState<number>(
    initialData?.productionCosts.labor ?? 20000
  );
  const [transport, setTransport] = useState<number>(
    initialData?.productionCosts.transport ?? 10000
  );
  const [otherCost, setOtherCost] = useState<number>(
    initialData?.productionCosts.other ?? 10000
  );

  // Custom flexible costs
  const [customCosts, setCustomCosts] = useState<
    { id: string; name: string; amount: number }[]
  >(initialData?.productionCosts.customItems || []);

  // Sales costs
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(
    initialData?.salesCosts.platformFeePercent ?? 0
  );
  const [additionalFeePerTx, setAdditionalFeePerTx] = useState<number>(
    initialData?.salesCosts.additionalFeePerTx ?? 0
  );

  // Target profit
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(
    initialData?.targetMarginPercent ?? 30
  );

  // Test selling price
  const [testedPrice, setTestedPrice] = useState<number>(
    initialData?.testedPrice ?? 6000
  );

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync when initialData changes
  useEffect(() => {
    if (initialData) {
      setProductName(initialData.product.name);
      setQuantity(initialData.product.quantity);
      setRawMaterial(initialData.productionCosts.rawMaterial);
      setPackaging(initialData.productionCosts.packaging);
      setLabor(initialData.productionCosts.labor);
      setTransport(initialData.productionCosts.transport);
      setOtherCost(initialData.productionCosts.other);
      setCustomCosts(initialData.productionCosts.customItems || []);
      setPlatformFeePercent(initialData.salesCosts.platformFeePercent);
      setAdditionalFeePerTx(initialData.salesCosts.additionalFeePerTx);
      setTargetMarginPercent(initialData.targetMarginPercent);
      if (initialData.testedPrice !== undefined) {
        setTestedPrice(initialData.testedPrice);
      }
    }
  }, [initialData]);

  // Aggregate current inputs
  const currentInputs: CalculationInputs = useMemo(() => {
    return {
      product: {
        name: productName.trim() || 'Produk Usaha',
        quantity: Math.max(0, quantity),
      },
      productionCosts: {
        rawMaterial,
        packaging,
        labor,
        transport,
        other: otherCost,
        customItems: customCosts,
      },
      salesCosts: {
        platformFeePercent,
        additionalFeePerTx,
      },
      targetMarginPercent,
      testedPrice,
    };
  }, [
    productName,
    quantity,
    rawMaterial,
    packaging,
    labor,
    transport,
    otherCost,
    customCosts,
    platformFeePercent,
    additionalFeePerTx,
    targetMarginPercent,
    testedPrice,
  ]);

  // Auto-calculated results
  const results: CalculationResults = useMemo(() => {
    return calculateHPP(currentInputs);
  }, [currentInputs]);

  // Test selling price calculation
  const priceTestResult: PriceTestResult = useMemo(() => {
    return testSellingPrice(
      testedPrice,
      results.costPerUnit,
      currentInputs.salesCosts,
      currentInputs.product.quantity
    );
  }, [
    testedPrice,
    results.costPerUnit,
    currentInputs.salesCosts,
    currentInputs.product.quantity,
  ]);

  // Update default tested price whenever recommended price changes if not manually edited
  const syncWithRecommendedPrice = () => {
    if (results.recommendedSellingPrice > 0) {
      const rounded = roundToNearest(results.recommendedSellingPrice, 100);
      setTestedPrice(rounded);
      showToast(`Harga uji disesuaikan ke ${formatRupiah(rounded)}`);
    }
  };

  const handleAddCustomCost = () => {
    const newId = `cost_${Date.now()}`;
    setCustomCosts([...customCosts, { id: newId, name: 'Biaya Tambahan', amount: 0 }]);
  };

  const handleUpdateCustomCost = (
    id: string,
    field: 'name' | 'amount',
    val: string | number
  ) => {
    setCustomCosts(
      customCosts.map((item) =>
        item.id === id ? { ...item, [field]: val } : item
      )
    );
  };

  const handleDeleteCustomCost = (id: string) => {
    setCustomCosts(customCosts.filter((item) => item.id !== id));
  };

  const handleResetToExample = () => {
    setProductName(PROMPT_EXAMPLE_PRESET.product.name);
    setQuantity(PROMPT_EXAMPLE_PRESET.product.quantity);
    setRawMaterial(PROMPT_EXAMPLE_PRESET.productionCosts.rawMaterial);
    setPackaging(PROMPT_EXAMPLE_PRESET.productionCosts.packaging);
    setLabor(PROMPT_EXAMPLE_PRESET.productionCosts.labor);
    setTransport(PROMPT_EXAMPLE_PRESET.productionCosts.transport);
    setOtherCost(PROMPT_EXAMPLE_PRESET.productionCosts.other);
    setCustomCosts([]);
    setPlatformFeePercent(PROMPT_EXAMPLE_PRESET.salesCosts.platformFeePercent);
    setAdditionalFeePerTx(PROMPT_EXAMPLE_PRESET.salesCosts.additionalFeePerTx);
    setTargetMarginPercent(PROMPT_EXAMPLE_PRESET.targetMarginPercent);
    setTestedPrice(PROMPT_EXAMPLE_PRESET.testedPrice || 6000);
    showToast('Berhasil memuat contoh Keripik Singkong!');
  };

  const handleClearAll = () => {
    setProductName('');
    setQuantity(1);
    setRawMaterial(0);
    setPackaging(0);
    setLabor(0);
    setTransport(0);
    setOtherCost(0);
    setCustomCosts([]);
    setPlatformFeePercent(0);
    setAdditionalFeePerTx(0);
    setTargetMarginPercent(30);
    setTestedPrice(0);
    showToast('Formulir berhasil dikosongkan.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSave = () => {
    if (quantity <= 0) {
      showToast('Gagal: Jumlah produk harus lebih dari 0.');
      return;
    }
    onSaveCalculation(currentInputs, results);
    showToast('Perhitungan berhasil disimpan ke Riwayat!');
  };

  const handleCopySummary = () => {
    const summary = `*RINGKASAN HPP & HARGA JUAL — HPP PRO*
Produk: ${productName || 'Tanpa Nama'}
Jumlah Produksi: ${quantity} unit
Total Biaya Produksi: ${formatRupiah(results.totalProductionCost)}
HPP per Unit: ${formatRupiah(results.costPerUnit)}
Harga Impas (BEP): ${formatRupiah(results.breakEvenPrice)}
Target Margin: ${targetMarginPercent}%
Harga Jual Rekomendasi: ${formatRupiah(results.recommendedSellingPrice)}
Estimasi Laba per Unit: ${formatRupiah(results.profitPerUnit)}
Estimasi Total Laba: ${formatRupiah(results.estimatedTotalProfit)}

*Hasil Uji Harga Jual:*
Harga yang Diuji: ${formatRupiah(testedPrice)}
Status: ${priceTestResult.status === 'profit' ? 'UNTUNG' : priceTestResult.status === 'loss' ? 'RUGI' : 'IMPAS'}
Laba per Unit: ${formatRupiah(priceTestResult.profitPerUnit)}
Margin Aktual: ${formatPercent(priceTestResult.marginPercent)}`;

    navigator.clipboard.writeText(summary);
    showToast('Ringkasan berhasil disalin ke papan klip!');
  };

  // AI Modal state & handlers
  const [isAIModalOpen, setIsAIModalOpen] = useState(openAIModal);

  useEffect(() => {
    if (openAIModal) {
      setIsAIModalOpen(true);
    }
  }, [openAIModal]);

  const handleCloseAIModal = () => {
    setIsAIModalOpen(false);
    if (onCloseAIModal) onCloseAIModal();
  };

  const handleApplyAIEstimation = (data: {
    productName: string;
    quantity: number;
    rawMaterial: number;
    packaging: number;
    labor: number;
    transport: number;
    other: number;
    items: AIEstimatedItem[];
  }) => {
    setProductName(data.productName);
    setQuantity(data.quantity);
    setRawMaterial(data.rawMaterial);
    setPackaging(data.packaging);
    setLabor(data.labor);
    setTransport(data.transport);
    setOtherCost(data.other);

    // Provide a smart default tested price
    const totalProd =
      data.rawMaterial + data.packaging + data.labor + data.transport + data.other;
    const estHpp = data.quantity > 0 ? totalProd / data.quantity : 0;
    const estSell = estHpp / (1 - targetMarginPercent / 100);
    if (estSell > 0) {
      setTestedPrice(roundToNearest(estSell, 500));
    }

    showToast(`Estimasi AI untuk "${data.productName}" berhasil diterapkan ke kalkulator!`);
  };


  const totalProductionCost = calculateTotalProductionCost(
    currentInputs.productionCosts
  );

  return (
    <div className="py-6 sm:py-8 space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Kalkulator HPP & Penetapan Harga
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Masukkan data modal, tentukan margin keuntungan, dan uji harga jual secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 hover:border-emerald-400 transition-colors"
            title="Gunakan AI untuk memperkirakan modal produksi otomatis"
          >
            <Bot className="h-3.5 w-3.5 text-emerald-700" />
            <span>🤖 Buat Estimasi dengan AI</span>
          </button>

          <button
            onClick={handleResetToExample}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            title="Muat contoh soal prompt: 20 pcs keripik singkong biaya Rp 80.000"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Contoh Bawaan</span>
          </button>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Kosongkan</span>
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
          >
            <BookmarkCheck className="h-3.5 w-3.5" />
            <span>Simpan</span>
          </button>
        </div>
      </div>

      {/* Banner AI Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/60 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Butuh Bantuan Memperkirakan Modal? Gunakan AI
            </h3>
            <p className="text-xs text-slate-600 leading-normal">
              Cukup masukkan nama produk dan jumlah, AI akan memperkirakan bahan baku, kemasan, tenaga kerja, dan operasional yang dapat Anda sesuaikan.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAIModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all shrink-0 whitespace-nowrap"
        >
          <Bot className="h-4 w-4" />
          <span>Buat Estimasi dengan AI</span>
        </button>
      </div>

      {/* Main Grid: Inputs (Left 7 cols) & Results (Right 5 cols) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* INPUTS COLUMN */}
        <div className="space-y-6 lg:col-span-7">
          {/* BAGIAN 1: DATA PRODUK */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-xs font-bold text-emerald-700">
                  1
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Data Produk
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <Bot className="h-3.5 w-3.5" />
                  <span>Isi Otomatis dengan AI</span>
                </button>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400">Batch produksi</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Keripik Singkong Renyah"
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Jumlah Dibuat (Batch) <span className="text-rose-500">*</span>
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
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 tabular-nums pr-12"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 font-medium">
                    unit/pcs
                  </span>
                </div>
              </div>
            </div>

            {quantity <= 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>
                  Jumlah produk harus lebih dari 0 agar HPP per unit dapat dihitung.
                </span>
              </div>
            )}
          </section>

          {/* BAGIAN 2: BIAYA PRODUKSI */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-xs font-bold text-emerald-700">
                  2
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Biaya Produksi
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Total Biaya Produksi:</span>
                <span className="text-sm font-bold text-emerald-700 tabular-nums">
                  {formatRupiah(totalProductionCost)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CurrencyInput
                label="Bahan Baku"
                value={rawMaterial}
                onChange={setRawMaterial}
                placeholder="30000"
                helperText="Biaya seluruh bahan mentah"
              />

              <CurrencyInput
                label="Kemasan"
                value={packaging}
                onChange={setPackaging}
                placeholder="10000"
                helperText="Plastik, toples, box, label stiker"
              />

              <CurrencyInput
                label="Tenaga Kerja"
                value={labor}
                onChange={setLabor}
                placeholder="20000"
                helperText="Upah pembuatan / pengolahan"
              />

              <CurrencyInput
                label="Transportasi"
                value={transport}
                onChange={setTransport}
                placeholder="10000"
                helperText="Ongkir belanja bahan baku"
              />

              <div className="sm:col-span-2">
                <CurrencyInput
                  label="Biaya Lainnya"
                  value={otherCost}
                  onChange={setOtherCost}
                  placeholder="10000"
                  helperText="Listrik, gas, air, penyusutan alat"
                />
              </div>
            </div>

            {/* Custom additional cost items */}
            {customCosts.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700 block">
                  Biaya Kustom Tambahan:
                </span>
                {customCosts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 p-2"
                  >
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleUpdateCustomCost(item.id, 'name', e.target.value)
                      }
                      placeholder="Nama Biaya"
                      className="w-1/2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                    <div className="w-1/2">
                      <CurrencyInput
                        value={item.amount}
                        onChange={(val) =>
                          handleUpdateCustomCost(item.id, 'amount', val)
                        }
                        placeholder="0"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteCustomCost(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      title="Hapus biaya ini"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleAddCustomCost}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Komponen Biaya Baru</span>
            </button>
          </section>

          {/* BAGIAN 3: BIAYA PENJUALAN */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-xs font-bold text-emerald-700">
                  3
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Biaya Penjualan (Platform / Marketplace)
                </h2>
              </div>
              <span className="text-xs text-slate-400">Komisi & Admin</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Biaya Admin / Platform (%)
                  </label>
                  <span className="text-xs text-slate-400">
                    {platformFeePercent}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    step="0.5"
                    value={platformFeePercent === 0 ? '' : platformFeePercent}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setPlatformFeePercent(
                        isNaN(val) ? 0 : Math.min(99, Math.max(0, val))
                      );
                    }}
                    placeholder="0"
                    className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 tabular-nums pr-8"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 font-medium">
                    %
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Contoh: Shopee (~6.5%), Tokopedia (~4%), GoFood (~20%)
                </p>
              </div>

              <div>
                <CurrencyInput
                  label="Biaya Tambahan per Transaksi"
                  value={additionalFeePerTx}
                  onChange={setAdditionalFeePerTx}
                  placeholder="0"
                  helperText="Biaya penanganan, kardus luar, atau fee payment"
                />
              </div>
            </div>

            {/* Quick preset chips for Indonesian channels */}
            <div className="pt-2">
              <span className="text-xs font-medium text-slate-500 block mb-1.5">
                Pilih Cepat Persentase Marketplace:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Offline / WA (0%)', pct: 0 },
                  { label: 'Tokopedia (4%)', pct: 4 },
                  { label: 'Shopee (6.5%)', pct: 6.5 },
                  { label: 'TikTok Shop (8%)', pct: 8 },
                  { label: 'GoFood / GrabFood (20%)', pct: 20 },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setPlatformFeePercent(item.pct)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      platformFeePercent === item.pct
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* BAGIAN 4: TARGET KEUNTUNGAN */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-xs font-bold text-emerald-700">
                  4
                </span>
                <h2 className="text-sm font-bold text-slate-900">
                  Target Keuntungan (Profit Margin)
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-700 tabular-nums">
                {targetMarginPercent}%
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  value={targetMarginPercent}
                  onChange={(e) =>
                    setTargetMarginPercent(parseInt(e.target.value, 10))
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
                />
                <div className="relative w-24 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={targetMarginPercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setTargetMarginPercent(
                        isNaN(val) ? 0 : Math.min(90, Math.max(1, val))
                      );
                    }}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-right text-sm font-bold text-slate-900 tabular-nums pr-7 focus:border-emerald-600 focus:outline-hidden"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-xs text-slate-400 font-bold">
                    %
                  </span>
                </div>
              </div>

              {/* Quick industry suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-xs text-slate-400 mr-1 self-center">
                  Rekomendasi:
                </span>
                {[
                  { label: 'Grosir (15%)', val: 15 },
                  { label: 'Standar (30%)', val: 30 },
                  { label: 'Kuliner (40%)', val: 40 },
                  { label: 'Fashion / Kerajinan (50%)', val: 50 },
                ].map((sug) => (
                  <button
                    key={sug.label}
                    onClick={() => setTargetMarginPercent(sug.val)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      targetMarginPercent === sug.val
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sug.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RESULTS & PRICE TESTER COLUMN */}
        <div className="space-y-6 lg:col-span-5">
          {/* HASIL PERHITUNGAN CARD */}
          <section className="rounded-2xl border border-emerald-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Hasil Perhitungan HPP
                </h2>
                <p className="text-xs text-slate-500">
                  {quantity > 0
                    ? `Perhitungan untuk ${quantity} unit produk`
                    : 'Jumlah unit belum diisi'}
                </p>
              </div>

              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title="Salin rincian hasil perhitungan"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Salin</span>
              </button>
            </div>

            {results.errorMessage ? (
              <div className="rounded-xl bg-rose-50 p-4 text-xs text-rose-800 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>Periksa Input Perhitungan</span>
                </div>
                <p>{results.errorMessage}</p>
              </div>
            ) : (
              <>
                {/* Highlight: Recommended Selling Price */}
                <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800">
                      Harga Jual yang Disarankan
                    </span>
                    <span className="text-xs font-medium text-emerald-700">
                      Margin {targetMarginPercent}%
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tabular-nums">
                    {formatRupiah(results.recommendedSellingPrice)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-800 pt-1">
                    <span>
                      Pembulatan retail: {formatRupiah(roundToNearest(results.recommendedSellingPrice, 100))}
                    </span>
                    <button
                      onClick={syncWithRecommendedPrice}
                      className="font-semibold underline hover:text-emerald-950"
                    >
                      Uji di Simulator
                    </button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-0.5">
                    <span className="text-slate-500 block">Total Biaya Produksi</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatRupiah(results.totalProductionCost)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-0.5">
                    <span className="text-slate-500 block">HPP per Unit</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatRupiah(results.costPerUnit)}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-0.5">
                    <span className="text-slate-500 block">Harga Impas / BEP</span>
                    <span className="text-sm font-bold text-slate-800 tabular-nums">
                      {formatRupiah(results.breakEvenPrice)}
                    </span>
                    <span className="text-2xs text-slate-400 block">
                      Harga minimal agar tidak rugi
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-0.5">
                    <span className="text-slate-500 block">Keuntungan per Unit</span>
                    <span className="text-sm font-bold text-emerald-700 tabular-nums">
                      {formatRupiah(results.profitPerUnit)}
                    </span>
                    <span className="text-2xs text-slate-400 block">
                      Laba bersih setelah platform
                    </span>
                  </div>
                </div>

                {/* Batch Totals Summary */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Perkiraan Total Omzet:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formatRupiah(results.estimatedGrossRevenue)}
                    </span>
                  </div>
                  {platformFeePercent > 0 && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Potongan Platform ({platformFeePercent}%):</span>
                      <span className="tabular-nums">
                        - {formatRupiah(results.platformFeeAmountPerUnit * quantity)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 font-semibold text-emerald-800">
                    <span>Perkiraan Total Keuntungan:</span>
                    <span className="text-sm font-bold tabular-nums">
                      {formatRupiah(results.estimatedTotalProfit)}
                    </span>
                  </div>
                </div>

                {/* Save to History Button */}
                <button
                  onClick={handleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.99] transition-all"
                >
                  <BookmarkCheck className="h-4 w-4" />
                  <span>Simpan Perhitungan Ini</span>
                </button>
              </>
            )}
          </section>

          {/* FITUR: UJI HARGA JUAL (PRICE SIMULATOR) */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Uji Harga Jual
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Simulasikan harga jual pilihan Anda & cek profitabilitasnya
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {priceTestResult.status === 'profit' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Untung
                  </span>
                )}
                {priceTestResult.status === 'breakeven' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                    Impas (BEP)
                  </span>
                )}
                {priceTestResult.status === 'loss' && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 border border-rose-200">
                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    Rugi
                  </span>
                )}
              </div>
            </div>

            {/* Input Harga Jual Uji */}
            <CurrencyInput
              label="Masukkan Harga Jual yang Anda Inginkan"
              value={testedPrice}
              onChange={setTestedPrice}
              placeholder="6000"
              helperText="Harga jual ke pembeli sebelum potongan biaya"
            />

            {/* Warning Alert if Under Cost / Loss */}
            {priceTestResult.status === 'loss' && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-2 text-rose-900">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>Peringatan: Harga Jual Menyebabkan Kerugian!</span>
                </div>
                <p className="text-xs leading-relaxed text-rose-800">
                  Harga jual <strong>{formatRupiah(testedPrice)}</strong> berada di bawah total biaya modal per unit (HPP + Biaya Penjualan: <strong>{formatRupiah(priceTestResult.totalCostPerUnitWithSales)}</strong>).
                </p>
                <div className="pt-1 flex items-center justify-between text-xs font-semibold text-rose-900 border-t border-rose-200/60">
                  <span>Kerugian per Unit:</span>
                  <span className="tabular-nums font-bold">
                    - {formatRupiah(priceTestResult.lossAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
                  <span>Total Kerugian ({quantity} unit):</span>
                  <span className="tabular-nums font-bold">
                    - {formatRupiah(priceTestResult.lossAmount * quantity)}
                  </span>
                </div>
                <p className="text-xs text-rose-700 italic">
                  💡 Naikkan harga minimal ke <strong>{formatRupiah(results.breakEvenPrice)}</strong> untuk mencapai titik impas (BEP).
                </p>
              </div>
            )}

            {/* Breakeven notice */}
            {priceTestResult.status === 'breakeven' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-amber-600" />
                  <span>Titik Impas (BEP)</span>
                </div>
                <p>
                  Dengan harga ini, pendapatan Anda tepat menutupi seluruh HPP dan biaya platform tanpa laba dan tanpa rugi.
                </p>
              </div>
            )}

            {/* Real-time Calculation Breakdown of Tested Price */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>HPP per Unit:</span>
                <span className="font-medium text-slate-900 tabular-nums">
                  {formatRupiah(results.costPerUnit)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Potongan Biaya Platform:</span>
                <span className="font-medium text-slate-900 tabular-nums">
                  {formatRupiah(priceTestResult.platformFeeAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Pendapatan Bersih Diterima:</span>
                <span className="font-medium text-slate-900 tabular-nums">
                  {formatRupiah(priceTestResult.netRevenuePerUnit)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-bold">
                <span className={priceTestResult.status === 'loss' ? 'text-rose-700' : 'text-slate-800'}>
                  Keuntungan per Unit:
                </span>
                <span
                  className={`text-sm tabular-nums ${
                    priceTestResult.status === 'loss'
                      ? 'text-rose-600'
                      : priceTestResult.status === 'profit'
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {formatRupiah(priceTestResult.profitPerUnit)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Margin Keuntungan Aktual:</span>
                <span
                  className={`font-semibold tabular-nums ${
                    priceTestResult.status === 'loss'
                      ? 'text-rose-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {formatPercent(priceTestResult.marginPercent)}
                </span>
              </div>

              <div className="flex items-center justify-between font-bold text-slate-900 pt-1 border-t border-slate-200/60">
                <span>Total Estimasi Keuntungan ({quantity} unit):</span>
                <span
                  className={`text-sm tabular-nums ${
                    priceTestResult.status === 'loss'
                      ? 'text-rose-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {formatRupiah(priceTestResult.totalProfit)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* AI Estimation Modal */}
      <AIEstimationModal
        isOpen={isAIModalOpen}
        onClose={handleCloseAIModal}
        onApplyEstimation={handleApplyAIEstimation}
        initialProductName={productName}
        initialQuantity={quantity}
      />
    </div>
  );
};

