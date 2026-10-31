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

const CITIZEN_CASES = [
  {
    id: "C001",
    day: 1,
    name: "Alice",
    district: "Downtown",
    note: "Works from home",
    declaredCO2: 80,
    receipts: [
      {
        type: "Energy",
        title: "Household Energy Use",
        items: [
          { label: "Grid Electricity", qty: 100, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Natural Gas", qty: 50, unit: "m³", rateKey: "GAS_HEAT" },
          { label: "Local Organic / Plant Food", qty: 2, unit: "pack", rateKey: "LOCAL_FOOD" },
          { label: "Beef Sirloin", qty: 1, unit: "pack", rateKey: "BEEF" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: null,
    fraudType: null,
  },
  {
    id: "C002",
    day: 2,
    name: "Bob",
    district: "Industrial",
    note: "Delivery driver",
    declaredCO2: 120,
    receipts: [
      {
        type: "Transport and Food",
        title: "Mixed Receipt",
        items: [
          { label: "Domestic Air Travel", qty: 1, unit: "ticket", rateKey: "FLIGHT" },
          { label: "Public Electric Transit", qty: 10, unit: "km", rateKey: "PUBLIC_TRANSIT" },
          { label: "Landfill Waste", qty: 5, unit: "kg", rateKey: "LANDFILL" },
          { label: "Composted Organic Waste", qty: 2, unit: "kg", rateKey: "COMPOST" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: null,
    fraudType: null,
  }
];

export { CITIZEN_CASES };
