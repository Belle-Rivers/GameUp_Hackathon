import { describe, expect, it } from 'vitest';
import {
  INITIAL_METRICS,
  METRIC_BOUNDS,
  createInitialMetrics,
  isBankrupt,
  isTrustDepleted,
  clampPercentage,
  checkFailureConditions,
  checkVictoryCondition,
  applyMetricChanges,
} from '../js/backend/systems/metrics.js';

describe('Metrics System (P1-17 & P1-18)', () => {
  describe('Initial Metrics (P1-17)', () => {
    it('defines initial metrics matching GAME_RULES.md §6.1', () => {
      expect(INITIAL_METRICS.netZero).toBe(30);
      expect(INITIAL_METRICS.budget).toBe(5000);
      expect(INITIAL_METRICS.trust).toBe(70);
    });

    it('creates fresh independent copies of initial metrics', () => {
      const m1 = createInitialMetrics();
      const m2 = createInitialMetrics();
      expect(m1).toEqual(INITIAL_METRICS);
      m1.budget = 9999;
      expect(m2.budget).toBe(5000);
    });
  });

  describe('Guardrails and Bounds (P1-18)', () => {
    it('clamps net-zero and trust between 0 and 100', () => {
      expect(clampPercentage(-10)).toBe(0);
      expect(clampPercentage(150)).toBe(100);
      expect(clampPercentage(55)).toBe(55);
      expect(clampPercentage(0)).toBe(0);
      expect(clampPercentage(100)).toBe(100);
    });

    it('detects bankruptcy when budget <= 0', () => {
      expect(isBankrupt(1)).toBe(false);
      expect(isBankrupt(0)).toBe(true);
      expect(isBankrupt(-50)).toBe(true);
    });

    it('detects public trust depletion when trust <= 0', () => {
      expect(isTrustDepleted(1)).toBe(false);
      expect(isTrustDepleted(0)).toBe(true);
      expect(isTrustDepleted(-10)).toBe(true);
    });

    it('checks failure conditions for bankruptcy first', () => {
      const res = checkFailureConditions({ netZero: 50, budget: 0, trust: 70 });
      expect(res.isFailed).toBe(true);
      expect(res.reason).toBe('BANKRUPTCY');
    });

    it('checks failure conditions for public trust', () => {
      const res = checkFailureConditions({ netZero: 50, budget: 1000, trust: 0 });
      expect(res.isFailed).toBe(true);
      expect(res.reason).toBe('PUBLIC_TRUST');
    });

    it('reports no failure when metrics are healthy', () => {
      const res = checkFailureConditions({ netZero: 50, budget: 1000, trust: 50 });
      expect(res.isFailed).toBe(false);
      expect(res.reason).toBeNull();
    });

    it('evaluates victory condition only when netZero >= 100% and no failures', () => {
      expect(checkVictoryCondition({ netZero: 100, budget: 100, trust: 10 }).isVictory).toBe(true);
      expect(checkVictoryCondition({ netZero: 99, budget: 100, trust: 10 }).isVictory).toBe(false);
      expect(checkVictoryCondition({ netZero: 99, budget: 100, trust: 10 }).reason).toBe('NET_ZERO_TARGET');
      expect(checkVictoryCondition({ netZero: 100, budget: 0, trust: 50 }).isVictory).toBe(false);
      expect(checkVictoryCondition({ netZero: 100, budget: 0, trust: 50 }).reason).toBe('BANKRUPTCY');
    });
  });

  describe('Applying Metric Changes (P1-17 & P1-18)', () => {
    it('applies positive changes correctly', () => {
      const current = { netZero: 30, budget: 5000, trust: 70 };
      const delta = { netZero: 5, budget: 250, trust: 3 };
      const { metrics, failure } = applyMetricChanges(current, delta);

      expect(metrics.netZero).toBe(35);
      expect(metrics.budget).toBe(5250);
      expect(metrics.trust).toBe(73);
      expect(failure.isFailed).toBe(false);
    });

    it('clamps net-zero to 100% and trust to 100% when exceeding max', () => {
      const current = { netZero: 95, budget: 5000, trust: 98 };
      const delta = { netZero: 10, budget: 0, trust: 5 };
      const { metrics, failure } = applyMetricChanges(current, delta);

      expect(metrics.netZero).toBe(100);
      expect(metrics.trust).toBe(100);
      expect(failure.isFailed).toBe(false);
    });

    it('clamps net-zero and trust at 0 without clamping budget prior to bankruptcy check', () => {
      const current = { netZero: 2, budget: 100, trust: 5 };
      const delta = { netZero: -5, budget: -300, trust: -10 };
      const { metrics, failure } = applyMetricChanges(current, delta);

      expect(metrics.netZero).toBe(0);
      expect(metrics.trust).toBe(0);
      expect(metrics.budget).toBe(-200);
      expect(failure.isFailed).toBe(true);
      expect(failure.reason).toBe('BANKRUPTCY');
    });
  });
});

