/**
 * @typedef {import('../index.js').GameStateView} GameStateView
 * @typedef {import('../index.js').CitizenCaseView} CitizenCaseView
 * @typedef {import('../index.js').AuditActionRequest} AuditActionRequest
 * @typedef {import('../index.js').ActionResult} ActionResult
 * @typedef {import('../index.js').ShiftSummary} ShiftSummary
 * @typedef {import('../index.js').CampaignOutcome} CampaignOutcome
 * @typedef {import('./game-state.js').GameState} GameState
 */

import {
  createInitialGameState,
  getCurrentCase,
  applyAuditAction,
  tickTimer,
  startNextDay,
  sanitizeGameStateView,
} from './game-state.js';
import { checkVictoryCondition } from './metrics.js';

/**
 * Manages an active campaign instance and lifecycle.
 */
export class CampaignManager {
  /**
   * @param {number} [startDay=1]
   */
  constructor(startDay = 1) {
    /** @type {GameState} */
    this.state = createInitialGameState(startDay);
  }

  /**
   * Resets campaign to day 1 with initial metrics.
   * Per GAME_RULES.md §10.3.
   *
   * @returns {GameStateView}
   */
  restart() {
    this.state = createInitialGameState(1);
    return this.getView();
  }

  /**
   * Returns current sanitized game state view for frontend.
   *
   * @returns {GameStateView}
   */
  getView() {
    return sanitizeGameStateView(this.state);
  }

  /**
   * Returns the current active citizen case view, or null if none remains.
   * Sanitizes case to prevent leakage of internal test fields (e.g. hasFraud).
   *
   * @returns {CitizenCaseView | null}
   */
  getCurrentCaseView() {
    const activeCase = getCurrentCase(this.state);
    if (!activeCase) return null;

    return {
      id: activeCase.id,
      day: activeCase.day,
      name: activeCase.name,
      district: activeCase.district,
      note: activeCase.note,
      declaredCO2: activeCase.declaredCO2,
      receipts: activeCase.receipts,
    };
  }

  /**
   * Advances the timer by a number of seconds.
   * If the timer runs out on day 3 with no time remaining, evaluates campaign outcome if needed.
   *
   * @param {number} [seconds=1]
   * @returns {GameStateView}
   */
  tick(seconds = 1) {
    this.state = tickTimer(this.state, seconds);

    if (this.state.shiftEnded && !this.state.campaignEnded && this.state.currentDay === 3) {
      const victoryEval = checkVictoryCondition(this.state.metrics);
      this.state.campaignEnded = true;
      this.state.campaignOutcome = {
        status: victoryEval.isVictory ? 'VICTORY' : 'FAILED',
        failureReason: victoryEval.reason,
        metrics: { ...this.state.metrics },
      };
    }

    return this.getView();
  }

  /**
   * Validates and applies a player action against the current case.
   *
   * @param {AuditActionRequest} request
   * @returns {ActionResult}
   */
  submitAction(request) {
    const { state: nextState, result } = applyAuditAction(this.state, request);
    this.state = nextState;
    return result;
  }

  /**
   * Transitions to the next day if shift has ended and campaign is active.
   *
   * @returns {GameStateView}
   */
  advanceDay() {
    this.state = startNextDay(this.state);
    return this.getView();
  }

  /**
   * Returns a shift summary object for the completed day.
   *
   * @returns {ShiftSummary}
   */
  getShiftSummary() {
    return {
      day: this.state.currentDay,
      metrics: { ...this.state.metrics },
      shiftStats: { ...this.state.shiftStats },
    };
  }

  /**
   * Returns terminal outcome or null if campaign is ongoing.
   *
   * @returns {CampaignOutcome | null}
   */
  getCampaignOutcome() {
    return this.state.campaignOutcome ? { ...this.state.campaignOutcome } : null;
  }
}

/**
 * Singleton or factory helper to manage campaign lifecycle.
 */
let defaultCampaign = null;

export function getCampaign() {
  if (!defaultCampaign) {
    defaultCampaign = new CampaignManager(1);
  }
  return defaultCampaign;
}

export function resetCampaign() {
  defaultCampaign = new CampaignManager(1);
  return defaultCampaign;
}

