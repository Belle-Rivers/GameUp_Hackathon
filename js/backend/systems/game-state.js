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
 * @typedef {Object} GameState
 * @property {number} currentDay Campaign day currently being played.
 * @property {number} timeRemaining Remaining shift time in seconds.
 * @property {number} currentCaseIndex Index of the current citizen case.
 * @property {import('../data/cases.js').CitizenCase[]} dailyCases Cases for the current day.
 * @property {CityMetrics} metrics Current city metrics.
 * @property {ShiftStats} shiftStats Current shift statistics.
 */

export {};
