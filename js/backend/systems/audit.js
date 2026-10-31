/**
 * @typedef {import('../data/cases.js').CitizenCase} CitizenCase
 * @typedef {import('../data/grants.js').GrantId} GrantId
 * @typedef {import('../index.js').ActionType} ActionType
 * @typedef {import('../index.js').AuditActionRequest} AuditActionRequest
 * @typedef {import('../index.js').MetricChanges} MetricChanges
 */

/**
 * @typedef {Object} ApprovalValidationResult
 * @property {boolean} isValid Whether approval is valid.
 * @property {string} reason Explanation of approval validity.
 * @property {number} actualCO2 Calculated actual emissions in kg CO2.
 * @property {number} declaredCO2 Declared emissions in kg CO2.
 * @property {number} discrepancy Signed discrepancy (actualCO2 - declaredCO2).
 * @property {boolean} withinTolerance Whether discrepancy is within ±2 kg tolerance.
 * @property {boolean} hasUnverifiedOffset Whether case claims an unverified offset.
 */

/**
 * @typedef {Object} FineValidationResult
 * @property {boolean} isValid Whether fine is valid.
 * @property {string} reason Explanation of fine validity.
 * @property {number} fineAmount Calculated fine amount in USD.
 * @property {boolean} underdeclared Whether emissions were underdeclared by > 2 kg.
 * @property {boolean} hasUnverifiedOffset Whether case claims an unverified offset.
 * @property {number} actualCO2 Calculated actual emissions in kg CO2.
 * @property {number} declaredCO2 Declared emissions in kg CO2.
 * @property {number} discrepancy Signed discrepancy (actualCO2 - declaredCO2).
 */

/**
 * @typedef {Object} ActionResolutionResult
 * @property {string} caseId Identifier of the evaluated case.
 * @property {ActionType} action Action type that was resolved.
 * @property {GrantId | null} grantId Selected grant ID if action was GRANT, or null.
 * @property {boolean} isValid Whether the action was valid.
 * @property {string} explanation Player-facing summary explaining the outcome.
 * @property {MetricChanges} metricChanges Metric changes produced by the action.
 * @property {ApprovalValidationResult | FineValidationResult | import('./grant-system.js').GrantValidationResult | Object} details Detailed validation data.
 */

import {
  calculateActualEmissions,
  compareDeclaration,
  detectDiscrepancy,
  verifyOffsets,
} from '../calculations/emissions.js';
import {
  validateGrant,
  calculateGrantMetricChanges,
} from './grant-system.js';

/**
 * Metric changes defined in GAME_RULES.md §4.1 for APPROVE.
 */
export const APPROVAL_ACTION_EFFECTS = {
  VALID: {
    budgetMultiplier: 0.5,
    trust: 3,
    netZero: 1,
  },
  INVALID: {
    budget: -200,
    trust: -5,
    netZero: -2,
  },
};

/**
 * Metric changes defined in GAME_RULES.md §4.2 for FINE.
 */
export const FINE_ACTION_EFFECTS = {
  VALID: {
    ratePerKg: 10,
    trust: -2,
    netZero: 3,
  },
  INVALID: {
    budget: -300,
    trust: -12,
    netZero: 0,
  },
};

/**
 * Validate whether an APPROVE action is correct for a citizen case.
 *
 * Valid per GAME_RULES.md §4.1 when:
 * 1. Absolute difference between actual and declared emissions is 2 kg or less.
 * 2. No unverified greenwashing offset claim makes the case invalid.
 *
 * @param {CitizenCase} citizenCase Case to evaluate.
 * @returns {ApprovalValidationResult}
 */
export function validateApproval(citizenCase) {
  const actualCO2 = calculateActualEmissions(citizenCase);
  const declaredCO2 = citizenCase.declaredCO2;
  const comparison = compareDeclaration(citizenCase);
  const discrepancyInfo = detectDiscrepancy(comparison);
  const offsetInfo = verifyOffsets(citizenCase);

  const withinTolerance = discrepancyInfo.withinTolerance;
  const hasUnverifiedOffset = offsetInfo.hasUnverifiedOffset;
  const isValid = withinTolerance && !hasUnverifiedOffset;

  let reason;
  if (isValid) {
    reason =
      'Approval valid: declared emissions match actual records within the ±2 kg tolerance and no unverified offsets were claimed.';
  } else if (!withinTolerance && hasUnverifiedOffset) {
    reason = `Approval invalid: discrepancy of ${discrepancyInfo.absoluteDiscrepancy.toFixed(
      2
    )} kg exceeds the ±2 kg tolerance and case contains unverified offset claims.`;
  } else if (!withinTolerance) {
    reason = `Approval invalid: declaration discrepancy of ${discrepancyInfo.absoluteDiscrepancy.toFixed(
      2
    )} kg exceeds the ±2 kg tolerance.`;
  } else {
    reason =
      'Approval invalid: case contains an unverified or unapproved offset claim.';
  }

  return {
    isValid,
    reason,
    actualCO2,
    declaredCO2,
    discrepancy: comparison.discrepancy,
    withinTolerance,
    hasUnverifiedOffset,
  };
}

/**
 * Validate whether a FINE action is correct for a citizen case.
 *
 * Valid per GAME_RULES.md §4.2 when EITHER condition is true:
 * 1. Declared emissions are more than 2 kg below actual emissions (discrepancy > 2).
 * 2. The citizen claims an offset that cannot be verified.
 *
 * Fine amount per GAME_RULES.md §4.2 and D-11:
 * Fine = max(0, Actual CO₂ - Declared CO₂) × $10
 *
 * @param {CitizenCase} citizenCase Case to evaluate.
 * @returns {FineValidationResult}
 */
export function validateFine(citizenCase) {
  const actualCO2 = calculateActualEmissions(citizenCase);
  const declaredCO2 = citizenCase.declaredCO2;
  const comparison = compareDeclaration(citizenCase);
  const offsetInfo = verifyOffsets(citizenCase);

  const discrepancy = comparison.discrepancy;
  // Underdeclared means actual emissions exceed declared emissions by more than 2 kg
  const underdeclared = discrepancy > 2;
  const hasUnverifiedOffset = offsetInfo.hasUnverifiedOffset;
  const isValid = underdeclared || hasUnverifiedOffset;

  const rawFine = Math.max(0, discrepancy) * FINE_ACTION_EFFECTS.VALID.ratePerKg;
  // Round to 2 decimal places to avoid floating point imprecision
  const fineAmount = Math.round(rawFine * 100) / 100;

  let reason;
  if (isValid) {
    if (underdeclared && hasUnverifiedOffset) {
      reason = `Fine valid: citizen underdeclared emissions by ${discrepancy.toFixed(
        2
      )} kg and claimed an unverified offset. Fine: $${fineAmount}.`;
    } else if (underdeclared) {
      reason = `Fine valid: citizen underdeclared emissions by ${discrepancy.toFixed(
        2
      )} kg (exceeding 2 kg threshold). Fine: $${fineAmount}.`;
    } else {
      reason = `Fine valid: citizen claimed an unverified offset. Fine: $${fineAmount}.`;
    }
  } else {
    reason =
      'Fine invalid: citizen did not underdeclare emissions by more than 2 kg and has no unverified offset claims.';
  }

  return {
    isValid,
    reason,
    fineAmount,
    underdeclared,
    hasUnverifiedOffset,
    actualCO2,
    declaredCO2,
    discrepancy,
  };
}

/**
 * Calculate the financial and metric effects of every action and return
 * the complete action resolution.
 *
 * Handles:
 * - APPROVE: Valid awards (actualCO2 * $0.50), +3% trust, +1% Net-Zero.
 *            Invalid penalizes -$200 budget, -5% trust, -2% Net-Zero.
 * - FINE:    Valid assesses fineAmount to budget, -2% trust, +3% Net-Zero.
 *            Invalid penalizes -$300 budget, -12% trust, 0% Net-Zero.
 * - GRANT:   Valid deducts grant.cost from budget, +8% trust, +grant.netZeroBoost Net-Zero.
 *            Invalid deducts grant.cost from budget, -4% trust, 0% Net-Zero.
 *
 * @param {ActionType | AuditActionRequest} actionOrRequest Action name or request object.
 * @param {CitizenCase} citizenCase Case to evaluate.
 * @param {GrantId} [maybeGrantId] Grant identifier if action is GRANT and first param is action string.
 * @returns {ActionResolutionResult}
 */
export function resolveAction(actionOrRequest, citizenCase, maybeGrantId) {
  /** @type {ActionType} */
  let action;
  /** @type {GrantId | null} */
  let grantId = null;

  if (typeof actionOrRequest === 'object' && actionOrRequest !== null) {
    action = actionOrRequest.action;
    grantId = actionOrRequest.grantId || null;
  } else {
    action = actionOrRequest;
    grantId = maybeGrantId || null;
  }

  const caseId = citizenCase.id;

  if (action === 'APPROVE') {
    const validation = validateApproval(citizenCase);

    if (validation.isValid) {
      const budgetChange =
        Math.round(
          validation.actualCO2 * APPROVAL_ACTION_EFFECTS.VALID.budgetMultiplier * 100
        ) / 100;
      const metricChanges = {
        netZero: APPROVAL_ACTION_EFFECTS.VALID.netZero,
        budget: budgetChange,
        trust: APPROVAL_ACTION_EFFECTS.VALID.trust,
      };
      const explanation = `Approved declaration: declaration is accurate within tolerance. Budget +$${budgetChange.toFixed(
        2
      )}, Public Trust +${metricChanges.trust}%, Net-Zero +${metricChanges.netZero}%.`;

      return {
        caseId,
        action,
        grantId: null,
        isValid: true,
        explanation,
        metricChanges,
        details: validation,
      };
    } else {
      const metricChanges = {
        netZero: APPROVAL_ACTION_EFFECTS.INVALID.netZero,
        budget: APPROVAL_ACTION_EFFECTS.INVALID.budget,
        trust: APPROVAL_ACTION_EFFECTS.INVALID.trust,
      };
      const explanation = `Oversight penalty: ${validation.reason} Budget -$200, Public Trust -5%, Net-Zero -2%.`;

      return {
        caseId,
        action,
        grantId: null,
        isValid: false,
        explanation,
        metricChanges,
        details: validation,
      };
    }
  }

  if (action === 'FINE') {
    const validation = validateFine(citizenCase);

    if (validation.isValid) {
      const metricChanges = {
        netZero: FINE_ACTION_EFFECTS.VALID.netZero,
        budget: validation.fineAmount,
        trust: FINE_ACTION_EFFECTS.VALID.trust,
      };
      const explanation = `Fine enforced: ${validation.reason} Budget +$${validation.fineAmount}, Public Trust ${metricChanges.trust}%, Net-Zero +${metricChanges.netZero}%.`;

      return {
        caseId,
        action,
        grantId: null,
        isValid: true,
        explanation,
        metricChanges,
        details: validation,
      };
    } else {
      const metricChanges = {
        netZero: FINE_ACTION_EFFECTS.INVALID.netZero,
        budget: FINE_ACTION_EFFECTS.INVALID.budget,
        trust: FINE_ACTION_EFFECTS.INVALID.trust,
      };
      const explanation = `Unfair fine penalty: ${validation.reason} Budget -$300, Public Trust -12%, Net-Zero 0%.`;

      return {
        caseId,
        action,
        grantId: null,
        isValid: false,
        explanation,
        metricChanges,
        details: validation,
      };
    }
  }

  if (action === 'GRANT') {
    const validation = validateGrant(citizenCase, grantId || undefined);
    const metricChanges = calculateGrantMetricChanges(validation);

    if (validation.isValid) {
      const grantName = validation.grant ? validation.grant.name : 'Mitigation Grant';
      const explanation = `Grant awarded (${grantName}): ${validation.reason} Budget -$${validation.cost}, Public Trust +${metricChanges.trust}%, Net-Zero +${metricChanges.netZero}%.`;

      return {
        caseId,
        action,
        grantId: validation.grantId,
        isValid: true,
        explanation,
        metricChanges,
        details: validation,
      };
    } else {
      const explanation = `Wasted subsidy penalty: ${validation.reason} Budget -$${validation.cost}, Public Trust ${metricChanges.trust}%, Net-Zero 0%.`;

      return {
        caseId,
        action,
        grantId: validation.grantId,
        isValid: false,
        explanation,
        metricChanges,
        details: validation,
      };
    }
  }

  throw new Error(`Unsupported audit action type: "${action}". Must be APPROVE, FINE, or GRANT.`);
}

