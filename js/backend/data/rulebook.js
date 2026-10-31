/**
 * @typedef {Object} EmissionRate
 * @property {string} key Unique rulebook key referenced by receipt items.
 * @property {string} category Emission category.
 * @property {string} activity Human-readable activity description.
 * @property {number} rate Emission rate in kg CO2 per unit.
 * @property {string} unit Unit of measurement.
 */

/**
 * @typedef {Record<string, EmissionRate>} EmissionRulebook
 */

export {};
