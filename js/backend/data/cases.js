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
 * @property {string} type Category used to group recorded activities. Use `COOLING` for summer air-conditioning electricity.
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
 * @property {'ASPHALT' | 'OTHER'} roofType Household roof type, used for Cool/Green Roof Permit eligibility.
 * @property {import('./grants.js').GrantId | null} eligibleGrant Eligible grant identifier, if applicable.
 * @property {string} grantExplanation Explanation of why the citizen qualifies.
 * @property {boolean} [hasFraud] Expected fraud indicator for test and content-authoring purposes.
 * @property {FraudType | null} [fraudType] Type of fraud or misleading declaration.
 */

import * as rulebook from './rulebook.js';

const CITIZEN_CASES = [
  {
    id: "C001",
    day: 1,
    name: "Alice",
    district: "Downtown",
    note: "Works from home",
    declaredCO2: 80,
    roofType: "OTHER",
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
    roofType: "OTHER",
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

function validateReceiptItem(item) {
  const errors = [];
  if (typeof item.label !== 'string' || item.label.trim() === '') errors.push('label must be a non-empty string');
  if (typeof item.qty !== 'number' || !Number.isFinite(item.qty) || item.qty <= 0) errors.push('qty must be a positive number');
  if (typeof item.unit !== 'string' || item.unit.trim() === '') errors.push('unit must be a non-empty string');
  if (typeof item.rateKey !== 'string' || item.rateKey.trim() === '' || !rulebook.EMISSION_RULEBOOK[item.rateKey]) errors.push('rateKey must be a valid emission rate key');
  return { valid: errors.length === 0, errors };
}

function validateReceipt(receipt) {
  const errors = [];
  if (typeof receipt.type !== 'string' || receipt.type.trim() === '') errors.push('receipt type must be a non-empty string');
  if (typeof receipt.title !== 'string' || receipt.title.trim() === '') errors.push('receipt title must be a non-empty string');
  if (!Array.isArray(receipt.items) || receipt.items.length === 0) errors.push('receipt must have at least one item');
  else {
    for (const item of receipt.items) {
      const itemResult = validateReceiptItem(item);
      if (!itemResult.valid) {
        for (const e of itemResult.errors) errors.push(`item: ${e}`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

function validateCase(c) {
  const errors = [];
  if (typeof c.id !== 'string' || !/^C\d{3}$/.test(c.id)) errors.push('case id must match format C###');
  if (typeof c.day !== 'number' || !Number.isInteger(c.day) || c.day < 1 || c.day > 3) errors.push('day must be 1, 2, or 3');
  if (typeof c.name !== 'string' || c.name.trim() === '') errors.push('name must be a non-empty string');
  if (typeof c.district !== 'string' || c.district.trim() === '') errors.push('district must be a non-empty string');
  if (typeof c.declaredCO2 !== 'number' || !Number.isFinite(c.declaredCO2) || c.declaredCO2 < 0) errors.push('declaredCO2 must be a non-negative number');
  if (!Array.isArray(c.receipts) || c.receipts.length === 0) errors.push('case must have at least one receipt');
  else {
    for (const receipt of c.receipts) {
      const receiptResult = validateReceipt(receipt);
      if (!receiptResult.valid) {
        for (const e of receiptResult.errors) errors.push(`receipt: ${e}`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}

export { CITIZEN_CASES, validateCase, validateReceipt, validateReceiptItem };
