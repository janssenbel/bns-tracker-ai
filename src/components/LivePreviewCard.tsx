import React from 'react';
import { Calendar, Clock, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { ExpenseItem, Payer, TurnoverCalculation } from '../types';
import { formatCurrency } from '../utils/calculations';

interface LivePreviewCardProps {
  year: string;
  make: string;
  model: string;
  plateNumber: string;
  buyPrice: number;
  buyPayer: Payer;
  sellPrice: number;
  expenses: ExpenseItem[];
  totalCapital: number;
  netProfit: number;
  profitMargin: number;
  roiMarkup: number;
  turnover: TurnoverCalculation;
  currency: string;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({
  year,
  make,
  model,
  plateNumber,
  buyPrice,
  buyPayer,
  sellPrice,
  expenses,
  totalCapital,
  netProfit,
  profitMargin,
  roiMarkup,
  turnover,
  currency,
}) => {
  const vehicleTitle = [year, make, model].filter(Boolean).join(' ') || 'Select / Enter Vehicle';
  const cleanPlate = (plateNumber || '').trim().toUpperCase() || 'NO PLATE';

  // Profit Status Styling
  let statusBadge: {
    text: string;
    bg: string;
    colorClass: string;
    icon: React.ReactNode;
  } = {
    text: 'Pending',
    bg: 'bg-slate-800 text-slate-400 border-slate-700',
    colorClass: 'text-slate-100',
    icon: null,
  };

  if (sellPrice === 0 && buyPrice === 0 && totalCapital === 0) {
    statusBadge = {
      text: 'Pending',
      bg: 'bg-slate-800 text-slate-400 border-slate-700',
      colorClass: 'text-slate-300',
      icon: null,
    };
  } else if (netProfit > 0) {
    statusBadge = {
      text: 'Profitable Deal',
      bg: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60',
      colorClass: 'text-emerald-400',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    };
  } else if (netProfit < 0) {
    statusBadge = {
      text: 'Net Loss',
      bg: 'bg-rose-950/70 text-rose-400 border-rose-800/60',
      colorClass: 'text-rose-400',
      icon: <TrendingDown className="w-3.5 h-3.5" />,
    };
  } else {
    statusBadge = {
      text: 'Break-Even',
      bg: 'bg-amber-950/70 text-amber-400 border-amber-800/60',
      colorClass: 'text-amber-400',
      icon: null,
    };
  }

  const validExpenses = expenses.filter((e) => (e.amount || 0) > 0);

  return (
    <div className="space-y-4">
      {/* Unit Identification Header Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
          <span className="uppercase tracking-wider text-[10px] text-slate-400">Unit Preview</span>
          <span className="bg-yellow-400 text-slate-950 font-mono font-extrabold px-2.5 py-0.5 rounded border border-yellow-300 tracking-wider text-xs shadow-xs">
            {cleanPlate}
          </span>
        </div>
        <h3 className="text-lg font-extrabold text-white truncate tracking-tight" title={vehicleTitle}>
          {vehicleTitle}
        </h3>
        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            {turnover.totalDays !== null ? (
              <strong className={turnover.status === 'Sold' ? 'text-blue-300' : 'text-amber-300'}>
                {turnover.formattedText}
              </strong>
            ) : (
              <span>Turnover: No date</span>
            )}
          </span>
        </div>
      </div>

      {/* Net Profit Card */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
            Net Profit per Unit
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.bg}`}
          >
            {statusBadge.icon}
            {statusBadge.text}
          </span>
        </div>

        <div className={`text-3xl sm:text-4xl font-black font-mono tracking-tight mt-1 mb-4 ${statusBadge.colorClass}`}>
          {formatCurrency(netProfit, currency)}
        </div>

        {/* 3 Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center font-mono">
          <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-750">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Margin</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-200">
              {profitMargin.toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-750">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">ROI (Markup)</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-200">
              {roiMarkup.toFixed(1)}%
            </span>
          </div>

          <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-750">
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Turnover</span>
            <span className="text-xs sm:text-sm font-extrabold text-blue-400 truncate">
              {turnover.totalDays !== null ? `${turnover.totalDays}d` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Live Expense Breakdown */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Unit Cost Breakdown
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            {validExpenses.length} item{validExpenses.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Acquisition Price Row */}
        <div className="flex items-center justify-between text-xs py-1">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-semibold">Acquisition Price:</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                buyPayer === 'Janssen'
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                  : buyPayer === 'Ralph'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  : 'bg-teal-950/80 text-teal-300 border border-teal-800/60'
              }`}
            >
              {buyPayer}
            </span>
          </div>
          <span className="font-mono font-bold text-slate-200">
            {formatCurrency(buyPrice, currency)}
          </span>
        </div>

        {/* Dynamic Expenses List */}
        <div className="space-y-1.5 pt-1 border-t border-dashed border-slate-800 max-h-48 overflow-y-auto pr-1">
          {validExpenses.length > 0 ? (
            validExpenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-xs text-slate-400 py-0.5">
                <div className="flex items-center gap-1.5 truncate max-w-[210px] sm:max-w-[260px]">
                  <span className="truncate" title={e.name}>
                    {e.name}
                  </span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-bold shrink-0 ${
                      e.payer === 'Janssen'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                        : e.payer === 'Ralph'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                        : 'bg-teal-950 text-teal-300 border border-teal-800/50'
                    }`}
                  >
                    {e.payer}
                  </span>
                </div>
                <span className="font-mono text-slate-300 shrink-0">
                  {formatCurrency(e.amount, currency)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-slate-500 italic py-1">
              No additional reconditioning expenses added yet.
            </div>
          )}
        </div>

        {/* Total Capital Outlay */}
        <div className="pt-2 border-t-2 border-slate-800 flex justify-between items-center text-xs">
          <span className="font-extrabold text-slate-200 uppercase tracking-tight">
            Total Capital Outlay:
          </span>
          <span className="font-mono font-black text-rose-400 text-sm">
            {formatCurrency(totalCapital, currency)}
          </span>
        </div>

        {/* Selling Price */}
        <div className="flex justify-between items-center text-xs text-slate-300 pt-1">
          <span className="font-semibold">Selling / Target Price:</span>
          <span className="font-mono font-extrabold text-emerald-400 text-sm">
            {formatCurrency(sellPrice, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};
