import { describe, expect, it } from 'vitest';
import { CITIZEN_CASES } from '../js/backend/data/cases.js';
import { EMISSION_RULEBOOK } from '../js/backend/data/rulebook.js';

const CANONICAL_KEYS = new Set(Object.keys(EMISSION_RULEBOOK));

describe('CITIZEN_CASES', () => {
  it('has exactly 18 citizen cases across the 3 campaign days', () => {
    expect(CITIZEN_CASES.length).toBe(18);
  });

  it('contains exactly 5 cases for Day 1, 6 for Day 2, and 7 for Day 3', () => {
    expect(CITIZEN_CASES.filter((c) => c.day === 1).length).toBe(5);
    expect(CITIZEN_CASES.filter((c) => c.day === 2).length).toBe(6);
    expect(CITIZEN_CASES.filter((c) => c.day === 3).length).toBe(7);
  });

  it('each case has a valid id', () => {
    for (const c of CITIZEN_CASES) {
      expect(c.id).toMatch(/^C\d{3}$/);
    }
  });

  it('each case uses only canonical rate keys', () => {
    for (const c of CITIZEN_CASES) {
      for (const receipt of c.receipts) {
        for (const item of receipt.items) {
          expect(CANONICAL_KEYS).toContain(item.rateKey);
        }
      }
    }
  });

  it('each case has a numeric declaredCO2', () => {
    for (const c of CITIZEN_CASES) {
      expect(Number.isFinite(c.declaredCO2)).toBe(true);
    }
  });

  it('each case declares a valid roofType', () => {
    for (const c of CITIZEN_CASES) {
      expect(['ASPHALT', 'OTHER']).toContain(c.roofType);
    }
  });

  it('each receipt has a type and title', () => {
    for (const c of CITIZEN_CASES) {
      for (const receipt of c.receipts) {
        expect(receipt).toHaveProperty('type');
        expect(receipt).toHaveProperty('title');
      }
    }
  });
});