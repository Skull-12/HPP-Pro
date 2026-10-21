import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronRight,
  Download,
  FolderOpen,
  History,
  Package,
  PlusCircle,
  Search,
  Trash2,
} from 'lucide-react';
import { SavedCalculation } from '../types/calculator';
import { formatPercent, formatRupiah } from '../utils/calculator';
import { exportCalculationsToCSV } from '../utils/storage';

interface HistoryViewProps {
  calculations: SavedCalculation[];
  onOpenCalculation: (calc: SavedCalculation) => void;
  onDeleteCalculation: (id: string) => void;
  onClearAll: () => void;
  onNewCalculation: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  calculations,
  onOpenCalculation,
  onDeleteCalculation,
  onClearAll,
  onNewCalculation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter calculations based on search query
  const filteredCalculations = useMemo(() => {
    if (!searchQuery.trim()) return calculations;
    const query = searchQuery.toLowerCase();
    return calculations.filter((item) =>
      item.inputs.product.name.toLowerCase().includes(query)
    );
  }, [calculations, searchQuery]);

  return (
    <div className="py-6 sm:py-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Riwayat Perhitungan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar perhitungan HPP dan simulasi harga yang tersimpan aman pada akun Anda (dilindungi Supabase RLS).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {calculations.length > 0 && (
            <>
              <button
                onClick={() => exportCalculationsToCSV(calculations)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                title="Unduh seluruh riwayat sebagai file spreadsheet CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh CSV</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 shadow-2xs hover:bg-rose-50 hover:border-rose-200 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Hapus Semua</span>
              </button>
            </>
          )}

          <button
            onClick={onNewCalculation}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Hitung Baru</span>
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Clear All */}
      {showClearConfirm && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-3">
          <p className="text-xs font-bold text-rose-900">
            Apakah Anda yakin ingin menghapus seluruh riwayat ({calculations.length} data)?
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClearAll();
                setShowClearConfirm(false);
              }}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Ya, Hapus Semua
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Search Input */}
      {calculations.length > 0 && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama produk..."
            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      )}

      {/* Empty State */}
      {calculations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
            <History className="h-6 w-6" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-sm font-bold text-slate-900">
              Belum Ada Riwayat Perhitungan
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              Perhitungan yang Anda simpan akan muncul di sini agar mudah dibuka dan diedit kembali kapan saja.
            </p>
          </div>
          <button
            onClick={onNewCalculation}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <span>Mulai Hitung Produk Pertama</span>
          </button>
        </div>
      ) : filteredCalculations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          Tidak ditemukan perhitungan dengan nama "{searchQuery}".
        </div>
      ) : (
        /* History Cards List */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCalculations.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {item.inputs.product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-2xs text-slate-400 pt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>·</span>
                      <span className="font-medium text-slate-600">
                        {item.inputs.product.quantity} unit
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteCalculation(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Hapus dari riwayat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2 space-y-0.5">
                    <span className="text-slate-400 text-2xs block">HPP / Unit</span>
                    <span className="font-bold text-slate-800 tabular-nums">
                      {formatRupiah(item.results.costPerUnit)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-emerald-50/70 p-2 space-y-0.5">
                    <span className="text-emerald-700 text-2xs block">Harga Jual Disarankan</span>
                    <span className="font-bold text-emerald-900 tabular-nums">
                      {formatRupiah(item.results.recommendedSellingPrice)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2 space-y-0.5">
                    <span className="text-slate-400 text-2xs block">BEP / Impas</span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {formatRupiah(item.results.breakEvenPrice)}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2 space-y-0.5">
                    <span className="text-slate-400 text-2xs block">Laba / Unit</span>
                    <span className="font-semibold text-emerald-700 tabular-nums">
                      {formatRupiah(item.results.profitPerUnit)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 pt-1 flex items-center justify-between">
                  <span>Margin: <strong>{formatPercent(item.results.actualMarginPercent)}</strong></span>
                  <span>Est. Total Laba: <strong className="text-emerald-700 font-bold">{formatRupiah(item.results.estimatedTotalProfit)}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => onOpenCalculation(item)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  <span>Buka di Kalkulator</span>
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
