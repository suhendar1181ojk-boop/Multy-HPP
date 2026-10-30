export type CostItemType = 'material' | 'labor' | 'overhead';

export interface CostItem {
  id: string;
  name: string;
  type: CostItemType;
  quantity: number;
  unit: string;
  unitPrice: number;
  isFixedCost?: boolean; // For BEP classification (especially in overhead)
  notes?: string;
}

export type BusinessCategory = 'kuliner' | 'jasa' | 'konstruksi' | 'manufaktur' | 'retail';

export interface ProjectData {
  id: string;
  name: string;
  category: BusinessCategory;
  productionVolume: number; // e.g. 100 porsi, 1 website, 36 m2
  volumeUnit: string;
  targetMargin: number; // in percentage, e.g. 30 for 30%
  pricingMethod: 'margin' | 'markup'; // 'margin' (on sales price) or 'markup' (on cost)
  contingencyPercent: number; // e.g. 5% for unpredicted expenses
  discountPercent: number; // e.g. 0% promo
  includeTax: boolean; // PPN 11%
  taxRatePercent: number; // default 11%
  items: CostItem[];
  clientName?: string;
  projectDate?: string;
  validUntilDate?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VendorOption {
  id: string;
  vendorName: string;
  unitPrice: number;
  shippingCost: number;
  minOrderQuantity: number;
  deliveryDays: number;
  rating: number; // 1-5
  notes?: string;
}

export interface VendorComparison {
  itemId: string;
  itemName: string;
  requiredQuantity: number;
  unit: string;
  baselineUnitPrice: number;
  vendors: VendorOption[];
}

export interface CalculationResult {
  totalMaterial: number;
  totalLabor: number;
  totalOverhead: number;
  baseCost: number; // DM + DL + OH
  contingencyAmount: number;
  totalCost: number; // baseCost + contingency
  costPerUnit: number; // totalCost / volume
  
  // Pricing
  suggestedPriceBeforeDiscount: number;
  discountAmount: number;
  suggestedPriceNet: number;
  taxAmount: number;
  finalPriceWithTax: number;
  
  // Profitability
  profitPerUnit: number; // Net price - cost per unit
  totalProfit: number;
  effectiveMarginPercent: number; // (Profit / Net Price) * 100
  effectiveMarkupPercent: number; // (Profit / Cost per Unit) * 100
  
  // Break-even
  fixedCostsTotal: number;
  variableCostsTotal: number;
  variableCostPerUnit: number;
  contributionMarginPerUnit: number;
  contributionMarginRatio: number;
  bepUnits: number;
  bepRevenue: number;
  isProfitPositive: boolean;
}

/**
 * Calculate complete HPP, RAB, Margin, and BEP metrics
 */
export function calculateHPP(project: {
  productionVolume: number;
  targetMargin: number;
  pricingMethod: 'margin' | 'markup';
  contingencyPercent: number;
  discountPercent: number;
  includeTax: boolean;
  taxRatePercent: number;
  items: CostItem[];
}): CalculationResult {
  const volume = Math.max(project.productionVolume || 1, 0.0001);
  
  let totalMaterial = 0;
  let totalLabor = 0;
  let totalOverhead = 0;
  let fixedCostsTotal = 0;
  let variableCostsTotal = 0;

  for (const item of project.items) {
    const subtotal = Math.max(0, (item.quantity || 0) * (item.unitPrice || 0));
    
    if (item.type === 'material') {
      totalMaterial += subtotal;
      variableCostsTotal += subtotal;
    } else if (item.type === 'labor') {
      totalLabor += subtotal;
      // If labor is fixed monthly salary vs variable per unit
      if (item.isFixedCost) {
        fixedCostsTotal += subtotal;
      } else {
        variableCostsTotal += subtotal;
      }
    } else if (item.type === 'overhead') {
      totalOverhead += subtotal;
      // Overheads default to fixed cost unless explicitly marked variable
      if (item.isFixedCost !== false) {
        fixedCostsTotal += subtotal;
      } else {
        variableCostsTotal += subtotal;
      }
    }
  }

  const baseCost = totalMaterial + totalLabor + totalOverhead;
  const contingencyPercent = Math.max(0, project.contingencyPercent || 0);
  const contingencyAmount = (baseCost * contingencyPercent) / 100;
  const totalCost = baseCost + contingencyAmount;
  const costPerUnit = totalCost / volume;

  // Pricing calculation
  const targetMargin = Math.max(0, Math.min(project.targetMargin || 0, 99.9));
  let suggestedPriceBeforeDiscount = costPerUnit;

  if (project.pricingMethod === 'markup') {
    // Markup on Cost: Price = Cost * (1 + Markup / 100)
    suggestedPriceBeforeDiscount = costPerUnit * (1 + targetMargin / 100);
  } else {
    // Margin on Price: Price = Cost / (1 - Margin / 100)
    const marginFactor = 1 - targetMargin / 100;
    suggestedPriceBeforeDiscount = marginFactor > 0 ? costPerUnit / marginFactor : costPerUnit * 2;
  }

  // Discount
  const discountPercent = Math.max(0, Math.min(project.discountPercent || 0, 100));
  const discountAmount = (suggestedPriceBeforeDiscount * discountPercent) / 100;
  const suggestedPriceNet = Math.max(0, suggestedPriceBeforeDiscount - discountAmount);

  // Tax (PPN 11%)
  const taxRate = project.includeTax ? Math.max(0, project.taxRatePercent || 11) : 0;
  const taxAmount = (suggestedPriceNet * taxRate) / 100;
  const finalPriceWithTax = suggestedPriceNet + taxAmount;

  // Profitability
  const profitPerUnit = suggestedPriceNet - costPerUnit;
  const totalProfit = profitPerUnit * volume;
  const effectiveMarginPercent = suggestedPriceNet > 0 ? (profitPerUnit / suggestedPriceNet) * 100 : 0;
  const effectiveMarkupPercent = costPerUnit > 0 ? (profitPerUnit / costPerUnit) * 100 : 0;

  // BEP Analysis
  const variableCostPerUnit = variableCostsTotal / volume;
  const contributionMarginPerUnit = suggestedPriceNet - variableCostPerUnit;
  const contributionMarginRatio = suggestedPriceNet > 0 ? contributionMarginPerUnit / suggestedPriceNet : 0;
  
  let bepUnits = 0;
  let bepRevenue = 0;
  if (contributionMarginPerUnit > 0) {
    const rawUnits = fixedCostsTotal / contributionMarginPerUnit;
    // Account for floating point rounding before ceil (e.g., 5.000000000001 -> 5)
    bepUnits = Math.ceil(Number((rawUnits - 1e-7).toFixed(6)));
    bepRevenue = bepUnits * suggestedPriceNet;
  } else if (fixedCostsTotal === 0 && variableCostsTotal > 0) {
    bepUnits = 0;
    bepRevenue = 0;
  } else {
    // Cannot reach BEP if price is less than variable cost
    bepUnits = Infinity;
    bepRevenue = Infinity;
  }

  return {
    totalMaterial,
    totalLabor,
    totalOverhead,
    baseCost,
    contingencyAmount,
    totalCost,
    costPerUnit,
    suggestedPriceBeforeDiscount,
    discountAmount,
    suggestedPriceNet,
    taxAmount,
    finalPriceWithTax,
    profitPerUnit,
    totalProfit,
    effectiveMarginPercent,
    effectiveMarkupPercent,
    fixedCostsTotal,
    variableCostsTotal,
    variableCostPerUnit,
    contributionMarginPerUnit,
    contributionMarginRatio,
    bepUnits: isFinite(bepUnits) ? bepUnits : -1,
    bepRevenue: isFinite(bepRevenue) ? bepRevenue : -1,
    isProfitPositive: profitPerUnit >= 0,
  };
}

/**
 * Calculates scenario comparisons: Base, Optimistic (+efficiency, -cost), Pessimistic (+inflation, -volume)
 */
export function calculateScenarios(project: ProjectData) {
  const baseResult = calculateHPP(project);

  // Optimistic: 8% discount on materials, 5% labor productivity improvement, +15% volume
  const optItems: CostItem[] = project.items.map((item) => {
    if (item.type === 'material') {
      return { ...item, unitPrice: item.unitPrice * 0.92 };
    }
    if (item.type === 'labor') {
      return { ...item, unitPrice: item.unitPrice * 0.95 };
    }
    return item;
  });
  const optResult = calculateHPP({
    ...project,
    productionVolume: Math.round(project.productionVolume * 1.15),
    items: optItems,
  });

  // Pessimistic: 12% material price hike, 8% overhead inflation, -15% volume
  const pesItems: CostItem[] = project.items.map((item) => {
    if (item.type === 'material') {
      return { ...item, unitPrice: item.unitPrice * 1.12 };
    }
    if (item.type === 'overhead') {
      return { ...item, unitPrice: item.unitPrice * 1.08 };
    }
    return item;
  });
  const pesResult = calculateHPP({
    ...project,
    productionVolume: Math.max(1, Math.round(project.productionVolume * 0.85)),
    items: pesItems,
  });

  return {
    base: baseResult,
    optimistic: optResult,
    pessimistic: pesResult,
  };
}

/**
 * Compare vendor pricing options for a specific cost item
 */
export function evaluateVendors(comparison: VendorComparison) {
  const currentTotal = comparison.requiredQuantity * comparison.baselineUnitPrice;

  const vendorResults = comparison.vendors.map((vendor) => {
    const itemSubtotal = comparison.requiredQuantity * vendor.unitPrice;
    const grandTotal = itemSubtotal + vendor.shippingCost;
    const difference = grandTotal - currentTotal;
    const savingsPercent = currentTotal > 0 ? ((currentTotal - grandTotal) / currentTotal) * 100 : 0;
    const meetsMinOrder = comparison.requiredQuantity >= vendor.minOrderQuantity;

    return {
      ...vendor,
      itemSubtotal,
      grandTotal,
      difference,
      savingsPercent,
      meetsMinOrder,
      isBestDeal: false,
    };
  });

  // Find lowest total that meets minimum order if possible
  const validVendors = vendorResults.filter((v) => v.meetsMinOrder);
  const bestVendor = validVendors.length > 0
    ? validVendors.reduce((prev, curr) => (prev.grandTotal < curr.grandTotal ? prev : curr))
    : vendorResults.reduce((prev, curr) => (prev.grandTotal < curr.grandTotal ? prev : curr), vendorResults[0]);

  if (bestVendor) {
    const match = vendorResults.find((v) => v.id === bestVendor.id);
    if (match) match.isBestDeal = true;
  }

  return {
    currentTotal,
    vendors: vendorResults,
  };
}

/**
 * Indonesian Rupiah formatting utility
 */
export function formatIDR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Percentage formatting utility
 */
export function formatPercent(value: number, decimals: number = 1): string {
  if (isNaN(value) || value === null || value === undefined) return '0%';
  return `${value.toFixed(decimals).replace('.', ',')}%`;
}
