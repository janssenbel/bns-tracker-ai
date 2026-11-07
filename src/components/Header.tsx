import React from 'react';
import { Car, CheckCircle2, DollarSign, Download, Users, WifiOff } from 'lucide-react';
import { CURRENCIES } from '../types';

interface HeaderProps {
  currency: string;
  onCurrencyChange: (c: string) => void;
  totalCars: number;
  onOpenGlobalSummary: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  totalCars,
  onOpenGlobalSummary,
  onExportData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
            <Car className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                AutoBuy & Sell
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700 uppercase tracking-wider">
                Car Traders
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              Unit Profit · Turnover Days · Partner Split (Janssen & Ralph)
            </p>
          </div>
        </div>

        {/* Center / Right Zone */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Offline Ready Badge */}
          <div
            title="All vehicle logs & expense calculations are saved locally in your browser and work 100% offline."
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline Storage</span>
          </div>

          {/* Currency Selector */}
          <div className="relative">
            <select
              aria-label="Select currency"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="appearance-none bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 pr-7 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol} {c.label.split(' ')[1] || ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
              <DollarSign className="w-3 h-3" />
            </div>
          </div>

          {/* Partner Ledger Summary Button */}
          <button
            onClick={onOpenGlobalSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm hover:shadow"
            title="View overall summary of all expenses covered by Janssen and Ralph"
          >
            <Users className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">Partner Ledger</span>
            <span className="md:hidden">Partners</span>
            <span className="ml-1 px-1.5 py-0.2 bg-indigo-900/80 rounded text-[10px] text-indigo-200">
              {totalCars}
            </span>
          </button>

          {/* Quick Export Button */}
          <button
            onClick={onExportData}
            title="Export / Backup Records as JSON or CSV"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Backup</span>
          </button>
        </div>
      </div>
    </header>
  );
};
