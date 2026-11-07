import React, { useState } from 'react';
import { ArrowRightLeft, Check, ShieldCheck, UserCheck, Users, Wallet } from 'lucide-react';
import { PartnerExpenseSummary } from '../types';
import { formatCurrency } from '../utils/calculations';

interface PartnerSummaryCardProps {
  summary: PartnerExpenseSummary;
  currency: string;
  unitTitle?: string;
  unitPlate?: string;
}

export const PartnerSummaryCard: React.FC<PartnerSummaryCardProps> = ({
  summary,
  currency,
  unitTitle = 'Current Vehicle',
  unitPlate,
}) => {
  const [viewMode, setViewMode] = useState<'expenses' | 'capital'>('expenses');

  const janssenAmt = viewMode === 'expenses' ? summary.janssenExpenses : summary.janssenTotalCapital;
  const ralphAmt = viewMode === 'expenses' ? summary.ralphExpenses : summary.ralphTotalCapital;
  const totalAmt = viewMode === 'expenses' ? summary.totalExpenses : summary.totalCapital;

  const diff = janssenAmt - ralphAmt;
  const halfDiff = Math.abs(diff) / 2;

  const janssenPct = totalAmt > 0 ? (janssenAmt / totalAmt) * 100 : 50;
  const ralphPct = totalAmt > 0 ? (ralphAmt / totalAmt) * 100 : 50;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              Partner Outlay Summary
              {unitPlate && (
                <span className="font-mono text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {unitPlate}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Expenses covered by Janssen & Ralph
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode('expenses')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              viewMode === 'expenses'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expenses Only
          </button>
          <button
            type="button"
            onClick={() => setViewMode('capital')}
            className={`px-2.5 py-1 rounded-md font-semibold transition ${
              viewMode === 'capital'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Total Capital
          </button>
        </div>
      </div>

      {/* Partner Comparison Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Janssen */}
        <div className="bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-900/50 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-indigo-400" /> Janssen
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {janssenPct.toFixed(0)}%
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-indigo-200 tracking-tight">
            {formatCurrency(janssenAmt, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {viewMode === 'expenses' ? (
              <span>Reconditioning expenses covered</span>
            ) : (
              <span>Buy cost share + reconditioning</span>
            )}
          </div>
        </div>

        {/* Ralph */}
        <div className="bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-900/50 rounded-xl p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-amber-400" /> Ralph
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {ralphPct.toFixed(0)}%
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-200 tracking-tight">
            {formatCurrency(ralphAmt, currency)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {viewMode === 'expenses' ? (
              <span>Reconditioning expenses covered</span>
            ) : (
              <span>Buy cost share + reconditioning</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar of Contribution */}
      <div className="mb-4">
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${janssenPct}%` }}
            className="bg-indigo-500 h-full transition-all duration-300"
            title={`Janssen: ${janssenPct.toFixed(1)}%`}
          />
          <div
            style={{ width: `${ralphPct}%` }}
            className="bg-amber-500 h-full transition-all duration-300"
            title={`Ralph: ${ralphPct.toFixed(1)}%`}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
          <span>Janssen: {formatCurrency(janssenAmt, currency)}</span>
          <span>Total: {formatCurrency(totalAmt, currency)}</span>
          <span>Ralph: {formatCurrency(ralphAmt, currency)}</span>
        </div>
      </div>

      {/* Equalization Insight / Settlement */}
      <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-slate-200">
              {Math.abs(diff) < 1 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Balanced 50/50 Outlay — Both contributed equally!
                </span>
              ) : diff > 0 ? (
                <span>
                  <strong className="text-indigo-400">Janssen</strong> paid{' '}
                  <strong className="text-white">{formatCurrency(diff, currency)}</strong> more{' '}
                  {viewMode === 'expenses' ? 'in expenses' : 'in total capital'}.
                </span>
              ) : (
                <span>
                  <strong className="text-amber-400">Ralph</strong> paid{' '}
                  <strong className="text-white">{formatCurrency(Math.abs(diff), currency)}</strong> more{' '}
                  {viewMode === 'expenses' ? 'in expenses' : 'in total capital'}.
                </span>
              )}
            </span>

            {Math.abs(diff) >= 1 && (
              <p className="text-[11px] text-slate-400 leading-relaxed">
                To equalize 50/50:{' '}
                {diff > 0 ? (
                  <>
                    <strong className="text-amber-300">Ralph</strong> reimburses{' '}
                    <strong className="text-indigo-300 font-mono">Janssen {formatCurrency(halfDiff, currency)}</strong>,
                    or Janssen claims +{formatCurrency(halfDiff, currency)} from the sales payout before the remaining profit split.
                  </>
                ) : (
                  <>
                    <strong className="text-indigo-300">Janssen</strong> reimburses{' '}
                    <strong className="text-amber-300 font-mono">Ralph {formatCurrency(halfDiff, currency)}</strong>,
                    or Ralph claims +{formatCurrency(halfDiff, currency)} from the sales payout before the remaining profit split.
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Payout Distribution Simulation (when vehicle sells) */}
      {summary.netProfit !== 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Sale Payout Distribution (Outlay Back + 50% Profit):
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="bg-slate-800/60 p-2 rounded-lg border border-indigo-900/40">
              <span className="block text-[10px] text-indigo-300">Janssen Payout</span>
              <span className="font-bold text-white text-xs">
                {formatCurrency(summary.janssenPayout, currency)}
              </span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-amber-900/40">
              <span className="block text-[10px] text-amber-300">Ralph Payout</span>
              <span className="font-bold text-white text-xs">
                {formatCurrency(summary.ralphPayout, currency)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
