import React from 'react';
import {
  ArrowRight,
  Bot,
  TrendingUp,
  Percent,
  Sparkles,
  History,
  Info,
  DollarSign,
  Package,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { CalculationInputs, SavedCalculation } from '../types/calculator';
import { formatRupiah, formatPercent, INDUSTRY_PRESETS } from '../utils/calculator';
import { Calculator } from 'lucide-react';

interface DashboardViewProps {
  onStartCalculating: () => void;
  onOpenAIEstimation?: () => void;
  onLoadPreset: (preset: CalculationInputs) => void;
  savedCalculations: SavedCalculation[];
  onOpenHistory: () => void;
  onSelectCalculation: (calc: SavedCalculation) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartCalculating,
  onOpenAIEstimation,
  onLoadPreset,
  savedCalculations,
  onOpenHistory,
  onSelectCalculation,
}) => {
  const promptExample = INDUSTRY_PRESETS[0];

  return (
    <div className="space-y-10 py-6 sm:py-8">
      {/* Hero Welcome Card */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">
            Platform Keuangan UMKM Indonesia
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 text-balance">
            Selamat datang di HPP Pro
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl text-pretty">
            Hitung biaya produk, tentukan harga jual, dan ketahui keuntungan usaha Anda.
            Bebas rumus rumit, akurat, dan dirancang khusus untuk pengusaha UMKM, penjual online, dan pemula.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartCalculating}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm sm:text-base font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <Calculator className="h-4 w-4" />
              <span>Mulai Menghitung</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {onOpenAIEstimation && (
              <button
                onClick={onOpenAIEstimation}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50/90 px-4 py-3.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition-colors whitespace-nowrap shadow-2xs"
              >
                <Bot className="h-4 w-4 text-emerald-700" />
                <span>🤖 Buat Estimasi dengan AI</span>
              </button>
            )}

            <button
              onClick={() => onLoadPreset(promptExample.data)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Coba Contoh: Keripik Singkong</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle background shape */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl"
        />
      </section>

      {/* Quick Summary Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rumus HPP per Unit
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-lg font-bold text-slate-900">
            Total Biaya ÷ Jumlah Produk
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-normal">
            Termasuk bahan baku, kemasan, tenaga kerja, transportasi, dan operasional lainnya.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Proteksi Potongan Platform
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-lg font-bold text-slate-900">
            Biaya Admin & Transaksi
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-normal">
            Kalkulator otomatis menghitung potongan marketplace (Shopee, Tokopedia, GoFood) agar margin tidak tergerus.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Simulator Bebas Boncos
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-lg font-bold text-slate-900">
            Fitur Uji Harga Jual
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-normal">
            Cek langsung apakah harga keinginan Anda menghasilkan untung, impas, atau justru rugi secara real-time.
          </p>
        </div>
      </section>

      {/* Preset Cepat untuk Berbagai Usaha UMKM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pilih Contoh Usaha Siap Pakai
            </h2>
            <p className="text-xs text-slate-500">
              Klik salah satu template di bawah untuk langsung mencoba perhitungan di kalkulator
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRY_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold text-emerald-700">
                  {preset.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                  {preset.name}
                </h3>
                <div className="text-xs text-slate-500 space-y-1 pt-1">
                  <div className="flex justify-between">
                    <span>Target Batch:</span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {preset.data.product.quantity} unit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Margin:</span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {preset.data.targetMarginPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onLoadPreset(preset.data)}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors"
              >
                <span>Gunakan Data Ini</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Riwayat Terakhir (Jika ada) */}
      {savedCalculations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Riwayat Perhitungan Terakhir
              </h2>
              <p className="text-xs text-slate-500">
                Tersimpan aman di peramban Anda (localStorage)
              </p>
            </div>
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <span>Lihat Semua ({savedCalculations.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedCalculations.slice(0, 3).map((calc) => (
              <div
                key={calc.id}
                onClick={() => onSelectCalculation(calc)}
                className="group cursor-pointer rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">
                    {calc.inputs.product.name}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {new Date(calc.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">HPP / Unit:</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {formatRupiah(calc.results.costPerUnit)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Harga Jual:</span>
                    <span className="font-semibold text-emerald-700 tabular-nums">
                      {formatRupiah(calc.results.recommendedSellingPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Margin:</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {formatPercent(calc.results.actualMarginPercent)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Untung:</span>
                    <span className="font-semibold text-emerald-700 tabular-nums">
                      {formatRupiah(calc.results.estimatedTotalProfit)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Buka di Kalkulator</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Edukasi & Panduan Singkat UMKM */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Panduan Menentukan Harga Jual yang Menguntungkan
          </h2>
          <p className="text-xs text-slate-500">
            Kunci sukses usaha agar tidak terjebak perang harga dan tetap memiliki arus kas sehat
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Jangan Lupakan Biaya Tersembunyi
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Banyak pemula hanya menghitung bahan baku. Selalu masukkan biaya kemasan, stiker, gas/listrik, ongkos kirim bahan, dan upah kerja Anda sendiri ke dalam HPP.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Pahami Perbedaan Margin vs Markup
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Markup</strong> dihitung dari harga modal (HPP). <strong>Margin</strong> dihitung dari harga jual akhir. Margin 30% berarti dari setiap Rp 10.000 harga jual, Rp 3.000 adalah laba bersih Anda.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Ketahui Titik Impas (BEP)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              BEP adalah harga jual minimal agar modal balik tanpa rugi setelah dipotong komisi marketplace. Jangan pernah memberi diskon di bawah harga BEP ini!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
