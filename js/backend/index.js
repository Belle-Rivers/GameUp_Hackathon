/**
 * @typedef {import('./data/cases.js').CitizenCase} CitizenCase
 * @typedef {import('./data/cases.js').Receipt} Receipt
 * @typedef {import('./data/cases.js').ReceiptItem} ReceiptItem
 * @typedef {import('./data/cases.js').FraudType} FraudType
 * @typedef {import('./data/rulebook.js').EmissionRate} EmissionRate
 * @typedef {import('./data/rulebook.js').EmissionRulebook} EmissionRulebook
 * @typedef {import('./data/grants.js').GrantId} GrantId
 * @typedef {import('./data/grants.js').GrantEligibility} GrantEligibility
 * @typedef {import('./data/grants.js').Grant} Grant
 * @typedef {import('./systems/game-state.js').CityMetrics} CityMetrics
 * @typedef {import('./systems/game-state.js').ShiftStats} ShiftStats
 * @typedef {import('./systems/game-state.js').GameState} GameState
 */

/**
 * @typedef {'APPROVE' | 'FINE' | 'GRANT'} ActionType
 */

/**
 * @typedef {Object} CitizenCaseView
 * @property {string} id Unique case identifier.
 * @property {1 | 2 | 3} day Campaign day associated with the case.
 * @property {string} name Citizen name.
 * @property {string} district Citizen's district.
 * @property {string} note Personal statement from the citizen.
 * @property {number} declaredCO2 Declared carbon footprint in kg CO2.
 * @property {Receipt[]} receipts Collection of recorded household activities.
 */

/**
 * @typedef {Object} GameStateView
 * @property {number} currentDay Campaign day currently being played.
 * @property {number} timeRemaining Remaining shift time in seconds.
 * @property {number} currentCaseIndex Index of the current citizen case.
 * @property {CityMetrics} metrics Current city metrics.
 * @property {ShiftStats} shiftStats Current shift statistics.
 */

/**
 * @typedef {Object} ReceiptItemRef
 * @property {number} receiptIndex Index of the receipt in the current case.
 * @property {number} itemIndex Index of the item within that receipt.
 */

/**
 * @typedef {Object} ReceiptBreakdownRequest
 * @property {string} caseId Case whose receipt items should be calculated.
 * @property {ReceiptItemRef[]} [selection] Items to calculate. Omit to calculate the full case.
 */

/**
 * @typedef {Object} ReceiptBreakdownItem
 * @property {ReceiptItemRef} ref Reference to the calculated receipt item.
 * @property {string} label Human-readable activity description.
 * @property {number} qty Recorded quantity.
 * @property {string} unit Unit of measurement.
 * @property {number} co2 Emission contribution in kg CO2.
 */

/**
 * @typedef {Object} ReceiptBreakdown
 * @property {string} caseId Case the breakdown belongs to.
 * @property {ReceiptBreakdownItem[]} items Per-item emission contributions.
 * @property {Record<string, number>} categorySubtotals Emission subtotals by receipt category.
 * @property {number} totalCO2 Total emissions for the requested selection.
 */

/**
 * @typedef {Object} AuditActionRequest
 * @property {string} caseId Case the action applies to.
 * @property {ActionType} action Selected action.
 * @property {GrantId} [grantId] Selected grant. Required when action is GRANT.
 */

/**
 * @typedef {Object} MetricChanges
 * @property {number} netZero Change in Net-Zero Progress percentage points.
 * @property {number} budget Change in municipal budget in USD.
 * @property {number} trust Change in Public Trust percentage points.
 */

/**
 * @typedef {'VICTORY' | 'FAILED'} CampaignStatus
 */

/**
 * @typedef {'BANKRUPTCY' | 'PUBLIC_TRUST' | 'NET_ZERO_TARGET'} CampaignFailureReason
 */

/**
 * @typedef {Object} CampaignOutcome
 * @property {CampaignStatus} status Final campaign status.
 * @property {CampaignFailureReason | null} failureReason Failure cause, or null on victory.
 * @property {CityMetrics} metrics Final city metrics.
 */

/**
 * @typedef {Object} ActionResult
 * @property {string} caseId Case the action applied to.
 * @property {ActionType} action Action that was submitted.
 * @property {GrantId | null} grantId Selected grant, or null for non-grant actions.
 * @property {boolean} isValid Whether the backend validated the action as correct.
 * @property {string} explanation Human-readable explanation for the player.
 * @property {CityMetrics} metrics Updated city metrics.
 * @property {MetricChanges} metricChanges Changes applied by the action.
 * @property {ShiftStats} shiftStats Updated shift statistics.
 * @property {boolean} hasNextCase Whether another case remains in the current shift.
 * @property {boolean} shiftEnded Whether the shift has ended.
 * @property {CampaignOutcome | null} campaignOutcome Terminal outcome, or null if ongoing.
 */

/**
 * @typedef {Object} ShiftSummary
 * @property {number} day Day the summary belongs to.
 * @property {CityMetrics} metrics City metrics at the end of the shift.
 * @property {ShiftStats} shiftStats Statistics for the completed shift.
 */

/**
 * @typedef {Object} BackendApi
 * @property {() => GameStateView} startCampaign Initialize the campaign and return the initial view.
 * @property {() => GameStateView} restartCampaign Reset the campaign and return the initial view.
 * @property {() => GameStateView} getState Return the current sanitized game state.
 * @property {() => CitizenCaseView | null} getCurrentCase Return the current case, or null when none remains.
 * @property {() => EmissionRulebook} getRulebook Return the emission rulebook.
 * @property {() => Grant[]} getGrants Return the grant catalog.
 * @property {(request: ReceiptBreakdownRequest) => ReceiptBreakdown} getReceiptBreakdown Calculate selected receipt contributions.
 * @property {(request: AuditActionRequest) => ActionResult} submitAction Validate an action and apply its effects.
 * @property {() => ShiftSummary} getShiftSummary Return the summary for the completed shift.
 * @property {() => CampaignOutcome | null} getCampaignOutcome Return the terminal outcome, or null if ongoing.
 */

import * as cases from './data/cases.js';
import * as rulebook from './data/rulebook.js';
import * as grants from './data/grants.js';
import * as emissions from './calculations/emissions.js';
import * as audit from './systems/audit.js';
import * as grantSystem from './systems/grant-system.js';
import * as metrics from './systems/metrics.js';
import * as gameState from './systems/game-state.js';
import * as campaign from './systems/campaign.js';

/**
 * Creates or gets the default BackendApi implementation.
 *
 * @type {BackendApi}
 */
export const backendApi = {
  startCampaign: () => campaign.resetCampaign().getView(),
  restartCampaign: () => campaign.resetCampaign().getView(),
  getState: () => campaign.getCampaign().getView(),
  getCurrentCase: () => campaign.getCampaign().getCurrentCaseView(),
  getRulebook: () => rulebook.EMISSION_RULEBOOK,
  getGrants: () => grants.MITIGATION_GRANTS,
  getReceiptBreakdown: (request) => {
    const targetCase = cases.CITIZEN_CASES.find((c) => c.id === request.caseId);
    if (!targetCase) {
      throw new Error(`Case not found: "${request.caseId}".`);
    }
    return emissions.breakdownReceipts(targetCase, request.selection);
  },
  submitAction: (request) => campaign.getCampaign().submitAction(request),
  getShiftSummary: () => campaign.getCampaign().getShiftSummary(),
  getCampaignOutcome: () => campaign.getCampaign().getCampaignOutcome(),
};

export {
  cases,
  rulebook,
  grants,
  emissions,
  audit,
  grantSystem,
  metrics,
  gameState,
  campaign,
};
