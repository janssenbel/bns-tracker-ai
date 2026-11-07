import React, { useEffect, useState } from 'react';
import { GlobalSummaryModal } from './components/GlobalSummaryModal';
import { Header } from './components/Header';
import { InventoryLogTable } from './components/InventoryLogTable';
import { LivePreviewCard } from './components/LivePreviewCard';
import { PartnerSummaryCard } from './components/PartnerSummaryCard';
import { VehicleForm } from './components/VehicleForm';
import { DEFAULT_EXPENSE_TEMPLATES, ExpenseItem, Payer, VehicleRecord } from './types';
import {
  calculateTurnoverDays,
  computeVehicleFinancials,
  normalizePlate,
} from './utils/calculations';
import { INITIAL_SAMPLE_RECORDS } from './utils/sampleData';

const STORAGE_KEY = 'autobuy_sell_records_v1';

export default function App() {
  // Load saved records from local storage or fallback to realistic initial samples
  const [records, setRecords] = useState<VehicleRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load records from storage', e);
    }
    return INITIAL_SAMPLE_RECORDS;
  });

  // Global Currency
  const [currency, setCurrency] = useState<string>('₱');

  // Form Fields
  const [year, setYear] = useState<string>('2021');
  const [make, setMake] = useState<string>('Toyota');
  const [model, setModel] = useState<string>('Fortuner 2.8 V 4x2 AT');
  const [plateNumber, setPlateNumber] = useState<string>('NDK 4821');
  const [dateBought, setDateBought] = useState<string>('2026-10-15');
  const [dateSold, setDateSold] = useState<string>('2026-11-02');
  const [buyPrice, setBuyPrice] = useState<number>(1380000);
  const [buyPayer, setBuyPayer] = useState<Payer>('Both');
  const [sellPrice, setSellPrice] = useState<number>(1560000);
  const [notes, setNotes] = useState<string>('Sold to direct buyer in Quezon City. Clean papers.');

  // Form Expenses with Payer
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    return [
      {
        id: 'exp-1',
        name: 'Detailing / 3-Stage Exterior Buffing & Interior Shampoo',
        amount: 8500,
        payer: 'Janssen',
      },
      {
        id: 'exp-2',
        name: 'Mechanical PMS / Synthetic Oil, Filter & Brake Pads',
        amount: 14200,
        payer: 'Ralph',
      },
      {
        id: 'exp-3',
        name: 'Body Paint Touch-up (Front Bumper Chip)',
        amount: 4500,
        payer: 'Both',
      },
      {
        id: 'exp-4',
        name: 'LTO Transfer & HPG Clearance / Notary',
        amount: 6800,
        payer: 'Both',
      },
      {
        id: 'exp-5',
        name: 'Agent / Broker Commission',
        amount: 25000,
        payer: 'Both',
      },
    ];
  });

  // UI state
  const [isGlobalSummaryOpen, setIsGlobalSummaryOpen] = useState(false);
  const [notification, setNotification] = useState<{ text: string; isUpdate: boolean } | null>(
    null
  );

  // Save records to LocalStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [records]);

  // Check if current plate matches any record in inventory
  const cleanCurrentPlate = normalizePlate(plateNumber);
  const existingRecord = records.find(
    (r) => normalizePlate(r.plateNumber) === cleanCurrentPlate && cleanCurrentPlate !== ''
  );
  const isExistingPlate = Boolean(existingRecord);

  // Calculated Days
  const turnover = calculateTurnoverDays(dateBought, dateSold);

  // Financial calculations
  const financials = computeVehicleFinancials(buyPrice, buyPayer, sellPrice, expenses);

  const showNotification = (text: string, isUpdate: boolean) => {
    setNotification({ text, isUpdate });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  };

  // Smart Save / Update by Plate Number
  const handleSaveRecord = () => {
    const cleanPlate = normalizePlate(plateNumber);
    if (!cleanPlate) {
      alert(
        'Please enter a Plate Number or Conduction Sticker. The plate number is required to automatically identify and update records without duplicates.'
      );
      return;
    }

    if (buyPrice <= 0 && sellPrice <= 0) {
      alert('Please enter at least an Acquisition (Buy Price) or Target Selling Price.');
      return;
    }

    const validExpenses = expenses
      .filter((e) => e.name.trim() !== '')
      .map((e) => ({
        ...e,
        amount: e.amount || 0,
      }));

    const existingIndex = records.findIndex(
      (r) => normalizePlate(r.plateNumber) === cleanPlate
    );

    const recordData: Omit<VehicleRecord, 'id' | 'createdAt'> = {
      year: year.trim() || '—',
      make: make.trim() || 'Vehicle',
      model: model.trim() || '',
      plateNumber: plateNumber.trim().toUpperCase(),
      dateBought: dateBought.trim(),
      dateSold: dateSold.trim(),
      buyPrice: buyPrice || 0,
      buyPayer,
      sellPrice: sellPrice || 0,
      currency,
      expenses: validExpenses,
      notes: notes.trim(),
      updatedAt: Date.now(),
    };

    if (existingIndex !== -1) {
      // Update existing record in place
      const updated = [...records];
      updated[existingIndex] = {
        ...records[existingIndex],
        ...recordData,
      };
      setRecords(updated);
      showNotification(
        `Updated record for Plate: ${recordData.plateNumber} (in-place update)`,
        true
      );
    } else {
      // Create new record
      const newRecord: VehicleRecord = {
        ...recordData,
        id: `car-${Date.now()}`,
        createdAt: Date.now(),
      };
      setRecords([newRecord, ...records]);
      showNotification(
        `Saved new vehicle record for Plate: ${recordData.plateNumber}`,
        false
      );
    }
  };

  // Reset form to blank defaults
  const handleResetForm = () => {
    setYear(new Date().getFullYear().toString());
    setMake('');
    setModel('');
    setPlateNumber('');
    setDateBought(new Date().toISOString().slice(0, 10));
    setDateSold('');
    setBuyPrice(0);
    setBuyPayer('Both');
    setSellPrice(0);
    setNotes('');

    // Reset expenses with fresh template IDs
    setExpenses(
      DEFAULT_EXPENSE_TEMPLATES.map((t, idx) => ({
        id: `exp-init-${idx}-${Date.now()}`,
        name: t.name,
        amount: 0,
        payer: t.payer,
      }))
    );

    setNotification(null);
  };

  // Load record to form for editing
  const handleEditRecord = (record: VehicleRecord) => {
    setYear(record.year || '');
    setMake(record.make || '');
    setModel(record.model || '');
    setPlateNumber(record.plateNumber || '');
    setDateBought(record.dateBought || '');
    setDateSold(record.dateSold || '');
    setBuyPrice(record.buyPrice || 0);
    setBuyPayer(record.buyPayer || 'Both');
    setSellPrice(record.sellPrice || 0);
    setCurrency(record.currency || '₱');
    setNotes(record.notes || '');

    if (record.expenses && record.expenses.length > 0) {
      setExpenses(record.expenses);
    } else {
      setExpenses(
        DEFAULT_EXPENSE_TEMPLATES.map((t, idx) => ({
          id: `exp-loaded-${idx}`,
          name: t.name,
          amount: 0,
          payer: t.payer,
        }))
      );
    }

    // Scroll to form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showNotification(
      `Loaded ${record.plateNumber} into form. Adjust expenses or prices and click Update Record.`,
      true
    );
  };

  // Delete vehicle record
  const handleDeleteRecord = (id: string, plate: string) => {
    if (confirm(`Are you sure you want to delete vehicle record for plate "${plate}"?`)) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showNotification(`Deleted vehicle record for ${plate}`, false);
    }
  };

  // Clear all records
  const handleClearAll = () => {
    if (
      confirm(
        'Warning: This will delete ALL saved vehicle records from your browser. Are you sure?'
      )
    ) {
      setRecords([]);
      showNotification('All vehicle records cleared.', false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        totalCars={records.length}
        onOpenGlobalSummary={() => setIsGlobalSummaryOpen(true)}
        onExportData={() => setIsGlobalSummaryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Top 2-Column Split: Form (Left 7 cols) & Live Results + Partner Summary (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7">
            <VehicleForm
              year={year}
              onYearChange={setYear}
              make={make}
              onMakeChange={setMake}
              model={model}
              onModelChange={setModel}
              plateNumber={plateNumber}
              onPlateNumberChange={setPlateNumber}
              dateBought={dateBought}
              onDateBoughtChange={setDateBought}
              dateSold={dateSold}
              onDateSoldChange={setDateSold}
              buyPrice={buyPrice}
              onBuyPriceChange={setBuyPrice}
              buyPayer={buyPayer}
              onBuyPayerChange={setBuyPayer}
              sellPrice={sellPrice}
              onSellPriceChange={setSellPrice}
              expenses={expenses}
              onExpensesChange={setExpenses}
              notes={notes}
              onNotesChange={setNotes}
              currency={currency}
              turnover={turnover}
              isExistingPlate={isExistingPlate}
              onSave={handleSaveRecord}
              onReset={handleResetForm}
              notificationMessage={notification}
            />
          </div>

          {/* Right Live Results & Partner Outlay (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Profit Preview Card */}
            <LivePreviewCard
              year={year}
              make={make}
              model={model}
              plateNumber={plateNumber}
              buyPrice={buyPrice}
              buyPayer={buyPayer}
              sellPrice={sellPrice}
              expenses={expenses}
              totalCapital={financials.totalCapital}
              netProfit={financials.netProfit}
              profitMargin={financials.profitMargin}
              roiMarkup={financials.roiMarkup}
              turnover={turnover}
              currency={currency}
            />

            {/* Partner Expense Summary for this Unit (Janssen vs Ralph) */}
            <PartnerSummaryCard
              summary={financials.partnerSummary}
              currency={currency}
              unitTitle={[year, make, model].filter(Boolean).join(' ') || 'Current Unit'}
              unitPlate={normalizePlate(plateNumber)}
            />
          </div>
        </div>

        {/* Saved Inventory & Sales Log Table (Clickable breakdown + edit by plate) */}
        <InventoryLogTable
          records={records}
          onEditRecord={handleEditRecord}
          onDeleteRecord={handleDeleteRecord}
          onClearAll={handleClearAll}
          currency={currency}
        />
      </main>

      {/* Global Summary Modal (Overall Janssen & Ralph Ledger) */}
      <GlobalSummaryModal
        isOpen={isGlobalSummaryOpen}
        onClose={() => setIsGlobalSummaryOpen(false)}
        records={records}
        currency={currency}
        onImportRecords={(imported) => {
          setRecords(imported);
          showNotification(`Restored ${imported.length} vehicles from backup`, false);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <p>
          AutoBuy & Sell · Car Profit, Turnover & Partner Expense Calculator · Saved Offline
        </p>
      </footer>
    </div>
  );
}
