/**
 * @typedef {import('../data/cases.js').ReceiptItem} ReceiptItem
 * @typedef {import('../data/cases.js').CitizenCase} CitizenCase
 * @typedef {import('../data/rulebook.js').EmissionRate} EmissionRate
 */

import { EMISSION_RULEBOOK } from '../data/rulebook.js';

/**
 * Resolve an item's rate key against the emission rulebook.
 *
 * @param {string} rateKey Rulebook key referenced by the receipt item.
 * @returns {EmissionRate}
 * @throws {Error} When the rate key is not defined in the rulebook.
 */
function resolveRate(rateKey) {
  const rate = EMISSION_RULEBOOK[rateKey];
  if (!rate) {
    throw new Error(`Unknown emission rate key: ${rateKey}`);
  }
  return rate;
}

/**
 * Calculate the emission contribution of a single receipt item.
 *
 * @param {ReceiptItem} item Recorded household activity.
 * @returns {number} Emission contribution in kg CO2.
 */
function calculateItemEmissions(item) {
  const rate = resolveRate(item.rateKey);
  return item.qty * rate.rate;
}

/**
 * Calculate the total actual emissions for all receipt items in a case.
 *
 * The assessed total is clamped to zero so a net-negative footprint from
 * offsets is never displayed or used as a negative value (GAME_RULES §3.2).
 *
 * @param {CitizenCase} citizenCase Case whose receipt items should be summed.
 * @returns {number} Total actual emissions in kg CO2, never below zero.
 */
function calculateActualEmissions(citizenCase) {
  let total = 0;

  for (const receipt of citizenCase.receipts) {
    for (const item of receipt.items) {
      total += calculateItemEmissions(item);
    }
  }

  return Math.max(0, total);
}

export { calculateItemEmissions, calculateActualEmissions };
