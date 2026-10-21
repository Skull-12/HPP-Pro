export interface ProductionCosts {
  rawMaterial: number;      // Bahan baku
  packaging: number;        // Kemasan
  labor: number;            // Tenaga kerja
  transport: number;        // Transportasi
  other: number;            // Biaya lainnya
  customItems?: { id: string; name: string; amount: number }[]; // Item tambahan fleksibel
}

export interface SalesCosts {
  platformFeePercent: number; // Biaya admin/platform (%)
  additionalFeePerTx: number; // Biaya tambahan per transaksi (Rp)
}

export interface ProductData {
  name: string;
  quantity: number; // Jumlah produk yang dibuat (harus > 0)
}

export interface CalculationInputs {
  product: ProductData;
  productionCosts: ProductionCosts;
  salesCosts: SalesCosts;
  targetMarginPercent: number; // Target margin keuntungan (%)
  testedPrice?: number;        // Harga jual untuk fitur "Uji Harga Jual"
}

export interface CalculationResults {
  totalProductionCost: number;       // Total biaya produksi
  costPerUnit: number;               // HPP per unit (Harga Pokok Penjualan)
  breakEvenPrice: number;            // Harga impas / BEP per unit
  recommendedSellingPrice: number;   // Harga jual yang disarankan (berdasarkan target margin)
  profitPerUnit: number;             // Keuntungan bersih per unit
  actualMarginPercent: number;       // Margin keuntungan (%)
  actualMarkupPercent: number;       // Markup keuntungan (%)
  estimatedTotalProfit: number;      // Perkiraan total keuntungan (unit * profit)
  estimatedGrossRevenue: number;     // Perkiraan total omzet kotor
  platformFeeAmountPerUnit: number;  // Biaya platform per unit pada harga rekomendasi
  isValid: boolean;
  errorMessage?: string;
}

export type PriceTestStatus = 'profit' | 'breakeven' | 'loss';

export interface PriceTestResult {
  testedPrice: number;
  costPerUnit: number;
  platformFeeAmount: number;
  netRevenuePerUnit: number;
  profitPerUnit: number;
  marginPercent: number;
  totalProfit: number;
  totalCostPerUnitWithSales: number; // HPP + platform fee
  status: PriceTestStatus;
  lossAmount: number; // positive number if loss, 0 if profit
}

export interface SavedCalculation {
  id: string;
  createdAt: string;
  updatedAt: string;
  inputs: CalculationInputs;
  results: CalculationResults;
  notes?: string;
}

export type CostCategoryKey = 'rawMaterial' | 'packaging' | 'labor' | 'transport' | 'other';

export interface AIEstimatedItem {
  id: string;
  category: CostCategoryKey;
  name: string;
  quantity: string | number;
  unit: string;
  estimatedCost: number;
}

export interface AIEstimationResult {
  productName: string;
  quantity: number;
  context?: string;
  notes?: string;
  disclaimer: string;
  items: AIEstimatedItem[];
}

