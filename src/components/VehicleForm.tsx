import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Hash,
  Info,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { ExpenseItem, Payer, TurnoverCalculation } from '../types';
import { formatCurrency, normalizePlate } from '../utils/calculations';

interface VehicleFormProps {
  year: string;
  onYearChange: (v: string) => void;
  make: string;
  onMakeChange: (v: string) => void;
  model: string;
  onModelChange: (v: string) => void;
  plateNumber: string;
  onPlateNumberChange: (v: string) => void;
  dateBought: string;
  onDateBoughtChange: (v: string) => void;
  dateSold: string;
  onDateSoldChange: (v: string) => void;
  buyPrice: number;
  onBuyPriceChange: (v: number) => void;
  buyPayer: Payer;
  onBuyPayerChange: (v: Payer) => void;
  sellPrice: number;
  onSellPriceChange: (v: number) => void;
  expenses: ExpenseItem[];
  onExpensesChange: (items: ExpenseItem[]) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  currency: string;
  turnover: TurnoverCalculation;
  isExistingPlate: boolean;
  onSave: () => void;
  onReset: () => void;
  notificationMessage: { text: string; isUpdate: boolean } | null;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  year,
  onYearChange,
  make,
  onMakeChange,
  model,
  onModelChange,
  plateNumber,
  onPlateNumberChange,
  dateBought,
  onDateBoughtChange,
  dateSold,
  onDateSoldChange,
  buyPrice,
  onBuyPriceChange,
  buyPayer,
  onBuyPayerChange,
  sellPrice,
  onSellPriceChange,
  expenses,
  onExpensesChange,
  notes,
  onNotesChange,
  currency,
  turnover,
  isExistingPlate,
  onSave,
  onReset,
  notificationMessage,
}) => {
  const handleExpenseNameChange = (id: string, name: string) => {
    onExpensesChange(
      expenses.map((e) => (e.id === id ? { ...e, name } : e))
    );
  };

  const handleExpenseAmountChange = (id: string, amount: number) => {
    onExpensesChange(
      expenses.map((e) => (e.id === id ? { ...e, amount } : e))
    );
  };

  const handleExpensePayerChange = (id: string, payer: Payer) => {
    onExpensesChange(
      expenses.map((e) => (e.id === id ? { ...e, payer } : e))
    );
  };

  const handleAddExpense = () => {
    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: 'Other Reconditioning Cost',
      amount: 0,
      payer: 'Both',
    };
    onExpensesChange([...expenses, newItem]);
  };

  const handleRemoveExpense = (id: string) => {
    onExpensesChange(expenses.filter((e) => e.id !== id));
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm space-y-6">
      {/* Toast Notification */}
      {notificationMessage && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
            notificationMessage.isUpdate
              ? 'bg-blue-950/80 text-blue-300 border-blue-800/80 shadow-xs'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 shadow-xs'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notificationMessage.text}</span>
        </div>
      )}

      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Vehicle Specification & Financials
          </h2>
          <p className="text-xs text-slate-400">
            Enter description, purchase details, turnover dates, and reconditioning items.
          </p>
        </div>
        {isExistingPlate && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
            <RefreshCw className="w-3 h-3 text-blue-400" />
            Existing Unit in Log
          </span>
        )}
      </div>

      {/* Vehicle Description: Year, Make, Model */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Vehicle Identification
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Year Model
            </span>
            <input
              type="number"
              placeholder="e.g. 2021"
              value={year}
              onChange={(e) => onYearChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-4">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Make / Brand
            </span>
            <input
              type="text"
              list="car-makes-list"
              placeholder="e.g. Toyota"
              value={make}
              onChange={(e) => onMakeChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="car-makes-list">
              <option value="Toyota" />
              <option value="Honda" />
              <option value="Mitsubishi" />
              <option value="Ford" />
              <option value="Nissan" />
              <option value="Hyundai" />
              <option value="Kia" />
              <option value="Mazda" />
              <option value="Suzuki" />
              <option value="Isuzu" />
              <option value="Subaru" />
              <option value="BMW" />
              <option value="Mercedes-Benz" />
              <option value="Chevrolet" />
              <option value="Geely" />
              <option value="MG" />
              <option value="BYD" />
            </datalist>
          </div>

          <div className="sm:col-span-5">
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Model / Variant Description
            </span>
            <input
              type="text"
              placeholder="e.g. Fortuner 2.8 V 4x2 AT"
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Plate Number (Primary Key for Auto-Updating) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <Hash className="w-3 h-3 text-blue-400" />
              Plate Number / Conduction Sticker <span className="text-blue-400">*</span>
            </span>
            <span className="text-[10px] text-slate-400">
              Unique Key: saving updates any existing record with this plate
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. NDK 4821 or Conduction Sticker"
              value={plateNumber}
              onChange={(e) => onPlateNumberChange(e.target.value)}
              className={`w-full bg-slate-800/90 border rounded-xl px-3 py-2.5 text-sm font-mono font-extrabold uppercase tracking-widest text-yellow-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 ${
                isExistingPlate
                  ? 'border-blue-500 focus:ring-blue-500'
                  : 'border-slate-700 focus:ring-blue-500'
              }`}
            />
            {isExistingPlate && (
              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                Auto-Update Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Date Bought, Date Sold, and Total Days */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Transaction Dates & Holding Duration
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-850/60 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Date Bought
            </span>
            <input
              type="date"
              value={dateBought}
              onChange={(e) => onDateBoughtChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Date Sold
            </span>
            <input
              type="date"
              value={dateSold}
              onChange={(e) => onDateSoldChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[9px] text-slate-400 mt-0.5 block">
              Leave blank if currently in stock
            </span>
          </div>

          <div className="flex flex-col justify-center items-center bg-slate-800/80 border border-slate-750 rounded-lg p-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" /> Total Days
            </span>
            <span className="text-sm font-black font-mono text-white mt-0.5">
              {turnover.totalDays !== null ? (
                <span className={turnover.status === 'Sold' ? 'text-blue-400' : 'text-amber-400'}>
                  {turnover.formattedText}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & Acquisition Payer */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Vehicle Acquisition & Target Sale Price
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Buying Price + Payer */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-rose-300">
                Acquisition (Buy Price) *
              </span>
              {/* Buy Payer Selector */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">Paid by:</span>
                <select
                  aria-label="Acquisition price paid by"
                  value={buyPayer}
                  onChange={(e) => onBuyPayerChange(e.target.value as Payer)}
                  className="bg-slate-800 border border-slate-700 text-xs font-bold rounded-lg px-2 py-0.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Both">Both (50/50)</option>
                  <option value="Janssen">Janssen (100%)</option>
                  <option value="Ralph">Ralph (100%)</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-rose-400 font-mono font-bold text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={buyPrice || ''}
                onChange={(e) => onBuyPriceChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-rose-900/60 rounded-xl pl-9 pr-3 py-2 text-base font-mono font-extrabold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Selling Price */}
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-300">
                Selling / Target Price *
              </span>
              <span className="text-[10px] text-emerald-400/80 font-medium">Gross Revenue</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-emerald-400 font-mono font-bold text-sm">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={sellPrice || ''}
                onChange={(e) => onSellPriceChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-emerald-900/60 rounded-xl pl-9 pr-3 py-2 text-base font-mono font-extrabold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Other Expenses & Reconditioning List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Reconditioning & Other Unit Expenses
            </span>
            <p className="text-[10px] text-slate-400">
              Assign each expense to <strong>Janssen</strong>, <strong>Ralph</strong>, or <strong>Both (50/50)</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddExpense}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>
        </div>

        {/* Expenses Rows */}
        <div className="space-y-2">
          {expenses.map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-800/80 border border-slate-750 hover:border-slate-700 p-2.5 rounded-xl transition-colors"
            >
              {/* Expense Name */}
              <input
                type="text"
                placeholder="Expense Name (e.g. Detailing, New Tires, Battery)"
                value={item.name}
                onChange={(e) => handleExpenseNameChange(item.id, e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <div className="flex items-center gap-2">
                {/* Expense Amount */}
                <div className="relative w-28 sm:w-32">
                  <span className="absolute left-2.5 top-1.5 text-[11px] font-mono text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={item.amount || ''}
                    onChange={(e) =>
                      handleExpenseAmountChange(item.id, parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-right font-mono font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Covered By Selector (Janssen / Ralph / Both) */}
                <select
                  aria-label="Covered by partner"
                  value={item.payer}
                  onChange={(e) =>
                    handleExpensePayerChange(item.id, e.target.value as Payer)
                  }
                  className={`border text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                    item.payer === 'Janssen'
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                      : item.payer === 'Ralph'
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-slate-900 text-teal-300 border-slate-700'
                  }`}
                >
                  <option value="Both">Both (50/50)</option>
                  <option value="Janssen">Janssen</option>
                  <option value="Ralph">Ralph</option>
                </select>

                {/* Delete Expense */}
                <button
                  type="button"
                  onClick={() => handleRemoveExpense(item.id)}
                  title="Remove this expense"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Notes / Remarks (Optional) */}
      <div>
        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
          Dealer Notes / Client Info (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Registered under first owner, with spare key and manuals. Inquired by Mr. Santos."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onSave}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 px-5 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
        >
          {isExistingPlate ? (
            <>
              <RefreshCw className="w-4 h-4 text-amber-300" />
              Update Record for Plate: {normalizePlate(plateNumber) || 'Unit'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-amber-300" />
              Save Vehicle Record
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="px-5 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          Reset Form
        </button>
      </div>
    </div>
  );
};
