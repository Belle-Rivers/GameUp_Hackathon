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

export {};
