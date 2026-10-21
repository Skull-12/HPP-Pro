import { SavedCalculation } from '../types/calculator';

const STORAGE_KEY = 'hpp_pro_saved_calculations_v1';

export function getSavedCalculations(): SavedCalculation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load calculations from localStorage:', error);
    return [];
  }
}

export function saveCalculation(
  calculation: Omit<SavedCalculation, 'id' | 'createdAt' | 'updatedAt'>
): SavedCalculation {
  const existing = getSavedCalculations();
  const now = new Date().toISOString();

  const newEntry: SavedCalculation = {
    ...calculation,
    id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newEntry, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save calculation to localStorage:', error);
  }
  return newEntry;
}

export function updateCalculation(
  id: string,
  updates: Partial<SavedCalculation>
): SavedCalculation[] {
  const existing = getSavedCalculations();
  const now = new Date().toISOString();
  const updated = existing.map((item) =>
    item.id === id ? { ...item, ...updates, updatedAt: now } : item
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update calculation in localStorage:', error);
  }
  return updated;
}

export function deleteCalculation(id: string): SavedCalculation[] {
  const existing = getSavedCalculations();
  const filtered = existing.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete calculation from localStorage:', error);
  }
  return filtered;
}

export function clearAllCalculations(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear calculations from localStorage:', error);
  }
}

/**
 * Export saved calculations as CSV file formatted for Indonesia (semicolon or comma with UTF-8 BOM)
 */
export function exportCalculationsToCSV(items: SavedCalculation[]): void {
  if (items.length === 0) return;

  const headers = [
    'Tanggal',
    'Nama Produk',
    'Jumlah Unit',
    'Total Biaya Produksi (Rp)',
    'HPP per Unit (Rp)',
    'Harga Jual Rekomendasi (Rp)',
    'BEP / Titik Impas (Rp)',
    'Biaya Platform (%)',
    'Target Margin (%)',
    'Keuntungan Bersih per Unit (Rp)',
    'Estimasi Total Keuntungan (Rp)',
  ];

  const rows = items.map((item) => [
    new Date(item.createdAt).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    `"${item.inputs.product.name.replace(/"/g, '""')}"`,
    item.inputs.product.quantity,
    Math.round(item.results.totalProductionCost),
    Math.round(item.results.costPerUnit),
    Math.round(item.results.recommendedSellingPrice),
    Math.round(item.results.breakEvenPrice),
    item.inputs.salesCosts.platformFeePercent,
    item.inputs.targetMarginPercent,
    Math.round(item.results.profitPerUnit),
    Math.round(item.results.estimatedTotalProfit),
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `Riwayat_HPP_Pro_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
