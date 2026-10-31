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
  // ─── DAY 1: Introduction (5 cases) ──────────────────────────────────────────
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
  // Preserved as index [1] for backward-compatible tests referencing CITIZEN_CASES[1]
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
  },
  {
    id: "C003",
    day: 1,
    name: "Can Demir",
    district: "Muratpaşa, Antalya",
    note: "I run a community soup kitchen. Our organic food scraps and packaging have filled up our landfill trash bin beyond capacity.",
    declaredCO2: 155,
    roofType: "OTHER",
    receipts: [
      {
        type: "Waste",
        title: "Municipal Waste Collection",
        items: [
          { label: "Landfill Waste", qty: 40, unit: "kg", rateKey: "LANDFILL" }
        ]
      },
      {
        type: "Energy and Food",
        title: "Kitchen Utilities",
        items: [
          { label: "Grid Electricity", qty: 50, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Local Organic / Plant Food", qty: 20, unit: "pack", rateKey: "LOCAL_FOOD" }
        ]
      }
    ],
    eligibleGrant: "COMPOST_KIT",
    grantExplanation: "Landfill waste of 40 kg exceeds the 30 kg threshold.",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C004",
    day: 1,
    name: "Fatma Kaya",
    district: "Konyaaltı, Antalya",
    note: "Our central gas boiler is over twenty years old and runs continuously in January. The heating bill was unbearable.",
    declaredCO2: 310,
    roofType: "OTHER",
    receipts: [
      {
        type: "Heating",
        title: "BOTAŞ Natural Gas Statement",
        items: [
          { label: "Natural Gas", qty: 140, unit: "m³", rateKey: "GAS_HEAT" }
        ]
      },
      {
        type: "Electricity",
        title: "TEDAŞ Electric Meter",
        items: [
          { label: "Grid Electricity", qty: 60, unit: "kWh", rateKey: "GRID_ELEC" }
        ]
      }
    ],
    eligibleGrant: "HEAT_PUMP",
    grantExplanation: "Natural gas heating consumption of 140 m³ exceeds the 100 m³ threshold.",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C005",
    day: 1,
    name: "Emre Öztürk",
    district: "Kepez, Antalya",
    note: "I carefully monitor our family utility meter and shop locally at the weekly neighbourhood pazars.",
    declaredCO2: 76,
    roofType: "OTHER",
    receipts: [
      {
        type: "Utilities & Food",
        title: "Monthly Household Log",
        items: [
          { label: "Grid Electricity", qty: 80, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Natural Gas", qty: 15, unit: "m³", rateKey: "GAS_HEAT" },
          { label: "Local Organic / Plant Food", qty: 12, unit: "pack", rateKey: "LOCAL_FOOD" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C006",
    day: 1,
    name: "Zeynep Arslan",
    district: "Muratpaşa, Antalya",
    note: "We barely used our heating or appliances, just normal daily living and a few weekend meals.",
    declaredCO2: 60,
    roofType: "OTHER",
    receipts: [
      {
        type: "Power & Groceries",
        title: "Household Monthly Statement",
        items: [
          { label: "Grid Electricity", qty: 120, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Beef Sirloin", qty: 3, unit: "pack", rateKey: "BEEF" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: false,
    fraudType: null,
  },

  // ─── DAY 2: Investigation (6 cases) ─────────────────────────────────────────
  {
    id: "C007",
    day: 2,
    name: "Mehmet Çelik",
    district: "Kepez, Antalya",
    note: "I commute over 380 km every month across Kepez and Döşemealtı in my gasoline car. I want to switch to the electric tram.",
    declaredCO2: 105,
    roofType: "OTHER",
    receipts: [
      {
        type: "Commute",
        title: "Monthly Odometer Log",
        items: [
          { label: "Gasoline Travel", qty: 380, unit: "km", rateKey: "GASOLINE" }
        ]
      },
      {
        type: "Energy & Diet",
        title: "Household Expenses",
        items: [
          { label: "Grid Electricity", qty: 50, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Local Organic / Plant Food", qty: 8, unit: "pack", rateKey: "LOCAL_FOOD" }
        ]
      }
    ],
    eligibleGrant: "TRANSIT_PASS",
    grantExplanation: "Gasoline mobility of 380 km exceeds the 300 km threshold.",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C008",
    day: 2,
    name: "Selin Yıldız",
    district: "Konyaaltı, Antalya",
    note: "Our top-floor duplex has a dark asphalt roof that absorbs heat all day, forcing our air conditioning unit to run constantly.",
    declaredCO2: 145,
    roofType: "ASPHALT",
    receipts: [
      {
        type: "COOLING",
        title: "Summer AC Electric Usage",
        items: [
          { label: "Grid Electricity", qty: 180, unit: "kWh", rateKey: "GRID_ELEC" }
        ]
      },
      {
        type: "Home",
        title: "Base Home Utilities",
        items: [
          { label: "Natural Gas", qty: 20, unit: "m³", rateKey: "GAS_HEAT" },
          { label: "Grid Electricity", qty: 30, unit: "kWh", rateKey: "GRID_ELEC" }
        ]
      }
    ],
    eligibleGrant: "COOL_ROOF",
    grantExplanation: "Summer AC electricity of 180 kWh exceeds 150 kWh on an asphalt roof.",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C009",
    day: 2,
    name: "Burak Şen",
    district: "Muratpaşa, Antalya",
    note: "I bought private verified carbon credits from an online startup for 150 kg CO2, so my Antalya-Istanbul flight should count as net zero!",
    declaredCO2: 35,
    roofType: "OTHER",
    receipts: [
      {
        type: "Travel",
        title: "Airline Boarding Pass",
        items: [
          { label: "Domestic Air Travel", qty: 1, unit: "ticket", rateKey: "FLIGHT" }
        ]
      },
      {
        type: "Living",
        title: "Apartment Utility Bill",
        items: [
          { label: "Grid Electricity", qty: 60, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Local Organic / Plant Food", qty: 10, unit: "pack", rateKey: "LOCAL_FOOD" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: true,
    fraudType: "UNVERIFIED_OFFSET",
  },
  {
    id: "C010",
    day: 2,
    name: "Deniz Aydın",
    district: "Döşemealtı, Antalya",
    note: "Our rooftop solar panels generated clean electricity to offset our household power.",
    declaredCO2: 130,
    roofType: "OTHER",
    receipts: [
      {
        type: "Solar Power",
        title: "Solar Inverter & Grid Net Metering",
        items: [
          { label: "Grid Electricity", qty: 160, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Rooftop Solar Offset", qty: 50, unit: "kWh", rateKey: "SOLAR_OFFSET" }
        ]
      },
      {
        type: "Heating & Local Food",
        title: "Domestic Fuel & Market",
        items: [
          { label: "Natural Gas", qty: 30, unit: "m³", rateKey: "GAS_HEAT" },
          { label: "Local Organic / Plant Food", qty: 20, unit: "pack", rateKey: "LOCAL_FOOD" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C011",
    day: 2,
    name: "Hakan Koç",
    district: "Kepez, Antalya",
    note: "Our apartment was empty during the holiday, so our smart meter record must be inaccurate.",
    declaredCO2: 50,
    roofType: "OTHER",
    receipts: [
      {
        type: "Smart Meter",
        title: "Automated Electricity Reading",
        items: [
          { label: "Grid Electricity", qty: 190, unit: "kWh", rateKey: "GRID_ELEC" }
        ]
      },
      {
        type: "Heating",
        title: "Gas Heating Bill",
        items: [
          { label: "Natural Gas", qty: 25, unit: "m³", rateKey: "GAS_HEAT" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: true,
    fraudType: "UNDERDECLARED_KWH",
  },

  // ─── DAY 3: Final Audit (7 cases) ───────────────────────────────────────────
  {
    id: "C012",
    day: 3,
    name: "Elif Karaca",
    district: "Muratpaşa, Antalya",
    note: "I recorded all our receipts across power, gas, market shopping, and organic composting.",
    declaredCO2: 150,
    roofType: "OTHER",
    receipts: [
      {
        type: "Electricity",
        title: "Smart Meter Statement",
        items: [
          { label: "Grid Electricity", qty: 90, unit: "kWh", rateKey: "GRID_ELEC" }
        ]
      },
      {
        type: "Heating",
        title: "Gas Statement",
        items: [
          { label: "Natural Gas", qty: 35, unit: "m³", rateKey: "GAS_HEAT" }
        ]
      },
      {
        type: "Grocery",
        title: "Supermarket Purchase Slip",
        items: [
          { label: "Beef Sirloin", qty: 1, unit: "pack", rateKey: "BEEF" },
          { label: "Imported Out-of-Season Goods", qty: 4, unit: "item", rateKey: "IMPORTED_GOODS" }
        ]
      },
      {
        type: "Composting",
        title: "Community Compost Weigh-in",
        items: [
          { label: "Composted Organic Waste", qty: 10, unit: "kg", rateKey: "COMPOST" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C013",
    day: 3,
    name: "Ahmet Güler",
    district: "Kepez, Antalya",
    note: "I calculated my monthly footprint at approximately 110 kg based on general estimates.",
    declaredCO2: 110,
    roofType: "OTHER",
    receipts: [
      {
        type: "Energy",
        title: "Utility Billing Summary",
        items: [
          { label: "Grid Electricity", qty: 85, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Natural Gas", qty: 25, unit: "m³", rateKey: "GAS_HEAT" }
        ]
      },
      {
        type: "Commute",
        title: "Fuel Purchase Receipt",
        items: [
          { label: "Gasoline Travel", qty: 100, unit: "km", rateKey: "GASOLINE" }
        ]
      },
      {
        type: "Trash",
        title: "Waste Weigh-in",
        items: [
          { label: "Landfill Waste", qty: 2, unit: "kg", rateKey: "LANDFILL" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C014",
    day: 3,
    name: "Gamze Bulut",
    district: "Döşemealtı, Antalya",
    note: "Our detached rural house used heavy natural gas heating during the sub-zero plateau nights.",
    declaredCO2: 260,
    roofType: "OTHER",
    receipts: [
      {
        type: "Heating",
        title: "Rural Gas Supply Bill",
        items: [
          { label: "Natural Gas", qty: 115, unit: "m³", rateKey: "GAS_HEAT" }
        ]
      },
      {
        type: "Household & Diet",
        title: "Electric & Farmers Market",
        items: [
          { label: "Grid Electricity", qty: 40, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Local Organic / Plant Food", qty: 20, unit: "pack", rateKey: "LOCAL_FOOD" }
        ]
      }
    ],
    eligibleGrant: "HEAT_PUMP",
    grantExplanation: "Natural gas consumption of 115 m³ exceeds the 100 m³ threshold.",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C015",
    day: 3,
    name: "Kerem Yaman",
    district: "Konyaaltı, Antalya",
    note: "Living directly under the uninsulated asphalt roof terrace, our summer AC had to work without interruption.",
    declaredCO2: 165,
    roofType: "ASPHALT",
    receipts: [
      {
        type: "COOLING",
        title: "Peak Summer Cooling Usage",
        items: [
          { label: "Grid Electricity", qty: 170, unit: "kWh", rateKey: "GRID_ELEC" }
        ]
      },
      {
        type: "Household Power",
        title: "Base Electrical Consumption",
        items: [
          { label: "Grid Electricity", qty: 100, unit: "kWh", rateKey: "GRID_ELEC" }
        ]
      },
      {
        type: "Winter Heating",
        title: "Supplementary Heating",
        items: [
          { label: "Natural Gas", qty: 15, unit: "m³", rateKey: "GAS_HEAT" }
        ]
      }
    ],
    eligibleGrant: "COOL_ROOF",
    grantExplanation: "Summer AC electricity of 170 kWh exceeds 150 kWh on an asphalt roof.",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C016",
    day: 3,
    name: "Yasemin Vural",
    district: "Muratpaşa, Antalya",
    note: "We planted twelve young saplings on our family plot to offset our flights, so I omitted the flight ticket from the calculation.",
    declaredCO2: 42,
    roofType: "OTHER",
    receipts: [
      {
        type: "Travel",
        title: "Flight Confirmation Slip",
        items: [
          { label: "Domestic Air Travel", qty: 1, unit: "ticket", rateKey: "FLIGHT" }
        ]
      },
      {
        type: "Power & Food",
        title: "Residential Utilities",
        items: [
          { label: "Grid Electricity", qty: 60, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Local Organic / Plant Food", qty: 4, unit: "pack", rateKey: "LOCAL_FOOD" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: true,
    fraudType: "UNVERIFIED_OFFSET",
  },
  {
    id: "C017",
    day: 3,
    name: "Serkan Tekin",
    district: "Aksu, Antalya",
    note: "I make multi-stop daily distribution runs in a gasoline van between Aksu and downtown Antalya.",
    declaredCO2: 125,
    roofType: "OTHER",
    receipts: [
      {
        type: "Van Travel",
        title: "Commercial Route Log",
        items: [
          { label: "Gasoline Travel", qty: 450, unit: "km", rateKey: "GASOLINE" }
        ]
      },
      {
        type: "Warehouse Power & Food",
        title: "Depot Operating Log",
        items: [
          { label: "Grid Electricity", qty: 50, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Local Organic / Plant Food", qty: 20, unit: "pack", rateKey: "LOCAL_FOOD" }
        ]
      }
    ],
    eligibleGrant: "TRANSIT_PASS",
    grantExplanation: "Gasoline mobility of 450 km exceeds the 300 km threshold.",
    hasFraud: false,
    fraudType: null,
  },
  {
    id: "C018",
    day: 3,
    name: "Leyla Şimşek",
    district: "Kepez, Antalya",
    note: "Complete monthly accounting across residential energy, heating, electric transit, and neighborhood composting.",
    declaredCO2: 126,
    roofType: "OTHER",
    receipts: [
      {
        type: "Home Energy",
        title: "Residential Power and Heating",
        items: [
          { label: "Grid Electricity", qty: 80, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Natural Gas", qty: 30, unit: "m³", rateKey: "GAS_HEAT" }
        ]
      },
      {
        type: "Daily Commute",
        title: "AntRay Electric Tram Card",
        items: [
          { label: "Public Electric Transit", qty: 200, unit: "km", rateKey: "PUBLIC_TRANSIT" }
        ]
      },
      {
        type: "Meals & Waste",
        title: "Dietary and Organic Recycling",
        items: [
          { label: "Beef Sirloin", qty: 1, unit: "pack", rateKey: "BEEF" },
          { label: "Local Organic / Plant Food", qty: 10, unit: "pack", rateKey: "LOCAL_FOOD" },
          { label: "Composted Organic Waste", qty: 60, unit: "kg", rateKey: "COMPOST" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: "",
    hasFraud: false,
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
  if (!Array.isArray(receipt.items) || receipt.items.length === 0) errors.push('receipt must contain a non-empty items array');
  else {
    receipt.items.forEach((item, index) => {
      const itemValidation = validateReceiptItem(item);
      if (!itemValidation.valid) {
        errors.push(`Item at index ${index} is invalid: ${itemValidation.errors.join(', ')}`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}

function validateCase(c) {
  const errors = [];
  if (typeof c.id !== 'string' || !/^C\d{3}$/.test(c.id)) errors.push('id must match format C###');
  if (![1, 2, 3].includes(c.day)) errors.push('day must be 1, 2, or 3');
  if (typeof c.name !== 'string' || c.name.trim() === '') errors.push('name must be a non-empty string');
  if (typeof c.district !== 'string' || c.district.trim() === '') errors.push('district must be a non-empty string');
  if (typeof c.declaredCO2 !== 'number' || !Number.isFinite(c.declaredCO2) || c.declaredCO2 < 0) errors.push('declaredCO2 must be a non-negative number');
  if (!['ASPHALT', 'OTHER'].includes(c.roofType)) errors.push('roofType must be ASPHALT or OTHER');
  if (!Array.isArray(c.receipts) || c.receipts.length === 0) errors.push('receipts must be a non-empty array');
  else {
    c.receipts.forEach((receipt, index) => {
      const receiptValidation = validateReceipt(receipt);
      if (!receiptValidation.valid) {
        errors.push(`Receipt at index ${index} is invalid: ${receiptValidation.errors.join(', ')}`);
      }
    });
  }
  return { valid: errors.length === 0, errors };
}

export {
  CITIZEN_CASES,
  validateReceiptItem,
  validateReceipt,
  validateCase
};
