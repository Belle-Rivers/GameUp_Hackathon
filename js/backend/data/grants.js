/**
 * @typedef {'HEAT_PUMP' | 'COMPOST_KIT' | 'TRANSIT_PASS' | 'COOL_ROOF'} GrantId
 */

/**
 * @typedef {Object} GrantEligibility
 * @property {number} [naturalGasAboveM3] Natural gas consumption must exceed this value.
 * @property {number} [landfillWasteAboveKg] Landfill waste must exceed this value.
 * @property {number} [gasolineDistanceAboveKm] Gasoline travel must exceed this value.
 * @property {number} [summerAcAboveKwh] Summer air-conditioning electricity must exceed this value.
 * @property {boolean} [requiresAsphaltRoof] Household must have an asphalt roof.
 */

/**
 * @typedef {Object} Grant
 * @property {GrantId} id Grant identifier.
 * @property {string} name Human-readable grant name.
 * @property {number} cost Grant cost in USD.
 * @property {number} netZeroBoost Net-Zero Progress boost in percentage points.
 * @property {GrantEligibility} eligibility Eligibility conditions.
 * @property {string} futureImpact Descriptive explanation of the grant's future impact.
 */

/**
 * @type {Record<GrantId, Grant>}
 */
export const GRANTS = {
  HEAT_PUMP: {
    id: 'HEAT_PUMP',
    name: 'Heat Pump Subsidy',
    cost: 400,
    netZeroBoost: 10,
    eligibility: {
      naturalGasAboveM3: 100,
    },
    futureImpact: '75% reduction in heating-related CO₂.',
  },
  COMPOST_KIT: {
    id: 'COMPOST_KIT',
    name: 'Municipal Compost Kit',
    cost: 150,
    netZeroBoost: 8,
    eligibility: {
      landfillWasteAboveKg: 30,
    },
    futureImpact:
      '90% reduction in methane-related CO₂e from the relevant organic waste.',
  },
  TRANSIT_PASS: {
    id: 'TRANSIT_PASS',
    name: 'EV Transit Voucher',
    cost: 200,
    netZeroBoost: 7,
    eligibility: {
      gasolineDistanceAboveKm: 300,
    },
    futureImpact:
      "Commute emissions become zero under the grant's intended electric mobility assumption.",
  },
  COOL_ROOF: {
    id: 'COOL_ROOF',
    name: 'Cool/Green Roof Permit',
    cost: 300,
    netZeroBoost: 9,
    eligibility: {
      summerAcAboveKwh: 150,
      requiresAsphaltRoof: true,
    },
    futureImpact: '40% reduction in cooling-related electricity consumption.',
  },
};

/**
 * List of all available mitigation grants.
 * @type {Grant[]}
 */
export const MITIGATION_GRANTS = Object.values(GRANTS);

export {};
