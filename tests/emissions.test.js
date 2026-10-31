import { describe, expect, it } from 'vitest';
import {
  calculateActualEmissions,
  calculateItemEmissions,
  calculateReceiptBreakdown,
  compareDeclaration,
  detectDiscrepancy,
} from '../js/backend/calculations/emissions.js';
import { CITIZEN_CASES } from '../js/backend/data/cases.js';

function makeCase(items, extraReceipts = []) {
  return {
    id: 'C999',
    day: 1,
    name: 'Test Citizen',
    district: 'Test District',
    note: 'Test note',
    declaredCO2: 0,
    roofType: 'OTHER',
    eligibleGrant: null,
    grantExplanation: '',
    receipts: [{ type: 'Energy', title: 'Test Receipt', items }, ...extraReceipts],
  };
}

describe('calculateItemEmissions', () => {
  it('calculates 100 kWh of grid electricity as 50 kg CO2', () => {
    const item = { label: 'Grid Electricity', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' };
    expect(calculateItemEmissions(item)).toBe(50);
  });

  it('calculates 10 m³ of natural gas as 20 kg CO2', () => {
    const item = { label: 'Natural Gas', qty: 10, unit: 'm³', rateKey: 'GAS_HEAT' };
    expect(calculateItemEmissions(item)).toBe(20);
  });

  it('calculates 2 beef packs as 30 kg CO2', () => {
    const item = { label: 'Beef', qty: 2, unit: 'pack', rateKey: 'BEEF' };
    expect(calculateItemEmissions(item)).toBe(30);
  });

  it('returns a negative contribution for rooftop solar offsets', () => {
    const item = { label: 'Rooftop Solar Offset', qty: 100, unit: 'kWh', rateKey: 'SOLAR_OFFSET' };
    expect(calculateItemEmissions(item)).toBe(-40);
  });

  it('returns zero for zero-emission public transit', () => {
    const item = { label: 'Public Electric Transit', qty: 50, unit: 'km', rateKey: 'PUBLIC_TRANSIT' };
    expect(calculateItemEmissions(item)).toBe(0);
  });

  it('throws for an unknown rate key instead of assigning a rate', () => {
    const item = { label: 'Mystery', qty: 1, unit: 'unit', rateKey: 'UNKNOWN' };
    expect(() => calculateItemEmissions(item)).toThrow('Unknown emission rate key: UNKNOWN');
  });
});

describe('calculateActualEmissions', () => {
  it('sums every item across every receipt', () => {
    const citizenCase = makeCase(
      [
        { label: 'Grid Electricity', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' },
        { label: 'Natural Gas', qty: 10, unit: 'm³', rateKey: 'GAS_HEAT' },
        { label: 'Beef', qty: 2, unit: 'pack', rateKey: 'BEEF' },
      ],
      [
        {
          type: 'Transportation',
          title: 'Second Receipt',
          items: [
            { label: 'Domestic Air Travel', qty: 1, unit: 'ticket', rateKey: 'FLIGHT' },
            { label: 'Landfill Waste', qty: 5, unit: 'kg', rateKey: 'LANDFILL' },
          ],
        },
      ],
    );

    expect(calculateActualEmissions(citizenCase)).toBe(265);
  });

  it('lets negative offsets reduce the total', () => {
    const citizenCase = makeCase([
      { label: 'Grid Electricity', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' },
      { label: 'Rooftop Solar Offset', qty: 50, unit: 'kWh', rateKey: 'SOLAR_OFFSET' },
    ]);

    expect(calculateActualEmissions(citizenCase)).toBe(30);
  });

  it('clamps a net-negative total to zero', () => {
    const citizenCase = makeCase([
      { label: 'Rooftop Solar Offset', qty: 100, unit: 'kWh', rateKey: 'SOLAR_OFFSET' },
    ]);

    expect(calculateActualEmissions(citizenCase)).toBe(0);
  });

  it('calculates the sample citizen cases from their receipt items', () => {
    expect(calculateActualEmissions(CITIZEN_CASES[0])).toBe(166);
    expect(calculateActualEmissions(CITIZEN_CASES[1])).toBeCloseTo(165.2);
  });
});

describe('calculateReceiptBreakdown', () => {
  it('returns the case id and every item contribution with its reference', () => {
    const citizenCase = makeCase([
      { label: 'Grid Electricity', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' },
      { label: 'Beef', qty: 2, unit: 'pack', rateKey: 'BEEF' },
    ]);

    expect(calculateReceiptBreakdown(citizenCase)).toEqual({
      caseId: 'C999',
      items: [
        {
          ref: { receiptIndex: 0, itemIndex: 0 },
          label: 'Grid Electricity',
          qty: 100,
          unit: 'kWh',
          co2: 50,
        },
        {
          ref: { receiptIndex: 0, itemIndex: 1 },
          label: 'Beef',
          qty: 2,
          unit: 'pack',
          co2: 30,
        },
      ],
      categorySubtotals: { Energy: 80 },
      totalCO2: 80,
    });
  });

  it('groups category subtotals across receipts of the same type', () => {
    const citizenCase = makeCase(
      [
        { label: 'Grid Electricity', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' },
        { label: 'Rooftop Solar Offset', qty: 50, unit: 'kWh', rateKey: 'SOLAR_OFFSET' },
      ],
      [
        {
          type: 'Energy',
          title: 'Second Energy Receipt',
          items: [{ label: 'Natural Gas', qty: 10, unit: 'm³', rateKey: 'GAS_HEAT' }],
        },
        {
          type: 'Transportation',
          title: 'Travel Receipt',
          items: [
            { label: 'Domestic Air Travel', qty: 1, unit: 'ticket', rateKey: 'FLIGHT' },
            { label: 'Public Electric Transit', qty: 10, unit: 'km', rateKey: 'PUBLIC_TRANSIT' },
          ],
        },
      ],
    );

    const breakdown = calculateReceiptBreakdown(citizenCase);

    expect(breakdown.items).toHaveLength(5);
    expect(breakdown.items[2].ref).toEqual({ receiptIndex: 1, itemIndex: 0 });
    expect(breakdown.categorySubtotals).toEqual({
      Energy: 50,
      Transportation: 150,
    });
    expect(breakdown.totalCO2).toBe(200);
  });

  it('preserves negative offsets in item and category values while clamping the total', () => {
    const citizenCase = makeCase([
      { label: 'Rooftop Solar Offset', qty: 100, unit: 'kWh', rateKey: 'SOLAR_OFFSET' },
    ]);

    const breakdown = calculateReceiptBreakdown(citizenCase);

    expect(breakdown.items[0].co2).toBe(-40);
    expect(breakdown.categorySubtotals).toEqual({ Energy: -40 });
    expect(breakdown.totalCO2).toBe(0);
  });

  it('matches the case total from calculateActualEmissions', () => {
    for (const citizenCase of CITIZEN_CASES) {
      const breakdown = calculateReceiptBreakdown(citizenCase);
      expect(breakdown.totalCO2).toBe(calculateActualEmissions(citizenCase));
    }
  });

  it('calculates the sample cases per item and category', () => {
    const first = calculateReceiptBreakdown(CITIZEN_CASES[0]);
    expect(first.items).toHaveLength(4);
    expect(first.categorySubtotals).toEqual({ Energy: 166 });
    expect(first.totalCO2).toBe(166);

    const second = calculateReceiptBreakdown(CITIZEN_CASES[1]);
    expect(second.items).toHaveLength(4);
    expect(second.categorySubtotals['Transport and Food']).toBeCloseTo(165.2);
    expect(second.totalCO2).toBeCloseTo(165.2);
  });

  it('throws for an unknown rate key', () => {
    const citizenCase = makeCase([
      { label: 'Mystery', qty: 1, unit: 'unit', rateKey: 'UNKNOWN' },
    ]);

    expect(() => calculateReceiptBreakdown(citizenCase)).toThrow(
      'Unknown emission rate key: UNKNOWN',
    );
  });
});

describe('compareDeclaration', () => {
  it('returns a positive discrepancy when actual emissions exceed the declaration', () => {
    const citizenCase = makeCase([
      { label: 'Grid Electricity', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' },
      { label: 'Beef', qty: 2, unit: 'pack', rateKey: 'BEEF' },
    ]);
    citizenCase.declaredCO2 = 30;

    const comparison = compareDeclaration(citizenCase);

    expect(comparison).toEqual({
      caseId: 'C999',
      actualCO2: 80,
      declaredCO2: 30,
      discrepancy: 50,
      discrepancyRatio: 0.625,
    });
  });

  it('returns a negative discrepancy when the declaration exceeds actual emissions', () => {
    const citizenCase = makeCase([
      { label: 'Grid Electricity', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' },
    ]);
    citizenCase.declaredCO2 = 100;

    const comparison = compareDeclaration(citizenCase);

    expect(comparison.actualCO2).toBe(50);
    expect(comparison.declaredCO2).toBe(100);
    expect(comparison.discrepancy).toBe(-50);
    expect(comparison.discrepancyRatio).toBe(-1);
  });

  it('returns zero discrepancy when declared and actual emissions match', () => {
    const citizenCase = makeCase([
      { label: 'Natural Gas', qty: 10, unit: 'm³', rateKey: 'GAS_HEAT' },
    ]);
    citizenCase.declaredCO2 = 20;

    const comparison = compareDeclaration(citizenCase);

    expect(comparison.discrepancy).toBe(0);
    expect(comparison.discrepancyRatio).toBe(0);
  });

  it('returns a null ratio when actual emissions are zero', () => {
    const citizenCase = makeCase([
      { label: 'Rooftop Solar Offset', qty: 100, unit: 'kWh', rateKey: 'SOLAR_OFFSET' },
    ]);
    citizenCase.declaredCO2 = 10;

    const comparison = compareDeclaration(citizenCase);

    expect(comparison.actualCO2).toBe(0);
    expect(comparison.declaredCO2).toBe(10);
    expect(comparison.discrepancy).toBe(-10);
    expect(comparison.discrepancyRatio).toBeNull();
  });

  it('returns a null ratio when both emissions are zero', () => {
    const citizenCase = makeCase([
      { label: 'Public Electric Transit', qty: 10, unit: 'km', rateKey: 'PUBLIC_TRANSIT' },
    ]);
    citizenCase.declaredCO2 = 0;

    const comparison = compareDeclaration(citizenCase);

    expect(comparison.discrepancy).toBe(0);
    expect(comparison.discrepancyRatio).toBeNull();
  });

  it('compares the sample citizen cases against their declarations', () => {
    const first = compareDeclaration(CITIZEN_CASES[0]);
    expect(first.actualCO2).toBe(166);
    expect(first.declaredCO2).toBe(80);
    expect(first.discrepancy).toBe(86);
    expect(first.discrepancyRatio).toBeCloseTo(86 / 166);

    const second = compareDeclaration(CITIZEN_CASES[1]);
    expect(second.actualCO2).toBeCloseTo(165.2);
    expect(second.declaredCO2).toBe(120);
    expect(second.discrepancy).toBeCloseTo(45.2);
    expect(second.discrepancyRatio).toBeCloseTo(45.2 / 165.2);
  });
});

describe('detectDiscrepancy', () => {
  function comparisonFor(actualCO2, declaredCO2) {
    const citizenCase = makeCase([
      { label: 'Grid Electricity', qty: actualCO2 / 0.5, unit: 'kWh', rateKey: 'GRID_ELEC' },
    ]);
    citizenCase.declaredCO2 = declaredCO2;
    return compareDeclaration(citizenCase);
  }

  it('accepts a difference of exactly 2 kg as within tolerance', () => {
    expect(detectDiscrepancy(comparisonFor(50, 52))).toEqual({
      absoluteDiscrepancy: 2,
      withinTolerance: true,
      isZeroEmission: false,
    });
    expect(detectDiscrepancy(comparisonFor(50, 48)).withinTolerance).toBe(true);
  });

  it('rejects differences greater than 2 kg', () => {
    expect(detectDiscrepancy(comparisonFor(50, 52.01)).withinTolerance).toBe(false);
    expect(detectDiscrepancy(comparisonFor(50, 47.99)).withinTolerance).toBe(false);
  });

  it('uses the absolute discrepancy for zero-emission cases', () => {
    const comparison = comparisonFor(0, 2);

    expect(comparison.discrepancyRatio).toBeNull();
    expect(detectDiscrepancy(comparison)).toEqual({
      absoluteDiscrepancy: 2,
      withinTolerance: true,
      isZeroEmission: true,
    });
  });

  it('rejects a zero-emission declaration outside the tolerance', () => {
    expect(detectDiscrepancy(comparisonFor(0, 2.01))).toEqual({
      absoluteDiscrepancy: 2.01,
      withinTolerance: false,
      isZeroEmission: true,
    });
  });

  it('accepts a zero-emission case when both values are zero', () => {
    expect(detectDiscrepancy(comparisonFor(0, 0))).toEqual({
      absoluteDiscrepancy: 0,
      withinTolerance: true,
      isZeroEmission: true,
    });
  });
});
