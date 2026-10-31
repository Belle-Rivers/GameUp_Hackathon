/**
 * @typedef {import('../data/cases.js').ReceiptItem} ReceiptItem
 * @typedef {import('../data/cases.js').CitizenCase} CitizenCase
 * @typedef {import('../data/rulebook.js').EmissionRate} EmissionRate
 */

/**
 * @typedef {Object} ReceiptItemRef
 * @property {number} receiptIndex Index of the receipt in the case.
 * @property {number} itemIndex Index of the item within that receipt.
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
 * @property {number} totalCO2 Total emissions for the case, never below zero.
 */

/**
 * @typedef {Object} DeclarationComparison
 * @property {string} caseId Case the comparison belongs to.
 * @property {number} actualCO2 Actual emissions calculated from receipts.
 * @property {number} declaredCO2 Emissions declared by the citizen.
 * @property {number} discrepancy Actual emissions minus declared emissions.
 * @property {number | null} discrepancyRatio Discrepancy divided by actual emissions, or null when actual emissions are zero.
 */

/**
 * @typedef {Object} DiscrepancyDetection
 * @property {number} absoluteDiscrepancy Absolute difference between actual and declared emissions.
 * @property {boolean} withinTolerance Whether the absolute discrepancy is 2 kg CO2 or less.
 * @property {boolean} isZeroEmission Whether actual emissions are zero.
 */

const DISCREPANCY_TOLERANCE_KG = 2;

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

/**
 * Compare a citizen's declared emissions with the actual emissions calculated
 * from their receipt items.
 *
 * The discrepancy ratio is null when actual emissions are zero so the game
 * never divides by zero; decision rules use the absolute discrepancy in that
 * case (GAME_RULES §3.4, D-08).
 *
 * @param {CitizenCase} citizenCase Case whose declaration should be compared.
 * @returns {DeclarationComparison}
 */
function compareDeclaration(citizenCase) {
  const actualCO2 = calculateActualEmissions(citizenCase);
  const declaredCO2 = citizenCase.declaredCO2;
  const discrepancy = actualCO2 - declaredCO2;

  return {
    caseId: citizenCase.id,
    actualCO2,
    declaredCO2,
    discrepancy,
    discrepancyRatio: actualCO2 === 0 ? null : discrepancy / actualCO2,
  };
}

/**
 * Detect whether a declaration is within the ±2 kg CO2 tolerance.
 *
 * The absolute discrepancy is used so zero-emission cases are handled without
 * relying on the discrepancy ratio (GAME_RULES §3.5, D-08).
 *
 * @param {DeclarationComparison} comparison Result from compareDeclaration.
 * @returns {DiscrepancyDetection}
 */
function detectDiscrepancy(comparison) {
  const absoluteDiscrepancy = Math.abs(comparison.discrepancy);

  return {
    absoluteDiscrepancy,
    withinTolerance: absoluteDiscrepancy <= DISCREPANCY_TOLERANCE_KG,
    isZeroEmission: comparison.actualCO2 === 0,
  };
}

/**
 * Calculate the emission contribution of every item and the subtotal of every
 * receipt category for a case.
 *
 * Item contributions may be negative for offsets. Category subtotals preserve
 * those negative contributions, while the total is clamped to zero per
 * GAME_RULES §3.2.
 *
 * @param {CitizenCase} citizenCase Case to break down.
 * @returns {ReceiptBreakdown}
 */
function calculateReceiptBreakdown(citizenCase) {
  /** @type {ReceiptBreakdownItem[]} */
  const items = [];
  /** @type {Record<string, number>} */
  const categorySubtotals = {};
  let total = 0;

  citizenCase.receipts.forEach((receipt, receiptIndex) => {
    const category = receipt.type;
    if (categorySubtotals[category] === undefined) {
      categorySubtotals[category] = 0;
    }

    receipt.items.forEach((item, itemIndex) => {
      const co2 = calculateItemEmissions(item);
      items.push({
        ref: { receiptIndex, itemIndex },
        label: item.label,
        qty: item.qty,
        unit: item.unit,
        co2,
      });
      categorySubtotals[category] += co2;
      total += co2;
    });
  });

  return {
    caseId: citizenCase.id,
    items,
    categorySubtotals,
    totalCO2: Math.max(0, total),
  };
}

export {
  calculateItemEmissions,
  calculateActualEmissions,
  compareDeclaration,
  detectDiscrepancy,
  calculateReceiptBreakdown,
};
