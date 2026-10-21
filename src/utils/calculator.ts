import {
  CalculationInputs,
  CalculationResults,
  PriceTestResult,
} from '../types/calculator';

/**
 * Format number to Indonesian Rupiah standard (e.g. Rp 10.000)
 */
export function formatRupiah(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || !isFinite(amount)) return 'Rp 0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return `${isNegative ? '- ' : ''}Rp ${formatted}`;
}

/**
 * Format percent nicely (e.g. 30% or 30.5%)
 */
export function formatPercent(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  const rounded = Math.round(value * 10) / 10;
  return `${rounded.toLocaleString('id-ID')}%`;
}

/**
 * Clean input string into a valid non-negative number
 */
export function parseCleanNumber(input: string | number): number {
  if (typeof input === 'number') {
    return isNaN(input) || input < 0 ? 0 : input;
  }
  // Remove currency prefixes, dots (thousands separators in ID), spaces
  const sanitized = input.replace(/[^0-9,-]/g, '').replace(',', '.');
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

/**
 * Calculate total production costs
 */
export function calculateTotalProductionCost(
  costs: CalculationInputs['productionCosts']
): number {
  const base =
    (costs.rawMaterial || 0) +
    (costs.packaging || 0) +
    (costs.labor || 0) +
    (costs.transport || 0) +
    (costs.other || 0);

  const customTotal = (costs.customItems || []).reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  return base + customTotal;
}

/**
 * Core calculation logic for HPP, BEP, and Recommended Price
 */
export function calculateHPP(inputs: CalculationInputs): CalculationResults {
  const { product, productionCosts, salesCosts, targetMarginPercent } = inputs;
  
  const totalProductionCost = calculateTotalProductionCost(productionCosts);
  const quantity = Math.max(0, product.quantity || 0);

  // Validation: quantity must be > 0
  if (quantity <= 0) {
    return {
      totalProductionCost,
      costPerUnit: 0,
      breakEvenPrice: 0,
      recommendedSellingPrice: 0,
      profitPerUnit: 0,
      actualMarginPercent: 0,
      actualMarkupPercent: 0,
      estimatedTotalProfit: 0,
      estimatedGrossRevenue: 0,
      platformFeeAmountPerUnit: 0,
      isValid: false,
      errorMessage: 'Jumlah produk yang dibuat harus lebih dari 0.',
    };
  }

  // Cost per unit (HPP)
  const costPerUnit = totalProductionCost / quantity;

  const platformPercent = Math.max(0, salesCosts.platformFeePercent || 0);
  const fixedFee = Math.max(0, salesCosts.additionalFeePerTx || 0);
  const targetMargin = Math.max(0, targetMarginPercent || 0);

  // BEP Calculation (Harga Impas per unit)
  // BEP * (1 - platformPercent/100) - fixedFee = costPerUnit
  // BEP = (costPerUnit + fixedFee) / (1 - platformPercent/100)
  let breakEvenPrice = 0;
  if (platformPercent < 100) {
    breakEvenPrice = (costPerUnit + fixedFee) / (1 - platformPercent / 100);
  } else {
    breakEvenPrice = costPerUnit + fixedFee;
  }

  // Recommended Selling Price based on Target Margin %
  // Target Margin = Profit / Price
  // Profit = Price * (1 - platformPercent/100) - fixedFee - costPerUnit
  // Margin * Price / 100 = Price * (1 - platformPercent/100) - fixedFee - costPerUnit
  // Price * [1 - (platformPercent + targetMargin)/100] = costPerUnit + fixedFee
  let recommendedSellingPrice = 0;
  const totalDeductionPercent = platformPercent + targetMargin;

  if (totalDeductionPercent >= 100) {
    return {
      totalProductionCost,
      costPerUnit,
      breakEvenPrice,
      recommendedSellingPrice: 0,
      profitPerUnit: 0,
      actualMarginPercent: 0,
      actualMarkupPercent: 0,
      estimatedTotalProfit: 0,
      estimatedGrossRevenue: 0,
      platformFeeAmountPerUnit: 0,
      isValid: false,
      errorMessage:
        'Total potongan biaya platform + target margin tidak boleh 100% atau lebih.',
    };
  }

  recommendedSellingPrice =
    (costPerUnit + fixedFee) / (1 - totalDeductionPercent / 100);

  // Platform fee per unit at recommended price
  const platformFeeAmountPerUnit =
    recommendedSellingPrice * (platformPercent / 100) + fixedFee;

  // Net revenue per unit
  const netRevenuePerUnit = recommendedSellingPrice - platformFeeAmountPerUnit;

  // Profit per unit
  const profitPerUnit = netRevenuePerUnit - costPerUnit;

  // Actual Margin and Markup
  const actualMarginPercent =
    recommendedSellingPrice > 0
      ? (profitPerUnit / recommendedSellingPrice) * 100
      : 0;

  const actualMarkupPercent =
    costPerUnit > 0 ? (profitPerUnit / costPerUnit) * 100 : 0;

  // Total estimates for batch
  const estimatedTotalProfit = profitPerUnit * quantity;
  const estimatedGrossRevenue = recommendedSellingPrice * quantity;

  return {
    totalProductionCost,
    costPerUnit,
    breakEvenPrice,
    recommendedSellingPrice,
    profitPerUnit,
    actualMarginPercent,
    actualMarkupPercent,
    estimatedTotalProfit,
    estimatedGrossRevenue,
    platformFeeAmountPerUnit,
    isValid: true,
  };
}

/**
 * Fitur "Uji Harga Jual" (Price Simulator)
 */
export function testSellingPrice(
  testedPrice: number,
  costPerUnit: number,
  salesCosts: CalculationInputs['salesCosts'],
  quantity: number
): PriceTestResult {
  const price = Math.max(0, testedPrice || 0);
  const platformPercent = Math.max(0, salesCosts.platformFeePercent || 0);
  const fixedFee = Math.max(0, salesCosts.additionalFeePerTx || 0);

  // Biaya platform = (Harga * %) + biaya tetap
  const platformFeeAmount = price * (platformPercent / 100) + fixedFee;

  // Total biaya per unit yang harus ditutup penjual
  const totalCostPerUnitWithSales = costPerUnit + platformFeeAmount;

  // Pendapatan bersih yang diterima per unit
  const netRevenuePerUnit = price - platformFeeAmount;

  // Keuntungan bersih per unit
  const profitPerUnit = netRevenuePerUnit - costPerUnit;

  // Margin %
  const marginPercent = price > 0 ? (profitPerUnit / price) * 100 : 0;

  // Total keuntungan untuk seluruh batch produk
  const totalProfit = profitPerUnit * Math.max(1, quantity || 1);

  // Status keuntungan
  let status: 'profit' | 'breakeven' | 'loss' = 'profit';
  let lossAmount = 0;

  if (Math.abs(profitPerUnit) < 0.5) {
    status = 'breakeven';
  } else if (profitPerUnit > 0) {
    status = 'profit';
  } else {
    status = 'loss';
    lossAmount = Math.abs(profitPerUnit);
  }

  return {
    testedPrice: price,
    costPerUnit,
    platformFeeAmount,
    netRevenuePerUnit,
    profitPerUnit,
    marginPercent,
    totalProfit,
    totalCostPerUnitWithSales,
    status,
    lossAmount,
  };
}

/**
 * Standard rounding helper for Indonesian retail prices
 */
export function roundToNearest(value: number, nearest: number = 100): number {
  if (nearest <= 0) return Math.round(value);
  return Math.ceil(value / nearest) * nearest;
}

/**
 * Preset sample from user prompt
 */
export const PROMPT_EXAMPLE_PRESET: CalculationInputs = {
  product: {
    name: 'Keripik Singkong Renyah',
    quantity: 20,
  },
  productionCosts: {
    rawMaterial: 30000,
    packaging: 10000,
    labor: 20000,
    transport: 10000,
    other: 10000,
    customItems: [],
  },
  salesCosts: {
    platformFeePercent: 0,
    additionalFeePerTx: 0,
  },
  targetMarginPercent: 30,
  testedPrice: 6000,
};

/**
 * Additional popular business presets for Indonesian UMKM
 */
export const INDUSTRY_PRESETS: {
  id: string;
  name: string;
  category: string;
  data: CalculationInputs;
}[] = [
  {
    id: 'keripik-singkong',
    name: 'Keripik Singkong Renyah (Contoh Soal)',
    category: 'Camilan & Makanan Ringan',
    data: PROMPT_EXAMPLE_PRESET,
  },
  {
    id: 'kopi-susu',
    name: 'Kopi Susu Gula Aren (100 Botol 250ml)',
    category: 'Minuman & Cafe',
    data: {
      product: {
        name: 'Kopi Susu Literan / Botol 250ml',
        quantity: 100,
      },
      productionCosts: {
        rawMaterial: 450000, // Biji kopi, susu fresh milk, sirup gula aren
        packaging: 150000,   // Botol plastik kale, segel, stiker vinyl
        labor: 100000,       // Barista brewing & bottling
        transport: 30000,    // Beli bahan
        other: 20000,        // Listrik & es batu
        customItems: [],
      },
      salesCosts: {
        platformFeePercent: 12, // GrabFood/GoFood merchant fee
        additionalFeePerTx: 1000, // Biaya kantong/tas
      },
      targetMarginPercent: 35,
      testedPrice: 15000,
    },
  },
  {
    id: 'kaos-distro',
    name: 'Kaos Cotton Combed 24s Sablon (50 Pcs)',
    category: 'Fashion & Konveksi',
    data: {
      product: {
        name: 'Kaos Distro Oversize Sablon DTF',
        quantity: 50,
      },
      productionCosts: {
        rawMaterial: 1500000, // Bahan kaos polos cotton combed 24s
        packaging: 125000,    // Ziplock polymailer + thank you card + stiker
        labor: 750000,        // Ongkos sablon & finishing
        transport: 50000,     // Pengiriman dari konveksi
        other: 75000,         // QC & hangtag
        customItems: [],
      },
      salesCosts: {
        platformFeePercent: 6.5, // Shopee Star+ Seller fee
        additionalFeePerTx: 1500, // Biaya layanan / packing kardus
      },
      targetMarginPercent: 40,
      testedPrice: 99000,
    },
  },
  {
    id: 'kue-nastar',
    name: 'Kue Nastar Wisman Premium (10 Toples)',
    category: 'Kue Kering & Bakery',
    data: {
      product: {
        name: 'Nastar Wisman Keju 500gr',
        quantity: 10,
      },
      productionCosts: {
        rawMaterial: 380000, // Butter wisman, nanas, keju edam, tepung
        packaging: 70000,    // Toples hardtop segi + pita + stiker emas
        labor: 120000,       // Upah buat & panggang 1 batch
        transport: 25000,    // Belanja bahan
        other: 35000,        // Gas oven & listrik
        customItems: [],
      },
      salesCosts: {
        platformFeePercent: 5, // WhatsApp direct / Tokopedia
        additionalFeePerTx: 0,
      },
      targetMarginPercent: 35,
      testedPrice: 95000,
    },
  },
];
