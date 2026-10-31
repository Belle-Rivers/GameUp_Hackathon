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

import * as cases from './data/cases.js';
import * as rulebook from './data/rulebook.js';
import * as grants from './data/grants.js';
import * as emissions from './calculations/emissions.js';
import * as audit from './systems/audit.js';
import * as grantSystem from './systems/grant-system.js';
import * as metrics from './systems/metrics.js';
import * as gameState from './systems/game-state.js';
import * as campaign from './systems/campaign.js';

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
