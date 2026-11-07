export type Payer = 'Janssen' | 'Ralph' | 'Both';

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  payer: Payer;
}

export interface VehicleRecord {
  id: string;
  year: string;
  make: string;
  model: string;
  plateNumber: string;
  dateBought: string; // YYYY-MM-DD
  dateSold: string; // YYYY-MM-DD (empty if unsold/in stock)
  buyPrice: number;
  buyPayer: Payer;
  sellPrice: number;
  currency: string;
  expenses: ExpenseItem[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PartnerExpenseSummary {
  janssenExpenses: number;
  ralphExpenses: number;
  bothExpenses: number; // total marked Both
  totalExpenses: number;
  janssenTotalCapital: number; // including buy price share
  ralphTotalCapital: number; // including buy price share
  totalCapital: number;
  netProfit: number;
  janssenProfitShare: number; // 50%
  ralphProfitShare: number; // 50%
  janssenPayout: number; // Outlay back + profit share
  ralphPayout: number; // Outlay back + profit share
  settlementDifference: number; // (Janssen - Ralph)
}

export interface TurnoverCalculation {
  totalDays: number | null;
  status: 'Sold' | 'In Stock' | 'No Date' | 'Invalid';
  formattedText: string;
}

export const DEFAULT_EXPENSE_TEMPLATES: Array<{ name: string; payer: Payer }> = [
  { name: 'Detailing / Interior & Exterior Buffing', payer: 'Both' },
  { name: 'Mechanical PMS / Engine Oil / Parts', payer: 'Both' },
  { name: 'Body Repair & Paint Touch-up', payer: 'Both' },
  { name: 'LTO Transfer / Notary / Doc Stamps', payer: 'Both' },
  { name: 'Agent / Broker Commission', payer: 'Both' },
  { name: 'Gas / Towing / Transport', payer: 'Both' },
];

export const CURRENCIES = [
  { symbol: '₱', label: '₱ (PHP - Philippine Peso)' },
  { symbol: '$', label: '$ (USD - US Dollar)' },
  { symbol: '€', label: '€ (EUR - Euro)' },
  { symbol: '¥', label: '¥ (JPY - Japanese Yen)' },
  { symbol: 'AED', label: 'AED (UAE Dirham)' },
  { symbol: '£', label: '£ (GBP - British Pound)' },
];
