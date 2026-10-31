import { describe, expect, it } from 'vitest';
import { CITIZEN_CASES } from '../js/backend/data/cases.js';
import { EMISSION_RULEBOOK } from '../js/backend/data/rulebook.js';

const CANONICAL_KEYS = new Set(Object.keys(EMISSION_RULEBOOK));

describe('CITIZEN_CASES', () => {
  it('has exactly two sample cases', () => {
    expect(CITIZEN_CASES.length).toBe(2);
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

  it('each receipt has a type and title', () => {
    for (const c of CITIZEN_CASES) {
      for (const receipt of c.receipts) {
        expect(receipt).toHaveProperty('type');
        expect(receipt).toHaveProperty('title');
      }
    }
  });
});