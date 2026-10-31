import { describe, expect, it } from 'vitest';
import { backendApi } from '../js/backend/index.js';
import { CAMPAIGN_DAYS, getDayConfig, getAvailableGrantsForDay } from '../js/backend/data/days.js';
import { CITIZEN_CASES, validateCase } from '../js/backend/data/cases.js';
import {
  createInitialGameState,
  getCasesForDay,
  getTimeLimitForDay,
  startNextDay,
  tickTimer,
  applyAuditAction,
} from '../js/backend/systems/game-state.js';
import { CampaignManager } from '../js/backend/systems/campaign.js';

describe('Phase 4A: Three-Day Campaign and Progression', () => {
  describe('P4-01: Day 1 Configuration', () => {
    it('has exactly 5 cases and 120 seconds time limit', () => {
      const config = getDayConfig(1);
      expect(config.day).toBe(1);
      expect(config.cases).toBe(5);
      expect(config.caseCount).toBe(5);
      expect(config.timeLimitSeconds).toBe(120);
      expect(config.shiftDuration).toBe(120);
      expect(getTimeLimitForDay(1)).toBe(120);
    });

    it('makes only initial grants (HEAT_PUMP, COMPOST_KIT) available on Day 1', () => {
      const grantsDay1 = getAvailableGrantsForDay(1);
      expect(grantsDay1).toEqual(['HEAT_PUMP', 'COMPOST_KIT']);

      const fullGrants = backendApi.getGrants(1);
      expect(fullGrants.map((g) => g.id)).toEqual(['HEAT_PUMP', 'COMPOST_KIT']);
    });

    it('contains basic audits and matching mechanics in Day 1 cases', () => {
      const day1Cases = getCasesForDay(1);
      expect(day1Cases).toHaveLength(5);
      expect(day1Cases.every((c) => c.day === 1)).toBe(true);

      // C003 is eligible for COMPOST_KIT (landfill > 30 kg)
      const compostCase = day1Cases.find((c) => c.eligibleGrant === 'COMPOST_KIT');
      expect(compostCase).toBeDefined();

      // C004 is eligible for HEAT_PUMP (gas > 100 m³)
      const heatPumpCase = day1Cases.find((c) => c.eligibleGrant === 'HEAT_PUMP');
      expect(heatPumpCase).toBeDefined();
    });
  });

  describe('P4-02: Day 2 Configuration', () => {
    it('has exactly 6 cases and 100 seconds time limit', () => {
      const config = getDayConfig(2);
      expect(config.day).toBe(2);
      expect(config.cases).toBe(6);
      expect(config.caseCount).toBe(6);
      expect(config.timeLimitSeconds).toBe(100);
      expect(config.shiftDuration).toBe(100);
      expect(getTimeLimitForDay(2)).toBe(100);
    });

    it('expands grants to all four options on Day 2', () => {
      const grantsDay2 = getAvailableGrantsForDay(2);
      expect(grantsDay2).toEqual(['HEAT_PUMP', 'COMPOST_KIT', 'TRANSIT_PASS', 'COOL_ROOF']);

      const fullGrants = backendApi.getGrants(2);
      expect(fullGrants).toHaveLength(4);
    });

    it('introduces greenwashing fraud and flight records on Day 2', () => {
      const day2Cases = getCasesForDay(2);
      expect(day2Cases).toHaveLength(6);
      expect(day2Cases.every((c) => c.day === 2)).toBe(true);

      // Contains flight records
      const flightCase = day2Cases.find((c) =>
        c.receipts.some((r) => r.items.some((item) => item.rateKey === 'FLIGHT'))
      );
      expect(flightCase).toBeDefined();

      // Contains unverified offset fraud
      const fraudCase = day2Cases.find((c) => c.fraudType === 'UNVERIFIED_OFFSET');
      expect(fraudCase).toBeDefined();
    });
  });

  describe('P4-03: Day 3 Configuration', () => {
    it('has exactly 7 cases and 90 seconds time limit', () => {
      const config = getDayConfig(3);
      expect(config.day).toBe(3);
      expect(config.cases).toBe(7);
      expect(config.caseCount).toBe(7);
      expect(config.timeLimitSeconds).toBe(90);
      expect(config.shiftDuration).toBe(90);
      expect(getTimeLimitForDay(3)).toBe(90);
    });

    it('has all four mitigation grants available on Day 3', () => {
      const grantsDay3 = getAvailableGrantsForDay(3);
      expect(grantsDay3).toEqual(['HEAT_PUMP', 'COMPOST_KIT', 'TRANSIT_PASS', 'COOL_ROOF']);
    });

    it('features complex multi-receipt cases and subtle discrepancies on Day 3', () => {
      const day3Cases = getCasesForDay(3);
      expect(day3Cases).toHaveLength(7);
      expect(day3Cases.every((c) => c.day === 3)).toBe(true);

      // Check cases with multiple receipts
      const multiReceiptCases = day3Cases.filter((c) => c.receipts.length >= 3);
      expect(multiReceiptCases.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('P4-04: Daily Case Selection', () => {
    it('loads correct case subsets for each campaign day without leakage', () => {
      const day1 = getCasesForDay(1);
      const day2 = getCasesForDay(2);
      const day3 = getCasesForDay(3);

      expect(day1).toHaveLength(5);
      expect(day2).toHaveLength(6);
      expect(day3).toHaveLength(7);
      expect(day1.length + day2.length + day3.length).toBe(18);

      const allIds = new Set([...day1, ...day2, ...day3].map((c) => c.id));
      expect(allIds.size).toBe(18);
    });

    it('all 18 citizen cases pass schema validation', () => {
      for (const c of CITIZEN_CASES) {
        const result = validateCase(c);
        expect(result.valid, `Case ${c.id} validation failed: ${result.errors.join('; ')}`).toBe(true);
      }
    });

    it('sanitizes case views to conceal test metadata', () => {
      const mgr = new CampaignManager(2);
      const view = mgr.getCurrentCaseView();
      expect(view).not.toBeNull();
      expect(view).not.toHaveProperty('hasFraud');
      expect(view).not.toHaveProperty('fraudType');
      expect(view).not.toHaveProperty('eligibleGrant');
    });
  });

  describe('P4-05: Campaign Transitions', () => {
    it('carries over metrics and applies next day time limit and cases', () => {
      let state = createInitialGameState(1);
      state.metrics.netZero = 55;
      state.metrics.budget = 4800;
      state.metrics.trust = 80;
      state.shiftStats.processedCount = 5;

      const day2State = startNextDay(state);
      expect(day2State.currentDay).toBe(2);
      expect(day2State.timeRemaining).toBe(100); // Day 2 limit
      expect(day2State.currentCaseIndex).toBe(0);
      expect(day2State.dailyCases).toHaveLength(6);
      expect(day2State.metrics.netZero).toBe(55); // Preserved
      expect(day2State.metrics.budget).toBe(4800); // Preserved
      expect(day2State.metrics.trust).toBe(80); // Preserved
      expect(day2State.shiftStats.processedCount).toBe(0); // Daily stats reset
      expect(day2State.shiftEnded).toBe(false);

      const day3State = startNextDay(day2State);
      expect(day3State.currentDay).toBe(3);
      expect(day3State.timeRemaining).toBe(90); // Day 3 limit
      expect(day3State.dailyCases).toHaveLength(7);
    });

    it('rejects day transition past Day 3', () => {
      const state = createInitialGameState(3);
      expect(() => startNextDay(state)).toThrow('Campaign only has 3 days.');
    });

    it('prevents transitioning if campaign has already ended or failed', () => {
      const failedState = createInitialGameState(1);
      failedState.campaignEnded = true;
      expect(() => startNextDay(failedState)).toThrow('Cannot start next day: Campaign has ended.');

      const bankruptState = createInitialGameState(1);
      bankruptState.metrics.budget = 0;
      expect(() => startNextDay(bankruptState)).toThrow('Cannot start next day: Campaign has ended.');

      const distrustState = createInitialGameState(1);
      distrustState.metrics.trust = 0;
      expect(() => startNextDay(distrustState)).toThrow('Cannot start next day: Campaign has ended.');
    });
  });

  describe('P4-06: Campaign Win Conditions', () => {
    it('does not trigger victory early if net-zero reaches 100% on Day 1 or Day 2 (D-02)', () => {
      let state = createInitialGameState(1);
      state.metrics.netZero = 100;
      state.metrics.budget = 4000;
      state.metrics.trust = 80;

      // Exhaust Day 1 cases
      state.currentCaseIndex = 4;
      const { state: afterActionState } = applyAuditAction(state, {
        caseId: state.dailyCases[4].id,
        action: 'APPROVE',
      });

      expect(afterActionState.shiftEnded).toBe(true);
      expect(afterActionState.campaignEnded).toBe(false);
      expect(afterActionState.campaignOutcome).toBeNull();
    });

    it('triggers VICTORY when Day 3 finishes with Net-Zero >= 100%', () => {
      let state = createInitialGameState(3);
      state.metrics.netZero = 100;
      state.metrics.budget = 3500;
      state.metrics.trust = 75;

      // Finish last case of Day 3
      state.currentCaseIndex = 6;
      const { state: finalState, result } = applyAuditAction(state, {
        caseId: state.dailyCases[6].id,
        action: 'APPROVE',
      });

      expect(finalState.campaignEnded).toBe(true);
      expect(finalState.campaignOutcome).not.toBeNull();
      expect(finalState.campaignOutcome.status).toBe('VICTORY');
      expect(finalState.campaignOutcome.failureReason).toBeNull();
      expect(result.campaignOutcome.status).toBe('VICTORY');
    });

    it('fails campaign with NET_ZERO_TARGET if Net-Zero < 100% when Day 3 timer expires', () => {
      let state = createInitialGameState(3);
      state.metrics.netZero = 85;
      state.metrics.budget = 3000;
      state.metrics.trust = 70;

      const finalState = tickTimer(state, 150);
      expect(finalState.shiftEnded).toBe(true);
      expect(finalState.campaignEnded).toBe(true);
      expect(finalState.campaignOutcome.status).toBe('FAILED');
      expect(finalState.campaignOutcome.failureReason).toBe('NET_ZERO_TARGET');
    });
  });

  describe('P4-07: Campaign Loss Conditions', () => {
    it('immediately ends campaign on bankruptcy when budget <= 0', () => {
      const state = createInitialGameState(1, { netZero: 30, budget: 100, trust: 70 });

      // Invalid APPROVE triggers $200 penalty (100 - 200 = -100 <= 0)
      const { state: nextState, result } = applyAuditAction(state, {
        caseId: 'C001',
        action: 'APPROVE',
      });

      expect(nextState.campaignEnded).toBe(true);
      expect(nextState.campaignOutcome.status).toBe('FAILED');
      expect(nextState.campaignOutcome.failureReason).toBe('BANKRUPTCY');
      expect(result.campaignOutcome.status).toBe('FAILED');

      // Subsequent actions must be blocked
      expect(() => applyAuditAction(nextState, { caseId: 'C001', action: 'APPROVE' }))
        .toThrow('Cannot apply action: Campaign has already ended.');
    });

    it('immediately ends campaign on public trust depletion when trust <= 0', () => {
      const state = createInitialGameState(2, { netZero: 50, budget: 3000, trust: 2 });

      // Action causing trust deduction (e.g. invalid action or fine -2% trust: 2 - 2 = 0)
      const currentCase = state.dailyCases[0];
      const { state: nextState } = applyAuditAction(state, {
        caseId: currentCase.id,
        action: 'FINE',
      });

      expect(nextState.campaignEnded).toBe(true);
      expect(nextState.campaignOutcome.status).toBe('FAILED');
      expect(nextState.campaignOutcome.failureReason).toBe('PUBLIC_TRUST');
    });
  });

  describe('P4-08: Campaign Statistics', () => {
    it('aggregates performance across multiple shift days', () => {
      backendApi.startCampaign();

      // Submit action on Day 1
      const c1 = backendApi.getCurrentCase();
      backendApi.submitAction({ caseId: c1.id, action: 'FINE' });

      let stats = backendApi.getCampaignStats();
      expect(stats.totalProcessed).toBe(1);
      expect(stats.totalCorrect).toBe(1);
      expect(stats.totalFines).toBe(1);

      // Advance to Day 2
      backendApi.advanceDay();
      const stateView = backendApi.getState();
      expect(stateView.currentDay).toBe(2);
      expect(stateView.shiftStats.processedCount).toBe(0); // Day 2 shift stats reset
      expect(stateView.campaignStats.totalProcessed).toBe(1); // Cumulative stats preserved
      expect(stateView.campaignStats.daysCompleted).toBe(1);

      // Submit action on Day 2
      const c2 = backendApi.getCurrentCase();
      backendApi.submitAction({ caseId: c2.id, action: 'FINE' });

      stats = backendApi.getCampaignStats();
      expect(stats.totalProcessed).toBe(2);
      expect(stats.totalCorrect).toBe(2);
      expect(stats.totalFines).toBe(2);
      expect(stats.daysCompleted).toBe(1);
    });

    it('resets cumulative campaign statistics upon campaign restart', () => {
      backendApi.startCampaign();
      const c1 = backendApi.getCurrentCase();
      backendApi.submitAction({ caseId: c1.id, action: 'FINE' });
      expect(backendApi.getCampaignStats().totalProcessed).toBe(1);

      backendApi.restartCampaign();
      const freshStats = backendApi.getCampaignStats();
      expect(freshStats.totalProcessed).toBe(0);
      expect(freshStats.totalCorrect).toBe(0);
      expect(freshStats.totalFines).toBe(0);
      expect(freshStats.totalGrants).toBe(0);
      expect(freshStats.daysCompleted).toBe(0);
    });
  });
});

