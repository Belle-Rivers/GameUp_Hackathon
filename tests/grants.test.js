import { describe, expect, it } from 'vitest';
import { GRANTS } from '../js/backend/data/grants.js';

const EXPECTED_GRANTS = {
  HEAT_PUMP: {
    name: 'Heat Pump Subsidy',
    cost: 400,
    netZeroBoost: 10,
    eligibility: { naturalGasAboveM3: 100 },
    futureImpact: '75% reduction in heating-related CO₂.',
  },
  COMPOST_KIT: {
    name: 'Municipal Compost Kit',
    cost: 150,
    netZeroBoost: 8,
    eligibility: { landfillWasteAboveKg: 30 },
    futureImpact:
      '90% reduction in methane-related CO₂e from the relevant organic waste.',
  },
  TRANSIT_PASS: {
    name: 'EV Transit Voucher',
    cost: 200,
    netZeroBoost: 7,
    eligibility: { gasolineDistanceAboveKm: 300 },
    futureImpact:
      "Commute emissions become zero under the grant's intended electric mobility assumption.",
  },
  COOL_ROOF: {
    name: 'Cool/Green Roof Permit',
    cost: 300,
    netZeroBoost: 9,
    eligibility: { summerAcAboveKwh: 150, requiresAsphaltRoof: true },
    futureImpact: '40% reduction in cooling-related electricity consumption.',
  },
};

describe('GRANTS', () => {
  it('defines exactly the four grant IDs', () => {
    expect(Object.keys(GRANTS).sort()).toEqual(
      Object.keys(EXPECTED_GRANTS).sort(),
    );
  });

  it.each(Object.entries(EXPECTED_GRANTS))(
    'defines the correct grant data for %s',
    (id, expected) => {
      expect(GRANTS[id]).toEqual({ id, ...expected });
    },
  );

  it('uses positive finite costs and Net-Zero boosts', () => {
    for (const grant of Object.values(GRANTS)) {
      expect(Number.isFinite(grant.cost)).toBe(true);
      expect(grant.cost).toBeGreaterThan(0);
      expect(Number.isFinite(grant.netZeroBoost)).toBe(true);
      expect(grant.netZeroBoost).toBeGreaterThan(0);
    }
  });

  it('uses the approved Cool/Green Roof AC threshold', () => {
    expect(GRANTS.COOL_ROOF.eligibility.summerAcAboveKwh).toBe(150);
  });
});
