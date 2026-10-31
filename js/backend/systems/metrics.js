/**
 * @typedef {import('../index.js').CityMetrics} CityMetrics
 * @typedef {import('../index.js').MetricChanges} MetricChanges
 * @typedef {import('../index.js').CampaignFailureReason} CampaignFailureReason
 */

/**
 * Initial metrics defined in GAME_RULES.md §6.1.
 */
export const INITIAL_METRICS = Object.freeze({
  netZero: 30,
  budget: 5000,
  trust: 70,
});

/**
 * Clamping boundaries defined in GAME_RULES.md §6.5.
 */
export const METRIC_BOUNDS = Object.freeze({
  netZero: { min: 0, max: 100 },
  trust: { min: 0, max: 100 },
});

/**
 * Creates a fresh clone of initial city metrics.
 *
 * @returns {CityMetrics}
 */
export function createInitialMetrics() {
  return { ...INITIAL_METRICS };
}

/**
 * Checks whether a given budget triggers bankruptcy failure.
 * Per GAME_RULES.md §6.3, §10.2: fails if budget <= 0.
 *
 * @param {number} budget
 * @returns {boolean}
 */
export function isBankrupt(budget) {
  return typeof budget === 'number' && budget <= 0;
}

/**
 * Checks whether public trust triggers failure.
 * Per GAME_RULES.md §6.4, §10.2: fails if trust <= 0.
 *
 * @param {number} trust
 * @returns {boolean}
 */
export function isTrustDepleted(trust) {
  return typeof trust === 'number' && trust <= 0;
}

/**
 * Clamps percentage metrics (netZero and trust) between 0 and 100.
 * Per GAME_RULES.md §6.5: Budget must not be clamped to zero before bankruptcy check!
 *
 * @param {number} value
 * @param {number} [min=0]
 * @param {number} [max=100]
 * @returns {number}
 */
export function clampPercentage(value, min = 0, max = 100) {
  if (typeof value !== 'number' || Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Evaluates failure conditions on current city metrics.
 * Per GAME_RULES.md §6.5, §10.2:
 * 1. Budget <= 0 -> BANKRUPTCY
 * 2. Trust <= 0 -> PUBLIC_TRUST
 *
 * @param {CityMetrics} metrics
 * @returns {{ isFailed: boolean, reason: CampaignFailureReason | null }}
 */
export function checkFailureConditions(metrics) {
  if (!metrics) {
    return { isFailed: false, reason: null };
  }

  if (isBankrupt(metrics.budget)) {
    return { isFailed: true, reason: 'BANKRUPTCY' };
  }

  if (isTrustDepleted(metrics.trust)) {
    return { isFailed: true, reason: 'PUBLIC_TRUST' };
  }

  return { isFailed: false, reason: null };
}

/**
 * Evaluates victory condition at the end of Day 3.
 * Per GAME_RULES.md §10.1:
 * - netZero >= 100%
 * - budget > 0
 * - trust > 0
 *
 * @param {CityMetrics} metrics
 * @returns {{ isVictory: boolean, reason: CampaignFailureReason | null }}
 */
export function checkVictoryCondition(metrics) {
  const failure = checkFailureConditions(metrics);
  if (failure.isFailed) {
    return { isVictory: false, reason: failure.reason };
  }

  if (metrics.netZero < 100) {
    return { isVictory: false, reason: 'NET_ZERO_TARGET' };
  }

  return { isVictory: true, reason: null };
}

/**
 * Applies metric changes to current city metrics following the strict sequence
 * in GAME_RULES.md §6.5:
 * 1. Calculate raw updated values (Budget retains negative value if under zero).
 * 2. Check failure conditions (bankruptcy / trust depleted).
 * 3. Clamp percentage metrics (netZero and trust between 0 and 100).
 *
 * Returns updated metrics and failure status.
 *
 * @param {CityMetrics} currentMetrics
 * @param {MetricChanges} changes
 * @returns {{
 *   metrics: CityMetrics,
 *   changes: MetricChanges,
 *   failure: { isFailed: boolean, reason: CampaignFailureReason | null }
 * }}
 */
export function applyMetricChanges(currentMetrics, changes) {
  const base = currentMetrics || INITIAL_METRICS;
  const delta = changes || { netZero: 0, budget: 0, trust: 0 };

  const rawNetZero = (base.netZero ?? 0) + (delta.netZero ?? 0);
  const rawBudget = (base.budget ?? 0) + (delta.budget ?? 0);
  const rawTrust = (base.trust ?? 0) + (delta.trust ?? 0);

  // Check bankruptcy and trust depletion before or with raw values
  const failure = checkFailureConditions({
    netZero: rawNetZero,
    budget: rawBudget,
    trust: rawTrust,
  });

  const updatedMetrics = {
    netZero: clampPercentage(rawNetZero, METRIC_BOUNDS.netZero.min, METRIC_BOUNDS.netZero.max),
    budget: Math.round(rawBudget * 100) / 100, // keep cents precision cleanly
    trust: clampPercentage(rawTrust, METRIC_BOUNDS.trust.min, METRIC_BOUNDS.trust.max),
  };

  return {
    metrics: updatedMetrics,
    changes: {
      netZero: delta.netZero ?? 0,
      budget: delta.budget ?? 0,
      trust: delta.trust ?? 0,
    },
    failure,
  };
}

