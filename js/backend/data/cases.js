/**
 * @typedef {'UNVERIFIED_OFFSET' | 'HIDDEN_RECEIPT' | 'UNDERDECLARED_KWH'} FraudType
 */

/**
 * @typedef {Object} ReceiptItem
 * @property {string} label Human-readable activity description.
 * @property {number} qty Recorded quantity.
 * @property {string} unit Unit of measurement.
 * @property {string} rateKey Key referencing an emission factor in the rulebook.
 */

/**
 * @typedef {Object} Receipt
 * @property {string} type Category used to group recorded activities.
 * @property {string} title Human-readable receipt title.
 * @property {ReceiptItem[]} items Recorded household activities.
 */

/**
 * @typedef {Object} CitizenCase
 * @property {string} id Unique case identifier.
 * @property {1 | 2 | 3} day Campaign day associated with the case.
 * @property {string} name Citizen name.
 * @property {string} district Citizen's district.
 * @property {string} note Personal statement from the citizen.
 * @property {number} declaredCO2 Declared carbon footprint in kg CO2.
 * @property {Receipt[]} receipts Collection of recorded household activities.
 * @property {import('./grants.js').GrantId | null} eligibleGrant Eligible grant identifier, if applicable.
 * @property {string} grantExplanation Explanation of why the citizen qualifies.
 * @property {boolean} [hasFraud] Expected fraud indicator for test and content-authoring purposes.
 * @property {FraudType | null} [fraudType] Type of fraud or misleading declaration.
 */

export {};
