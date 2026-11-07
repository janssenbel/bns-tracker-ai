import { ExpenseItem, PartnerExpenseSummary, TurnoverCalculation, VehicleRecord } from '../types';

export function normalizePlate(plate: string): string {
  return (plate || '').replace(/[\s\-_.]/g, '').toUpperCase();
}

export function formatCurrency(amount: number, symbol: string = '₱'): string {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (amount < 0) {
    return `-${symbol}${formatted}`;
  }
  return `${symbol}${formatted}`;
}

export function calculateTurnoverDays(
  dateBought: string,
  dateSold?: string
): TurnoverCalculation {
  if (!dateBought) {
    return {
      totalDays: null,
      status: 'No Date',
      formattedText: '—',
    };
  }

  const bought = new Date(`${dateBought}T00:00:00`);
  if (isNaN(bought.getTime())) {
    return {
      totalDays: null,
      status: 'Invalid',
      formattedText: 'Invalid Date',
    };
  }

  if (dateSold && dateSold.trim() !== '') {
    const sold = new Date(`${dateSold}T00:00:00`);
    if (isNaN(sold.getTime())) {
      return {
        totalDays: null,
        status: 'Invalid',
        formattedText: 'Invalid Date',
      };
    }

    const diffMs = sold.getTime() - bought.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        totalDays: diffDays,
        status: 'Invalid',
        formattedText: 'Sold before Bought',
      };
    }

    return {
      totalDays: diffDays,
      status: 'Sold',
      formattedText: `${diffDays} days (Sold)`,
    };
  }

  // Still in stock: calculate from dateBought to today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - bought.getTime();
  const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  return {
    totalDays: diffDays,
    status: 'In Stock',
    formattedText: `${diffDays} days (In Stock)`,
  };
}

export function computeVehicleFinancials(
  buyPrice: number,
  buyPayer: 'Janssen' | 'Ralph' | 'Both',
  sellPrice: number,
  expenses: ExpenseItem[]
): {
  totalAdditionalExpenses: number;
  totalCapital: number;
  netProfit: number;
  profitMargin: number;
  roiMarkup: number;
  partnerSummary: PartnerExpenseSummary;
} {
  let janssenExpenses = 0;
  let ralphExpenses = 0;
  let bothExpenses = 0;
  let totalAdditionalExpenses = 0;

  for (const exp of expenses) {
    const amt = exp.amount || 0;
    totalAdditionalExpenses += amt;

    if (exp.payer === 'Janssen') {
      janssenExpenses += amt;
    } else if (exp.payer === 'Ralph') {
      ralphExpenses += amt;
    } else {
      // Both: 50 / 50 split
      bothExpenses += amt;
      janssenExpenses += amt / 2;
      ralphExpenses += amt / 2;
    }
  }

  const safeBuy = buyPrice || 0;
  const safeSell = sellPrice || 0;
  const totalCapital = safeBuy + totalAdditionalExpenses;
  const netProfit = safeSell - totalCapital;

  const profitMargin = safeSell > 0 ? (netProfit / safeSell) * 100 : 0;
  const roiMarkup = totalCapital > 0 ? (netProfit / totalCapital) * 100 : 0;

  // Capital share including acquisition cost
  let janssenBuyShare = 0;
  let ralphBuyShare = 0;
  if (buyPayer === 'Janssen') {
    janssenBuyShare = safeBuy;
  } else if (buyPayer === 'Ralph') {
    ralphBuyShare = safeBuy;
  } else {
    janssenBuyShare = safeBuy / 2;
    ralphBuyShare = safeBuy / 2;
  }

  const janssenTotalCapital = janssenBuyShare + janssenExpenses;
  const ralphTotalCapital = ralphBuyShare + ralphExpenses;

  // Profit split: 50% Janssen, 50% Ralph
  const janssenProfitShare = netProfit / 2;
  const ralphProfitShare = netProfit / 2;

  // Payout when sold: each gets their total capital contribution back + 50% net profit
  const janssenPayout = janssenTotalCapital + janssenProfitShare;
  const ralphPayout = ralphTotalCapital + ralphProfitShare;

  const settlementDifference = janssenExpenses - ralphExpenses;

  return {
    totalAdditionalExpenses,
    totalCapital,
    netProfit,
    profitMargin,
    roiMarkup,
    partnerSummary: {
      janssenExpenses,
      ralphExpenses,
      bothExpenses,
      totalExpenses: totalAdditionalExpenses,
      janssenTotalCapital,
      ralphTotalCapital,
      totalCapital,
      netProfit,
      janssenProfitShare,
      ralphProfitShare,
      janssenPayout,
      ralphPayout,
      settlementDifference,
    },
  };
}

export function computeGlobalPartnerSummary(records: VehicleRecord[]): {
  totalCars: number;
  totalSold: number;
  totalInStock: number;
  totalAcquisition: number;
  totalExpenses: number;
  totalCapital: number;
  totalGrossSales: number;
  totalNetProfit: number;
  janssenTotalExpenses: number;
  ralphTotalExpenses: number;
  janssenTotalCapital: number;
  ralphTotalCapital: number;
  janssenTotalProfit: number;
  ralphTotalProfit: number;
  settlementDifference: number;
} {
  let totalSold = 0;
  let totalInStock = 0;
  let totalAcquisition = 0;
  let totalExpenses = 0;
  let totalCapital = 0;
  let totalGrossSales = 0;
  let totalNetProfit = 0;

  let janssenTotalExpenses = 0;
  let ralphTotalExpenses = 0;
  let janssenTotalCapital = 0;
  let ralphTotalCapital = 0;

  for (const r of records) {
    if (r.dateSold && r.dateSold.trim() !== '') {
      totalSold++;
    } else {
      totalInStock++;
    }

    const fin = computeVehicleFinancials(r.buyPrice, r.buyPayer, r.sellPrice, r.expenses);
    totalAcquisition += r.buyPrice || 0;
    totalExpenses += fin.totalAdditionalExpenses;
    totalCapital += fin.totalCapital;
    totalGrossSales += r.sellPrice || 0;
    totalNetProfit += fin.netProfit;

    janssenTotalExpenses += fin.partnerSummary.janssenExpenses;
    ralphTotalExpenses += fin.partnerSummary.ralphExpenses;
    janssenTotalCapital += fin.partnerSummary.janssenTotalCapital;
    ralphTotalCapital += fin.partnerSummary.ralphTotalCapital;
  }

  const janssenTotalProfit = totalNetProfit / 2;
  const ralphTotalProfit = totalNetProfit / 2;
  const settlementDifference = janssenTotalExpenses - ralphTotalExpenses;

  return {
    totalCars: records.length,
    totalSold,
    totalInStock,
    totalAcquisition,
    totalExpenses,
    totalCapital,
    totalGrossSales,
    totalNetProfit,
    janssenTotalExpenses,
    ralphTotalExpenses,
    janssenTotalCapital,
    ralphTotalCapital,
    janssenTotalProfit,
    ralphTotalProfit,
    settlementDifference,
  };
}
