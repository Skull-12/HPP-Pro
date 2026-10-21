import React from 'react';
import { Calculator, History, LayoutDashboard, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'calculator' | 'history';
  onSelectTab: (tab: 'dashboard' | 'calculator' | 'history') => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="group flex items-center gap-2.5 text-left focus:outline-hidden"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
              <Calculator className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              HPP <span className="text-emerald-600 font-extrabold">Pro</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line text) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-2 rounded-lg px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onSelectTab('calculator')}
            className={`flex items-center gap-2 rounded-lg px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'calculator'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span>Kalkulator HPP</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-2 rounded-lg px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'history'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Riwayat</span>
            {savedCount > 0 && (
              <span className="text-xs font-semibold tabular-nums text-emerald-700 ml-0.5">
                ({savedCount})
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('calculator')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Hitung Baru</span>
          </button>
        </div>
      </div>
    </header>
  );
};
