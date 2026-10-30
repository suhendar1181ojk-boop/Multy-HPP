import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateHPP, calculateScenarios, evaluateVendors, CostItem, ProjectData } from './calculations';

test('calculateHPP correctly computes direct materials, labor, overhead and cost per unit', () => {
  const items: CostItem[] = [
    { id: '1', name: 'Beras', type: 'material', quantity: 10, unit: 'kg', unitPrice: 15000 }, // 150,000
    { id: '2', name: 'Ayam', type: 'material', quantity: 10, unit: 'ekor', unitPrice: 35000 }, // 350,000
    { id: '3', name: 'Koki', type: 'labor', quantity: 1, unit: 'hari', unitPrice: 150000 }, // 150,000
    { id: '4', name: 'Gas & Listrik', type: 'overhead', quantity: 1, unit: 'paket', unitPrice: 50000, isFixedCost: true }, // 50,000
  ];

  // Base cost = 150k + 350k + 150k + 50k = 700,000
  // Contingency = 10% = 70,000
  // Total cost = 770,000
  // Volume = 70 porsi -> Cost per unit = 11,000
  const result = calculateHPP({
    productionVolume: 70,
    targetMargin: 20,
    pricingMethod: 'markup',
    contingencyPercent: 10,
    discountPercent: 0,
    includeTax: false,
    taxRatePercent: 11,
    items,
  });

  assert.equal(result.totalMaterial, 500000);
  assert.equal(result.totalLabor, 150000);
  assert.equal(result.totalOverhead, 50000);
  assert.equal(result.baseCost, 700000);
  assert.equal(result.contingencyAmount, 70000);
  assert.equal(result.totalCost, 770000);
  assert.equal(result.costPerUnit, 11000);

  // Markup 20%: Price = 11000 * 1.20 = 13200
  assert.equal(result.suggestedPriceBeforeDiscount, 13200);
  assert.equal(result.profitPerUnit, 2200);
  assert.equal(result.totalProfit, 154000);
});

test('calculateHPP distinguishes Margin on Price vs Markup on Cost', () => {
  const items: CostItem[] = [
    { id: '1', name: 'Item A', type: 'material', quantity: 1, unit: 'pcs', unitPrice: 100000 },
  ];

  // Cost = 100,000. Target = 50%
  // Markup 50%: Price = 100,000 * 1.50 = 150,000 (Margin = 50,000 / 150,000 = 33.33%)
  const markupResult = calculateHPP({
    productionVolume: 1,
    targetMargin: 50,
    pricingMethod: 'markup',
    contingencyPercent: 0,
    discountPercent: 0,
    includeTax: false,
    taxRatePercent: 11,
    items,
  });
  assert.equal(markupResult.costPerUnit, 100000);
  assert.equal(markupResult.suggestedPriceNet, 150000);
  assert.equal(markupResult.profitPerUnit, 50000);

  // Margin 50%: Price = 100,000 / (1 - 0.5) = 200,000 (Profit = 100,000, 50% of price)
  const marginResult = calculateHPP({
    productionVolume: 1,
    targetMargin: 50,
    pricingMethod: 'margin',
    contingencyPercent: 0,
    discountPercent: 0,
    includeTax: false,
    taxRatePercent: 11,
    items,
  });
  assert.equal(marginResult.suggestedPriceNet, 200000);
  assert.equal(marginResult.profitPerUnit, 100000);
  assert.equal(Math.round(marginResult.effectiveMarginPercent), 50);
});

test('calculateHPP correctly computes BEP (Break Even Point)', () => {
  // Selling Price = 20,000
  // Variable Cost per unit = 10,000 (Material)
  // Contribution Margin = 10,000 per unit
  // Fixed Cost = 50,000 (Overhead)
  // BEP units = 50,000 / 10,000 = 5 units
  const items: CostItem[] = [
    { id: '1', name: 'Bahan', type: 'material', quantity: 10, unit: 'pcs', unitPrice: 10000 }, // Variable = 100k for 10 units = 10k/unit
    { id: '2', name: 'Sewa Alat', type: 'overhead', quantity: 1, unit: 'bln', unitPrice: 50000, isFixedCost: true },
  ];

  const result = calculateHPP({
    productionVolume: 10,
    targetMargin: 20000, // Price manually set via pricing
    pricingMethod: 'markup',
    contingencyPercent: 0,
    discountPercent: 0,
    includeTax: false,
    taxRatePercent: 11,
    items,
  });

  // Cost per unit = (100,000 + 50,000) / 10 = 15,000
  // Let's check with 33.333% markup -> 20,000 price
  const resultWithMarkup = calculateHPP({
    productionVolume: 10,
    targetMargin: 33.33333333333,
    pricingMethod: 'markup',
    contingencyPercent: 0,
    discountPercent: 0,
    includeTax: false,
    taxRatePercent: 11,
    items,
  });

  // Price net ~ 20,000
  // Fixed costs = 50,000
  // Variable cost per unit = 10,000
  // Contribution margin ~ 10,000
  // BEP units = 50,000 / 10,000 = 5
  assert.equal(resultWithMarkup.fixedCostsTotal, 50000);
  assert.equal(resultWithMarkup.variableCostPerUnit, 10000);
  assert.equal(resultWithMarkup.bepUnits, 5);
});

test('evaluateVendors calculates correct savings and identifies best deal', () => {
  const comparison = {
    itemId: 'item-1',
    itemName: 'Beras Ramos Super',
    requiredQuantity: 100,
    unit: 'kg',
    baselineUnitPrice: 16000, // Current total = 1,600,000
    vendors: [
      {
        id: 'v1',
        vendorName: 'Toko Sumber Pangan',
        unitPrice: 14500, // 1,450,000 + 50,000 = 1,500,000 (Savings 100,000)
        shippingCost: 50000,
        minOrderQuantity: 50,
        deliveryDays: 1,
        rating: 4.8,
      },
      {
        id: 'v2',
        vendorName: 'Grosir Beras Jaya',
        unitPrice: 14000, // 1,400,000 + 200,000 = 1,600,000 (No savings due to high shipping)
        shippingCost: 200000,
        minOrderQuantity: 100,
        deliveryDays: 3,
        rating: 4.2,
      },
    ],
  };

  const evalResult = evaluateVendors(comparison);
  assert.equal(evalResult.currentTotal, 1600000);
  assert.equal(evalResult.vendors[0].isBestDeal, true);
  assert.equal(evalResult.vendors[0].grandTotal, 1500000);
  assert.equal(evalResult.vendors[0].difference, -100000);
  assert.equal(evalResult.vendors[1].isBestDeal, false);
});
