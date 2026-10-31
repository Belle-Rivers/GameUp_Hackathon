/**
 * @typedef {import('../data/cases.js').CitizenCase} CitizenCase
 * @typedef {import('../data/cases.js').Receipt} Receipt
 * @typedef {import('../data/cases.js').ReceiptItem} ReceiptItem
 * @typedef {import('../data/grants.js').GrantId} GrantId
 * @typedef {import('../data/grants.js').Grant} Grant
 * @typedef {import('../index.js').MetricChanges} MetricChanges
 */

/**
 * @typedef {Object} HouseholdConsumptionMetrics
 * @property {number} naturalGasM3 Total natural gas heating consumption in m³.
 * @property {number} landfillWasteKg Total landfill waste in kg.
 * @property {number} gasolineDistanceKm Total gasoline travel distance in km.
 * @property {number} summerCoolingKwh Total summer AC electricity in kWh from COOLING receipts.
 * @property {'ASPHALT' | 'OTHER' | string} roofType Household roof type.
 */

/**
 * @typedef {Object} GrantEligibilityResult
 * @property {boolean} eligible Whether the citizen qualifies for the specified grant.
 * @property {string} reason Human-readable explanation of eligibility or disqualification.
 * @property {HouseholdConsumptionMetrics} metrics Extracted household metrics relevant to eligibility.
 */

/**
 * @typedef {Object} GrantValidationResult
 * @property {boolean} isValid Whether awarding the grant is valid.
 * @property {string} reason Human-readable reason for player feedback.
 * @property {GrantId | null} grantId The grant ID evaluated, or null if none provided.
 * @property {Grant | null} grant The grant definition if known, or null.
 * @property {number} cost Grant cost in USD applied to budget.
 * @property {number} netZeroBoost Net-Zero Progress boost in percentage points (0 if invalid).
 */

import { GRANTS } from '../data/grants.js';
import { getAvailableGrantsForDay } from '../data/days.js';

/**
 * Metric changes applied when a grant action is resolved.
 * Follows GAME_RULES.md §4.3 and §6.
 */
export const GRANT_ACTION_EFFECTS = {
  VALID: {
    trust: 8,
  },
  INVALID: {
    trust: -4,
    netZero: 0,
  },
};

/**
 * Extract household consumption quantities from case receipts and metadata.
 *
 * Checks:
 * - Natural gas: sum of qty for items with rateKey 'GAS_HEAT'
 * - Landfill waste: sum of qty for items with rateKey 'LANDFILL'
 * - Gasoline mobility: sum of qty for items with rateKey 'GASOLINE'
 * - Summer air-conditioning: sum of qty for items with rateKey 'GRID_ELEC'
 *   inside receipts of type 'COOLING' (GAME_RULES §7.2, D-16)
 * - Roof type: citizenCase.roofType (required for Cool/Green Roof Permit)
 *
 * @param {CitizenCase} citizenCase Citizen case to analyze.
 * @returns {HouseholdConsumptionMetrics}
 */
export function getHouseholdConsumption(citizenCase) {
  let naturalGasM3 = 0;
  let landfillWasteKg = 0;
  let gasolineDistanceKm = 0;
  let summerCoolingKwh = 0;

  if (Array.isArray(citizenCase.receipts)) {
    for (const receipt of citizenCase.receipts) {
      const isCoolingReceipt =
        typeof receipt.type === 'string' &&
        receipt.type.trim().toUpperCase() === 'COOLING';

      if (Array.isArray(receipt.items)) {
        for (const item of receipt.items) {
          if (item.rateKey === 'GAS_HEAT') {
            naturalGasM3 += item.qty;
          } else if (item.rateKey === 'LANDFILL') {
            landfillWasteKg += item.qty;
          } else if (item.rateKey === 'GASOLINE') {
            gasolineDistanceKm += item.qty;
          }

          if (isCoolingReceipt && item.rateKey === 'GRID_ELEC') {
            summerCoolingKwh += item.qty;
          }
        }
      }
    }
  }

  return {
    naturalGasM3,
    landfillWasteKg,
    gasolineDistanceKm,
    summerCoolingKwh,
    roofType: citizenCase.roofType || 'OTHER',
  };
}

/**
 * Check whether a citizen case qualifies for a specific mitigation grant.
 *
 * Evaluates the rules defined in GAME_RULES.md §5 and decisions D-15/D-16:
 * - HEAT_PUMP: Natural gas heating consumption > 100 m³.
 * - COMPOST_KIT: Landfill waste > 30 kg.
 * - TRANSIT_PASS: Gasoline mobility > 300 km.
 * - COOL_ROOF: Summer AC electricity > 150 kWh (strict) AND roofType === 'ASPHALT'.
 *
 * Note: Per GAME_RULES.md §7.3 and D-09/D-13, eligibility is computed directly
 * from receipt records and roof type, not from hidden metadata.
 *
 * @param {CitizenCase} citizenCase Case to evaluate.
 * @param {GrantId} grantId Grant identifier to check.
 * @returns {GrantEligibilityResult}
 */
export function checkGrantEligibility(citizenCase, grantId) {
  const grant = GRANTS[grantId];
  const metrics = getHouseholdConsumption(citizenCase);

  if (!grant) {
    return {
      eligible: false,
      reason: `Unknown grant ID: ${grantId}`,
      metrics,
    };
  }

  switch (grantId) {
    case 'HEAT_PUMP': {
      const threshold = grant.eligibility.naturalGasAboveM3 ?? 100;
      const eligible = metrics.naturalGasM3 > threshold;
      return {
        eligible,
        reason: eligible
          ? `Natural gas consumption of ${metrics.naturalGasM3} m³ exceeds the ${threshold} m³ threshold.`
          : `Natural gas consumption of ${metrics.naturalGasM3} m³ does not exceed the ${threshold} m³ threshold.`,
        metrics,
      };
    }

    case 'COMPOST_KIT': {
      const threshold = grant.eligibility.landfillWasteAboveKg ?? 30;
      const eligible = metrics.landfillWasteKg > threshold;
      return {
        eligible,
        reason: eligible
          ? `Landfill waste of ${metrics.landfillWasteKg} kg exceeds the ${threshold} kg threshold.`
          : `Landfill waste of ${metrics.landfillWasteKg} kg does not exceed the ${threshold} kg threshold.`,
        metrics,
      };
    }

    case 'TRANSIT_PASS': {
      const threshold = grant.eligibility.gasolineDistanceAboveKm ?? 300;
      const eligible = metrics.gasolineDistanceKm > threshold;
      return {
        eligible,
        reason: eligible
          ? `Gasoline travel of ${metrics.gasolineDistanceKm} km exceeds the ${threshold} km threshold.`
          : `Gasoline travel of ${metrics.gasolineDistanceKm} km does not exceed the ${threshold} km threshold.`,
        metrics,
      };
    }

    case 'COOL_ROOF': {
      const acThreshold = grant.eligibility.summerAcAboveKwh ?? 150;
      const isAsphalt = String(metrics.roofType).toUpperCase() === 'ASPHALT';
      const exceedsAcThreshold = metrics.summerCoolingKwh > acThreshold;
      const eligible = exceedsAcThreshold && isAsphalt;

      let reason;
      if (eligible) {
        reason = `Summer AC electricity of ${metrics.summerCoolingKwh} kWh exceeds ${acThreshold} kWh with an asphalt roof.`;
      } else if (!exceedsAcThreshold && !isAsphalt) {
        reason = `Summer AC electricity of ${metrics.summerCoolingKwh} kWh does not exceed ${acThreshold} kWh and roof is not asphalt (${metrics.roofType}).`;
      } else if (!exceedsAcThreshold) {
        reason = `Summer AC electricity of ${metrics.summerCoolingKwh} kWh does not exceed the ${acThreshold} kWh threshold.`;
      } else {
        reason = `Household does not have an asphalt roof (${metrics.roofType}).`;
      }

      return {
        eligible,
        reason,
        metrics,
      };
    }

    default:
      return {
        eligible: false,
        reason: `Unsupported grant ID: ${grantId}`,
        metrics,
      };
  }
}

/**
 * Return a list of all grant IDs that a citizen case qualifies for.
 *
 * @param {CitizenCase} citizenCase Case to evaluate.
 * @returns {GrantId[]} Array of eligible grant IDs.
 */
export function getEligibleGrants(citizenCase) {
  const eligibleGrants = [];
  for (const grantId of Object.keys(GRANTS)) {
    const result = checkGrantEligibility(citizenCase, /** @type {GrantId} */ (grantId));
    if (result.eligible) {
      eligibleGrants.push(/** @type {GrantId} */ (grantId));
    }
  }
  return eligibleGrants;
}

/**
 * Determine the primary eligible grant for a citizen case, or null if none.
 *
 * @param {CitizenCase} citizenCase Case to evaluate.
 * @returns {GrantId | null}
 */
export function determineEligibleGrant(citizenCase) {
  const eligible = getEligibleGrants(citizenCase);
  return eligible.length > 0 ? eligible[0] : null;
}

/**
 * Validate whether awarding a specific grant to a citizen case is valid.
 *
 * Valid when:
 * - A valid grantId is selected.
 * - The citizen satisfies the grant's eligibility requirements.
 *
 * Per GAME_RULES.md §4.3:
 * - If valid: cost = grant.cost, netZeroBoost = grant.netZeroBoost
 * - If invalid: cost = selected grant cost (or 0 if unknown), netZeroBoost = 0
 *
 * @param {CitizenCase} citizenCase Case receiving the grant.
 * @param {GrantId | string} [grantId] Selected grant identifier.
 * @returns {GrantValidationResult}
 */
export function validateGrant(citizenCase, grantId) {
  if (!grantId || typeof grantId !== 'string') {
    return {
      isValid: false,
      reason: 'No mitigation grant was selected for the GRANT action.',
      grantId: null,
      grant: null,
      cost: 0,
      netZeroBoost: 0,
    };
  }

  const grant = GRANTS[/** @type {GrantId} */ (grantId)];
  if (!grant) {
    return {
      isValid: false,
      reason: `Unknown mitigation grant selected: "${grantId}".`,
      grantId: null,
      grant: null,
      cost: 0,
      netZeroBoost: 0,
    };
  }

  const eligibility = checkGrantEligibility(citizenCase, grant.id);

  if (eligibility.eligible) {
    return {
      isValid: true,
      reason: `Eligible for ${grant.name}: ${eligibility.reason}`,
      grantId: grant.id,
      grant,
      cost: grant.cost,
      netZeroBoost: grant.netZeroBoost,
    };
  }

  return {
    isValid: false,
    reason: `Ineligible for ${grant.name}: ${eligibility.reason}`,
    grantId: grant.id,
    grant,
    cost: grant.cost,
    netZeroBoost: 0,
  };
}

/**
 * Calculate the metric changes for a grant validation result.
 *
 * @param {GrantValidationResult} validation Validation result from validateGrant.
 * @returns {MetricChanges}
 */
export function calculateGrantMetricChanges(validation) {
  const budgetChange = validation.cost === 0 ? 0 : -validation.cost;

  if (validation.isValid) {
    return {
      budget: budgetChange,
      trust: GRANT_ACTION_EFFECTS.VALID.trust,
      netZero: validation.netZeroBoost,
    };
  }

  return {
    budget: budgetChange,
    trust: GRANT_ACTION_EFFECTS.INVALID.trust,
    netZero: GRANT_ACTION_EFFECTS.INVALID.netZero,
  };
}

/**
 * Retrieves full Grant objects available on a specific campaign day.
 * Day 1: Heat Pump Subsidy & Municipal Compost Kit.
 * Day 2 & 3: All four grants.
 *
 * @param {number} day Campaign day (1, 2, or 3).
 * @returns {Grant[]}
 */
export function getGrantsForDay(day) {
  const grantIds = getAvailableGrantsForDay(day);
  return grantIds.map((id) => GRANTS[id]).filter(Boolean);
}

