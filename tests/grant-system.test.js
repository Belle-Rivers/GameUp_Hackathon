import { describe, expect, it } from 'vitest';
import {
  getHouseholdConsumption,
  checkGrantEligibility,
  getEligibleGrants,
  determineEligibleGrant,
  validateGrant,
  calculateGrantMetricChanges,
  GRANT_ACTION_EFFECTS,
} from '../js/backend/systems/grant-system.js';
import { GRANTS } from '../js/backend/data/grants.js';

function makeCase({
  receipts = [],
  roofType = 'OTHER',
  id = 'C999',
  declaredCO2 = 50,
} = {}) {
  return {
    id,
    day: 1,
    name: 'Test Citizen',
    district: 'Suburbs',
    note: 'Sample note',
    declaredCO2,
    roofType,
    receipts,
    eligibleGrant: null,
    grantExplanation: '',
  };
}

describe('getHouseholdConsumption', () => {
  it('extracts consumption metrics across receipts', () => {
    const citizenCase = makeCase({
      roofType: 'ASPHALT',
      receipts: [
        {
          type: 'Energy',
          title: 'Home Energy',
          items: [
            { label: 'Grid Electricity', qty: 200, unit: 'kWh', rateKey: 'GRID_ELEC' },
            { label: 'Natural Gas', qty: 120, unit: 'm³', rateKey: 'GAS_HEAT' },
          ],
        },
        {
          type: 'COOLING',
          title: 'Summer Air Conditioning',
          items: [
            { label: 'Summer AC', qty: 180, unit: 'kWh', rateKey: 'GRID_ELEC' },
          ],
        },
        {
          type: 'Transport & Waste',
          title: 'Weekly Records',
          items: [
            { label: 'Gasoline Car', qty: 350, unit: 'km', rateKey: 'GASOLINE' },
            { label: 'Landfill Waste', qty: 45, unit: 'kg', rateKey: 'LANDFILL' },
          ],
        },
      ],
    });

    const metrics = getHouseholdConsumption(citizenCase);
    expect(metrics.naturalGasM3).toBe(120);
    expect(metrics.landfillWasteKg).toBe(45);
    expect(metrics.gasolineDistanceKm).toBe(350);
    expect(metrics.summerCoolingKwh).toBe(180);
    expect(metrics.roofType).toBe('ASPHALT');
  });

  it('does not count grid electricity from non-COOLING receipts toward summer AC cooling', () => {
    const citizenCase = makeCase({
      receipts: [
        {
          type: 'Energy',
          title: 'Regular Power',
          items: [
            { label: 'Grid Electricity', qty: 500, unit: 'kWh', rateKey: 'GRID_ELEC' },
          ],
        },
      ],
    });

    const metrics = getHouseholdConsumption(citizenCase);
    expect(metrics.summerCoolingKwh).toBe(0);
  });
});

describe('checkGrantEligibility', () => {
  it('accumulates consumption across multiple receipts and items', () => {
    const multiCase = makeCase({
      roofType: 'ASPHALT',
      receipts: [
        {
          type: 'COOLING',
          title: 'AC Zone 1',
          items: [{ label: 'AC Living Room', qty: 90, unit: 'kWh', rateKey: 'GRID_ELEC' }],
        },
        {
          type: 'COOLING',
          title: 'AC Zone 2',
          items: [{ label: 'AC Bedroom', qty: 70, unit: 'kWh', rateKey: 'GRID_ELEC' }],
        },
        {
          type: 'Energy 1',
          title: 'Heater Unit 1',
          items: [{ label: 'Natural Gas', qty: 60, unit: 'm³', rateKey: 'GAS_HEAT' }],
        },
        {
          type: 'Energy 2',
          title: 'Heater Unit 2',
          items: [{ label: 'Natural Gas', qty: 50, unit: 'm³', rateKey: 'GAS_HEAT' }],
        },
      ],
    });

    // 90 + 70 = 160 > 150 kWh with ASPHALT roof -> eligible for COOL_ROOF
    expect(checkGrantEligibility(multiCase, 'COOL_ROOF').eligible).toBe(true);
    // 60 + 50 = 110 > 100 m³ -> eligible for HEAT_PUMP
    expect(checkGrantEligibility(multiCase, 'HEAT_PUMP').eligible).toBe(true);
    expect(getEligibleGrants(multiCase).sort()).toEqual(['COOL_ROOF', 'HEAT_PUMP'].sort());
  });

  describe('HEAT_PUMP', () => {
    it('is eligible when natural gas exceeds 100 m³', () => {
      const c = makeCase({
        receipts: [
          {
            type: 'Energy',
            title: 'Gas Heat',
            items: [{ label: 'Natural Gas', qty: 101, unit: 'm³', rateKey: 'GAS_HEAT' }],
          },
        ],
      });
      const res = checkGrantEligibility(c, 'HEAT_PUMP');
      expect(res.eligible).toBe(true);
      expect(res.reason).toContain('exceeds the 100 m³ threshold');
    });

    it('is ineligible when natural gas is exactly 100 m³ (strict threshold)', () => {
      const c = makeCase({
        receipts: [
          {
            type: 'Energy',
            title: 'Gas Heat',
            items: [{ label: 'Natural Gas', qty: 100, unit: 'm³', rateKey: 'GAS_HEAT' }],
          },
        ],
      });
      const res = checkGrantEligibility(c, 'HEAT_PUMP');
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain('does not exceed');
    });

    it('is ineligible when natural gas is below 100 m³', () => {
      const c = makeCase({
        receipts: [
          {
            type: 'Energy',
            title: 'Gas Heat',
            items: [{ label: 'Natural Gas', qty: 50, unit: 'm³', rateKey: 'GAS_HEAT' }],
          },
        ],
      });
      expect(checkGrantEligibility(c, 'HEAT_PUMP').eligible).toBe(false);
    });
  });

  describe('COMPOST_KIT', () => {
    it('is eligible when landfill waste exceeds 30 kg', () => {
      const c = makeCase({
        receipts: [
          {
            type: 'Waste',
            title: 'Trash',
            items: [{ label: 'Landfill Waste', qty: 31, unit: 'kg', rateKey: 'LANDFILL' }],
          },
        ],
      });
      const res = checkGrantEligibility(c, 'COMPOST_KIT');
      expect(res.eligible).toBe(true);
      expect(res.reason).toContain('exceeds the 30 kg threshold');
    });

    it('is ineligible when landfill waste is exactly 30 kg', () => {
      const c = makeCase({
        receipts: [
          {
            type: 'Waste',
            title: 'Trash',
            items: [{ label: 'Landfill Waste', qty: 30, unit: 'kg', rateKey: 'LANDFILL' }],
          },
        ],
      });
      expect(checkGrantEligibility(c, 'COMPOST_KIT').eligible).toBe(false);
    });

    it('is ineligible when landfill waste is below 30 kg', () => {
      const c = makeCase({
        receipts: [
          {
            type: 'Waste',
            title: 'Trash',
            items: [{ label: 'Landfill Waste', qty: 15, unit: 'kg', rateKey: 'LANDFILL' }],
          },
        ],
      });
      expect(checkGrantEligibility(c, 'COMPOST_KIT').eligible).toBe(false);
    });
  });

  describe('TRANSIT_PASS', () => {
    it('is eligible when gasoline travel exceeds 300 km', () => {
      const c = makeCase({
        receipts: [
          {
            type: 'Transport',
            title: 'Driving',
            items: [{ label: 'Gasoline Car', qty: 301, unit: 'km', rateKey: 'GASOLINE' }],
          },
        ],
      });
      const res = checkGrantEligibility(c, 'TRANSIT_PASS');
      expect(res.eligible).toBe(true);
      expect(res.reason).toContain('exceeds the 300 km threshold');
    });

    it('is ineligible when gasoline travel is exactly 300 km', () => {
      const c = makeCase({
        receipts: [
          {
            type: 'Transport',
            title: 'Driving',
            items: [{ label: 'Gasoline Car', qty: 300, unit: 'km', rateKey: 'GASOLINE' }],
          },
        ],
      });
      expect(checkGrantEligibility(c, 'TRANSIT_PASS').eligible).toBe(false);
    });

    it('is ineligible when gasoline travel is below 300 km', () => {
      const c = makeCase({
        receipts: [
          {
            type: 'Transport',
            title: 'Driving',
            items: [{ label: 'Gasoline Car', qty: 200, unit: 'km', rateKey: 'GASOLINE' }],
          },
        ],
      });
      expect(checkGrantEligibility(c, 'TRANSIT_PASS').eligible).toBe(false);
    });
  });

  describe('COOL_ROOF (D-15, D-16)', () => {
    it('is eligible when summer cooling AC > 150 kWh AND roofType is ASPHALT', () => {
      const c = makeCase({
        roofType: 'ASPHALT',
        receipts: [
          {
            type: 'COOLING',
            title: 'AC Receipts',
            items: [{ label: 'Summer AC', qty: 151, unit: 'kWh', rateKey: 'GRID_ELEC' }],
          },
        ],
      });
      const res = checkGrantEligibility(c, 'COOL_ROOF');
      expect(res.eligible).toBe(true);
      expect(res.reason).toContain('exceeds 150 kWh with an asphalt roof');
    });

    it('is ineligible when summer cooling AC is exactly 150 kWh (strict > 150 per D-15)', () => {
      const c = makeCase({
        roofType: 'ASPHALT',
        receipts: [
          {
            type: 'COOLING',
            title: 'AC Receipts',
            items: [{ label: 'Summer AC', qty: 150, unit: 'kWh', rateKey: 'GRID_ELEC' }],
          },
        ],
      });
      const res = checkGrantEligibility(c, 'COOL_ROOF');
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain('does not exceed the 150 kWh threshold');
    });

    it('is ineligible when summer cooling AC > 150 kWh but roofType is not ASPHALT', () => {
      const c = makeCase({
        roofType: 'OTHER',
        receipts: [
          {
            type: 'COOLING',
            title: 'AC Receipts',
            items: [{ label: 'Summer AC', qty: 200, unit: 'kWh', rateKey: 'GRID_ELEC' }],
          },
        ],
      });
      const res = checkGrantEligibility(c, 'COOL_ROOF');
      expect(res.eligible).toBe(false);
      expect(res.reason).toContain('does not have an asphalt roof');
    });

    it('is ineligible when roofType is ASPHALT but cooling is in non-COOLING receipt', () => {
      const c = makeCase({
        roofType: 'ASPHALT',
        receipts: [
          {
            type: 'Energy',
            title: 'General Energy',
            items: [{ label: 'Grid Electricity', qty: 300, unit: 'kWh', rateKey: 'GRID_ELEC' }],
          },
        ],
      });
      const res = checkGrantEligibility(c, 'COOL_ROOF');
      expect(res.eligible).toBe(false);
    });
  });

  it('returns ineligible for unknown grant ID', () => {
    const c = makeCase();
    const res = checkGrantEligibility(c, 'UNKNOWN_GRANT');
    expect(res.eligible).toBe(false);
    expect(res.reason).toContain('Unknown grant ID');
  });
});

describe('getEligibleGrants and determineEligibleGrant', () => {
  it('identifies eligible grants and returns empty when none match', () => {
    const cleanCase = makeCase();
    expect(getEligibleGrants(cleanCase)).toEqual([]);
    expect(determineEligibleGrant(cleanCase)).toBeNull();

    const gasCase = makeCase({
      receipts: [
        {
          type: 'Energy',
          title: 'Gas',
          items: [{ label: 'Gas Heat', qty: 150, unit: 'm³', rateKey: 'GAS_HEAT' }],
        },
      ],
    });
    expect(getEligibleGrants(gasCase)).toEqual(['HEAT_PUMP']);
    expect(determineEligibleGrant(gasCase)).toBe('HEAT_PUMP');
  });
});

describe('validateGrant', () => {
  it('validates correct grant when citizen is eligible', () => {
    const c = makeCase({
      receipts: [
        {
          type: 'Waste',
          title: 'Waste',
          items: [{ label: 'Landfill Waste', qty: 50, unit: 'kg', rateKey: 'LANDFILL' }],
        },
      ],
    });
    const res = validateGrant(c, 'COMPOST_KIT');
    expect(res.isValid).toBe(true);
    expect(res.grantId).toBe('COMPOST_KIT');
    expect(res.cost).toBe(150);
    expect(res.netZeroBoost).toBe(8);
    expect(res.grant).toEqual(GRANTS.COMPOST_KIT);
  });

  it('rejects grant when citizen is ineligible, charging grant cost with 0 Net-Zero boost', () => {
    const c = makeCase({
      receipts: [
        {
          type: 'Waste',
          title: 'Waste',
          items: [{ label: 'Landfill Waste', qty: 10, unit: 'kg', rateKey: 'LANDFILL' }],
        },
      ],
    });
    const res = validateGrant(c, 'COMPOST_KIT');
    expect(res.isValid).toBe(false);
    expect(res.grantId).toBe('COMPOST_KIT');
    expect(res.cost).toBe(150);
    expect(res.netZeroBoost).toBe(0);
    expect(res.reason).toContain('Ineligible for Municipal Compost Kit');
  });

  it('rejects when no grant ID is provided', () => {
    const c = makeCase();
    const res = validateGrant(c);
    expect(res.isValid).toBe(false);
    expect(res.cost).toBe(0);
    expect(res.netZeroBoost).toBe(0);
  });

  it('rejects when unknown grant ID is provided', () => {
    const c = makeCase();
    const res = validateGrant(c, 'SOLAR_BONUS');
    expect(res.isValid).toBe(false);
    expect(res.cost).toBe(0);
    expect(res.netZeroBoost).toBe(0);
  });
});

describe('calculateGrantMetricChanges', () => {
  it('calculates effects for valid grant per GAME_RULES §4.3', () => {
    const validation = {
      isValid: true,
      cost: 400,
      netZeroBoost: 10,
    };
    const changes = calculateGrantMetricChanges(validation);
    expect(changes).toEqual({
      budget: -400,
      trust: 8,
      netZero: 10,
    });
  });

  it('calculates effects for invalid grant per GAME_RULES §4.3', () => {
    const validation = {
      isValid: false,
      cost: 300,
      netZeroBoost: 0,
    };
    const changes = calculateGrantMetricChanges(validation);
    expect(changes).toEqual({
      budget: -300,
      trust: -4,
      netZero: 0,
    });
  });
});
