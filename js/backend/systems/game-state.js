/**
 * @typedef {Object} CityMetrics
 * @property {number} netZero Net-Zero Progress in percentage points.
 * @property {number} budget Municipal budget in USD.
 * @property {number} trust Public Trust in percentage points.
 */

/**
 * @typedef {Object} ShiftStats
 * @property {number} processedCount Number of citizen cases receiving a completed action.
 * @property {number} correctActions Number of actions validated as correct.
 * @property {number} finesIssued Number of valid fines issued.
 * @property {number} grantsIssued Number of valid grants awarded.
 * @property {number} co2ReducedKg Estimated CO2 reduction credited by valid mitigation interventions.
 */

/**
 * @typedef {Object} CampaignStats
 * @property {number} totalProcessed Total citizens processed across all days.
 * @property {number} totalCorrect Total correct actions across all days.
 * @property {number} totalFines Total valid fines issued across all days.
 * @property {number} totalGrants Total valid grants awarded across all days.
 * @property {number} daysCompleted Number of completed shift days.
 */

/**
 * @typedef {Object} GameState
 * @property {number} currentDay Campaign day currently being played.
 * @property {number} timeRemaining Remaining shift time in seconds.
 * @property {number} currentCaseIndex Index of the current citizen case.
 * @property {import('../data/cases.js').CitizenCase[]} dailyCases Cases for the current day.
 * @property {CityMetrics} metrics Current city metrics.
 * @property {ShiftStats} shiftStats Current shift statistics.
 * @property {CampaignStats} campaignStats Cumulative statistics across all campaign days.
 * @property {boolean} shiftEnded Whether the current shift has concluded.
 * @property {boolean} campaignEnded Whether the campaign has concluded.
 * @property {import('../index.js').CampaignOutcome | null} campaignOutcome Final outcome if campaignEnded is true.
 */

import { CITIZEN_CASES } from '../data/cases.js';
import { CAMPAIGN_DAYS } from '../data/days.js';
import {
  createInitialMetrics,
  applyMetricChanges,
  checkFailureConditions,
  checkVictoryCondition,
} from './metrics.js';
import { resolveAction } from './audit.js';

/**
 * Creates empty shift statistics.
 * Per GAME_RULES.md §9.
 *
 * @returns {ShiftStats}
 */
export function createInitialShiftStats() {
  return {
    processedCount: 0,
    correctActions: 0,
    finesIssued: 0,
    grantsIssued: 0,
    co2ReducedKg: 0,
  };
}

/**
 * Creates empty cumulative campaign statistics.
 * Per GAME_RULES.md §10.1 and P4-08.
 *
 * @returns {CampaignStats}
 */
export function createInitialCampaignStats() {
  return {
    totalProcessed: 0,
    totalCorrect: 0,
    totalFines: 0,
    totalGrants: 0,
    daysCompleted: 0,
  };
}

/**
 * Retrieves cases belonging to the specified campaign day.
 *
 * @param {number} day
 * @returns {import('../data/cases.js').CitizenCase[]}
 */
export function getCasesForDay(day) {
  return CITIZEN_CASES.filter((c) => c.day === day);
}

/**
 * Retrieves the time limit in seconds for a specified campaign day.
 * Per GAME_RULES.md §8 and CAMPAIGN_DAYS.
 *
 * @param {number} day
 * @returns {number}
 */
export function getTimeLimitForDay(day) {
  return CAMPAIGN_DAYS[day]?.timeLimitSeconds ?? 120;
}

/**
 * Initializes the full game state.
 * Per P1-16: Initialize the campaign, day, timer, cases, and metrics.
 *
 * @param {number} [day=1]
 * @param {CityMetrics} [initialMetrics]
 * @returns {GameState}
 */
export function createInitialGameState(day = 1, initialMetrics = null) {
  const dailyCases = getCasesForDay(day);
  const timeRemaining = getTimeLimitForDay(day);
  const metrics = initialMetrics ? { ...initialMetrics } : createInitialMetrics();
  const shiftStats = createInitialShiftStats();
  const campaignStats = createInitialCampaignStats();

  return {
    currentDay: day,
    timeRemaining,
    currentCaseIndex: 0,
    dailyCases,
    metrics,
    shiftStats,
    campaignStats,
    shiftEnded: false,
    campaignEnded: false,
    campaignOutcome: null,
  };
}

/**
 * Gets the current active case from game state, or null if no cases remain.
 * Per GAME_RULES.md §8.4.
 *
 * @param {GameState} state
 * @returns {import('../data/cases.js').CitizenCase | null}
 */
export function getCurrentCase(state) {
  if (!state || !Array.isArray(state.dailyCases)) return null;
  if (state.currentCaseIndex < 0 || state.currentCaseIndex >= state.dailyCases.length) {
    return null;
  }
  return state.dailyCases[state.currentCaseIndex];
}

/**
 * Checks whether another case remains in the current shift.
 *
 * @param {GameState} state
 * @returns {boolean}
 */
export function hasNextCase(state) {
  if (!state || !Array.isArray(state.dailyCases)) return false;
  return state.currentCaseIndex + 1 < state.dailyCases.length;
}

/**
 * Updates shift statistics based on a resolved action.
 * Per GAME_RULES.md §9:
 * - processedCount increases when an action is completed.
 * - correctActions increases when isValid is true.
 * - finesIssued increases when valid FINE is issued.
 * - grantsIssued increases when valid GRANT is issued.
 * - co2ReducedKg remains 0 or reflects documented mitigation baseline.
 *
 * @param {ShiftStats} stats
 * @param {import('./audit.js').ActionResolutionResult} actionResult
 * @returns {ShiftStats}
 */
export function recordActionInShiftStats(stats, actionResult) {
  const nextStats = { ...stats };
  nextStats.processedCount += 1;

  if (actionResult.isValid) {
    nextStats.correctActions += 1;
    if (actionResult.action === 'FINE') {
      nextStats.finesIssued += 1;
    } else if (actionResult.action === 'GRANT') {
      nextStats.grantsIssued += 1;
    }
  }

  return nextStats;
}

/**
 * Updates cumulative campaign statistics based on a resolved action.
 * Per GAME_RULES.md §10.1 and P4-08.
 *
 * @param {CampaignStats} stats
 * @param {import('./audit.js').ActionResolutionResult} actionResult
 * @returns {CampaignStats}
 */
export function recordActionInCampaignStats(stats, actionResult) {
  const nextStats = { ...stats };
  nextStats.totalProcessed += 1;

  if (actionResult.isValid) {
    nextStats.totalCorrect += 1;
    if (actionResult.action === 'FINE') {
      nextStats.totalFines += 1;
    } else if (actionResult.action === 'GRANT') {
      nextStats.totalGrants += 1;
    }
  }

  return nextStats;
}

/**
 * Advances case progression after an action has been taken.
 * If the current case was the last case of the day, marks the shift as ended.
 * Per GAME_RULES.md §8.4, §11.7, §11.8.
 *
 * @param {GameState} state
 * @returns {GameState}
 */
export function advanceCase(state) {
  if (!state || state.shiftEnded || state.campaignEnded) {
    return state;
  }

  const nextIndex = state.currentCaseIndex + 1;
  const isLastCase = nextIndex >= state.dailyCases.length;

  return {
    ...state,
    currentCaseIndex: nextIndex,
    shiftEnded: isLastCase,
  };
}

/**
 * Deducts elapsed seconds from remaining shift time.
 * If timer expires (<= 0), timer is clamped to 0 and shift ends.
 * Per GAME_RULES.md §8.5: When timer reaches zero, stop accepting new actions,
 * do not automatically process the current citizen, end shift.
 *
 * @param {GameState} state
 * @param {number} seconds
 * @returns {GameState}
 */
export function tickTimer(state, seconds = 1) {
  if (!state || state.shiftEnded || state.campaignEnded) {
    return state;
  }

  const nextTime = Math.max(0, state.timeRemaining - seconds);
  const timerExpired = nextTime === 0;

  if (timerExpired && state.currentDay === 3 && !state.campaignEnded) {
    const victoryEval = checkVictoryCondition(state.metrics);
    return {
      ...state,
      timeRemaining: 0,
      shiftEnded: true,
      campaignEnded: true,
      campaignOutcome: {
        status: victoryEval.isVictory ? 'VICTORY' : 'FAILED',
        failureReason: victoryEval.reason,
        metrics: { ...state.metrics },
        campaignStats: { ...(state.campaignStats || createInitialCampaignStats()) },
      },
    };
  }

  return {
    ...state,
    timeRemaining: nextTime,
    shiftEnded: timerExpired ? true : state.shiftEnded,
  };
}

/**
 * Applies a player's audit action to the game state.
 * Validates action, applies metric changes, updates shift statistics,
 * checks failure guardrails, and advances case progression.
 *
 * @param {GameState} state
 * @param {import('../index.js').AuditActionRequest} request
 * @returns {{
 *   state: GameState,
 *   result: import('../index.js').ActionResult
 * }}
 */
export function applyAuditAction(state, request) {
  if (!state) {
    throw new Error('GameState is required to apply audit action.');
  }

  if (state.campaignEnded) {
    throw new Error('Cannot apply action: Campaign has already ended.');
  }

  if (state.shiftEnded) {
    throw new Error('Cannot apply action: Current shift has ended.');
  }

  const citizenCase = getCurrentCase(state);
  if (!citizenCase) {
    throw new Error('No citizen case available to audit.');
  }

  if (citizenCase.id !== request.caseId) {
    throw new Error(
      `Mismatched case ID. Expected "${citizenCase.id}" but received "${request.caseId}".`
    );
  }

  // 1. Resolve action validity & metric effects
  const resolution = resolveAction(request.action, citizenCase, request.grantId);

  // 2. Apply metric changes & check bankruptcy/public trust guardrails
  const { metrics: updatedMetrics, failure } = applyMetricChanges(
    state.metrics,
    resolution.metricChanges
  );

  // 3. Update shift statistics & campaign statistics
  const updatedShiftStats = recordActionInShiftStats(state.shiftStats, resolution);
  const updatedCampaignStats = recordActionInCampaignStats(
    state.campaignStats || createInitialCampaignStats(),
    resolution
  );

  // 4. Advance case
  const nextCaseIndex = state.currentCaseIndex + 1;
  const noCasesRemaining = nextCaseIndex >= state.dailyCases.length;

  let shiftEnded = noCasesRemaining;
  let campaignEnded = state.campaignEnded;
  let campaignOutcome = state.campaignOutcome;

  // 5. Evaluate failure or end of shift
  if (failure.isFailed) {
    campaignEnded = true;
    shiftEnded = true;
    campaignOutcome = {
      status: 'FAILED',
      failureReason: failure.reason,
      metrics: updatedMetrics,
      campaignStats: updatedCampaignStats,
    };
  } else if (noCasesRemaining && state.currentDay === 3) {
    // If Day 3 cases are completed, evaluate victory
    const victoryEval = checkVictoryCondition(updatedMetrics);
    campaignEnded = true;
    shiftEnded = true;
    campaignOutcome = {
      status: victoryEval.isVictory ? 'VICTORY' : 'FAILED',
      failureReason: victoryEval.reason,
      metrics: updatedMetrics,
      campaignStats: updatedCampaignStats,
    };
  }

  const nextState = {
    ...state,
    metrics: updatedMetrics,
    shiftStats: updatedShiftStats,
    campaignStats: updatedCampaignStats,
    currentCaseIndex: nextCaseIndex,
    shiftEnded,
    campaignEnded,
    campaignOutcome,
  };

  /** @type {import('../index.js').ActionResult} */
  const actionResult = {
    caseId: resolution.caseId,
    action: resolution.action,
    grantId: resolution.grantId,
    isValid: resolution.isValid,
    explanation: resolution.explanation,
    metrics: updatedMetrics,
    metricChanges: resolution.metricChanges,
    shiftStats: updatedShiftStats,
    hasNextCase: !noCasesRemaining && !campaignEnded,
    shiftEnded,
    campaignOutcome,
  };

  return {
    state: nextState,
    result: actionResult,
  };
}

/**
 * Transitions game state to the next campaign day.
 * Metrics carry over; timer, cases, case index, and shift statistics reset.
 * Per GAME_RULES.md §8.6.
 *
 * @param {GameState} state
 * @returns {GameState}
 */
export function startNextDay(state) {
  if (!state) {
    throw new Error('GameState is required to start next day.');
  }

  if (state.campaignEnded || state.metrics.budget <= 0 || state.metrics.trust <= 0) {
    throw new Error('Cannot start next day: Campaign has ended.');
  }

  const nextDay = state.currentDay + 1;
  if (nextDay > 3) {
    throw new Error('Campaign only has 3 days.');
  }

  const dailyCases = getCasesForDay(nextDay);
  const timeRemaining = getTimeLimitForDay(nextDay);
  const shiftStats = createInitialShiftStats();
  const campaignStats = {
    ...(state.campaignStats || createInitialCampaignStats()),
    daysCompleted: state.currentDay,
  };

  return {
    ...state,
    currentDay: nextDay,
    timeRemaining,
    currentCaseIndex: 0,
    dailyCases,
    shiftStats,
    campaignStats,
    shiftEnded: false,
    campaignEnded: false,
    campaignOutcome: null,
  };
}

/**
 * Returns a sanitized frontend view of the game state.
 *
 * @param {GameState} state
 * @returns {import('../index.js').GameStateView}
 */
export function sanitizeGameStateView(state) {
  return {
    currentDay: state.currentDay,
    timeRemaining: state.timeRemaining,
    currentCaseIndex: state.currentCaseIndex,
    metrics: { ...state.metrics },
    shiftStats: { ...state.shiftStats },
    campaignStats: { ...(state.campaignStats || createInitialCampaignStats()) },
    shiftEnded: state.shiftEnded,
    campaignEnded: state.campaignEnded,
  };
}

export {};
