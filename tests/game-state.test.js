import { describe, expect, it } from 'vitest';
import {
  createInitialGameState,
  createInitialShiftStats,
  getCasesForDay,
  getTimeLimitForDay,
  getCurrentCase,
  hasNextCase,
  recordActionInShiftStats,
  advanceCase,
  tickTimer,
  applyAuditAction,
  startNextDay,
  sanitizeGameStateView,
} from '../js/backend/systems/game-state.js';
import { CampaignManager } from '../js/backend/systems/campaign.js';
import { backendApi } from '../js/backend/index.js';

describe('Game State & Progression (P1-16, P1-19, P1-20)', () => {
  describe('Initial Game State (P1-16)', () => {
    it('initializes day 1 with 120 seconds and default metrics', () => {
      const state = createInitialGameState(1);
      expect(state.currentDay).toBe(1);
      expect(state.timeRemaining).toBe(120);
      expect(state.currentCaseIndex).toBe(0);
      expect(state.metrics.netZero).toBe(30);
      expect(state.metrics.budget).toBe(5000);
      expect(state.metrics.trust).toBe(70);
      expect(state.shiftEnded).toBe(false);
      expect(state.campaignEnded).toBe(false);
    });

    it('initializes shift stats with all zeros', () => {
      const stats = createInitialShiftStats();
      expect(stats.processedCount).toBe(0);
      expect(stats.correctActions).toBe(0);
      expect(stats.finesIssued).toBe(0);
      expect(stats.grantsIssued).toBe(0);
      expect(stats.co2ReducedKg).toBe(0);
    });
  });

  describe('Case Progression & Timer (P1-19)', () => {
    it('retrieves the active case correctly', () => {
      const state = createInitialGameState(1);
      const activeCase = getCurrentCase(state);
      expect(activeCase).toBeDefined();
      expect(activeCase.id).toBe('C001');
      // In current sample dataset, Day 1 has 1 case (C001)
      expect(hasNextCase(state)).toBe(false);
    });

    it('advances to the next case without skipping', () => {
      // Create a mock state with multiple cases to test advancement
      let state = {
        ...createInitialGameState(1),
        dailyCases: [
          { id: 'C101', day: 1, name: 'Case 1' },
          { id: 'C102', day: 1, name: 'Case 2' },
        ],
      };
      expect(hasNextCase(state)).toBe(true);

      state = advanceCase(state);
      expect(state.currentCaseIndex).toBe(1);
      expect(getCurrentCase(state).id).toBe('C102');
      expect(hasNextCase(state)).toBe(false);

      state = advanceCase(state);
      expect(state.currentCaseIndex).toBe(2);
      expect(getCurrentCase(state)).toBeNull();
      expect(state.shiftEnded).toBe(true);
    });

    it('ticks down timer and marks shift ended when reaching 0', () => {
      let state = createInitialGameState(1);
      state = tickTimer(state, 30);
      expect(state.timeRemaining).toBe(90);
      expect(state.shiftEnded).toBe(false);

      state = tickTimer(state, 100);
      expect(state.timeRemaining).toBe(0);
      expect(state.shiftEnded).toBe(true);
    });
  });

  describe('Shift Statistics Tracking (P1-20)', () => {
    it('records valid approval action', () => {
      let stats = createInitialShiftStats();
      stats = recordActionInShiftStats(stats, {
        action: 'APPROVE',
        isValid: true,
      });

      expect(stats.processedCount).toBe(1);
      expect(stats.correctActions).toBe(1);
      expect(stats.finesIssued).toBe(0);
      expect(stats.grantsIssued).toBe(0);
    });

    it('records invalid fine action', () => {
      let stats = createInitialShiftStats();
      stats = recordActionInShiftStats(stats, {
        action: 'FINE',
        isValid: false,
      });

      expect(stats.processedCount).toBe(1);
      expect(stats.correctActions).toBe(0);
      expect(stats.finesIssued).toBe(0);
      expect(stats.grantsIssued).toBe(0);
    });

    it('records valid grant and fine actions correctly', () => {
      let stats = createInitialShiftStats();
      stats = recordActionInShiftStats(stats, {
        action: 'FINE',
        isValid: true,
      });
      stats = recordActionInShiftStats(stats, {
        action: 'GRANT',
        isValid: true,
      });

      expect(stats.processedCount).toBe(2);
      expect(stats.correctActions).toBe(2);
      expect(stats.finesIssued).toBe(1);
      expect(stats.grantsIssued).toBe(1);
    });
  });

  describe('Integrated Action Application (P1-16 to P1-20)', () => {
    it('applies action, updates metrics, stats, and advances to next case', () => {
      let state = createInitialGameState(1);
      // Case C001 declared 80, actual 166 -> FINE is valid (underdeclared by 86 kg)
      // Fine amount = 86 * 10 = $860
      const { state: nextState, result } = applyAuditAction(state, {
        caseId: 'C001',
        action: 'FINE',
      });

      expect(result.isValid).toBe(true);
      expect(result.metrics.netZero).toBe(33); // 30 + 3
      expect(result.metrics.budget).toBe(5860); // 5000 + 860
      expect(result.metrics.trust).toBe(68); // 70 - 2
      expect(result.shiftStats.processedCount).toBe(1);
      expect(result.shiftStats.correctActions).toBe(1);
      expect(result.shiftStats.finesIssued).toBe(1);
      expect(nextState.currentCaseIndex).toBe(1);
      expect(getCurrentCase(nextState)).toBeNull(); // Day 1 has 1 case in sample data
      expect(nextState.shiftEnded).toBe(true);
    });

    it('detects bankruptcy failure immediately when action budget penalty causes budget <= 0', () => {
      const state = createInitialGameState(1, { netZero: 30, budget: 100, trust: 70 });
      // Case C001: invalid APPROVE causes -$200 penalty (100 - 200 = -100)
      const { state: nextState, result } = applyAuditAction(state, {
        caseId: 'C001',
        action: 'APPROVE',
      });

      expect(result.isValid).toBe(false);
      expect(nextState.campaignEnded).toBe(true);
      expect(nextState.campaignOutcome.status).toBe('FAILED');
      expect(nextState.campaignOutcome.failureReason).toBe('BANKRUPTCY');
      expect(result.campaignOutcome.status).toBe('FAILED');
      expect(result.campaignOutcome.failureReason).toBe('BANKRUPTCY');
    });

    it('transitions to next day with preserved metrics and fresh timer/cases', () => {
      let state = createInitialGameState(1);
      state.metrics.netZero = 45;
      state.metrics.budget = 5200;
      state.metrics.trust = 85;

      const day2State = startNextDay(state);
      expect(day2State.currentDay).toBe(2);
      expect(day2State.timeRemaining).toBe(100); // Day 2 time limit
      expect(day2State.metrics.netZero).toBe(45);
      expect(day2State.metrics.budget).toBe(5200);
      expect(day2State.metrics.trust).toBe(85);
      expect(day2State.shiftStats.processedCount).toBe(0);
      expect(day2State.currentCaseIndex).toBe(0);
      expect(getCurrentCase(day2State).id).toBe('C002');
    });
  });

  describe('CampaignManager & BackendApi Integration', () => {
    it('integrates full campaign cycle via BackendApi', () => {
      const view = backendApi.startCampaign();
      expect(view.currentDay).toBe(1);
      expect(view.metrics.budget).toBe(5000);

      const caseView = backendApi.getCurrentCase();
      expect(caseView.id).toBe('C001');
      expect(caseView).not.toHaveProperty('hasFraud');

      const actionResult = backendApi.submitAction({
        caseId: 'C001',
        action: 'FINE',
      });

      expect(actionResult.isValid).toBe(true);
      const nextCase = backendApi.getCurrentCase();
      expect(nextCase).toBeNull(); // Day 1 finished

      const summary = backendApi.getShiftSummary();
      expect(summary.day).toBe(1);
      expect(summary.shiftStats.processedCount).toBe(1);
      expect(summary.shiftStats.finesIssued).toBe(1);
    });
  });
});
