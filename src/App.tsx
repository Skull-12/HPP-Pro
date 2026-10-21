import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CalculatorView } from './components/CalculatorView';
import { HistoryView } from './components/HistoryView';
import { CalculationInputs, CalculationResults, SavedCalculation } from './types/calculator';
import {
  getSavedCalculations,
  saveCalculation,
  deleteCalculation,
  clearAllCalculations,
} from './utils/storage';
import { PROMPT_EXAMPLE_PRESET } from './utils/calculator';
import { HelpCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'calculator' | 'history'>('dashboard');
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [activeCalculatorData, setActiveCalculatorData] = useState<CalculationInputs>(PROMPT_EXAMPLE_PRESET);
  const [showGlossaryModal, setShowGlossaryModal] = useState<boolean>(false);
  const [openAIModalInCalculator, setOpenAIModalInCalculator] = useState<boolean>(false);

  // Initialize saved calculations from localStorage
  useEffect(() => {
    const loaded = getSavedCalculations();
    setSavedCalculations(loaded);
  }, []);

  const handleStartCalculating = () => {
    setCurrentTab('calculator');
  };

  const handleOpenAIEstimation = () => {
    setOpenAIModalInCalculator(true);
    setCurrentTab('calculator');
  };

  const handleLoadPreset = (preset: CalculationInputs) => {
    setActiveCalculatorData(preset);
    setCurrentTab('calculator');
  };

  const handleSaveCalculation = (
    inputs: CalculationInputs,
    results: CalculationResults
  ) => {
    const saved = saveCalculation({
      inputs,
      results,
    });
    setSavedCalculations([saved, ...savedCalculations.filter((c) => c.id !== saved.id)]);
  };

  const handleDeleteCalculation = (id: string) => {
    const updated = deleteCalculation(id);
    setSavedCalculations(updated);
  };

  const handleClearAllCalculations = () => {
    clearAllCalculations();
    setSavedCalculations([]);
  };

  const handleOpenCalculationFromHistory = (calc: SavedCalculation) => {
    setActiveCalculatorData(calc.inputs);
    setCurrentTab('calculator');
  };

  const handleNewCalculation = () => {
    setActiveCalculatorData({
      product: { name: '', quantity: 1 },
      productionCosts: {
        rawMaterial: 0,
        packaging: 0,
        labor: 0,
        transport: 0,
        other: 0,
        customItems: [],
      },
      salesCosts: { platformFeePercent: 0, additionalFeePerTx: 0 },
      targetMarginPercent: 30,
      testedPrice: 0,
    });
    setCurrentTab('calculator');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        savedCount={savedCalculations.length}
      />

      {/* Main Content Area - Direct Instant Access */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onStartCalculating={handleStartCalculating}
            onOpenAIEstimation={handleOpenAIEstimation}
            onLoadPreset={handleLoadPreset}
            savedCalculations={savedCalculations}
            onOpenHistory={() => setCurrentTab('history')}
            onSelectCalculation={handleOpenCalculationFromHistory}
          />
        )}

        {currentTab === 'calculator' && (
          <CalculatorView
            initialData={activeCalculatorData}
            onSaveCalculation={handleSaveCalculation}
            onViewHistory={() => setCurrentTab('history')}
            openAIModal={openAIModalInCalculator}
            onCloseAIModal={() => setOpenAIModalInCalculator(false)}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            calculations={savedCalculations}
            onOpenCalculation={handleOpenCalculationFromHistory}
            onDeleteCalculation={handleDeleteCalculation}
            onClearAll={handleClearAllCalculations}
            onNewCalculation={handleNewCalculation}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">HPP Pro</span>
            <span>·</span>
            <span>Kalkulator HPP & Keuntungan Usaha untuk UMKM Indonesia</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGlossaryModal(true)}
              className="hover:text-emerald-700 flex items-center gap-1 font-medium transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Kamus Istilah HPP</span>
            </button>
            <span>·</span>
            <div className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Privasi Terjaga (Lokal di Browser)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Kamus Istilah Modal */}
      {showGlossaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Kamus Singkat Istilah Usaha
              </h3>
              <button
                onClick={() => setShowGlossaryModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <strong className="text-slate-900 block font-semibold text-sm">
                  1. HPP (Harga Pokok Penjualan)
                </strong>
                Total seluruh biaya langsung yang dikeluarkan untuk memproduksi atau menyediakan satu unit produk siap jual.
              </div>

              <div>
                <strong className="text-slate-900 block font-semibold text-sm">
                  2. Margin Keuntungan (Profit Margin)
                </strong>
                Persentase keuntungan bersih yang dihitung dari <em>harga jual akhir</em>. Contoh: Harga Rp 10.000, laba Rp 3.000, maka Margin = 30%.
              </div>

              <div>
                <strong className="text-slate-900 block font-semibold text-sm">
                  3. Markup
                </strong>
                Persentase penambahan laba yang dihitung dari <em>harga modal (HPP)</em>. Contoh: Modal Rp 7.000, laba Rp 3.000, maka Markup = ~42,8%.
              </div>

              <div>
                <strong className="text-slate-900 block font-semibold text-sm">
                  4. BEP (Break-Even Price / Titik Impas)
                </strong>
                Harga jual terendah di mana bisnis tidak mendapatkan untung dan tidak menderita kerugian setelah memperhitungkan seluruh biaya produksi dan potongan platform.
              </div>

              <div>
                <strong className="text-slate-900 block font-semibold text-sm">
                  5. Biaya Penjualan / Platform
                </strong>
                Potongan komisi persentase marketplace (Shopee, Tokopedia, TikTok Shop, GoFood) serta biaya tetap per pesanan (packing, payment fee).
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowGlossaryModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
