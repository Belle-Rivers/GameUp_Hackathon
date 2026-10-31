import { describe, expect, it } from 'vitest';
import {
  validateApproval,
  validateFine,
  resolveAction,
  APPROVAL_ACTION_EFFECTS,
  FINE_ACTION_EFFECTS,
} from '../js/backend/systems/audit.js';

function makeCase({
  id = 'C100',
  items = [],
  declaredCO2 = 0,
  roofType = 'OTHER',
  note = 'Standard declaration',
  extraReceipts = [],
  fraudType = null,
} = {}) {
  return {
    id,
    day: 1,
    name: 'Citizen Tester',
    district: 'Central',
    note,
    declaredCO2,
    roofType,
    eligibleGrant: null,
    grantExplanation: '',
    receipts: [
      {
        type: 'Energy',
        title: 'Electricity & Gas',
        items,
      },
      ...extraReceipts,
    ],
    fraudType,
  };
}

describe('validateApproval (P1-11)', () => {
  it('validates approval when declaration matches actual emissions exactly', () => {
    // 100 kWh grid electricity = 50 kg CO2
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 50,
    });
    const res = validateApproval(c);
    expect(res.isValid).toBe(true);
    expect(res.withinTolerance).toBe(true);
    expect(res.hasUnverifiedOffset).toBe(false);
    expect(res.discrepancy).toBe(0);
  });

  it('validates approval within +2 kg tolerance', () => {
    // Actual 50, Declared 48 (discrepancy +2)
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 48,
    });
    const res = validateApproval(c);
    expect(res.isValid).toBe(true);
    expect(res.discrepancy).toBe(2);
  });

  it('validates approval within -2 kg tolerance (overdeclaration)', () => {
    // Actual 50, Declared 52 (discrepancy -2)
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 52,
    });
    const res = validateApproval(c);
    expect(res.isValid).toBe(true);
    expect(res.discrepancy).toBe(-2);
  });

  it('rejects approval when underdeclared beyond 2 kg tolerance', () => {
    // Actual 50, Declared 47.9 (discrepancy +2.1)
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 47.9,
    });
    const res = validateApproval(c);
    expect(res.isValid).toBe(false);
    expect(res.withinTolerance).toBe(false);
    expect(res.reason).toContain('exceeds the ±2 kg tolerance');
  });

  it('rejects approval when overdeclared beyond 2 kg tolerance', () => {
    // Actual 50, Declared 53 (discrepancy -3)
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 53,
    });
    const res = validateApproval(c);
    expect(res.isValid).toBe(false);
    expect(res.withinTolerance).toBe(false);
  });

  it('rejects approval within tolerance if case claims an unverified offset in note', () => {
    // Actual 50, Declared 50, but note has unverified offset
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 50,
      note: 'I bought unverified offset credits from an online startup.',
    });
    const res = validateApproval(c);
    expect(res.isValid).toBe(false);
    expect(res.withinTolerance).toBe(true);
    expect(res.hasUnverifiedOffset).toBe(true);
    expect(res.reason).toContain('unverified or unapproved offset claim');
  });

  it('rejects approval within tolerance if case contains an unapproved offset item', () => {
    const c = makeCase({
      items: [
        { label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' },
        { label: 'Tree Offset', qty: 1, unit: 'tree', rateKey: 'GRID_ELEC' },
      ],
      declaredCO2: 50.5,
    });
    const res = validateApproval(c);
    expect(res.isValid).toBe(false);
    expect(res.hasUnverifiedOffset).toBe(true);
  });

  it('handles zero actual emissions correctly (GAME_RULES §3.4, D-08)', () => {
    const zeroCase = makeCase({
      items: [{ label: 'Metro', qty: 50, unit: 'km', rateKey: 'PUBLIC_TRANSIT' }],
      declaredCO2: 0,
    });
    const res = validateApproval(zeroCase);
    expect(res.isValid).toBe(true);
    expect(res.actualCO2).toBe(0);
  });

  it('handles clamped zero emissions with rooftop solar offset', () => {
    // 50 kWh grid elec = 25 kg CO2. Solar offset 100 kWh = -40 kg CO2. Net clamped to 0. Declared = 0.
    const solarCase = makeCase({
      items: [
        { label: 'Grid Power', qty: 50, unit: 'kWh', rateKey: 'GRID_ELEC' },
        { label: 'Solar Offset', qty: 100, unit: 'kWh', rateKey: 'SOLAR_OFFSET' },
      ],
      declaredCO2: 0,
    });
    const res = validateApproval(solarCase);
    expect(res.isValid).toBe(true);
    expect(res.actualCO2).toBe(0);
    expect(res.discrepancy).toBe(0);
  });
});

describe('validateFine (P1-12)', () => {
  it('validates fine when emissions are underdeclared by more than 2 kg', () => {
    // Actual 50, Declared 40 -> underdeclared by 10 kg
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 40,
    });
    const res = validateFine(c);
    expect(res.isValid).toBe(true);
    expect(res.underdeclared).toBe(true);
    expect(res.hasUnverifiedOffset).toBe(false);
    expect(res.fineAmount).toBe(100); // 10 kg * $10
    expect(res.reason).toContain('underdeclared emissions by 10.00 kg');
  });

  it('rejects fine when declaration is within 2 kg tolerance', () => {
    // Actual 50, Declared 48.5 (underdeclared by only 1.5 kg)
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 48.5,
    });
    const res = validateFine(c);
    expect(res.isValid).toBe(false);
    expect(res.underdeclared).toBe(false);
    expect(res.reason).toContain('Fine invalid');
  });

  it('rejects fine when underdeclared by exactly 2.0 kg (tolerance boundary)', () => {
    // Actual 50, Declared 48 (underdeclared by exactly 2.0 kg)
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 48,
    });
    const res = validateFine(c);
    expect(res.isValid).toBe(false);
    expect(res.underdeclared).toBe(false);
  });

  it('validates fine when underdeclared by 2.01 kg (strictly > 2 kg)', () => {
    // Actual 50, Declared 47.99 (underdeclared by 2.01 kg)
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 47.99,
    });
    const res = validateFine(c);
    expect(res.isValid).toBe(true);
    expect(res.underdeclared).toBe(true);
  });

  it('rejects fine when citizen overdeclared without unverified offsets', () => {
    // Actual 50, Declared 60
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 60,
    });
    const res = validateFine(c);
    expect(res.isValid).toBe(false);
    expect(res.fineAmount).toBe(0);
  });

  it('validates fine when citizen claims an unverified offset even without underdeclaration (D-11)', () => {
    // Actual 50, Declared 50 (discrepancy 0), but unverified offset
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 50,
      note: 'Invested in clean carbon offset startup.',
    });
    const res = validateFine(c);
    expect(res.isValid).toBe(true);
    expect(res.hasUnverifiedOffset).toBe(true);
    expect(res.underdeclared).toBe(false);
    // Per D-11: Fine = max(0, actual - declared) * 10 = 0
    expect(res.fineAmount).toBe(0);
    expect(res.reason).toContain('citizen claimed an unverified offset');
  });

  it('validates fine when citizen claims unverified offset AND is underdeclared', () => {
    // Actual 50, Declared 30 (discrepancy 20), plus unverified offset
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 30,
      note: 'Uses private online startup offset.',
    });
    const res = validateFine(c);
    expect(res.isValid).toBe(true);
    expect(res.hasUnverifiedOffset).toBe(true);
    expect(res.underdeclared).toBe(true);
    expect(res.fineAmount).toBe(200); // 20 kg * $10
  });

  it('ensures fine amount is never negative when overdeclared with unverified offset (D-11)', () => {
    // Actual 50, Declared 70 (discrepancy -20) with unverified offset
    const c = makeCase({
      items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      declaredCO2: 70,
      note: 'Uses private online startup offset.',
    });
    const res = validateFine(c);
    expect(res.isValid).toBe(true);
    expect(res.fineAmount).toBe(0);
  });
});

describe('resolveAction (P1-15)', () => {
  describe('APPROVE action', () => {
    it('applies correct approval effects within tolerance (Roadmap test)', () => {
      // 100 kWh grid electricity = 50 kg CO2. Declared = 50 kg.
      const c = makeCase({
        items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
        declaredCO2: 50,
      });

      const res = resolveAction('APPROVE', c);
      expect(res.isValid).toBe(true);
      expect(res.action).toBe('APPROVE');
      expect(res.grantId).toBeNull();
      // Budget: actualCO2 * 0.50 = 50 * 0.50 = $25
      expect(res.metricChanges.budget).toBe(25);
      expect(res.metricChanges.trust).toBe(APPROVAL_ACTION_EFFECTS.VALID.trust); // +3
      expect(res.metricChanges.netZero).toBe(APPROVAL_ACTION_EFFECTS.VALID.netZero); // +1
      expect(res.explanation).toContain('Budget +$25.00, Public Trust +3%, Net-Zero +1%');
    });

    it('applies oversight penalty when approval is outside tolerance (Roadmap test)', () => {
      // Actual 50, Declared 40 -> underdeclared by 10 kg
      const c = makeCase({
        items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
        declaredCO2: 40,
      });

      const res = resolveAction({ action: 'APPROVE', caseId: c.id }, c);
      expect(res.isValid).toBe(false);
      expect(res.metricChanges.budget).toBe(APPROVAL_ACTION_EFFECTS.INVALID.budget); // -200
      expect(res.metricChanges.trust).toBe(APPROVAL_ACTION_EFFECTS.INVALID.trust); // -5
      expect(res.metricChanges.netZero).toBe(APPROVAL_ACTION_EFFECTS.INVALID.netZero); // -2
      expect(res.explanation).toContain('Oversight penalty');
    });
  });

  describe('FINE action', () => {
    it('applies correct fine effects for underdeclared emissions (Roadmap test)', () => {
      // Actual 50, Declared 30 -> discrepancy 20 kg -> fine = $200
      const c = makeCase({
        items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
        declaredCO2: 30,
      });

      const res = resolveAction('FINE', c);
      expect(res.isValid).toBe(true);
      expect(res.action).toBe('FINE');
      expect(res.metricChanges.budget).toBe(200);
      expect(res.metricChanges.trust).toBe(FINE_ACTION_EFFECTS.VALID.trust); // -2
      expect(res.metricChanges.netZero).toBe(FINE_ACTION_EFFECTS.VALID.netZero); // +3
      expect(res.explanation).toContain('Fine enforced');
    });

    it('applies unfair fine penalty when fine is invalid', () => {
      // Actual 50, Declared 50
      const c = makeCase({
        items: [{ label: 'Power', qty: 100, unit: 'kWh', rateKey: 'GRID_ELEC' }],
        declaredCO2: 50,
      });

      const res = resolveAction('FINE', c);
      expect(res.isValid).toBe(false);
      expect(res.metricChanges.budget).toBe(FINE_ACTION_EFFECTS.INVALID.budget); // -300
      expect(res.metricChanges.trust).toBe(FINE_ACTION_EFFECTS.INVALID.trust); // -12
      expect(res.metricChanges.netZero).toBe(FINE_ACTION_EFFECTS.INVALID.netZero); // 0
      expect(res.explanation).toContain('Unfair fine penalty');
    });
  });

  describe('GRANT action', () => {
    it('applies correct cost and boost for valid grant (Roadmap test)', () => {
      // Natural gas 120 m³ > 100 m³ -> eligible for HEAT_PUMP (cost 400, netZeroBoost 10)
      const c = makeCase({
        items: [{ label: 'Gas Heat', qty: 120, unit: 'm³', rateKey: 'GAS_HEAT' }],
        declaredCO2: 240,
      });

      const res = resolveAction('GRANT', c, 'HEAT_PUMP');
      expect(res.isValid).toBe(true);
      expect(res.action).toBe('GRANT');
      expect(res.grantId).toBe('HEAT_PUMP');
      expect(res.metricChanges.budget).toBe(-400);
      expect(res.metricChanges.trust).toBe(8);
      expect(res.metricChanges.netZero).toBe(10);
      expect(res.explanation).toContain('Grant awarded (Heat Pump Subsidy)');
    });

    it('applies wasted subsidy penalty when grant issued to ineligible household (Roadmap test)', () => {
      // Natural gas only 50 m³ <= 100 m³ -> ineligible for HEAT_PUMP
      const c = makeCase({
        items: [{ label: 'Gas Heat', qty: 50, unit: 'm³', rateKey: 'GAS_HEAT' }],
        declaredCO2: 100,
      });

      const res = resolveAction({ action: 'GRANT', grantId: 'HEAT_PUMP', caseId: c.id }, c);
      expect(res.isValid).toBe(false);
      expect(res.metricChanges.budget).toBe(-400);
      expect(res.metricChanges.trust).toBe(-4);
      expect(res.metricChanges.netZero).toBe(0);
      expect(res.explanation).toContain('Wasted subsidy penalty');
    });

    it('handles grant action without a selected grant', () => {
      const c = makeCase();
      const res = resolveAction('GRANT', c);
      expect(res.isValid).toBe(false);
      expect(res.metricChanges.budget).toBe(0);
      expect(res.metricChanges.trust).toBe(-4);
      expect(res.metricChanges.netZero).toBe(0);
    });
  });

  it('throws an error for unsupported action types', () => {
    const c = makeCase();
    expect(() => resolveAction('BRIBE', c)).toThrow('Unsupported audit action type');
  });
});
