import React, { useRef } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { VehicleRecord } from '../types';
import { computeGlobalPartnerSummary, formatCurrency } from '../utils/calculations';

interface GlobalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: VehicleRecord[];
  currency: string;
  onImportRecords: (records: VehicleRecord[]) => void;
}

export const GlobalSummaryModal: React.FC<GlobalSummaryModalProps> = ({
  isOpen,
  onClose,
  records,
  currency,
  onImportRecords,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const globalFin = computeGlobalPartnerSummary(records);
  const diff = globalFin.settlementDifference;
  const halfDiff = Math.abs(diff) / 2;

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `autobuy_sell_inventory_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Plate',
      'Year',
      'Make',
      'Model',
      'Date Bought',
      'Date Sold',
      'Buy Price',
      'Buy Payer',
      'Total Expenses',
      'Total Capital',
      'Sell Price',
      'Net Profit',
    ];

    const rows = records.map((r) => {
      const expensesSum = r.expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      const totalCapital = (r.buyPrice || 0) + expensesSum;
      const profit = (r.sellPrice || 0) - totalCapital;
      return [
        `"${r.plateNumber}"`,
        r.year,
        `"${r.make}"`,
        `"${r.model}"`,
        r.dateBought || '',
        r.dateSold || '',
        r.buyPrice,
        r.buyPayer,
        expensesSum,
        totalCapital,
        r.sellPrice,
        profit,
      ].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `autobuy_sell_records_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Import JSON Backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportRecords(parsed);
          alert(`Successfully imported ${parsed.length} vehicle records!`);
          onClose();
        } else {
          alert('Invalid file format. Expected a JSON array of vehicle records.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Partnership Ledger: Janssen & Ralph
              </h3>
              <p className="text-xs text-slate-400">
                Grand summary across all {globalFin.totalCars} registered vehicles ({globalFin.totalSold} sold, {globalFin.totalInStock} in stock)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reconditioning Expenses Summary (Direct Answer to User Request) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Reconditioning Expenses Covered
            </h4>
            <span className="text-xs font-mono text-slate-400">
              Combined: {formatCurrency(globalFin.totalExpenses, currency)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-b from-indigo-950/50 to-slate-900 border border-indigo-900/60 rounded-xl p-4">
              <span className="text-xs font-bold uppercase text-indigo-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Janssen Expenses
              </span>
              <div className="text-2xl font-black font-mono text-indigo-200 mt-1">
                {formatCurrency(globalFin.janssenTotalExpenses, currency)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Direct expenses + 50% of shared costs
              </p>
            </div>

            <div className="bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-900/60 rounded-xl p-4">
              <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Ralph Expenses
              </span>
              <div className="text-2xl font-black font-mono text-amber-200 mt-1">
                {formatCurrency(globalFin.ralphTotalExpenses, currency)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Direct expenses + 50% of shared costs
              </p>
            </div>
          </div>
        </div>

        {/* Total Capital Outlay Summary (Acquisitions + Expenses) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Total Capital Investment (Vehicles + Expenses)
            </h4>
            <span className="text-xs font-mono text-slate-400">
              Total Capital: {formatCurrency(globalFin.totalCapital, currency)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-750">
              <span className="text-[11px] text-slate-400 uppercase font-sans font-bold block">
                Janssen Total Capital
              </span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(globalFin.janssenTotalCapital, currency)}
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-750">
              <span className="text-[11px] text-slate-400 uppercase font-sans font-bold block">
                Ralph Total Capital
              </span>
              <span className="text-lg font-bold text-white">
                {formatCurrency(globalFin.ralphTotalCapital, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Net Settlement / Equalization Box */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <ArrowRightLeft className="w-4 h-4 text-blue-400" />
            <span>Equalization Settlement</span>
          </div>

          {Math.abs(diff) < 1 ? (
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Expenses are exactly 50/50 balanced between Janssen and Ralph.
            </div>
          ) : (
            <div className="space-y-1.5 leading-relaxed text-slate-300">
              <p>
                Cumulative expense disparity:{' '}
                {diff > 0 ? (
                  <span>
                    <strong className="text-indigo-400">Janssen</strong> has paid{' '}
                    <strong className="text-white font-mono">{formatCurrency(diff, currency)}</strong> more in reconditioning expenses than Ralph.
                  </span>
                ) : (
                  <span>
                    <strong className="text-amber-400">Ralph</strong> has paid{' '}
                    <strong className="text-white font-mono">{formatCurrency(Math.abs(diff), currency)}</strong> more in reconditioning expenses than Janssen.
                  </span>
                )}
              </p>
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-750 font-mono text-slate-200">
                To balance out 50/50:{' '}
                {diff > 0 ? (
                  <span className="text-amber-300 font-bold">
                    Ralph pays Janssen {formatCurrency(halfDiff, currency)}
                  </span>
                ) : (
                  <span className="text-indigo-300 font-bold">
                    Janssen pays Ralph {formatCurrency(halfDiff, currency)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Total Profits and Sales Performance */}
        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300 font-semibold">
            <span>Total Gross Sales (Revenue):</span>
            <span className="font-mono font-bold text-white">
              {formatCurrency(globalFin.totalGrossSales, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-300 font-semibold border-t border-slate-800 pt-2">
            <span>Cumulative Net Profit:</span>
            <span
              className={`font-mono font-black text-sm ${
                globalFin.totalNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(globalFin.totalNetProfit, currency)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
            <div className="bg-slate-900 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block font-sans">Janssen Profit Share (50%)</span>
              <span className="font-bold text-emerald-300">
                {formatCurrency(globalFin.janssenTotalProfit, currency)}
              </span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block font-sans">Ralph Profit Share (50%)</span>
              <span className="font-bold text-emerald-300">
                {formatCurrency(globalFin.ralphTotalProfit, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Offline Backup & Portability Actions */}
        <div className="border-t border-slate-800 pt-4 flex flex-wrap gap-2 justify-between items-center text-xs">
          <div className="flex gap-2">
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              Download JSON Backup
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              Export CSV
            </button>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-800 font-semibold transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore JSON Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
