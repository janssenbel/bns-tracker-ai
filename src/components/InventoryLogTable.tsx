import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  FileText,
  Filter,
  Search,
  Trash2,
  UserCheck,
  Users,
} from 'lucide-react';
import { VehicleRecord } from '../types';
import {
  calculateTurnoverDays,
  computeVehicleFinancials,
  formatCurrency,
} from '../utils/calculations';

interface InventoryLogTableProps {
  records: VehicleRecord[];
  onEditRecord: (record: VehicleRecord) => void;
  onDeleteRecord: (id: string, plate: string) => void;
  onClearAll: () => void;
  currency: string;
}

export const InventoryLogTable: React.FC<InventoryLogTableProps> = ({
  records,
  onEditRecord,
  onDeleteRecord,
  onClearAll,
  currency,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'sold'>('all');

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredRecords = records.filter((r) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      r.make.toLowerCase().includes(query) ||
      r.model.toLowerCase().includes(query) ||
      r.year.toString().includes(query) ||
      r.plateNumber.toLowerCase().includes(query);

    const isSold = Boolean(r.dateSold && r.dateSold.trim() !== '');
    if (statusFilter === 'in_stock' && isSold) return false;
    if (statusFilter === 'sold' && !isSold) return false;

    return matchesSearch;
  });

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Table Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Vehicle Inventory & Sales Log
            <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
              {filteredRecords.length} unit{filteredRecords.length === 1 ? '' : 's'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            💡 <strong>Click any vehicle row</strong> to reveal the full itemized expense breakdown & partner split.
          </p>
        </div>

        {/* Clear All Button */}
        {records.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-semibold self-start sm:self-center transition"
          >
            Clear All Records
          </button>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Make, Model, Year, or Plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-750 self-start sm:self-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_stock')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'in_stock'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            In Stock
          </button>
          <button
            onClick={() => setStatusFilter('sold')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'sold'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sold
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-850 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4">Vehicle Description</th>
              <th className="py-3 px-3">Plate / MV</th>
              <th className="py-3 px-3">Days</th>
              <th className="py-3 px-3">Buy Price</th>
              <th className="py-3 px-3">Total Capital</th>
              <th className="py-3 px-3">Sell Price</th>
              <th className="py-3 px-3">Net Profit</th>
              <th className="py-3 px-3">Margin</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-sans">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r) => {
                const fin = computeVehicleFinancials(
                  r.buyPrice,
                  r.buyPayer,
                  r.sellPrice,
                  r.expenses
                );
                const turnover = calculateTurnoverDays(r.dateBought, r.dateSold);
                const isExpanded = expandedId === r.id;
                const isSold = Boolean(r.dateSold && r.dateSold.trim() !== '');

                return (
                  <React.Fragment key={r.id}>
                    {/* Main Row */}
                    <tr
                      onClick={() => toggleRow(r.id)}
                      className={`cursor-pointer transition-colors hover:bg-slate-800/80 ${
                        isExpanded ? 'bg-slate-800/90' : 'bg-slate-900/60'
                      }`}
                    >
                      {/* Vehicle Description */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-white text-sm">
                          {r.year} {r.make} {r.model}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-medium mt-0.5">
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>Hide breakdown</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span>View expense breakdown</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Plate Badge */}
                      <td className="py-3 px-3 font-mono">
                        <span className="bg-yellow-400 text-slate-950 font-black px-2 py-0.5 rounded text-[11px] border border-yellow-300">
                          {r.plateNumber}
                        </span>
                      </td>

                      {/* Turnover Days */}
                      <td className="py-3 px-3 font-mono">
                        {turnover.totalDays !== null ? (
                          <div className="flex flex-col">
                            <span
                              className={`font-extrabold ${
                                isSold ? 'text-blue-400' : 'text-amber-400'
                              }`}
                            >
                              {turnover.totalDays}d
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {turnover.status}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Buy Price */}
                      <td className="py-3 px-3 font-mono text-slate-300">
                        <div>{formatCurrency(r.buyPrice, r.currency)}</div>
                        <div className="text-[9px] text-slate-400">Paid: {r.buyPayer}</div>
                      </td>

                      {/* Total Capital */}
                      <td className="py-3 px-3 font-mono font-bold text-rose-300">
                        {formatCurrency(fin.totalCapital, r.currency)}
                      </td>

                      {/* Sell Price */}
                      <td className="py-3 px-3 font-mono font-extrabold text-white">
                        {formatCurrency(r.sellPrice, r.currency)}
                      </td>

                      {/* Net Profit */}
                      <td className="py-3 px-3 font-mono font-extrabold">
                        <span
                          className={
                            fin.netProfit > 0
                              ? 'text-emerald-400'
                              : fin.netProfit < 0
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }
                        >
                          {formatCurrency(fin.netProfit, r.currency)}
                        </span>
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-300">
                        {fin.profitMargin.toFixed(1)}%
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEditRecord(r)}
                          title="Load into Form to Edit/Update"
                          className="p-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900 text-blue-300 border border-blue-800 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecord(r.id, r.plateNumber)}
                          title="Delete Vehicle Record"
                          className="p-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Breakdown Accordion Row */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80">
                        <td colSpan={9} className="p-4 sm:p-5 border-t border-slate-800">
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
                            {/* Header of Breakdown */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                              <div>
                                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                                  <span>Expense Breakdown for {r.year} {r.make} {r.model}</span>
                                  <span className="bg-yellow-400 text-slate-950 font-mono font-bold text-[10px] px-2 py-0.2 rounded">
                                    {r.plateNumber}
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                  Acquisition, reconditioning ledger, and partner split
                                </p>
                              </div>
                              <div className="text-right font-mono">
                                <span className="text-[11px] text-slate-400 uppercase font-bold block">
                                  Total Capital Outlay
                                </span>
                                <span className="font-black text-rose-400 text-base">
                                  {formatCurrency(fin.totalCapital, r.currency)}
                                </span>
                              </div>
                            </div>

                            {/* Dates Timeline Strip */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-850 p-2.5 rounded-lg text-xs font-mono">
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Bought: <strong>{r.dateBought || 'Not specified'}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Sold: <strong>{r.dateSold || 'Still in Inventory (Unsold)'}</strong></span>
                              </div>
                              <div className="flex items-center gap-1.5 text-blue-300">
                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                <span>Turnover: <strong>{turnover.formattedText}</strong></span>
                              </div>
                            </div>

                            {/* Partner Expenses Summary for this car */}
                            <div className="bg-slate-800/90 border border-slate-750 rounded-xl p-3.5">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                                  Partner Expenses Covered (Janssen vs. Ralph)
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Total Expenses: {formatCurrency(fin.totalAdditionalExpenses, r.currency)}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono text-xs">
                                <div className="bg-slate-900/80 p-2 rounded-lg border border-indigo-900/60">
                                  <span className="text-[10px] text-indigo-300 uppercase block font-sans font-bold">
                                    Janssen Expenses
                                  </span>
                                  <span className="font-extrabold text-white">
                                    {formatCurrency(fin.partnerSummary.janssenExpenses, r.currency)}
                                  </span>
                                </div>

                                <div className="bg-slate-900/80 p-2 rounded-lg border border-amber-900/60">
                                  <span className="text-[10px] text-amber-300 uppercase block font-sans font-bold">
                                    Ralph Expenses
                                  </span>
                                  <span className="font-extrabold text-white">
                                    {formatCurrency(fin.partnerSummary.ralphExpenses, r.currency)}
                                  </span>
                                </div>

                                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700">
                                  <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">
                                    Janssen Capital
                                  </span>
                                  <span className="font-bold text-indigo-200">
                                    {formatCurrency(fin.partnerSummary.janssenTotalCapital, r.currency)}
                                  </span>
                                </div>

                                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700">
                                  <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">
                                    Ralph Capital
                                  </span>
                                  <span className="font-bold text-amber-200">
                                    {formatCurrency(fin.partnerSummary.ralphTotalCapital, r.currency)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Base Acquisition Cost Box */}
                            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-rose-300">
                                  Base Vehicle Acquisition Cost:
                                </span>
                                <span className="bg-rose-900/60 text-rose-200 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Paid by: {r.buyPayer}
                                </span>
                              </div>
                              <span className="font-mono font-extrabold text-white">
                                {formatCurrency(r.buyPrice, r.currency)}
                              </span>
                            </div>

                            {/* Itemized Reconditioning Expenses List */}
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                                Itemized Reconditioning & Other Costs
                              </span>
                              {r.expenses && r.expenses.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {r.expenses.map((exp) => (
                                    <div
                                      key={exp.id}
                                      className="flex items-center justify-between p-2 bg-slate-800 rounded-lg border border-slate-750 text-xs"
                                    >
                                      <div className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-[240px]">
                                        <span className="truncate text-slate-200" title={exp.name}>
                                          {exp.name}
                                        </span>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                            exp.payer === 'Janssen'
                                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                                              : exp.payer === 'Ralph'
                                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                              : 'bg-teal-950 text-teal-300 border border-teal-700'
                                          }`}
                                        >
                                          {exp.payer === 'Both' ? 'Both (50/50)' : exp.payer}
                                        </span>
                                      </div>
                                      <span className="font-mono font-bold text-white shrink-0">
                                        {formatCurrency(exp.amount, r.currency)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-slate-500 italic text-xs py-2">
                                  No additional reconditioning expenses logged for this vehicle.
                                </div>
                              )}
                            </div>

                            {/* Notes */}
                            {r.notes && (
                              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800 text-xs text-slate-400">
                                <span className="font-bold text-slate-300">Notes: </span>
                                <span>{r.notes}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 text-xs">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No vehicles match your search or filter criteria.'
                    : 'No vehicles saved yet. Enter vehicle details in the form above and click "Save Vehicle Record".'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
