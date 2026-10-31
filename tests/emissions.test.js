import { describe, expect, it } from 'vitest';
import {
  calculateActualEmissions,
  calculateItemEmissions,
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
