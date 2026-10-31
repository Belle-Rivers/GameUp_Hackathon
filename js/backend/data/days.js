/**
 * @typedef {Object} DayConfig
 * @property {number} day Campaign day number (1, 2, or 3).
 * @property {string} title Narrative title of the shift.
 * @property {string} description Overview of shift complexity and mechanics.
 * @property {number} cases Number of citizen cases to audit.
 * @property {number} caseCount Alias for cases count.
 * @property {number} timeLimitSeconds Time limit for the shift in seconds.
 * @property {number} shiftDuration Alias for timeLimitSeconds.
 * @property {string[]} mechanics Key mechanics introduced or active in the day.
 * @property {import('./grants.js').GrantId[]} availableGrants Mitigation grants active on this day.
 */

/**
 * Three-day campaign configuration per GAME_RULES.md §8 and PRD.md §8.
 *
 * @type {Record<number, DayConfig>}
 */
export const CAMPAIGN_DAYS = {
  1: {
    day: 1,
    title: 'Introduction',
    description: 'Basic Audits: Simple receipt math, matching declared vs actual. Grants introduced: Heat Pump & Compost Kit.',
    cases: 5,
    caseCount: 5,
    timeLimitSeconds: 120,
    shiftDuration: 120,
    mechanics: [
      'Basic receipt calculations',
      'Simple declaration comparisons',
      'Introduction to the municipal rulebook',
      'Heat Pump Subsidy',
      'Municipal Compost Kit',
    ],
    availableGrants: ['HEAT_PUMP', 'COMPOST_KIT'],
  },
  2: {
    day: 2,
    title: 'Investigation',
    description: 'Greenwashing Fraud Introduced: Unverified offsets & flight logs. Grants expanded: EV Transit Voucher & Cool Roof Permit.',
    cases: 6,
    caseCount: 6,
    timeLimitSeconds: 100,
    shiftDuration: 100,
    mechanics: [
      'Greenwashing and fraudulent environmental claims',
      'Flight records',
      'More complex household records',
      'All four mitigation grants',
    ],
    availableGrants: ['HEAT_PUMP', 'COMPOST_KIT', 'TRANSIT_PASS', 'COOL_ROOF'],
  },
  3: {
    day: 3,
    title: 'Final Audit',
    description: 'High-Density Shift: Multi-receipt cases, subtle rounding errors, conflicting personal notes vs actual receipt evidence.',
    cases: 7,
    caseCount: 7,
    timeLimitSeconds: 90,
    shiftDuration: 90,
    mechanics: [
      'Multiple receipts',
      'More complex calculations',
      'Subtle rounding differences',
      'Conflicting citizen notes',
      'More difficult audit decisions',
    ],
    availableGrants: ['HEAT_PUMP', 'COMPOST_KIT', 'TRANSIT_PASS', 'COOL_ROOF'],
  },
};

/**
 * Retrieves configuration for a specific campaign day.
 *
 * @param {number} day Day number (1, 2, or 3).
 * @returns {DayConfig}
 */
export function getDayConfig(day) {
  const config = CAMPAIGN_DAYS[day];
  if (!config) {
    throw new Error(`Invalid campaign day: ${day}. Expected 1, 2, or 3.`);
  }
  return {
    ...config,
    mechanics: [...config.mechanics],
    availableGrants: [...config.availableGrants],
  };
}

/**
 * Retrieves grant IDs available on a specific day.
 *
 * @param {number} day Day number (1, 2, or 3).
 * @returns {import('./grants.js').GrantId[]}
 */
export function getAvailableGrantsForDay(day) {
  return getDayConfig(day).availableGrants;
}

export {};
