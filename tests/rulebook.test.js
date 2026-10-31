import { describe, expect, it } from 'vitest';
import { EMISSION_RULEBOOK } from '../js/backend/data/rulebook.js';

const EXPECTED_RATES = {
  GRID_ELEC: {
    category: 'Electricity',
    activity: 'Grid electricity',
    rate: 0.5,
    unit: 'kg CO₂/kWh',
  },
  GAS_HEAT: {
    category: 'Heating',
    activity: 'Natural gas',
    rate: 2.0,
    unit: 'kg CO₂/m³',
  },
  SOLAR_OFFSET: {
    category: 'Electricity',
    activity: 'Rooftop solar offset',
    rate: -0.4,
    unit: 'kg CO₂/kWh',
  },
  BEEF: {
    category: 'Food',
    activity: 'Beef / ruminant meat',
    rate: 15.0,
    unit: 'kg CO₂/pack',
  },
  IMPORTED_GOODS: {
    category: 'Food',
    activity: 'Imported out-of-season goods',
    rate: 5.0,
    unit: 'kg CO₂/item',
  },
  LOCAL_FOOD: {
    category: 'Food',
    activity: 'Local organic / plant food',
    rate: 0.5,
    unit: 'kg CO₂/pack',
  },
  GASOLINE: {
    category: 'Transportation',
    activity: 'Gasoline travel',
    rate: 0.2,
    unit: 'kg CO₂/km',
  },
  FLIGHT: {
    category: 'Transportation',
    activity: 'Domestic air travel',
    rate: 150.0,
    unit: 'kg CO₂/ticket',
  },
  PUBLIC_TRANSIT: {
    category: 'Transportation',
    activity: 'Public electric transit',
    rate: 0.0,
    unit: 'kg CO₂/km',
  },
  LANDFILL: {
    category: 'Waste',
    activity: 'Landfill waste',
    rate: 3.0,
    unit: 'kg CO₂e/kg',
  },
  COMPOST: {
    category: 'Waste',
    activity: 'Composted organic waste',
    rate: 0.1,
    unit: 'kg CO₂e/kg',
  },
};

describe('EMISSION_RULEBOOK', () => {
  it('defines exactly the canonical rate keys', () => {
    expect(Object.keys(EMISSION_RULEBOOK).sort()).toEqual(
      Object.keys(EXPECTED_RATES).sort(),
    );
  });

  it('preserves the PRD-defined rate keys', () => {
    for (const key of ['GRID_ELEC', 'GAS_HEAT', 'LOCAL_FOOD', 'BEEF', 'FLIGHT']) {
      expect(EMISSION_RULEBOOK).toHaveProperty(key);
    }
  });

  it('defines the implementation-defined rate keys', () => {
    for (const key of [
      'SOLAR_OFFSET',
      'IMPORTED_GOODS',
      'GASOLINE',
      'PUBLIC_TRANSIT',
      'LANDFILL',
      'COMPOST',
    ]) {
      expect(EMISSION_RULEBOOK).toHaveProperty(key);
    }
  });

  it.each(Object.entries(EXPECTED_RATES))(
    'defines the correct rate for %s',
    (key, expected) => {
      expect(EMISSION_RULEBOOK[key]).toEqual({ key, ...expected });
    },
  );

  it('uses finite numeric rates', () => {
    for (const rate of Object.values(EMISSION_RULEBOOK)) {
      expect(Number.isFinite(rate.rate)).toBe(true);
    }
  });
});
