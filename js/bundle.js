(() => {
  // js/backend/data/rulebook.js
  var EMISSION_RULEBOOK = {
    GRID_ELEC: {
      key: "GRID_ELEC",
      category: "Electricity",
      activity: "Grid electricity",
      rate: 0.5,
      unit: "kg CO\u2082/kWh"
    },
    GAS_HEAT: {
      key: "GAS_HEAT",
      category: "Heating",
      activity: "Natural gas",
      rate: 2,
      unit: "kg CO\u2082/m\xB3"
    },
    SOLAR_OFFSET: {
      key: "SOLAR_OFFSET",
      category: "Electricity",
      activity: "Rooftop solar offset",
      rate: -0.4,
      unit: "kg CO\u2082/kWh"
    },
    BEEF: {
      key: "BEEF",
      category: "Food",
      activity: "Beef / ruminant meat",
      rate: 15,
      unit: "kg CO\u2082/pack"
    },
    IMPORTED_GOODS: {
      key: "IMPORTED_GOODS",
      category: "Food",
      activity: "Imported out-of-season goods",
      rate: 5,
      unit: "kg CO\u2082/item"
    },
    LOCAL_FOOD: {
      key: "LOCAL_FOOD",
      category: "Food",
      activity: "Local organic / plant food",
      rate: 0.5,
      unit: "kg CO\u2082/pack"
    },
    GASOLINE: {
      key: "GASOLINE",
      category: "Transportation",
      activity: "Gasoline travel",
      rate: 0.2,
      unit: "kg CO\u2082/km"
    },
    FLIGHT: {
      key: "FLIGHT",
      category: "Transportation",
      activity: "Domestic air travel",
      rate: 150,
      unit: "kg CO\u2082/ticket"
    },
    PUBLIC_TRANSIT: {
      key: "PUBLIC_TRANSIT",
      category: "Transportation",
      activity: "Public electric transit",
      rate: 0,
      unit: "kg CO\u2082/km"
    },
    LANDFILL: {
      key: "LANDFILL",
      category: "Waste",
      activity: "Landfill waste",
      rate: 3,
      unit: "kg CO\u2082e/kg"
    },
    COMPOST: {
      key: "COMPOST",
      category: "Waste",
      activity: "Composted organic waste",
      rate: 0.1,
      unit: "kg CO\u2082e/kg"
    }
  };

  // js/backend/data/cases.js
  var CITIZEN_CASES = [
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
            { label: "Natural Gas", qty: 50, unit: "m\xB3", rateKey: "GAS_HEAT" },
            { label: "Local Organic / Plant Food", qty: 2, unit: "pack", rateKey: "LOCAL_FOOD" },
            { label: "Beef Sirloin", qty: 1, unit: "pack", rateKey: "BEEF" }
          ]
        }
      ],
      eligibleGrant: null,
      grantExplanation: "",
      hasFraud: null,
      fraudType: null
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
      fraudType: null
    },
    {
      id: "C003",
      day: 1,
      name: "Can Demir",
      district: "Muratpa\u015Fa, Antalya",
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
      fraudType: null
    },
    {
      id: "C004",
      day: 1,
      name: "Fatma Kaya",
      district: "Konyaalt\u0131, Antalya",
      note: "Our central gas boiler is over twenty years old and runs continuously in January. The heating bill was unbearable.",
      declaredCO2: 310,
      roofType: "OTHER",
      receipts: [
        {
          type: "Heating",
          title: "BOTA\u015E Natural Gas Statement",
          items: [
            { label: "Natural Gas", qty: 140, unit: "m\xB3", rateKey: "GAS_HEAT" }
          ]
        },
        {
          type: "Electricity",
          title: "TEDA\u015E Electric Meter",
          items: [
            { label: "Grid Electricity", qty: 60, unit: "kWh", rateKey: "GRID_ELEC" }
          ]
        }
      ],
      eligibleGrant: "HEAT_PUMP",
      grantExplanation: "Natural gas heating consumption of 140 m\xB3 exceeds the 100 m\xB3 threshold.",
      hasFraud: false,
      fraudType: null
    },
    {
      id: "C005",
      day: 1,
      name: "Emre \xD6zt\xFCrk",
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
            { label: "Natural Gas", qty: 15, unit: "m\xB3", rateKey: "GAS_HEAT" },
            { label: "Local Organic / Plant Food", qty: 12, unit: "pack", rateKey: "LOCAL_FOOD" }
          ]
        }
      ],
      eligibleGrant: null,
      grantExplanation: "",
      hasFraud: false,
      fraudType: null
    },
    {
      id: "C006",
      day: 1,
      name: "Zeynep Arslan",
      district: "Muratpa\u015Fa, Antalya",
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
      fraudType: null
    },
    // ─── DAY 2: Investigation (6 cases) ─────────────────────────────────────────
    {
      id: "C007",
      day: 2,
      name: "Mehmet \xC7elik",
      district: "Kepez, Antalya",
      note: "I commute over 380 km every month across Kepez and D\xF6\u015Femealt\u0131 in my gasoline car. I want to switch to the electric tram.",
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
      fraudType: null
    },
    {
      id: "C008",
      day: 2,
      name: "Selin Y\u0131ld\u0131z",
      district: "Konyaalt\u0131, Antalya",
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
            { label: "Natural Gas", qty: 20, unit: "m\xB3", rateKey: "GAS_HEAT" },
            { label: "Grid Electricity", qty: 30, unit: "kWh", rateKey: "GRID_ELEC" }
          ]
        }
      ],
      eligibleGrant: "COOL_ROOF",
      grantExplanation: "Summer AC electricity of 180 kWh exceeds 150 kWh on an asphalt roof.",
      hasFraud: false,
      fraudType: null
    },
    {
      id: "C009",
      day: 2,
      name: "Burak \u015Een",
      district: "Muratpa\u015Fa, Antalya",
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
      fraudType: "UNVERIFIED_OFFSET"
    },
    {
      id: "C010",
      day: 2,
      name: "Deniz Ayd\u0131n",
      district: "D\xF6\u015Femealt\u0131, Antalya",
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
            { label: "Natural Gas", qty: 30, unit: "m\xB3", rateKey: "GAS_HEAT" },
            { label: "Local Organic / Plant Food", qty: 20, unit: "pack", rateKey: "LOCAL_FOOD" }
          ]
        }
      ],
      eligibleGrant: null,
      grantExplanation: "",
      hasFraud: false,
      fraudType: null
    },
    {
      id: "C011",
      day: 2,
      name: "Hakan Ko\xE7",
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
            { label: "Natural Gas", qty: 25, unit: "m\xB3", rateKey: "GAS_HEAT" }
          ]
        }
      ],
      eligibleGrant: null,
      grantExplanation: "",
      hasFraud: true,
      fraudType: "UNDERDECLARED_KWH"
    },
    // ─── DAY 3: Final Audit (7 cases) ───────────────────────────────────────────
    {
      id: "C012",
      day: 3,
      name: "Elif Karaca",
      district: "Muratpa\u015Fa, Antalya",
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
            { label: "Natural Gas", qty: 35, unit: "m\xB3", rateKey: "GAS_HEAT" }
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
      fraudType: null
    },
    {
      id: "C013",
      day: 3,
      name: "Ahmet G\xFCler",
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
            { label: "Natural Gas", qty: 25, unit: "m\xB3", rateKey: "GAS_HEAT" }
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
      fraudType: null
    },
    {
      id: "C014",
      day: 3,
      name: "Gamze Bulut",
      district: "D\xF6\u015Femealt\u0131, Antalya",
      note: "Our detached rural house used heavy natural gas heating during the sub-zero plateau nights.",
      declaredCO2: 260,
      roofType: "OTHER",
      receipts: [
        {
          type: "Heating",
          title: "Rural Gas Supply Bill",
          items: [
            { label: "Natural Gas", qty: 115, unit: "m\xB3", rateKey: "GAS_HEAT" }
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
      grantExplanation: "Natural gas consumption of 115 m\xB3 exceeds the 100 m\xB3 threshold.",
      hasFraud: false,
      fraudType: null
    },
    {
      id: "C015",
      day: 3,
      name: "Kerem Yaman",
      district: "Konyaalt\u0131, Antalya",
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
            { label: "Natural Gas", qty: 15, unit: "m\xB3", rateKey: "GAS_HEAT" }
          ]
        }
      ],
      eligibleGrant: "COOL_ROOF",
      grantExplanation: "Summer AC electricity of 170 kWh exceeds 150 kWh on an asphalt roof.",
      hasFraud: false,
      fraudType: null
    },
    {
      id: "C016",
      day: 3,
      name: "Yasemin Vural",
      district: "Muratpa\u015Fa, Antalya",
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
      fraudType: "UNVERIFIED_OFFSET"
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
      fraudType: null
    },
    {
      id: "C018",
      day: 3,
      name: "Leyla \u015Eim\u015Fek",
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
            { label: "Natural Gas", qty: 30, unit: "m\xB3", rateKey: "GAS_HEAT" }
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
      fraudType: null
    }
  ];

  // js/backend/data/days.js
  var CAMPAIGN_DAYS = {
    1: {
      day: 1,
      title: "Introduction",
      description: "Basic Audits: Simple receipt math, matching declared vs actual. Grants introduced: Heat Pump & Compost Kit.",
      cases: 5,
      caseCount: 5,
      timeLimitSeconds: 120,
      shiftDuration: 120,
      mechanics: [
        "Basic receipt calculations",
        "Simple declaration comparisons",
        "Introduction to the municipal rulebook",
        "Heat Pump Subsidy",
        "Municipal Compost Kit"
      ],
      availableGrants: ["HEAT_PUMP", "COMPOST_KIT"]
    },
    2: {
      day: 2,
      title: "Investigation",
      description: "Greenwashing Fraud Introduced: Unverified offsets & flight logs. Grants expanded: EV Transit Voucher & Cool Roof Permit.",
      cases: 6,
      caseCount: 6,
      timeLimitSeconds: 100,
      shiftDuration: 100,
      mechanics: [
        "Greenwashing and fraudulent environmental claims",
        "Flight records",
        "More complex household records",
        "All four mitigation grants"
      ],
      availableGrants: ["HEAT_PUMP", "COMPOST_KIT", "TRANSIT_PASS", "COOL_ROOF"]
    },
    3: {
      day: 3,
      title: "Final Audit",
      description: "High-Density Shift: Multi-receipt cases, subtle rounding errors, conflicting personal notes vs actual receipt evidence.",
      cases: 7,
      caseCount: 7,
      timeLimitSeconds: 90,
      shiftDuration: 90,
      mechanics: [
        "Multiple receipts",
        "More complex calculations",
        "Subtle rounding differences",
        "Conflicting citizen notes",
        "More difficult audit decisions"
      ],
      availableGrants: ["HEAT_PUMP", "COMPOST_KIT", "TRANSIT_PASS", "COOL_ROOF"]
    }
  };
  function getDayConfig(day) {
    const config = CAMPAIGN_DAYS[day];
    if (!config) {
      throw new Error(`Invalid campaign day: ${day}. Expected 1, 2, or 3.`);
    }
    return {
      ...config,
      mechanics: [...config.mechanics],
      availableGrants: [...config.availableGrants]
    };
  }
  function getAvailableGrantsForDay(day) {
    return getDayConfig(day).availableGrants;
  }

  // js/backend/data/grants.js
  var GRANTS = {
    HEAT_PUMP: {
      id: "HEAT_PUMP",
      name: "Heat Pump Subsidy",
      cost: 400,
      netZeroBoost: 10,
      eligibility: {
        naturalGasAboveM3: 100
      },
      futureImpact: "75% reduction in heating-related CO\u2082."
    },
    COMPOST_KIT: {
      id: "COMPOST_KIT",
      name: "Municipal Compost Kit",
      cost: 150,
      netZeroBoost: 8,
      eligibility: {
        landfillWasteAboveKg: 30
      },
      futureImpact: "90% reduction in methane-related CO\u2082e from the relevant organic waste."
    },
    TRANSIT_PASS: {
      id: "TRANSIT_PASS",
      name: "EV Transit Voucher",
      cost: 200,
      netZeroBoost: 7,
      eligibility: {
        gasolineDistanceAboveKm: 300
      },
      futureImpact: "Commute emissions become zero under the grant's intended electric mobility assumption."
    },
    COOL_ROOF: {
      id: "COOL_ROOF",
      name: "Cool/Green Roof Permit",
      cost: 300,
      netZeroBoost: 9,
      eligibility: {
        summerAcAboveKwh: 150,
        requiresAsphaltRoof: true
      },
      futureImpact: "40% reduction in cooling-related electricity consumption."
    }
  };
  var MITIGATION_GRANTS = Object.values(GRANTS);

  // js/backend/calculations/emissions.js
  var DISCREPANCY_TOLERANCE_KG = 2;
  function verifyOffsets(citizenCase) {
    const invalidOffsets = [];
    if (Array.isArray(citizenCase.receipts)) {
      for (const receipt of citizenCase.receipts) {
        if (!Array.isArray(receipt.items)) continue;
        for (const item of receipt.items) {
          const rateEntry = EMISSION_RULEBOOK[item.rateKey];
          const isOffsetKey = item.rateKey === "SOLAR_OFFSET";
          const hasNegativeRate = rateEntry && rateEntry.rate < 0;
          const mentionsOffset = /offset/i.test(item.label) || /offset/i.test(item.rateKey);
          if (mentionsOffset || hasNegativeRate) {
            if (!isOffsetKey) {
              invalidOffsets.push(
                `Unapproved offset item: "${item.label}" with rate key "${item.rateKey}" is not an approved municipal offset.`
              );
            } else if (item.qty <= 0) {
              invalidOffsets.push(
                `Invalid solar offset quantity: ${item.qty} ${item.unit}. Quantity must be positive.`
              );
            }
          }
        }
      }
    }
    if (typeof citizenCase.note === "string") {
      const unverifiedNotePattern = /clean carbon offset|private online startup|unverified offset/i;
      if (unverifiedNotePattern.test(citizenCase.note)) {
        invalidOffsets.push(`Citizen note claims unverified offset: "${citizenCase.note}"`);
      }
    }
    if (citizenCase.fraudType === "UNVERIFIED_OFFSET" && invalidOffsets.length === 0) {
      invalidOffsets.push("Case contains an unverified offset claim.");
    }
    return {
      hasUnverifiedOffset: invalidOffsets.length > 0,
      invalidOffsets
    };
  }
  function resolveRate(rateKey) {
    const rate = EMISSION_RULEBOOK[rateKey];
    if (!rate) {
      throw new Error(`Unknown emission rate key: ${rateKey}`);
    }
    return rate;
  }
  function calculateItemEmissions(item) {
    const rate = resolveRate(item.rateKey);
    return item.qty * rate.rate;
  }
  function calculateActualEmissions(citizenCase) {
    let total = 0;
    for (const receipt of citizenCase.receipts) {
      for (const item of receipt.items) {
        total += calculateItemEmissions(item);
      }
    }
    return Math.max(0, total);
  }
  function compareDeclaration(citizenCase) {
    const actualCO2 = calculateActualEmissions(citizenCase);
    const declaredCO2 = citizenCase.declaredCO2;
    const discrepancy = actualCO2 - declaredCO2;
    return {
      caseId: citizenCase.id,
      actualCO2,
      declaredCO2,
      discrepancy,
      discrepancyRatio: actualCO2 === 0 ? null : discrepancy / actualCO2
    };
  }
  function detectDiscrepancy(comparison) {
    const absoluteDiscrepancy = Math.abs(comparison.discrepancy);
    return {
      absoluteDiscrepancy,
      withinTolerance: absoluteDiscrepancy <= DISCREPANCY_TOLERANCE_KG,
      isZeroEmission: comparison.actualCO2 === 0
    };
  }
  function calculateReceiptBreakdown(citizenCase) {
    const items = [];
    const categorySubtotals = {};
    let total = 0;
    citizenCase.receipts.forEach((receipt, receiptIndex) => {
      const category = receipt.type;
      if (categorySubtotals[category] === void 0) {
        categorySubtotals[category] = 0;
      }
      receipt.items.forEach((item, itemIndex) => {
        const co2 = calculateItemEmissions(item);
        items.push({
          ref: { receiptIndex, itemIndex },
          label: item.label,
          qty: item.qty,
          unit: item.unit,
          co2
        });
        categorySubtotals[category] += co2;
        total += co2;
      });
    });
    return {
      caseId: citizenCase.id,
      items,
      categorySubtotals,
      totalCO2: Math.max(0, total)
    };
  }
  function breakdownReceipts(citizenCase, selection) {
    if (!selection || selection.length === 0) {
      return calculateReceiptBreakdown(citizenCase);
    }
    const items = [];
    const categorySubtotals = {};
    let total = 0;
    for (const ref of selection) {
      const receipt = citizenCase.receipts[ref.receiptIndex];
      if (!receipt) continue;
      const item = receipt.items[ref.itemIndex];
      if (!item) continue;
      const co2 = calculateItemEmissions(item);
      const category = receipt.type;
      items.push({
        ref: { receiptIndex: ref.receiptIndex, itemIndex: ref.itemIndex },
        label: item.label,
        qty: item.qty,
        unit: item.unit,
        co2
      });
      if (categorySubtotals[category] === void 0) {
        categorySubtotals[category] = 0;
      }
      categorySubtotals[category] += co2;
      total += co2;
    }
    return {
      caseId: citizenCase.id,
      items,
      categorySubtotals,
      totalCO2: total
    };
  }

  // js/backend/systems/grant-system.js
  var GRANT_ACTION_EFFECTS = {
    VALID: {
      trust: 8
    },
    INVALID: {
      trust: -4,
      netZero: 0
    }
  };
  function getHouseholdConsumption(citizenCase) {
    let naturalGasM3 = 0;
    let landfillWasteKg = 0;
    let gasolineDistanceKm = 0;
    let summerCoolingKwh = 0;
    if (Array.isArray(citizenCase.receipts)) {
      for (const receipt of citizenCase.receipts) {
        const isCoolingReceipt = typeof receipt.type === "string" && receipt.type.trim().toUpperCase() === "COOLING";
        if (Array.isArray(receipt.items)) {
          for (const item of receipt.items) {
            if (item.rateKey === "GAS_HEAT") {
              naturalGasM3 += item.qty;
            } else if (item.rateKey === "LANDFILL") {
              landfillWasteKg += item.qty;
            } else if (item.rateKey === "GASOLINE") {
              gasolineDistanceKm += item.qty;
            }
            if (isCoolingReceipt && item.rateKey === "GRID_ELEC") {
              summerCoolingKwh += item.qty;
            }
          }
        }
      }
    }
    return {
      naturalGasM3,
      landfillWasteKg,
      gasolineDistanceKm,
      summerCoolingKwh,
      roofType: citizenCase.roofType || "OTHER"
    };
  }
  function checkGrantEligibility(citizenCase, grantId) {
    const grant = GRANTS[grantId];
    const metrics = getHouseholdConsumption(citizenCase);
    if (!grant) {
      return {
        eligible: false,
        reason: `Unknown grant ID: ${grantId}`,
        metrics
      };
    }
    switch (grantId) {
      case "HEAT_PUMP": {
        const threshold = grant.eligibility.naturalGasAboveM3 ?? 100;
        const eligible = metrics.naturalGasM3 > threshold;
        return {
          eligible,
          reason: eligible ? `Natural gas consumption of ${metrics.naturalGasM3} m\xB3 exceeds the ${threshold} m\xB3 threshold.` : `Natural gas consumption of ${metrics.naturalGasM3} m\xB3 does not exceed the ${threshold} m\xB3 threshold.`,
          metrics
        };
      }
      case "COMPOST_KIT": {
        const threshold = grant.eligibility.landfillWasteAboveKg ?? 30;
        const eligible = metrics.landfillWasteKg > threshold;
        return {
          eligible,
          reason: eligible ? `Landfill waste of ${metrics.landfillWasteKg} kg exceeds the ${threshold} kg threshold.` : `Landfill waste of ${metrics.landfillWasteKg} kg does not exceed the ${threshold} kg threshold.`,
          metrics
        };
      }
      case "TRANSIT_PASS": {
        const threshold = grant.eligibility.gasolineDistanceAboveKm ?? 300;
        const eligible = metrics.gasolineDistanceKm > threshold;
        return {
          eligible,
          reason: eligible ? `Gasoline travel of ${metrics.gasolineDistanceKm} km exceeds the ${threshold} km threshold.` : `Gasoline travel of ${metrics.gasolineDistanceKm} km does not exceed the ${threshold} km threshold.`,
          metrics
        };
      }
      case "COOL_ROOF": {
        const acThreshold = grant.eligibility.summerAcAboveKwh ?? 150;
        const isAsphalt = String(metrics.roofType).toUpperCase() === "ASPHALT";
        const exceedsAcThreshold = metrics.summerCoolingKwh > acThreshold;
        const eligible = exceedsAcThreshold && isAsphalt;
        let reason;
        if (eligible) {
          reason = `Summer AC electricity of ${metrics.summerCoolingKwh} kWh exceeds ${acThreshold} kWh with an asphalt roof.`;
        } else if (!exceedsAcThreshold && !isAsphalt) {
          reason = `Summer AC electricity of ${metrics.summerCoolingKwh} kWh does not exceed ${acThreshold} kWh and roof is not asphalt (${metrics.roofType}).`;
        } else if (!exceedsAcThreshold) {
          reason = `Summer AC electricity of ${metrics.summerCoolingKwh} kWh does not exceed the ${acThreshold} kWh threshold.`;
        } else {
          reason = `Household does not have an asphalt roof (${metrics.roofType}).`;
        }
        return {
          eligible,
          reason,
          metrics
        };
      }
      default:
        return {
          eligible: false,
          reason: `Unsupported grant ID: ${grantId}`,
          metrics
        };
    }
  }
  function validateGrant(citizenCase, grantId) {
    if (!grantId || typeof grantId !== "string") {
      return {
        isValid: false,
        reason: "No mitigation grant was selected for the GRANT action.",
        grantId: null,
        grant: null,
        cost: 0,
        netZeroBoost: 0
      };
    }
    const grant = GRANTS[
      /** @type {GrantId} */
      grantId
    ];
    if (!grant) {
      return {
        isValid: false,
        reason: `Unknown mitigation grant selected: "${grantId}".`,
        grantId: null,
        grant: null,
        cost: 0,
        netZeroBoost: 0
      };
    }
    const eligibility = checkGrantEligibility(citizenCase, grant.id);
    if (eligibility.eligible) {
      return {
        isValid: true,
        reason: `Eligible for ${grant.name}: ${eligibility.reason}`,
        grantId: grant.id,
        grant,
        cost: grant.cost,
        netZeroBoost: grant.netZeroBoost
      };
    }
    return {
      isValid: false,
      reason: `Ineligible for ${grant.name}: ${eligibility.reason}`,
      grantId: grant.id,
      grant,
      cost: grant.cost,
      netZeroBoost: 0
    };
  }
  function calculateGrantMetricChanges(validation) {
    const budgetChange = validation.cost === 0 ? 0 : -validation.cost;
    if (validation.isValid) {
      return {
        budget: budgetChange,
        trust: GRANT_ACTION_EFFECTS.VALID.trust,
        netZero: validation.netZeroBoost
      };
    }
    return {
      budget: budgetChange,
      trust: GRANT_ACTION_EFFECTS.INVALID.trust,
      netZero: GRANT_ACTION_EFFECTS.INVALID.netZero
    };
  }
  function getGrantsForDay(day) {
    const grantIds = getAvailableGrantsForDay(day);
    return grantIds.map((id) => GRANTS[id]).filter(Boolean);
  }

  // js/backend/systems/audit.js
  var APPROVAL_ACTION_EFFECTS = {
    VALID: {
      budgetMultiplier: 0.5,
      trust: 3,
      netZero: 1
    },
    INVALID: {
      budget: -200,
      trust: -5,
      netZero: -2
    }
  };
  var FINE_ACTION_EFFECTS = {
    VALID: {
      ratePerKg: 10,
      trust: -2,
      netZero: 3
    },
    INVALID: {
      budget: -300,
      trust: -12,
      netZero: 0
    }
  };
  function validateApproval(citizenCase) {
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
      reason = "Approval valid: declared emissions match actual records within the \xB12 kg tolerance and no unverified offsets were claimed.";
    } else if (!withinTolerance && hasUnverifiedOffset) {
      reason = `Approval invalid: discrepancy of ${discrepancyInfo.absoluteDiscrepancy.toFixed(
        2
      )} kg exceeds the \xB12 kg tolerance and case contains unverified offset claims.`;
    } else if (!withinTolerance) {
      reason = `Approval invalid: declaration discrepancy of ${discrepancyInfo.absoluteDiscrepancy.toFixed(
        2
      )} kg exceeds the \xB12 kg tolerance.`;
    } else {
      reason = "Approval invalid: case contains an unverified or unapproved offset claim.";
    }
    return {
      isValid,
      reason,
      actualCO2,
      declaredCO2,
      discrepancy: comparison.discrepancy,
      withinTolerance,
      hasUnverifiedOffset
    };
  }
  function validateFine(citizenCase) {
    const actualCO2 = calculateActualEmissions(citizenCase);
    const declaredCO2 = citizenCase.declaredCO2;
    const comparison = compareDeclaration(citizenCase);
    const offsetInfo = verifyOffsets(citizenCase);
    const discrepancy = comparison.discrepancy;
    const underdeclared = discrepancy > 2;
    const hasUnverifiedOffset = offsetInfo.hasUnverifiedOffset;
    const isValid = underdeclared || hasUnverifiedOffset;
    const rawFine = Math.max(0, discrepancy) * FINE_ACTION_EFFECTS.VALID.ratePerKg;
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
      reason = "Fine invalid: citizen did not underdeclare emissions by more than 2 kg and has no unverified offset claims.";
    }
    return {
      isValid,
      reason,
      fineAmount,
      underdeclared,
      hasUnverifiedOffset,
      actualCO2,
      declaredCO2,
      discrepancy
    };
  }
  function resolveAction(actionOrRequest, citizenCase, maybeGrantId) {
    let action;
    let grantId = null;
    if (typeof actionOrRequest === "object" && actionOrRequest !== null) {
      action = actionOrRequest.action;
      grantId = actionOrRequest.grantId || null;
    } else {
      action = actionOrRequest;
      grantId = maybeGrantId || null;
    }
    const caseId = citizenCase.id;
    if (action === "APPROVE") {
      const validation = validateApproval(citizenCase);
      if (validation.isValid) {
        const budgetChange = Math.round(
          validation.actualCO2 * APPROVAL_ACTION_EFFECTS.VALID.budgetMultiplier * 100
        ) / 100;
        const metricChanges = {
          netZero: APPROVAL_ACTION_EFFECTS.VALID.netZero,
          budget: budgetChange,
          trust: APPROVAL_ACTION_EFFECTS.VALID.trust
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
          details: validation
        };
      } else {
        const metricChanges = {
          netZero: APPROVAL_ACTION_EFFECTS.INVALID.netZero,
          budget: APPROVAL_ACTION_EFFECTS.INVALID.budget,
          trust: APPROVAL_ACTION_EFFECTS.INVALID.trust
        };
        const explanation = `Oversight penalty: ${validation.reason} Budget -$200, Public Trust -5%, Net-Zero -2%.`;
        return {
          caseId,
          action,
          grantId: null,
          isValid: false,
          explanation,
          metricChanges,
          details: validation
        };
      }
    }
    if (action === "FINE") {
      const validation = validateFine(citizenCase);
      if (validation.isValid) {
        const metricChanges = {
          netZero: FINE_ACTION_EFFECTS.VALID.netZero,
          budget: validation.fineAmount,
          trust: FINE_ACTION_EFFECTS.VALID.trust
        };
        const explanation = `Fine enforced: ${validation.reason} Budget +$${validation.fineAmount}, Public Trust ${metricChanges.trust}%, Net-Zero +${metricChanges.netZero}%.`;
        return {
          caseId,
          action,
          grantId: null,
          isValid: true,
          explanation,
          metricChanges,
          details: validation
        };
      } else {
        const metricChanges = {
          netZero: FINE_ACTION_EFFECTS.INVALID.netZero,
          budget: FINE_ACTION_EFFECTS.INVALID.budget,
          trust: FINE_ACTION_EFFECTS.INVALID.trust
        };
        const explanation = `Unfair fine penalty: ${validation.reason} Budget -$300, Public Trust -12%, Net-Zero 0%.`;
        return {
          caseId,
          action,
          grantId: null,
          isValid: false,
          explanation,
          metricChanges,
          details: validation
        };
      }
    }
    if (action === "GRANT") {
      const validation = validateGrant(citizenCase, grantId || void 0);
      const metricChanges = calculateGrantMetricChanges(validation);
      if (validation.isValid) {
        const grantName = validation.grant ? validation.grant.name : "Mitigation Grant";
        const explanation = `Grant awarded (${grantName}): ${validation.reason} Budget -$${validation.cost}, Public Trust +${metricChanges.trust}%, Net-Zero +${metricChanges.netZero}%.`;
        return {
          caseId,
          action,
          grantId: validation.grantId,
          isValid: true,
          explanation,
          metricChanges,
          details: validation
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
          details: validation
        };
      }
    }
    throw new Error(`Unsupported audit action type: "${action}". Must be APPROVE, FINE, or GRANT.`);
  }

  // js/backend/systems/metrics.js
  var INITIAL_METRICS = Object.freeze({
    netZero: 30,
    budget: 5e3,
    trust: 70
  });
  var METRIC_BOUNDS = Object.freeze({
    netZero: { min: 0, max: 100 },
    trust: { min: 0, max: 100 }
  });
  function createInitialMetrics() {
    return { ...INITIAL_METRICS };
  }
  function isBankrupt(budget) {
    return typeof budget === "number" && budget <= 0;
  }
  function isTrustDepleted(trust) {
    return typeof trust === "number" && trust <= 0;
  }
  function clampPercentage(value, min = 0, max = 100) {
    if (typeof value !== "number" || Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
  }
  function checkFailureConditions(metrics) {
    if (!metrics) {
      return { isFailed: false, reason: null };
    }
    if (isBankrupt(metrics.budget)) {
      return { isFailed: true, reason: "BANKRUPTCY" };
    }
    if (isTrustDepleted(metrics.trust)) {
      return { isFailed: true, reason: "PUBLIC_TRUST" };
    }
    return { isFailed: false, reason: null };
  }
  function checkVictoryCondition(metrics) {
    const failure = checkFailureConditions(metrics);
    if (failure.isFailed) {
      return { isVictory: false, reason: failure.reason };
    }
    if (metrics.netZero < 100) {
      return { isVictory: false, reason: "NET_ZERO_TARGET" };
    }
    return { isVictory: true, reason: null };
  }
  function applyMetricChanges(currentMetrics, changes) {
    const base = currentMetrics || INITIAL_METRICS;
    const delta = changes || { netZero: 0, budget: 0, trust: 0 };
    const rawNetZero = (base.netZero ?? 0) + (delta.netZero ?? 0);
    const rawBudget = (base.budget ?? 0) + (delta.budget ?? 0);
    const rawTrust = (base.trust ?? 0) + (delta.trust ?? 0);
    const failure = checkFailureConditions({
      netZero: rawNetZero,
      budget: rawBudget,
      trust: rawTrust
    });
    const updatedMetrics = {
      netZero: clampPercentage(rawNetZero, METRIC_BOUNDS.netZero.min, METRIC_BOUNDS.netZero.max),
      budget: Math.round(rawBudget * 100) / 100,
      // keep cents precision cleanly
      trust: clampPercentage(rawTrust, METRIC_BOUNDS.trust.min, METRIC_BOUNDS.trust.max)
    };
    return {
      metrics: updatedMetrics,
      changes: {
        netZero: delta.netZero ?? 0,
        budget: delta.budget ?? 0,
        trust: delta.trust ?? 0
      },
      failure
    };
  }

  // js/backend/systems/game-state.js
  function createInitialShiftStats() {
    return {
      processedCount: 0,
      correctActions: 0,
      finesIssued: 0,
      grantsIssued: 0,
      co2ReducedKg: 0
    };
  }
  function createInitialCampaignStats() {
    return {
      totalProcessed: 0,
      totalCorrect: 0,
      totalFines: 0,
      totalGrants: 0,
      daysCompleted: 0
    };
  }
  function getCasesForDay(day) {
    return CITIZEN_CASES.filter((c) => c.day === day);
  }
  function getTimeLimitForDay(day) {
    return CAMPAIGN_DAYS[day]?.timeLimitSeconds ?? 120;
  }
  function createInitialGameState(day = 1, initialMetrics = null) {
    const dailyCases = getCasesForDay(day);
    const timeRemaining = getTimeLimitForDay(day);
    const metrics = initialMetrics ? { ...initialMetrics } : createInitialMetrics();
    const shiftStats = createInitialShiftStats();
    const campaignStats = createInitialCampaignStats();
    return {
      currentDay: day,
      timeRemaining,
      currentCaseIndex: 0,
      dailyCases,
      metrics,
      shiftStats,
      campaignStats,
      shiftEnded: false,
      campaignEnded: false,
      campaignOutcome: null
    };
  }
  function getCurrentCase(state) {
    if (!state || !Array.isArray(state.dailyCases)) return null;
    if (state.currentCaseIndex < 0 || state.currentCaseIndex >= state.dailyCases.length) {
      return null;
    }
    return state.dailyCases[state.currentCaseIndex];
  }
  function recordActionInShiftStats(stats, actionResult) {
    const nextStats = { ...stats };
    nextStats.processedCount += 1;
    if (actionResult.isValid) {
      nextStats.correctActions += 1;
      if (actionResult.action === "FINE") {
        nextStats.finesIssued += 1;
      } else if (actionResult.action === "GRANT") {
        nextStats.grantsIssued += 1;
      }
    }
    return nextStats;
  }
  function recordActionInCampaignStats(stats, actionResult) {
    const nextStats = { ...stats };
    nextStats.totalProcessed += 1;
    if (actionResult.isValid) {
      nextStats.totalCorrect += 1;
      if (actionResult.action === "FINE") {
        nextStats.totalFines += 1;
      } else if (actionResult.action === "GRANT") {
        nextStats.totalGrants += 1;
      }
    }
    return nextStats;
  }
  function tickTimer(state, seconds = 1) {
    if (!state || state.shiftEnded || state.campaignEnded) {
      return state;
    }
    const nextTime = Math.max(0, state.timeRemaining - seconds);
    const timerExpired = nextTime === 0;
    if (timerExpired && state.currentDay === 3 && !state.campaignEnded) {
      const victoryEval = checkVictoryCondition(state.metrics);
      return {
        ...state,
        timeRemaining: 0,
        shiftEnded: true,
        campaignEnded: true,
        campaignOutcome: {
          status: victoryEval.isVictory ? "VICTORY" : "FAILED",
          failureReason: victoryEval.reason,
          metrics: { ...state.metrics },
          campaignStats: { ...state.campaignStats || createInitialCampaignStats() }
        }
      };
    }
    return {
      ...state,
      timeRemaining: nextTime,
      shiftEnded: timerExpired ? true : state.shiftEnded
    };
  }
  function applyAuditAction(state, request) {
    if (!state) {
      throw new Error("GameState is required to apply audit action.");
    }
    if (state.campaignEnded) {
      throw new Error("Cannot apply action: Campaign has already ended.");
    }
    if (state.shiftEnded) {
      throw new Error("Cannot apply action: Current shift has ended.");
    }
    const citizenCase = getCurrentCase(state);
    if (!citizenCase) {
      throw new Error("No citizen case available to audit.");
    }
    if (citizenCase.id !== request.caseId) {
      throw new Error(
        `Mismatched case ID. Expected "${citizenCase.id}" but received "${request.caseId}".`
      );
    }
    const resolution = resolveAction(request.action, citizenCase, request.grantId);
    const { metrics: updatedMetrics, failure } = applyMetricChanges(
      state.metrics,
      resolution.metricChanges
    );
    const updatedShiftStats = recordActionInShiftStats(state.shiftStats, resolution);
    const updatedCampaignStats = recordActionInCampaignStats(
      state.campaignStats || createInitialCampaignStats(),
      resolution
    );
    const nextCaseIndex = state.currentCaseIndex + 1;
    const noCasesRemaining = nextCaseIndex >= state.dailyCases.length;
    let shiftEnded = noCasesRemaining;
    let campaignEnded = state.campaignEnded;
    let campaignOutcome = state.campaignOutcome;
    if (failure.isFailed) {
      campaignEnded = true;
      shiftEnded = true;
      campaignOutcome = {
        status: "FAILED",
        failureReason: failure.reason,
        metrics: updatedMetrics,
        campaignStats: updatedCampaignStats
      };
    } else if (noCasesRemaining && state.currentDay === 3) {
      const victoryEval = checkVictoryCondition(updatedMetrics);
      campaignEnded = true;
      shiftEnded = true;
      campaignOutcome = {
        status: victoryEval.isVictory ? "VICTORY" : "FAILED",
        failureReason: victoryEval.reason,
        metrics: updatedMetrics,
        campaignStats: updatedCampaignStats
      };
    }
    const nextState = {
      ...state,
      metrics: updatedMetrics,
      shiftStats: updatedShiftStats,
      campaignStats: updatedCampaignStats,
      currentCaseIndex: nextCaseIndex,
      shiftEnded,
      campaignEnded,
      campaignOutcome
    };
    const actionResult = {
      caseId: resolution.caseId,
      action: resolution.action,
      grantId: resolution.grantId,
      isValid: resolution.isValid,
      explanation: resolution.explanation,
      metrics: updatedMetrics,
      metricChanges: resolution.metricChanges,
      shiftStats: updatedShiftStats,
      hasNextCase: !noCasesRemaining && !campaignEnded,
      shiftEnded,
      campaignOutcome
    };
    return {
      state: nextState,
      result: actionResult
    };
  }
  function startNextDay(state) {
    if (!state) {
      throw new Error("GameState is required to start next day.");
    }
    if (state.campaignEnded || state.metrics.budget <= 0 || state.metrics.trust <= 0) {
      throw new Error("Cannot start next day: Campaign has ended.");
    }
    const nextDay = state.currentDay + 1;
    if (nextDay > 3) {
      throw new Error("Campaign only has 3 days.");
    }
    const dailyCases = getCasesForDay(nextDay);
    const timeRemaining = getTimeLimitForDay(nextDay);
    const shiftStats = createInitialShiftStats();
    const campaignStats = {
      ...state.campaignStats || createInitialCampaignStats(),
      daysCompleted: state.currentDay
    };
    return {
      ...state,
      currentDay: nextDay,
      timeRemaining,
      currentCaseIndex: 0,
      dailyCases,
      shiftStats,
      campaignStats,
      shiftEnded: false,
      campaignEnded: false,
      campaignOutcome: null
    };
  }
  function sanitizeGameStateView(state) {
    return {
      currentDay: state.currentDay,
      timeRemaining: state.timeRemaining,
      currentCaseIndex: state.currentCaseIndex,
      metrics: { ...state.metrics },
      shiftStats: { ...state.shiftStats },
      campaignStats: { ...state.campaignStats || createInitialCampaignStats() },
      shiftEnded: state.shiftEnded,
      campaignEnded: state.campaignEnded
    };
  }

  // js/backend/systems/campaign.js
  var CampaignManager = class {
    /**
     * @param {number} [startDay=1]
     */
    constructor(startDay = 1) {
      this.state = createInitialGameState(startDay);
    }
    /**
     * Resets campaign to day 1 with initial metrics.
     * Per GAME_RULES.md §10.3.
     *
     * @returns {GameStateView}
     */
    restart() {
      this.state = createInitialGameState(1);
      return this.getView();
    }
    /**
     * Returns current sanitized game state view for frontend.
     *
     * @returns {GameStateView}
     */
    getView() {
      return sanitizeGameStateView(this.state);
    }
    /**
     * Returns the current active citizen case view, or null if none remains.
     * Sanitizes case to prevent leakage of internal test fields (e.g. hasFraud).
     *
     * @returns {CitizenCaseView | null}
     */
    getCurrentCaseView() {
      const activeCase = getCurrentCase(this.state);
      if (!activeCase) return null;
      return {
        id: activeCase.id,
        day: activeCase.day,
        name: activeCase.name,
        district: activeCase.district,
        note: activeCase.note,
        declaredCO2: activeCase.declaredCO2,
        receipts: activeCase.receipts
      };
    }
    /**
     * Advances the timer by a number of seconds.
     * If the timer runs out on day 3 with no time remaining, evaluates campaign outcome if needed.
     *
     * @param {number} [seconds=1]
     * @returns {GameStateView}
     */
    tick(seconds = 1) {
      this.state = tickTimer(this.state, seconds);
      if (this.state.shiftEnded && !this.state.campaignEnded && this.state.currentDay === 3) {
        const victoryEval = checkVictoryCondition(this.state.metrics);
        this.state.campaignEnded = true;
        this.state.campaignOutcome = {
          status: victoryEval.isVictory ? "VICTORY" : "FAILED",
          failureReason: victoryEval.reason,
          metrics: { ...this.state.metrics }
        };
      }
      return this.getView();
    }
    /**
     * Validates and applies a player action against the current case.
     *
     * @param {AuditActionRequest} request
     * @returns {ActionResult}
     */
    submitAction(request) {
      const { state: nextState, result } = applyAuditAction(this.state, request);
      this.state = nextState;
      return result;
    }
    /**
     * Transitions to the next day if shift has ended and campaign is active.
     *
     * @returns {GameStateView}
     */
    advanceDay() {
      this.state = startNextDay(this.state);
      return this.getView();
    }
    /**
     * Returns a shift summary object for the completed day.
     *
     * @returns {ShiftSummary}
     */
    getShiftSummary() {
      return {
        day: this.state.currentDay,
        metrics: { ...this.state.metrics },
        shiftStats: { ...this.state.shiftStats }
      };
    }
    /**
     * Returns terminal outcome or null if campaign is ongoing.
     *
     * @returns {CampaignOutcome | null}
     */
    getCampaignOutcome() {
      return this.state.campaignOutcome ? { ...this.state.campaignOutcome } : null;
    }
    /**
     * Returns cumulative campaign statistics across all days.
     *
     * @returns {import('./game-state.js').CampaignStats}
     */
    getCampaignStats() {
      return {
        ...this.state.campaignStats || {
          totalProcessed: 0,
          totalCorrect: 0,
          totalFines: 0,
          totalGrants: 0,
          daysCompleted: 0
        }
      };
    }
  };
  var defaultCampaign = null;
  function getCampaign() {
    if (!defaultCampaign) {
      defaultCampaign = new CampaignManager(1);
    }
    return defaultCampaign;
  }
  function resetCampaign() {
    defaultCampaign = new CampaignManager(1);
    return defaultCampaign;
  }

  // js/backend/index.js
  var backendApi = {
    startCampaign: () => resetCampaign().getView(),
    restartCampaign: () => resetCampaign().getView(),
    getState: () => getCampaign().getView(),
    getCurrentCase: () => getCampaign().getCurrentCaseView(),
    getRulebook: () => EMISSION_RULEBOOK,
    getGrants: (day) => day ? getGrantsForDay(day) : MITIGATION_GRANTS,
    getGrantsForDay: (day) => getGrantsForDay(day),
    getDayConfig: (day) => getDayConfig(day),
    getAllDayConfigs: () => CAMPAIGN_DAYS,
    getCampaignStats: () => getCampaign().getCampaignStats(),
    getReceiptBreakdown: (request) => {
      const targetCase = CITIZEN_CASES.find((c) => c.id === request.caseId);
      if (!targetCase) {
        throw new Error(`Case not found: "${request.caseId}".`);
      }
      return breakdownReceipts(targetCase, request.selection);
    },
    submitAction: (request) => getCampaign().submitAction(request),
    getShiftSummary: () => getCampaign().getShiftSummary(),
    getCampaignOutcome: () => getCampaign().getCampaignOutcome(),
    /**
     * Advances the campaign timer by one second.
     * Returns an updated GameStateView (P3-12).
     *
     * @param {number} [seconds=1]
     * @returns {import('./index.js').GameStateView}
     */
    tick: (seconds = 1) => getCampaign().tick(seconds),
    /**
     * Advances the campaign to the next day after a completed shift.
     * Returns an updated GameStateView for the new day.
     *
     * @returns {import('./index.js').GameStateView}
     */
    advanceDay: () => getCampaign().advanceDay()
  };

  // js/frontend/screens/main-menu.js
  var MainMenuScreen = class {
    /**
     * @param {HTMLElement|Document} [root=document] Root DOM node containing main menu elements.
     * @param {MainMenuOptions} [options]
     */
    constructor(root = document, options = {}) {
      this.root = root;
      this.options = options;
      this.elements = this._queryElements();
      this._attachEvents();
    }
    _queryElements() {
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      return {
        screen: q("#screen-main-menu"),
        btnStart: q("#btn-start-game"),
        title: q(".menu-title"),
        subtitle: q(".menu-subtitle"),
        briefing: q(".menu-briefing")
      };
    }
    _attachEvents() {
      if (this.elements.btnStart) {
        this.elements.btnStart.addEventListener("click", (event) => {
          if (typeof this.options.onStart === "function") {
            this.options.onStart(event);
          }
        });
      }
    }
    /**
     * Activates and reveals the main menu screen.
     */
    show() {
      if (this.elements.screen?.classList) {
        this.elements.screen.classList.add("active");
      }
    }
    /**
     * Hides the main menu screen.
     */
    hide() {
      if (this.elements.screen?.classList) {
        this.elements.screen.classList.remove("active");
      }
    }
    /**
     * Checks whether the main menu is currently the active screen.
     *
     * @returns {boolean}
     */
    isActive() {
      return Boolean(this.elements.screen?.classList?.contains("active"));
    }
    /**
     * Updates the displayed title.
     *
     * @param {string} title
     */
    setTitle(title) {
      if (this.elements.title) {
        this.elements.title.textContent = title;
      }
    }
    /**
     * Updates the displayed subtitle.
     *
     * @param {string} subtitle
     */
    setSubtitle(subtitle) {
      if (this.elements.subtitle) {
        this.elements.subtitle.textContent = subtitle;
      }
    }
  };
  function createMainMenuScreen(root = document, options = {}) {
    return new MainMenuScreen(root, options);
  }

  // js/frontend/audio.js
  var SoundEngine = class {
    constructor() {
      this.ctx = null;
      this.muted = false;
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          const saved = window.localStorage.getItem("mca_sound_muted");
          if (saved !== null) {
            this.muted = saved === "true";
          }
        } catch (_) {
        }
      }
    }
    /**
     * Initializes or resumes the AudioContext on first user interaction.
     * Gracefully handles browser autoplay restrictions.
     *
     * @returns {boolean} true if AudioContext is active
     */
    init() {
      if (typeof window === "undefined") return false;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      if (!this.ctx) {
        try {
          this.ctx = new AudioContextClass();
        } catch (e) {
          console.warn("[AudioEngine] Could not initialize AudioContext:", e.message);
          return false;
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {
        });
      }
      return true;
    }
    /**
     * Checks if sound is currently muted.
     *
     * @returns {boolean}
     */
    isMuted() {
      return this.muted;
    }
    /**
     * Sets mute state and persists to localStorage.
     *
     * @param {boolean} muted
     */
    setMuted(muted) {
      this.muted = Boolean(muted);
      if (typeof window !== "undefined" && window.localStorage) {
        try {
          window.localStorage.setItem("mca_sound_muted", String(this.muted));
        } catch (_) {
        }
      }
    }
    /**
     * Toggles mute state.
     *
     * @returns {boolean} New mute state
     */
    toggleMute() {
      this.setMuted(!this.muted);
      return this.muted;
    }
    /**
     * Mechanical rubber stamp impact thud.
     *
     * @param {'APPROVE'|'FINE'|'GRANT'} [type='APPROVE']
     */
    playStamp(type = "APPROVE") {
      if (this.muted || !this.init() || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const baseFreq = type === "FINE" ? 95 : type === "GRANT" ? 140 : 120;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.18);
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.18);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch (_) {
      }
    }
    /**
     * Bright rising duo-tone chime for correct audit decision.
     */
    playSuccess() {
      if (this.muted || !this.init() || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.09);
        osc.frequency.setValueAtTime(783.99, now + 0.18);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch (_) {
      }
    }
    /**
     * Harsh low saw buzz for incorrect decision / penalty.
     */
    playError() {
      if (this.muted || !this.init() || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(95, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.32);
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, now);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.32);
      } catch (_) {
      }
    }
    /**
     * Subtle paper rustle / slide sound when loading a new dossier or flipping records.
     */
    playPaper() {
      if (this.muted || !this.init() || !this.ctx) return;
      try {
        const bufferSize = this.ctx.sampleRate * 0.12;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        filter.Q.setValueAtTime(2.5, this.ctx.currentTime);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(1e-3, this.ctx.currentTime + 0.12);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (_) {
      }
    }
    /**
     * Short mechanical click for calculator, tabs, or receipt row tap.
     */
    playClick() {
      if (this.muted || !this.init() || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } catch (_) {
      }
    }
    /**
     * Shift start or conclusion chime.
     */
    playTransition() {
      if (this.muted || !this.init() || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch (_) {
      }
    }
  };
  var soundEngine = new SoundEngine();

  // js/frontend/components/top-bar.js
  function formatBudget(amount) {
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      return "$0";
    }
    const isNegative = amount < 0;
    const abs = Math.abs(Math.round(amount));
    const formatted = abs.toLocaleString("en-US");
    return isNegative ? `-$${formatted}` : `$${formatted}`;
  }
  function formatTimer(totalSeconds) {
    if (typeof totalSeconds !== "number" || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
      return "00:00";
    }
    const total = Math.floor(totalSeconds);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(minutes)}:${pad(seconds)}`;
  }
  var TopBarComponent = class {
    /**
     * @param {HTMLElement|Document} root Root DOM element containing top-bar elements.
     */
    constructor(root = document) {
      this.root = root;
      this.elements = this._queryElements();
      this._initAudioToggle();
      this._initTerminalToggle();
    }
    _queryElements() {
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      return {
        dayBadge: q("#top-bar-day"),
        caseBadge: q("#top-bar-case"),
        netzeroVal: q("#meter-netzero-val"),
        netzeroBar: q("#meter-netzero-bar"),
        budgetVal: q("#meter-budget-val"),
        budgetBar: q("#meter-budget-bar"),
        trustVal: q("#meter-trust-val"),
        trustBar: q("#meter-trust-bar"),
        timerDisplay: q("#timer-display"),
        timerContainer: q("#timer-container"),
        btnAudioToggle: q("#btn-audio-toggle"),
        btnTerminalToggle: q("#btn-terminal-toggle")
      };
    }
    _initAudioToggle() {
      if (!this.elements.btnAudioToggle) return;
      this._updateAudioIcon();
      this.elements.btnAudioToggle.addEventListener("click", () => {
        soundEngine.toggleMute();
        this._updateAudioIcon();
      });
    }
    _initTerminalToggle() {
      this._terminalMode = false;
      try {
        if (typeof localStorage !== "undefined") {
          this._terminalMode = localStorage.getItem("gameup_terminal_mode") === "true";
        }
      } catch (_) {
        this._terminalMode = false;
      }
      if (this._terminalMode) {
        this._applyTerminalMode(true);
      }
      if (this.elements.btnTerminalToggle) {
        this._updateTerminalButton();
        this.elements.btnTerminalToggle.addEventListener("click", () => {
          this.toggleTerminalMode();
        });
      }
    }
    /**
     * Toggles the CRT/terminal display mode on and off.
     *
     * @returns {boolean} New terminal mode state.
     */
    toggleTerminalMode() {
      this.setTerminalMode(!this._terminalMode);
      return this._terminalMode;
    }
    /**
     * Sets CRT/terminal mode state.
     *
     * @param {boolean} enabled
     */
    setTerminalMode(enabled) {
      this._terminalMode = Boolean(enabled);
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("gameup_terminal_mode", this._terminalMode ? "true" : "false");
        }
      } catch (_) {
      }
      this._applyTerminalMode(this._terminalMode);
      this._updateTerminalButton();
    }
    /**
     * Returns whether terminal mode is active.
     *
     * @returns {boolean}
     */
    isTerminalMode() {
      return this._terminalMode;
    }
    _applyTerminalMode(enabled) {
      const target = typeof document !== "undefined" && document.body ? document.body : this.root?.body || this.root;
      if (target?.classList) {
        if (enabled) {
          target.classList.add("terminal-mode");
        } else {
          target.classList.remove("terminal-mode");
        }
      }
    }
    _updateTerminalButton() {
      if (!this.elements.btnTerminalToggle) return;
      const btn = this.elements.btnTerminalToggle;
      if (this._terminalMode) {
        btn.classList.add("terminal-active");
        btn.setAttribute("aria-label", "Disable CRT Terminal Mode");
        btn.setAttribute("title", "CRT Mode: Active (Click to Disable)");
      } else {
        btn.classList.remove("terminal-active");
        btn.setAttribute("aria-label", "Enable CRT Terminal Mode");
        btn.setAttribute("title", "CRT Mode: Off (Click to Enable)");
      }
    }
    _updateAudioIcon() {
      if (!this.elements.btnAudioToggle) return;
      const isMuted = soundEngine.isMuted();
      const iconSpan = this.elements.btnAudioToggle.querySelector?.(".audio-icon") || this.elements.btnAudioToggle;
      iconSpan.textContent = isMuted ? "\u{1F507}" : "\u{1F50A}";
      this.elements.btnAudioToggle.setAttribute("aria-label", isMuted ? "Unmute Sound Effects" : "Mute Sound Effects");
      this.elements.btnAudioToggle.setAttribute("title", isMuted ? "Sound: Muted (Click to Unmute)" : "Sound: Active (Click to Mute)");
    }
    /**
     * Updates the top bar display with new state data.
     *
     * @param {TopBarData} data
     */
    update(data = {}) {
      if (!data) return;
      if (this.elements.dayBadge && (data.day !== void 0 || data.maxDays !== void 0)) {
        const day = data.day ?? 1;
        const maxDays = data.maxDays ?? 3;
        this.elements.dayBadge.textContent = `DAY ${day} OF ${maxDays}`;
      }
      if (this.elements.caseBadge && (data.currentCaseIndex !== void 0 || data.totalCases !== void 0)) {
        const caseNum = data.currentCaseIndex !== void 0 ? data.currentCaseIndex + 1 : 1;
        const total = data.totalCases ?? 1;
        this.elements.caseBadge.textContent = `CASE ${caseNum}/${total}`;
      }
      if (data.metrics) {
        this.setMetrics(data.metrics);
      }
      if (data.timeRemaining !== void 0) {
        this.setTimer(data.timeRemaining);
      }
    }
    /**
     * Sets city metrics values and progress bar widths.
     *
     * @param {TopBarMetrics} metrics
     */
    setMetrics(metrics = {}) {
      if (metrics.netZero !== void 0) {
        const netZeroClamped = Math.max(0, Math.min(100, Math.round(metrics.netZero)));
        if (this.elements.netzeroVal) {
          this.elements.netzeroVal.textContent = `${netZeroClamped}%`;
        }
        if (this.elements.netzeroBar) {
          this.elements.netzeroBar.style.width = `${netZeroClamped}%`;
          const track = this.elements.netzeroBar.closest?.(".meter-track");
          if (track) track.setAttribute("aria-valuenow", String(netZeroClamped));
        }
      }
      if (metrics.budget !== void 0) {
        if (this.elements.budgetVal) {
          this.elements.budgetVal.textContent = formatBudget(metrics.budget);
        }
        if (this.elements.budgetBar) {
          const normalized = Math.max(0, Math.min(100, Math.round(metrics.budget / 5e3 * 100)));
          this.elements.budgetBar.style.width = `${normalized}%`;
          const track = this.elements.budgetBar.closest?.(".meter-track");
          if (track) track.setAttribute("aria-valuenow", String(normalized));
        }
      }
      if (metrics.trust !== void 0) {
        const trustClamped = Math.max(0, Math.min(100, Math.round(metrics.trust)));
        if (this.elements.trustVal) {
          this.elements.trustVal.textContent = `${trustClamped}%`;
        }
        if (this.elements.trustBar) {
          this.elements.trustBar.style.width = `${trustClamped}%`;
          const track = this.elements.trustBar.closest?.(".meter-track");
          if (track) track.setAttribute("aria-valuenow", String(trustClamped));
        }
      }
    }
    /**
     * Updates timer display and applies visual warning if time is low (<= 30s).
     *
     * @param {number} seconds
     */
    setTimer(seconds) {
      if (this.elements.timerDisplay) {
        this.elements.timerDisplay.textContent = formatTimer(seconds);
      }
      if (this.elements.timerContainer) {
        if (typeof seconds === "number" && seconds <= 30 && seconds > 0) {
          this.elements.timerContainer.classList.add("timer-warning");
        } else {
          this.elements.timerContainer.classList.remove("timer-warning");
        }
      }
    }
  };
  function createTopBar(root = document) {
    return new TopBarComponent(root);
  }

  // js/frontend/components/rulebook-panel.js
  var DEFAULT_POLICY_DIRECTIVES = [
    {
      code: "DIR-3101",
      title: "Unverified Carbon Offsets",
      text: "Offsets lacking official COP31 municipal registry seals are illegal deductions and must be rejected with fine penalties."
    },
    {
      code: "DIR-3102",
      title: "Permitted Tolerance Range",
      text: "A variance within \xB12.0 kg CO\u2082 between calculated and declared totals is permissible as acceptable reporting variance."
    },
    {
      code: "DIR-3103",
      title: "Municipal Mitigation Grants",
      text: "Citizens with qualifying high-emission defects (natural gas >100 m\xB3, waste >30 kg, mobility >300 km, or AC >150 kWh on asphalt roof) may be awarded grants."
    }
  ];
  function renderRateItem(rate) {
    const rateFormatted = typeof rate.rate === "number" ? rate.rate.toFixed(2) : String(rate.rate);
    const sign = rate.rate < 0 ? "" : "";
    const unitStr = rate.unit ? ` ${rate.unit}` : " kg CO\u2082/unit";
    const key = String(rate.key || "").toUpperCase();
    const iconMap = {
      GRID_ELEC: "assets/Electric_Meter.png",
      GAS_HEAT: "assets/NaturalGas_Heater.png",
      BEEF: "assets/LocalFruits.png",
      LOCAL_FOOD: "assets/LocalFruits.png",
      FLIGHT: "assets/plane.png",
      GASOLINE_KM: "assets/petrol.png",
      WASTE_KG: "assets/garbage.png",
      AC_COOLING: "assets/RooftopSolarEnergy.png",
      SOLAR_REDUCTION: "assets/RooftopSolarEnergy.png",
      HEAT_PUMP_GRANT: "assets/NaturalGas_Heater.png"
    };
    const iconSrc = iconMap[key] || "";
    const iconImg = iconSrc ? `<img src="${iconSrc}" alt="" class="rate-icon" aria-hidden="true" />` : "";
    return `
    <div class="rate-item card card-compact" data-rate-key="${escapeHtml(rate.key || "")}">
      <div class="rate-header">
        <div class="rate-title-wrap">
          ${iconImg}
          <span class="rate-name">${escapeHtml(rate.activity || rate.name || "")}</span>
        </div>
        <span class="rate-value font-mono">${sign}${rateFormatted}${escapeHtml(unitStr)}</span>
      </div>
      <span class="rate-category font-mono">${escapeHtml(rate.category || "General")}</span>
    </div>
  `.trim();
  }
  function renderPolicyItem(policy) {
    return `
    <div class="policy-card card card-compact" data-policy-code="${escapeHtml(policy.code)}">
      <span class="policy-code font-mono">${escapeHtml(policy.code)}</span>
      <h4 class="policy-heading">${escapeHtml(policy.title)}</h4>
      <p class="policy-text">${escapeHtml(policy.text)}</p>
    </div>
  `.trim();
  }
  function escapeHtml(str) {
    if (typeof str !== "string") return String(str ?? "");
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  var RulebookPanelComponent = class {
    /**
     * @param {HTMLElement|Document} root Root DOM element or panel container.
     */
    constructor(root = document) {
      this.root = root;
      this.ratesContainer = this.root && typeof this.root.querySelector === "function" ? this.root.querySelector("#rulebook-rates-list") : null;
      this.contentContainer = this.root && typeof this.root.querySelector === "function" ? this.root.querySelector("#rulebook-content") : null;
    }
    /**
     * Populates the rates list from a dictionary or array of emission rates.
     *
     * @param {Record<string, RulebookRateItem> | RulebookRateItem[]} rates
     */
    renderRates(rates = []) {
      if (!this.ratesContainer) return;
      const rateArray = Array.isArray(rates) ? rates : Object.values(rates || {});
      this.ratesContainer.innerHTML = rateArray.map(renderRateItem).join("\n");
    }
    /**
     * Populates policy directives into the rulebook panel.
     *
     * @param {PolicyDirectiveItem[]} [policies]
     */
    renderPolicies(policies = DEFAULT_POLICY_DIRECTIVES) {
      if (!this.contentContainer) return;
      let policySection = this.contentContainer.querySelector(".rulebook-section--policies");
      if (!policySection) {
        const sections = this.contentContainer.querySelectorAll(".rulebook-section");
        if (sections.length > 1) {
          policySection = sections[1];
        }
      }
      if (policySection) {
        const heading = '<h3 class="section-title">Policy Directives</h3>';
        const itemsHtml = policies.map(renderPolicyItem).join("\n");
        policySection.innerHTML = `${heading}
${itemsHtml}`;
      }
    }
    /**
     * Full update of the rulebook panel.
     *
     * @param {Object} data
     * @param {Record<string, RulebookRateItem> | RulebookRateItem[]} [data.rates]
     * @param {PolicyDirectiveItem[]} [data.policies]
     */
    update(data = {}) {
      if (data.rates) {
        this.renderRates(data.rates);
      }
      if (data.policies) {
        this.renderPolicies(data.policies);
      }
    }
  };
  function createRulebookPanel(root = document) {
    return new RulebookPanelComponent(root);
  }

  // js/frontend/components/dossier-panel.js
  function escapeHtml2(str) {
    if (typeof str !== "string") return String(str ?? "");
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function formatCO2(val) {
    if (typeof val !== "number" || !Number.isFinite(val)) {
      return "0.0 kg CO\u2082";
    }
    return `${val.toFixed(1)} kg CO\u2082`;
  }
  function renderReceiptItem(item, receiptIndex = 0, itemIndex = 0) {
    const qtyStr = typeof item.qty === "number" ? `${item.qty} ${item.unit || ""}`.trim() : String(item.qty);
    const rateKeyAttr = item.rateKey ? ` data-rate-key="${escapeHtml2(item.rateKey)}"` : "";
    return `
    <div class="receipt-item-row" data-receipt-index="${receiptIndex}" data-item-index="${itemIndex}"${rateKeyAttr} tabindex="0" role="button" aria-label="Calculate ${escapeHtml2(item.label)}">
      <span class="item-label">${escapeHtml2(item.label)}</span>
      <span class="item-qty font-mono">${escapeHtml2(qtyStr)}</span>
    </div>
  `.trim();
  }
  function renderReceiptCard(receipt, receiptIndex = 0) {
    const itemsHtml = (receipt.items || []).map((item, idx) => renderReceiptItem(item, receiptIndex, idx)).join("\n");
    const type = String(receipt.type || "").toUpperCase();
    const iconMap = {
      ENERGY: "assets/Electric_Meter.png",
      HEATING: "assets/NaturalGas_Heater.png",
      GAS: "assets/NaturalGas_Heater.png",
      GROCERY: "assets/LocalFruits.png",
      FOOD: "assets/LocalFruits.png",
      TRAVEL: "assets/plane.png",
      FLIGHT: "assets/plane.png",
      COMMUTE: "assets/petrol.png",
      WASTE: "assets/garbage.png"
    };
    const iconSrc = iconMap[type] || "";
    const iconImg = iconSrc ? `<img src="${iconSrc}" alt="" class="receipt-category-icon" aria-hidden="true" />` : "";
    return `
    <div class="receipt-card receipt-card--${escapeHtml2(type.toLowerCase())}" data-receipt-type="${escapeHtml2(receipt.type || "")}">
      <div class="receipt-header">
        <div class="receipt-title-wrap">
          ${iconImg}
          <span class="receipt-title font-mono">${escapeHtml2(receipt.title || "Receipt Record")}</span>
        </div>
        <span class="badge badge-subtle font-mono">${escapeHtml2(receipt.type || "MISC")}</span>
      </div>
      <div class="receipt-items">
        ${itemsHtml}
      </div>
    </div>
  `.trim();
  }
  var DossierPanelComponent = class {
    /**
     * @param {HTMLElement|Document} root Root DOM element or panel container.
     * @param {Object} [options]
     * @param {(itemRef: { receiptIndex: number, itemIndex: number, item: ReceiptItemData }) => void} [options.onItemClick]
     */
    constructor(root = document, options = {}) {
      this.root = root;
      this.options = options;
      this.currentCase = null;
      this.elements = this._queryElements();
      this._attachEvents();
    }
    _queryElements() {
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      return {
        panel: q("#dossier-panel"),
        content: q("#dossier-content"),
        paper: q("#dossier-panel .dossier-paper"),
        name: q("#dossier-citizen-name"),
        id: q("#dossier-citizen-id"),
        district: q("#dossier-district"),
        roof: q("#dossier-roof"),
        declared: q("#dossier-declared"),
        note: q("#dossier-note"),
        receiptsContainer: q("#dossier-receipts-container")
      };
    }
    _attachEvents() {
      if (this.elements.panel) {
        this.elements.panel.addEventListener("click", () => {
          this.skipIntakeAnimation();
        });
      }
      if (!this.elements.receiptsContainer) return;
      this.elements.receiptsContainer.addEventListener("click", (e) => {
        const row = e.target.closest?.(".receipt-item-row");
        if (!row) return;
        const rIndex = parseInt(row.getAttribute("data-receipt-index") || "0", 10);
        const iIndex = parseInt(row.getAttribute("data-item-index") || "0", 10);
        const item = this.currentCase?.receipts?.[rIndex]?.items?.[iIndex] || null;
        if (this.options.onItemClick) {
          this.options.onItemClick({ receiptIndex: rIndex, itemIndex: iIndex, item });
        }
      });
      this.elements.receiptsContainer.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          const row = e.target.closest?.(".receipt-item-row");
          if (row) {
            e.preventDefault();
            row.click();
          }
        }
      });
    }
    /**
     * Resets any active transition/intake/exit CSS classes on the dossier elements.
     */
    resetDossierTransform() {
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      const paper = this.elements.paper || q(".dossier-paper");
      const receipts = this.elements.receiptsContainer;
      const panel = this.elements.panel || q("#dossier-panel");
      const idEl = this.elements.id;
      const nameEl = this.elements.name;
      const animClasses = [
        "dossier-exit-approve",
        "dossier-exit-fine",
        "dossier-exit-grant",
        "dossier-intake-anim",
        "dossier-settled"
      ];
      if (paper?.classList) {
        animClasses.forEach((cls) => paper.classList.remove(cls));
      }
      if (receipts?.classList) {
        animClasses.forEach((cls) => receipts.classList.remove(cls));
      }
      if (panel?.classList) {
        panel.classList.remove("resolution-flash--fine", "resolution-shimmer--grant");
      }
      if (idEl?.classList) {
        idEl.classList.remove("reveal-hidden", "reveal-id-stamp");
      }
      if (nameEl?.classList) {
        nameEl.classList.remove("reveal-hidden", "reveal-name-in");
      }
    }
    /**
     * P5B-04: Plays a physical citizen intake animation.
     * Slides the dossier upward from the bottom, settles with rotation/shadow,
     * reveals Case ID and Citizen Name in sequence, and plays paper audio.
     *
     * @param {CitizenDossierData} citizenCase
     * @param {Object} [options]
     * @param {number} [options.duration=750]
     * @param {boolean} [options.reducedMotion=false]
     * @returns {Promise<void>}
     */
    animateIntake(citizenCase, { duration = 750, reducedMotion = false } = {}) {
      this.resetDossierTransform();
      this.loadCitizen(citizenCase);
      if (reducedMotion || duration === 0) {
        return Promise.resolve();
      }
      try {
        soundEngine.playPaper();
      } catch (_) {
      }
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      const paper = this.elements.paper || q(".dossier-paper");
      const receipts = this.elements.receiptsContainer;
      const idEl = this.elements.id;
      const nameEl = this.elements.name;
      if (idEl?.classList) {
        idEl.classList.add("reveal-hidden");
      }
      if (nameEl?.classList) {
        nameEl.classList.add("reveal-hidden");
      }
      if (paper?.classList) paper.classList.add("dossier-intake-anim");
      if (receipts?.classList) receipts.classList.add("dossier-intake-anim");
      return new Promise((resolve) => {
        let isSettled = false;
        const timers = [];
        const complete = () => {
          if (isSettled) return;
          isSettled = true;
          timers.forEach((t) => clearTimeout(t));
          if (paper?.classList) {
            paper.classList.remove("dossier-intake-anim");
            paper.classList.add("dossier-settled");
          }
          if (receipts?.classList) {
            receipts.classList.remove("dossier-intake-anim");
          }
          if (idEl?.classList) {
            idEl.classList.remove("reveal-hidden");
            idEl.classList.add("reveal-id-stamp");
          }
          if (nameEl?.classList) {
            nameEl.classList.remove("reveal-hidden");
            nameEl.classList.add("reveal-name-in");
          }
          this._activeIntakeComplete = null;
          resolve();
        };
        this._activeIntakeComplete = complete;
        timers.push(setTimeout(() => {
          if (idEl?.classList) {
            idEl.classList.remove("reveal-hidden");
            idEl.classList.add("reveal-id-stamp");
          }
        }, Math.round(duration * 0.45)));
        timers.push(setTimeout(() => {
          if (nameEl?.classList) {
            nameEl.classList.remove("reveal-hidden");
            nameEl.classList.add("reveal-name-in");
          }
        }, Math.round(duration * 0.7)));
        timers.push(setTimeout(complete, duration));
      });
    }
    /**
     * Immediately finishes any in-progress intake animation, snapping to settled state.
     */
    skipIntakeAnimation() {
      if (typeof this._activeIntakeComplete === "function") {
        this._activeIntakeComplete();
      }
    }
    /**
     * P5B-05: Case Resolution Animation.
     * Animates the dossier exit according to the decision:
     * - APPROVE: exits to the right.
     * - FINE: exits downward with red visual flash.
     * - GRANT: exits upward with gold shimmer.
     *
     * @param {'APPROVE'|'FINE'|'GRANT'} action
     * @param {Object} [options]
     * @param {number} [options.duration=650]
     * @param {boolean} [options.reducedMotion=false]
     * @returns {Promise<void>}
     */
    animateResolution(action, { duration = 650, reducedMotion = false } = {}) {
      if (reducedMotion || duration === 0) {
        return Promise.resolve();
      }
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      const paper = this.elements.paper || q(".dossier-paper");
      const receipts = this.elements.receiptsContainer;
      const panel = this.elements.panel || q("#dossier-panel");
      const actionUpper = String(action || "").toUpperCase();
      let exitClass = "dossier-exit-approve";
      let flashClass = "";
      if (actionUpper === "FINE") {
        exitClass = "dossier-exit-fine";
        flashClass = "resolution-flash--fine";
      } else if (actionUpper === "GRANT") {
        exitClass = "dossier-exit-grant";
        flashClass = "resolution-shimmer--grant";
      }
      if (paper?.classList) paper.classList.add(exitClass);
      if (receipts?.classList) receipts.classList.add(exitClass);
      if (panel?.classList && flashClass) panel.classList.add(flashClass);
      return new Promise((resolve) => {
        let resolved = false;
        const finish = () => {
          if (resolved) return;
          resolved = true;
          resolve();
        };
        setTimeout(finish, duration);
      });
    }
    /**
     * Loads and renders a citizen case dossier.
     *
     * @param {CitizenDossierData} citizenCase
     */
    loadCitizen(citizenCase) {
      if (!citizenCase) return;
      this.resetDossierTransform();
      this.currentCase = citizenCase;
      if (this.elements.name) {
        this.elements.name.textContent = citizenCase.name || "Unknown Citizen";
      }
      if (this.elements.id) {
        this.elements.id.textContent = citizenCase.id || "";
      }
      if (this.elements.district) {
        this.elements.district.textContent = citizenCase.district || "Antalya Municipal Area";
      }
      if (this.elements.roof) {
        this.elements.roof.textContent = citizenCase.roofType || "ASPHALT";
      }
      if (this.elements.declared) {
        this.elements.declared.textContent = formatCO2(citizenCase.declaredCO2 ?? 0);
      }
      if (this.elements.note) {
        this.elements.note.textContent = citizenCase.note ? `"${citizenCase.note}"` : "No statement provided.";
      }
      this.renderReceipts(citizenCase.receipts || []);
    }
    /**
     * Renders the receipt stack.
     *
     * @param {ReceiptData[]} receipts
     */
    renderReceipts(receipts = []) {
      if (!this.elements.receiptsContainer) return;
      if (receipts.length === 0) {
        this.elements.receiptsContainer.innerHTML = `
        <div class="receipt-card">
          <div class="receipt-header">
            <span class="receipt-title font-mono">No Records</span>
          </div>
          <div class="receipt-items">
            <span class="text-muted font-mono" style="font-size: var(--text-xs);">Citizen submitted no receipts.</span>
          </div>
        </div>
      `.trim();
        return;
      }
      this.elements.receiptsContainer.innerHTML = receipts.map((receipt, idx) => renderReceiptCard(receipt, idx)).join("\n");
    }
    /**
     * Sets callback when an item is clicked.
     *
     * @param {(itemRef: { receiptIndex: number, itemIndex: number, item: ReceiptItemData }) => void} callback
     */
    onItemClick(callback) {
      this.options.onItemClick = callback;
    }
    /**
     * Updates or loads citizen dossier data.
     *
     * @param {CitizenDossierData} citizenCase
     */
    update(citizenCase) {
      return this.loadCitizen(citizenCase);
    }
  };
  function createDossierPanel(root = document, options = {}) {
    return new DossierPanelComponent(root, options);
  }

  // js/frontend/components/calculator-panel.js
  function escapeHtml3(str) {
    if (typeof str !== "string") return String(str ?? "");
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function formatCO22(val) {
    if (typeof val !== "number" || !Number.isFinite(val)) {
      return "0.0 kg CO\u2082";
    }
    return `${val.toFixed(1)} kg CO\u2082`;
  }
  var CalculatorPanelComponent = class {
    /**
     * @param {HTMLElement|Document} root Root DOM element or calculator container.
     * @param {Object} [options]
     * @param {() => void} [options.onClear] Callback invoked when scratchpad is cleared.
     */
    constructor(root = document, options = {}) {
      this.root = root;
      this.options = options;
      this.entries = [];
      this.total = 0;
      this.elements = this._queryElements();
      this._attachEvents();
    }
    _queryElements() {
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      return {
        display: q("#calc-display"),
        tape: q("#calc-tape"),
        btnClear: q("#btn-calc-clear")
      };
    }
    _attachEvents() {
      if (this.elements.btnClear) {
        this.elements.btnClear.addEventListener("click", () => {
          this.clear();
          if (this.options.onClear) {
            this.options.onClear();
          }
        });
      }
    }
    /**
     * Adds an entry to the tape and recalculates the total.
     *
     * @param {TapeEntry} entry
     */
    addEntry(entry) {
      if (!entry || typeof entry.co2 !== "number" || !Number.isFinite(entry.co2)) {
        return;
      }
      this.entries.push(entry);
      this.total += entry.co2;
      this._render();
    }
    /**
     * Sets entire tape contents and updates the display.
     *
     * @param {TapeEntry[]} entries
     */
    setEntries(entries = []) {
      this.entries = [...entries];
      this.total = this.entries.reduce((sum, item) => sum + (Number.isFinite(item.co2) ? item.co2 : 0), 0);
      this._render();
    }
    /**
     * Clears the calculator tape and resets total to 0.
     */
    clear() {
      this.entries = [];
      this.total = 0;
      this._render();
    }
    /**
     * Returns current accumulated total in kg CO2.
     *
     * @returns {number}
     */
    getTotal() {
      return Math.round(this.total * 100) / 100;
    }
    /**
     * Updates display and tape elements.
     * @private
     */
    _render() {
      if (this.elements.display) {
        this.elements.display.textContent = formatCO22(this.total);
      }
      if (this.elements.tape) {
        if (this.entries.length === 0) {
          this.elements.tape.innerHTML = `
          <span class="tape-placeholder text-muted">Click receipt items to calculate footprint.</span>
        `.trim();
          return;
        }
        const rows = this.entries.map((entry) => {
          const sign = entry.co2 >= 0 ? "+" : "";
          const qtyPrefix = entry.qty !== void 0 && entry.unit ? `[${entry.qty} ${entry.unit}] ` : "";
          const co2Str = `${sign}${entry.co2.toFixed(1)} kg`;
          return `
          <div class="tape-entry font-mono" style="display:flex; justify-content:space-between; font-size:var(--text-xs); margin-bottom:2px;">
            <span class="tape-label">${escapeHtml3(qtyPrefix)}${escapeHtml3(entry.label)}</span>
            <span class="tape-value ${entry.co2 < 0 ? "text-success" : ""}">${escapeHtml3(co2Str)}</span>
          </div>
        `.trim();
        });
        this.elements.tape.innerHTML = rows.join("\n");
      }
    }
  };
  function createCalculatorPanel(root = document, options = {}) {
    return new CalculatorPanelComponent(root, options);
  }

  // js/frontend/components/action-panel.js
  var DEFAULT_GRANTS = [
    {
      id: "HEAT_PUMP",
      name: "Heat Pump Conversion",
      cost: 400,
      netZeroBoost: 10,
      futureImpact: "75% reduction in heating-related CO\u2082."
    },
    {
      id: "COMPOST_KIT",
      name: "Urban Compost Kit",
      cost: 150,
      netZeroBoost: 8,
      futureImpact: "90% reduction in methane-related CO\u2082e."
    },
    {
      id: "TRANSIT_PASS",
      name: "Annual Green Transit Pass",
      cost: 200,
      netZeroBoost: 7,
      futureImpact: "Zeroes commute emissions."
    },
    {
      id: "COOL_ROOF",
      name: "Cool/Green Roof Permit",
      cost: 300,
      netZeroBoost: 9,
      futureImpact: "40% reduction in cooling-related electricity consumption."
    }
  ];
  function escapeHtml4(str) {
    if (typeof str !== "string") return String(str ?? "");
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function formatGrantLabel(grant) {
    return `${grant.name} ($${grant.cost} | +${grant.netZeroBoost}% Net-Zero)`;
  }
  var ActionPanelComponent = class {
    /**
     * @param {HTMLElement|Document} root Root DOM element.
     * @param {Object} [options]
     * @param {() => void} [options.onApprove] Callback when APPROVE is clicked.
     * @param {() => void} [options.onFine] Callback when FINE is clicked.
     * @param {(grantId: string) => void} [options.onGrant] Callback when GRANT is clicked.
     * @param {(grantId: string) => void} [options.onGrantSelectChange] Callback when select changes.
     */
    constructor(root = document, options = {}) {
      this.root = root;
      this.options = options;
      this.elements = this._queryElements();
      this._attachEvents();
    }
    _queryElements() {
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      return {
        status: q("#action-panel-status"),
        auditedVal: q("#summary-audited-val"),
        declaredVal: q("#summary-declared-val"),
        varianceVal: q("#summary-variance-val"),
        varianceRow: q(".variance-row"),
        grantSelect: q("#grant-select"),
        btnApprove: q("#btn-action-approve"),
        btnFine: q("#btn-action-fine"),
        btnGrant: q("#btn-action-grant")
      };
    }
    _attachEvents() {
      if (this.elements.btnApprove) {
        this.elements.btnApprove.addEventListener("click", () => {
          if (this.options.onApprove) this.options.onApprove();
        });
      }
      if (this.elements.btnFine) {
        this.elements.btnFine.addEventListener("click", () => {
          if (this.options.onFine) this.options.onFine();
        });
      }
      if (this.elements.btnGrant) {
        this.elements.btnGrant.addEventListener("click", () => {
          const selected = this.getSelectedGrant();
          if (this.options.onGrant) this.options.onGrant(selected);
        });
      }
      if (this.elements.grantSelect) {
        this.elements.grantSelect.addEventListener("change", (e) => {
          const val = e.target?.value || "";
          if (this.options.onGrantSelectChange) {
            this.options.onGrantSelectChange(val);
          }
        });
      }
    }
    /**
     * Populates the grant selector with available grants.
     *
     * @param {GrantOption[]} grants
     */
    populateGrants(grants = DEFAULT_GRANTS) {
      if (!this.elements.grantSelect) return;
      const currentVal = this.elements.grantSelect.value;
      const defaultOption = '<option value="">-- Select Grant Program --</option>';
      const optionsHtml = grants.map((g) => {
        const label = formatGrantLabel(g);
        return `<option value="${escapeHtml4(g.id)}">${escapeHtml4(label)}</option>`;
      }).join("\n");
      this.elements.grantSelect.innerHTML = `${defaultOption}
${optionsHtml}`;
      if (currentVal) {
        this.elements.grantSelect.value = currentVal;
      }
    }
    /**
     * Returns the currently selected grant ID, or empty string if none.
     *
     * @returns {string}
     */
    getSelectedGrant() {
      return this.elements.grantSelect?.value || "";
    }
    /**
     * Sets the selected grant option by ID.
     *
     * @param {string} grantId
     */
    setSelectedGrant(grantId = "") {
      if (this.elements.grantSelect) {
        this.elements.grantSelect.value = grantId;
      }
    }
    /**
     * Updates the assessment comparison ledger.
     *
     * @param {number} auditedCO2
     * @param {number} declaredCO2
     */
    updateAssessment(auditedCO2 = 0, declaredCO2 = 0) {
      const audited = Number.isFinite(auditedCO2) ? auditedCO2 : 0;
      const declared = Number.isFinite(declaredCO2) ? declaredCO2 : 0;
      const variance = audited - declared;
      if (this.elements.auditedVal) {
        this.elements.auditedVal.textContent = `${audited.toFixed(1)} kg`;
      }
      if (this.elements.declaredVal) {
        this.elements.declaredVal.textContent = `${declared.toFixed(1)} kg`;
      }
      if (this.elements.varianceVal) {
        const sign = variance > 0 ? "+" : "";
        this.elements.varianceVal.textContent = `${sign}${variance.toFixed(1)} kg`;
      }
      if (this.elements.varianceRow) {
        this.elements.varianceRow.classList.remove("variance--positive", "variance--negative", "variance--zero");
        if (Math.abs(variance) <= 2) {
          this.elements.varianceRow.classList.add("variance--zero");
        } else if (variance > 0) {
          this.elements.varianceRow.classList.add("variance--positive");
        } else {
          this.elements.varianceRow.classList.add("variance--negative");
        }
      }
    }
    /**
     * Sets status indicator text in panel header.
     *
     * @param {string} statusText
     */
    setStatus(statusText = "READY") {
      if (this.elements.status) {
        this.elements.status.textContent = statusText;
      }
    }
    /**
     * Enables or disables the stamp action buttons.
     *
     * @param {boolean} enabled
     */
    setActionsEnabled(enabled = true) {
      if (this.elements.btnApprove) this.elements.btnApprove.disabled = !enabled;
      if (this.elements.btnFine) this.elements.btnFine.disabled = !enabled;
      if (this.elements.btnGrant) this.elements.btnGrant.disabled = !enabled;
      if (this.elements.grantSelect) this.elements.grantSelect.disabled = !enabled;
    }
    /**
     * Unified update method. Accepts a data object and delegates to the appropriate
     * sub-update methods.
     *
     * @param {Object} data
     * @param {number} [data.auditedCO2]
     * @param {number} [data.declaredCO2]
     * @param {GrantOption[]} [data.grants]
     * @param {string} [data.status]
     * @param {boolean} [data.actionsEnabled]
     */
    update(data = {}) {
      if (data.auditedCO2 !== void 0 || data.declaredCO2 !== void 0) {
        this.updateAssessment(data.auditedCO2 ?? 0, data.declaredCO2 ?? 0);
      }
      if (data.grants !== void 0) {
        this.populateGrants(data.grants);
      }
      if (data.status !== void 0) {
        this.setStatus(data.status);
      }
      if (data.actionsEnabled !== void 0) {
        this.setActionsEnabled(data.actionsEnabled);
      }
    }
  };
  function createActionPanel(root = document, options = {}) {
    return new ActionPanelComponent(root, options);
  }

  // js/frontend/screens/gameplay-screen.js
  var GameplayScreen = class {
    /**
     * @param {HTMLElement|Document} [root=document] Root DOM node containing gameplay elements.
     * @param {GameplayScreenOptions} [options]
     */
    constructor(root = document, options = {}) {
      this.root = root;
      this.options = options;
      this.screenElement = this._query("#screen-gameplay");
      this.workspaceGrid = this._query("#workspace");
      this.tabsBar = this._query(".workspace-tabs-bar");
      this.topBar = createTopBar(root);
      this.rulebook = createRulebookPanel(root);
      this.dossier = createDossierPanel(root, {
        onReceiptItemClick: (detail) => {
          if (typeof this.options.onReceiptItemClick === "function") {
            this.options.onReceiptItemClick(detail);
          }
        }
      });
      this.calculator = createCalculatorPanel(root, {
        onClear: () => {
          if (typeof this.options.onClearCalculator === "function") {
            this.options.onClearCalculator();
          }
        }
      });
      this.actionPanel = createActionPanel(root, {
        onApprove: () => {
          if (typeof this.options.onApprove === "function") {
            this.options.onApprove();
          }
        },
        onFine: () => {
          if (typeof this.options.onFine === "function") {
            this.options.onFine();
          }
        },
        onGrant: (grantId) => {
          if (typeof this.options.onGrant === "function") {
            this.options.onGrant(grantId);
          }
        },
        onGrantSelectChange: (grantId) => {
          if (typeof this.options.onGrantSelectChange === "function") {
            this.options.onGrantSelectChange(grantId);
          }
        }
      });
      this.activeTabId = "rulebook-panel";
      this._attachTabEvents();
    }
    _query(sel) {
      return this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
    }
    _queryAll(sel) {
      return this.root && typeof this.root.querySelectorAll === "function" ? Array.from(this.root.querySelectorAll(sel)) : [];
    }
    _attachTabEvents() {
      const tabButtons = this._queryAll(".workspace-tab-btn");
      for (const btn of tabButtons) {
        btn.addEventListener("click", () => {
          const targetId = btn.getAttribute("data-target") || btn.dataset?.target;
          if (targetId) {
            this.setActiveTab(targetId);
          }
        });
      }
    }
    /**
     * Switches the active workspace tab for small/tablet viewport layouts.
     *
     * @param {string} targetId ID of the target panel without '#' (e.g. 'rulebook-panel')
     */
    setActiveTab(targetId) {
      this.activeTabId = targetId;
      if (this.workspaceGrid) {
        if (typeof this.workspaceGrid.setAttribute === "function") {
          this.workspaceGrid.setAttribute("data-tab-mode", "tabs");
        }
      }
      const tabButtons = this._queryAll(".workspace-tab-btn");
      for (const btn of tabButtons) {
        const btnTarget = btn.getAttribute("data-target") || btn.dataset?.target;
        if (btnTarget === targetId) {
          btn.classList?.add("active");
        } else {
          btn.classList?.remove("active");
        }
      }
      const panelIds = ["rulebook-panel", "dossier-panel", "action-panel"];
      for (const id of panelIds) {
        const panel = this._query(`#${id}`);
        if (panel?.classList) {
          if (id === targetId) {
            panel.classList.add("tab-active");
          } else {
            panel.classList.remove("tab-active");
          }
        }
      }
      if (typeof this.options.onTabChange === "function") {
        this.options.onTabChange(targetId);
      }
    }
    /**
     * Returns the currently active tab ID.
     *
     * @returns {string}
     */
    getActiveTab() {
      return this.activeTabId;
    }
    /**
     * Activates and reveals the gameplay screen.
     */
    show() {
      if (this.screenElement?.classList) {
        this.screenElement.classList.add("active");
      }
    }
    /**
     * Hides the gameplay screen.
     */
    hide() {
      if (this.screenElement?.classList) {
        this.screenElement.classList.remove("active");
      }
    }
    /**
     * Checks whether the gameplay screen is currently visible.
     *
     * @returns {boolean}
     */
    isActive() {
      return Boolean(this.screenElement?.classList?.contains("active"));
    }
    /**
     * Updates all assembled sub-components from a unified state or partial updates.
     *
     * @param {Object} [data]
     */
    update(data = {}) {
      if (data.topBar) {
        this.topBar.update(data.topBar);
      } else if (data.day !== void 0 || data.metrics || data.timeRemaining !== void 0) {
        this.topBar.update({
          day: data.day,
          maxDays: data.maxDays,
          currentCaseIndex: data.currentCaseIndex,
          totalCases: data.totalCases,
          timeRemaining: data.timeRemaining,
          metrics: data.metrics
        });
      }
      if (data.rulebook) {
        this.rulebook.update(data.rulebook);
      } else if (data.rates || data.policies) {
        this.rulebook.update({
          rates: data.rates,
          policies: data.policies
        });
      }
      if (data.citizen) {
        if (typeof this.dossier.update === "function") {
          this.dossier.update(data.citizen);
        } else if (typeof this.dossier.loadCitizen === "function") {
          this.dossier.loadCitizen(data.citizen);
        }
      } else if (data.dossier) {
        if (typeof this.dossier.update === "function") {
          this.dossier.update(data.dossier);
        } else if (typeof this.dossier.loadCitizen === "function") {
          this.dossier.loadCitizen(data.dossier);
        }
      }
      if (data.actionPanel) {
        this.actionPanel.update(data.actionPanel);
      } else if (data.comparison || data.grants || data.auditedCO2 !== void 0) {
        this.actionPanel.update({
          auditedCO2: data.auditedCO2 ?? data.comparison?.auditedCO2,
          declaredCO2: data.declaredCO2 ?? data.comparison?.declaredCO2,
          grants: data.grants,
          status: data.actionStatus ?? data.status
        });
      }
      if (data.calculator) {
        if (Array.isArray(data.calculator.entries)) {
          this.calculator.clear();
          for (const entry of data.calculator.entries) {
            this.calculator.addEntry(entry);
          }
        }
      }
    }
    /**
     * Alias for update().
     *
     * @param {Object} [data]
     */
    render(data) {
      this.update(data);
    }
  };
  function createGameplayScreen(root = document, options = {}) {
    return new GameplayScreen(root, options);
  }

  // js/frontend/screens/game-over-screen.js
  function getFailureMessage(reason) {
    switch (reason) {
      case "BANKRUPTCY":
        return "Municipal Budget Depleted ($0 remaining).";
      case "PUBLIC_TRUST":
        return "Public Trust Collapsed (0% remaining). Civil unrest has forced terminal shutdown.";
      case "NET_ZERO_TARGET":
        return "Failed to achieve 100% Net-Zero target by the end of Day 3.";
      default:
        return typeof reason === "string" && reason.length > 0 ? reason : "The municipal carbon assessment campaign has concluded.";
    }
  }
  var GameOverScreenComponent = class {
    /**
     * @param {HTMLElement|Document} [root=document] Root DOM node containing game-over elements.
     * @param {GameOverScreenOptions} [options]
     */
    constructor(root = document, options = {}) {
      this.root = root;
      this.options = options;
      this.elements = this._queryElements();
      this._attachEvents();
    }
    _queryElements() {
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      return {
        screen: q("#screen-game-over"),
        badge: q("#game-over-badge"),
        title: q("#game-over-title"),
        reason: q("#game-over-reason"),
        stats: q("#game-over-stats"),
        days: q("#game-over-days"),
        netzero: q("#game-over-netzero"),
        trust: q("#game-over-trust"),
        budget: q("#game-over-budget"),
        totalProcessed: q("#game-over-total-processed"),
        totalCorrect: q("#game-over-total-correct"),
        totalFines: q("#game-over-total-fines"),
        totalGrants: q("#game-over-total-grants"),
        btnRestart: q("#btn-restart-game"),
        btnReturnMenu: q("#btn-return-menu")
      };
    }
    _attachEvents() {
      if (this.elements.btnRestart) {
        this.elements.btnRestart.addEventListener("click", (event) => {
          if (typeof this.options.onRestart === "function") {
            this.options.onRestart(event);
          }
        });
      }
      if (this.elements.btnReturnMenu) {
        this.elements.btnReturnMenu.addEventListener("click", (event) => {
          if (typeof this.options.onReturnMenu === "function") {
            this.options.onReturnMenu(event);
          }
        });
      }
    }
    /**
     * Renders victory or failure outcome content and final statistics.
     *
     * @param {CampaignOutcomeViewData} [data]
     */
    render(data = {}) {
      const isVictory = Boolean(data.isVictory || data.outcome === "VICTORY");
      if (this.elements.badge) {
        if (isVictory) {
          this.elements.badge.textContent = "COP31 TARGET ACHIEVED";
          this.elements.badge.classList?.remove("badge-danger");
          this.elements.badge.classList?.add("badge-gold");
        } else {
          this.elements.badge.textContent = "TERMINATION OF COMMISSION";
          this.elements.badge.classList?.remove("badge-gold");
          this.elements.badge.classList?.add("badge-danger");
        }
      }
      if (this.elements.title) {
        this.elements.title.textContent = isVictory ? "CAMPAIGN VICTORY" : "CAMPAIGN FAILED";
      }
      if (this.elements.reason) {
        if (isVictory) {
          this.elements.reason.textContent = data.reason ? data.reason : "Muratpa\u015Fa district has met municipal carbon targets within lawful budget tolerances.";
        } else {
          this.elements.reason.textContent = getFailureMessage(data.reason);
        }
      }
      const daysCompleted = data.daysCompleted ?? 1;
      const maxDays = data.maxDays ?? 3;
      if (this.elements.days) {
        this.elements.days.textContent = `${daysCompleted} of ${maxDays}`;
      }
      if (this.elements.netzero) {
        const nz = typeof data.netZero === "number" ? Math.round(data.netZero) : 0;
        this.elements.netzero.textContent = `${nz}%`;
      }
      if (this.elements.trust) {
        const tr = typeof data.trust === "number" ? Math.round(data.trust) : 0;
        this.elements.trust.textContent = `${tr}%`;
      }
      if (this.elements.budget) {
        const bd = typeof data.budget === "number" ? Math.round(data.budget) : 0;
        this.elements.budget.textContent = `$${bd.toLocaleString("en-US")}`;
      }
      const cs = data.campaignStats || {};
      if (this.elements.totalProcessed) {
        this.elements.totalProcessed.textContent = String(cs.totalProcessed ?? 0);
      }
      if (this.elements.totalCorrect) {
        this.elements.totalCorrect.textContent = String(cs.totalCorrect ?? 0);
      }
      if (this.elements.totalFines) {
        this.elements.totalFines.textContent = String(cs.totalFines ?? 0);
      }
      if (this.elements.totalGrants) {
        this.elements.totalGrants.textContent = String(cs.totalGrants ?? 0);
      }
    }
    /**
     * Reveals the game-over screen and displays outcome results.
     *
     * @param {CampaignOutcomeViewData} [data]
     */
    show(data) {
      if (data) {
        this.render(data);
      }
      if (this.elements.screen?.classList) {
        this.elements.screen.classList.add("active");
      }
    }
    /**
     * Hides the game-over screen.
     */
    hide() {
      if (this.elements.screen?.classList) {
        this.elements.screen.classList.remove("active");
      }
    }
    /**
     * Returns whether the game-over screen is active.
     *
     * @returns {boolean}
     */
    isActive() {
      return Boolean(this.elements.screen?.classList?.contains("active"));
    }
  };
  function createGameOverScreen(root = document, options = {}) {
    return new GameOverScreenComponent(root, options);
  }

  // js/frontend/screens/summary-screen.js
  function formatAccuracy(correctActions, processedCount) {
    if (typeof processedCount !== "number" || processedCount <= 0) {
      return "0.0%";
    }
    const correct = typeof correctActions === "number" && correctActions > 0 ? correctActions : 0;
    const pct = correct / processedCount * 100;
    return `${pct.toFixed(1)}%`;
  }
  var SummaryModalComponent = class {
    /**
     * @param {HTMLElement|Document} [root=document] Root DOM node containing summary-modal.
     * @param {SummaryModalOptions} [options]
     */
    constructor(root = document, options = {}) {
      this.root = root;
      this.options = options;
      this.elements = this._queryElements();
      this._attachEvents();
    }
    _queryElements() {
      const q = (sel) => this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
      return {
        modal: q("#summary-modal"),
        title: q("#modal-shift-title"),
        content: q("#summary-modal-content"),
        casesProcessed: q("#modal-cases-processed"),
        accuracy: q("#modal-accuracy"),
        co2Reduced: q("#modal-co2-reduced"),
        finesIssued: q("#modal-fines-issued"),
        grantsIssued: q("#modal-grants-issued"),
        btnNextShift: q("#btn-next-shift")
      };
    }
    _attachEvents() {
      if (this.elements.btnNextShift) {
        this.elements.btnNextShift.addEventListener("click", (event) => {
          if (typeof this.options.onProceed === "function") {
            this.options.onProceed(event);
          }
        });
      }
    }
    /**
     * Renders shift summary data into modal elements.
     *
     * @param {ShiftSummaryData} [data]
     */
    render(data = {}) {
      if (data.title && this.elements.title) {
        this.elements.title.textContent = data.title;
      } else if (data.day !== void 0 && this.elements.title) {
        this.elements.title.textContent = `DAY ${data.day} PERFORMANCE REPORT`;
      }
      if (this.elements.casesProcessed) {
        const count = data.processedCount ?? 0;
        this.elements.casesProcessed.textContent = String(count);
      }
      if (this.elements.accuracy) {
        if (typeof data.accuracy === "string") {
          this.elements.accuracy.textContent = data.accuracy;
        } else if (typeof data.accuracy === "number") {
          this.elements.accuracy.textContent = `${data.accuracy.toFixed(1)}%`;
        } else {
          const accuracyStr = formatAccuracy(data.correctActions ?? 0, data.processedCount ?? 0);
          this.elements.accuracy.textContent = accuracyStr;
        }
      }
      if (this.elements.co2Reduced) {
        if (typeof data.co2ReducedKg === "string") {
          this.elements.co2Reduced.textContent = data.co2ReducedKg;
        } else if (typeof data.co2ReducedKg === "number") {
          this.elements.co2Reduced.textContent = `${data.co2ReducedKg.toFixed(1)} kg`;
        } else {
          this.elements.co2Reduced.textContent = "0.0 kg";
        }
      }
      if (this.elements.finesIssued) {
        this.elements.finesIssued.textContent = String(data.finesIssued ?? 0);
      }
      if (this.elements.grantsIssued) {
        this.elements.grantsIssued.textContent = String(data.grantsIssued ?? 0);
      }
    }
    /**
     * Opens the summary modal and populates shift statistics.
     *
     * @param {ShiftSummaryData} [data]
     */
    open(data) {
      if (data) {
        this.render(data);
      }
      if (this.elements.modal) {
        if (typeof this.elements.modal.removeAttribute === "function") {
          this.elements.modal.removeAttribute("hidden");
        }
        this.elements.modal.hidden = false;
      }
    }
    /**
     * Alias for open().
     *
     * @param {ShiftSummaryData} [data]
     */
    show(data) {
      this.open(data);
    }
    /**
     * Closes and hides the summary modal.
     */
    close() {
      if (this.elements.modal) {
        if (typeof this.elements.modal.setAttribute === "function") {
          this.elements.modal.setAttribute("hidden", "");
        }
        this.elements.modal.hidden = true;
      }
      if (typeof this.options.onClose === "function") {
        this.options.onClose();
      }
    }
    /**
     * Alias for close().
     */
    hide() {
      this.close();
    }
    /**
     * Returns whether the modal is currently open.
     *
     * @returns {boolean}
     */
    isOpen() {
      if (!this.elements.modal) return false;
      const hasHiddenAttr = typeof this.elements.modal.hasAttribute === "function" ? this.elements.modal.hasAttribute("hidden") : Boolean(this.elements.modal.hidden);
      return !hasHiddenAttr && !this.elements.modal.hidden;
    }
  };
  function createSummaryModal(root = document, options = {}) {
    return new SummaryModalComponent(root, options);
  }

  // js/frontend/screens/day-intro-modal.js
  var DayIntroModalComponent = class {
    /**
     * @param {HTMLElement|Document} [root=document]
     * @param {DayIntroModalOptions} [options]
     */
    constructor(root = document, options = {}) {
      this.root = root;
      this.options = options;
      this.elements = this._queryElements();
      this._attachEvents();
    }
    _query(sel) {
      return this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
    }
    _queryElements() {
      return {
        modal: this._query("#day-intro-modal"),
        badge: this._query("#day-intro-badge"),
        title: this._query("#day-intro-title"),
        description: this._query("#day-intro-description"),
        cases: this._query("#day-intro-cases"),
        time: this._query("#day-intro-time"),
        mechanicsList: this._query("#day-intro-mechanics"),
        btnStartShift: this._query("#btn-start-shift")
      };
    }
    _attachEvents() {
      if (this.elements.btnStartShift) {
        this.elements.btnStartShift.addEventListener("click", (event) => {
          this.close();
          if (typeof this.options.onStartShift === "function") {
            this.options.onStartShift(event);
          }
        });
      }
    }
    /**
     * Renders the day intro modal with configuration data.
     *
     * @param {DayIntroData} data
     */
    render(data = {}) {
      const day = data.day ?? 1;
      const title = data.title || `Day ${day}`;
      const description = data.description || "";
      const caseCount = data.caseCount ?? data.cases ?? 5;
      const timeLimit = data.timeLimitSeconds ?? data.shiftDuration ?? 120;
      const mechanics = Array.isArray(data.mechanics) ? data.mechanics : [];
      if (this.elements.badge) {
        this.elements.badge.textContent = `OPERATIONAL BRIEFING \u2022 DAY ${day} OF 3`;
      }
      if (this.elements.title) {
        this.elements.title.textContent = `DAY ${day}: ${title.toUpperCase()}`;
      }
      if (this.elements.description) {
        this.elements.description.textContent = description;
      }
      if (this.elements.cases) {
        this.elements.cases.textContent = `${caseCount} Citizens`;
      }
      if (this.elements.time) {
        const minutes = Math.floor(timeLimit / 60);
        const seconds = timeLimit % 60;
        const timeStr = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
        this.elements.time.textContent = `${timeStr} (${timeLimit}s)`;
      }
      if (this.elements.mechanicsList) {
        this.elements.mechanicsList.innerHTML = mechanics.map((m) => `<li>${this._escapeHtml(m)}</li>`).join("");
      }
    }
    /**
     * Opens the day intro modal with data.
     *
     * @param {DayIntroData} [data]
     */
    open(data) {
      if (data) {
        this.render(data);
      }
      if (this.elements.modal) {
        if (typeof this.elements.modal.removeAttribute === "function") {
          this.elements.modal.removeAttribute("hidden");
        }
        this.elements.modal.hidden = false;
      }
    }
    show(data) {
      this.open(data);
    }
    /**
     * Closes the day intro modal.
     */
    close() {
      if (this.elements.modal) {
        if (typeof this.elements.modal.setAttribute === "function") {
          this.elements.modal.setAttribute("hidden", "");
        }
        this.elements.modal.hidden = true;
      }
    }
    hide() {
      this.close();
    }
    /**
     * Checks whether the day intro modal is open.
     *
     * @returns {boolean}
     */
    isOpen() {
      if (!this.elements.modal) return false;
      const hasHiddenAttr = typeof this.elements.modal.hasAttribute === "function" ? this.elements.modal.hasAttribute("hidden") : Boolean(this.elements.modal.hidden);
      return !hasHiddenAttr && !this.elements.modal.hidden;
    }
    _escapeHtml(str) {
      if (typeof str !== "string") return String(str ?? "");
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
  };
  function createDayIntroModal(root = document, options = {}) {
    return new DayIntroModalComponent(root, options);
  }

  // js/frontend/renderer.js
  var Renderer = class {
    /**
     * @param {HTMLElement|Document} [root=document]
     * @param {RendererOptions} [options]
     */
    constructor(root = document, options = {}) {
      this.root = root;
      this.options = options;
      this.mainMenu = options.mainMenu || createMainMenuScreen(root);
      this.gameplay = options.gameplay || createGameplayScreen(root);
      this.summaryModal = options.summaryModal || createSummaryModal(root);
      this.gameOver = options.gameOver || createGameOverScreen(root);
      this.dayIntroModal = options.dayIntroModal || createDayIntroModal(root);
      this.currentScreen = "main-menu";
    }
    /**
     * Normalizes screen identifiers (e.g. 'screen-main-menu' -> 'main-menu').
     *
     * @param {string} screenId
     * @returns {ScreenId}
     */
    _normalizeScreenId(screenId) {
      if (!screenId) return "main-menu";
      const normalized = screenId.replace(/^screen-/, "");
      if (normalized === "main-menu" || normalized === "gameplay" || normalized === "game-over") {
        return normalized;
      }
      return "main-menu";
    }
    /**
     * Activates the specified screen and deactivates all other screens.
     *
     * @param {string} screenId Screen identifier ('main-menu', 'gameplay', 'game-over').
     */
    showScreen(screenId) {
      const target = this._normalizeScreenId(screenId);
      this.mainMenu.hide();
      this.gameplay.hide();
      this.gameOver.hide();
      switch (target) {
        case "gameplay":
          this.gameplay.show();
          break;
        case "game-over":
          this.gameOver.show();
          break;
        case "main-menu":
        default:
          this.mainMenu.show();
          break;
      }
      this.currentScreen = target;
      if (typeof this.options.onScreenChange === "function") {
        this.options.onScreenChange(target);
      }
    }
    /**
     * Returns the currently active screen ID.
     *
     * @returns {ScreenId}
     */
    getCurrentScreen() {
      return this.currentScreen;
    }
    /**
     * Opens the shift summary modal.
     *
     * @param {Object} [shiftData]
     */
    showSummaryModal(shiftData) {
      this.summaryModal.open(shiftData);
    }
    /**
     * Closes the shift summary modal.
     */
    hideSummaryModal() {
      this.summaryModal.close();
    }
    /**
     * Checks whether the summary modal is open.
     *
     * @returns {boolean}
     */
    isSummaryModalOpen() {
      return this.summaryModal.isOpen();
    }
    /**
     * Opens the day introduction briefing modal.
     *
     * @param {Object} [introData]
     */
    showDayIntroModal(introData) {
      this.dayIntroModal.open(introData);
    }
    /**
     * Closes the day introduction briefing modal.
     */
    hideDayIntroModal() {
      this.dayIntroModal.close();
    }
    /**
     * Checks whether the day intro modal is open.
     *
     * @returns {boolean}
     */
    isDayIntroModalOpen() {
      return this.dayIntroModal.isOpen();
    }
    /**
     * Updates screens with new state view data.
     *
     * @param {Object} stateView
     */
    update(stateView = {}) {
      if (this.currentScreen === "gameplay") {
        this.gameplay.update(stateView);
      }
    }
    /**
     * Alias for update().
     *
     * @param {Object} stateView
     */
    render(stateView) {
      this.update(stateView);
    }
  };
  function createRenderer(root = document, options = {}) {
    return new Renderer(root, options);
  }

  // js/frontend/events.js
  var EventManager = class {
    /**
     * @param {HTMLElement|Document} [root=document] Root DOM node.
     * @param {UIEventHandlers} [handlers]
     */
    constructor(root = document, handlers = {}) {
      this.root = root;
      this.handlers = { ...handlers };
      this._listeners = [];
      this._setupGlobalKeyboard();
    }
    _query(sel) {
      return this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
    }
    _queryAll(sel) {
      return this.root && typeof this.root.querySelectorAll === "function" ? Array.from(this.root.querySelectorAll(sel)) : [];
    }
    _addListener(element, type, handler) {
      if (element && typeof element.addEventListener === "function") {
        element.addEventListener(type, handler);
        this._listeners.push({ element, type, handler });
      }
    }
    /**
     * Sets or updates an event handler callback.
     *
     * @param {keyof UIEventHandlers} eventName
     * @param {Function} handler
     */
    on(eventName, handler) {
      this.handlers[eventName] = handler;
    }
    /**
     * Sets up global keyboard shortcuts.
     */
    _setupGlobalKeyboard() {
      const keyTarget = typeof window !== "undefined" ? window : this.root;
      if (keyTarget && typeof keyTarget.addEventListener === "function") {
        const keyHandler = (event) => {
          const key = event.key;
          if (key === "Escape") {
            const modal = this._query("#summary-modal");
            if (modal && !modal.hasAttribute("hidden") && !modal.hidden) {
              if (typeof this.handlers.onCloseSummaryModal === "function") {
                this.handlers.onCloseSummaryModal();
              }
            }
          }
          const gameplayScreen = this._query("#screen-gameplay");
          const isGameplayActive = gameplayScreen?.classList?.contains("active");
          if (isGameplayActive) {
            if (key === "1") {
              if (typeof this.handlers.onApprove === "function") {
                this.handlers.onApprove();
              }
            } else if (key === "2") {
              if (typeof this.handlers.onFine === "function") {
                this.handlers.onFine();
              }
            } else if (key === "3") {
              if (typeof this.handlers.onGrant === "function") {
                const select = this._query("#grant-select");
                const selectedGrant = select?.value || "";
                this.handlers.onGrant(selectedGrant);
              }
            }
          }
        };
        this._addListener(keyTarget, "keydown", keyHandler);
      }
    }
    /**
     * Attaches click and change listeners to interactive buttons and selectors.
     */
    attach() {
      const btnStart = this._query("#btn-start-game");
      if (btnStart) {
        this._addListener(btnStart, "click", (e) => {
          if (typeof this.handlers.onStartGame === "function") {
            this.handlers.onStartGame(e);
          }
        });
      }
      const tabButtons = this._queryAll(".workspace-tab-btn");
      for (const btn of tabButtons) {
        this._addListener(btn, "click", () => {
          const targetId = btn.getAttribute("data-target") || btn.dataset?.target;
          if (targetId && typeof this.handlers.onTabSelect === "function") {
            this.handlers.onTabSelect(targetId);
          }
        });
      }
      const btnApprove = this._query("#btn-action-approve");
      if (btnApprove) {
        this._addListener(btnApprove, "click", () => {
          if (typeof this.handlers.onApprove === "function") {
            this.handlers.onApprove();
          }
        });
      }
      const btnFine = this._query("#btn-action-fine");
      if (btnFine) {
        this._addListener(btnFine, "click", () => {
          if (typeof this.handlers.onFine === "function") {
            this.handlers.onFine();
          }
        });
      }
      const btnGrant = this._query("#btn-action-grant");
      if (btnGrant) {
        this._addListener(btnGrant, "click", () => {
          const select = this._query("#grant-select");
          const selectedGrant = select?.value || "";
          if (typeof this.handlers.onGrant === "function") {
            this.handlers.onGrant(selectedGrant);
          }
        });
      }
      const selectGrant = this._query("#grant-select");
      if (selectGrant) {
        this._addListener(selectGrant, "change", (e) => {
          const val = e.target?.value ?? selectGrant.value;
          if (typeof this.handlers.onGrantSelectChange === "function") {
            this.handlers.onGrantSelectChange(val);
          }
        });
      }
      const btnCalcClear = this._query("#btn-calc-clear");
      if (btnCalcClear) {
        this._addListener(btnCalcClear, "click", () => {
          if (typeof this.handlers.onClearCalculator === "function") {
            this.handlers.onClearCalculator();
          }
        });
      }
      const btnNextShift = this._query("#btn-next-shift");
      if (btnNextShift) {
        this._addListener(btnNextShift, "click", () => {
          if (typeof this.handlers.onNextShift === "function") {
            this.handlers.onNextShift();
          }
        });
      }
      const btnStartShift = this._query("#btn-start-shift");
      if (btnStartShift) {
        this._addListener(btnStartShift, "click", () => {
          if (typeof this.handlers.onStartShift === "function") {
            this.handlers.onStartShift();
          }
        });
      }
      const btnRestart = this._query("#btn-restart-game");
      if (btnRestart) {
        this._addListener(btnRestart, "click", () => {
          if (typeof this.handlers.onRestartGame === "function") {
            this.handlers.onRestartGame();
          }
        });
      }
      const btnReturnMenu = this._query("#btn-return-menu");
      if (btnReturnMenu) {
        this._addListener(btnReturnMenu, "click", () => {
          if (typeof this.handlers.onReturnMenu === "function") {
            this.handlers.onReturnMenu();
          }
        });
      }
    }
    /**
     * Detaches all registered listeners.
     */
    destroy() {
      for (const { element, type, handler } of this._listeners) {
        if (element && typeof element.removeEventListener === "function") {
          element.removeEventListener(type, handler);
        }
      }
      this._listeners = [];
    }
  };
  function setupUIEvents(root = document, handlers = {}) {
    const manager = new EventManager(root, handlers);
    manager.attach();
    return manager;
  }

  // js/frontend/scene-director.js
  var SCENE_NAMES = Object.freeze({
    MENU: "MENU",
    DAY_BRIEF: "DAY_BRIEF",
    SHIFT_START: "SHIFT_START",
    CASE_INTAKE: "CASE_INTAKE",
    CASE_REVIEW: "CASE_REVIEW",
    CASE_RESOLVE: "CASE_RESOLVE",
    NEXT_CASE: "NEXT_CASE",
    DAY_SUMMARY: "DAY_SUMMARY",
    NEXT_DAY: "NEXT_DAY",
    VERDICT: "VERDICT"
  });
  var DEFAULT_TRANSITION_DURATIONS = Object.freeze({
    MENU: 350,
    DAY_BRIEF: 400,
    SHIFT_START: 300,
    CASE_INTAKE: 750,
    // P5B-04: 0.6–0.9s physical delivery
    CASE_REVIEW: 0,
    CASE_RESOLVE: 700,
    // P5B-05: resolution exit physics
    NEXT_CASE: 250,
    DAY_SUMMARY: 400,
    NEXT_DAY: 350,
    VERDICT: 500
  });
  var SceneDirector = class {
    /**
     * @param {SceneDirectorOptions} [options]
     */
    constructor(options = {}) {
      this.root = options.root || (typeof document !== "undefined" ? document : null);
      this._currentScene = options.initialScene || SCENE_NAMES.MENU;
      this._durations = {
        ...DEFAULT_TRANSITION_DURATIONS,
        ...options.durations || {}
      };
      this._handlers = /* @__PURE__ */ new Map();
      this._listeners = /* @__PURE__ */ new Map();
      this._isTransitioning = false;
      this._currentSkipFn = null;
      this._fallbackTimeout = null;
      this._reducedMotion = options.reducedMotion ?? this._detectReducedMotion();
      this._setupReducedMotionListener();
      this._applySceneAttribute(this._currentScene);
    }
    // ─── Reduced Motion ────────────────────────────────────────────────────────
    _detectReducedMotion() {
      if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
        try {
          return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch (_) {
          return false;
        }
      }
      return false;
    }
    _setupReducedMotionListener() {
      if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
        try {
          const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
          if (mql && typeof mql.addEventListener === "function") {
            mql.addEventListener("change", (e) => {
              this._reducedMotion = e.matches;
              this.emit("reducedMotionChange", { reducedMotion: e.matches });
            });
          }
        } catch (_) {
        }
      }
    }
    /**
     * Enables or disables reduced-motion mode.
     * When enabled, transitions complete virtually instantaneously without physical physics.
     *
     * @param {boolean} enabled
     */
    setReducedMotion(enabled) {
      this._reducedMotion = Boolean(enabled);
      this.emit("reducedMotionChange", { reducedMotion: this._reducedMotion });
    }
    /**
     * Returns whether reduced-motion is currently active.
     *
     * @returns {boolean}
     */
    isReducedMotion() {
      return this._reducedMotion;
    }
    // ─── Configuration & Registration ──────────────────────────────────────────
    /**
     * Registers a scene with enter/exit/skip lifecycle hooks.
     *
     * @param {string} sceneName Scene name from SCENE_NAMES or custom string.
     * @param {SceneHandler} handler Scene lifecycle handler.
     */
    registerScene(sceneName, handler) {
      if (!sceneName) return;
      this._handlers.set(sceneName, handler || {});
    }
    /**
     * Sets the configured transition duration for a scene in milliseconds.
     *
     * @param {string} sceneName
     * @param {number} durationMs
     */
    setTransitionDuration(sceneName, durationMs) {
      if (sceneName && typeof durationMs === "number" && durationMs >= 0) {
        this._durations[sceneName] = durationMs;
      }
    }
    /**
     * Gets the transition duration for a scene, factoring in reduced motion.
     *
     * @param {string} sceneName
     * @returns {number}
     */
    getTransitionDuration(sceneName) {
      if (this._reducedMotion) {
        return 0;
      }
      const handler = this._handlers.get(sceneName);
      if (handler && typeof handler.duration === "number") {
        return handler.duration;
      }
      return this._durations[sceneName] ?? 200;
    }
    /**
     * Returns the currently active scene identifier.
     *
     * @returns {string}
     */
    getCurrentScene() {
      return this._currentScene;
    }
    /**
     * Returns true if a transition is currently in progress.
     *
     * @returns {boolean}
     */
    isTransitioning() {
      return this._isTransitioning;
    }
    // ─── Event Bus ─────────────────────────────────────────────────────────────
    /**
     * Subscribes to SceneDirector events.
     *
     * @param {string} event
     * @param {Function} callback
     * @returns {() => void} Unsubscribe function.
     */
    on(event, callback) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, /* @__PURE__ */ new Set());
      }
      this._listeners.get(event).add(callback);
      return () => this.off(event, callback);
    }
    /**
     * Unsubscribes from an event.
     *
     * @param {string} event
     * @param {Function} callback
     */
    off(event, callback) {
      const set = this._listeners.get(event);
      if (set) {
        set.delete(callback);
      }
    }
    /**
     * Emits an event to registered listeners.
     *
     * @param {string} event
     * @param {any} payload
     */
    emit(event, payload) {
      const set = this._listeners.get(event);
      if (set) {
        for (const cb of set) {
          try {
            cb(payload);
          } catch (err) {
            console.warn(`[SceneDirector] Error in listener for "${event}":`, err);
          }
        }
      }
    }
    // ─── Scene Transition Orchestration ────────────────────────────────────────
    /**
     * Immediately skips the active transition if one is in flight, snapping to final state.
     */
    skipTransition() {
      if (this._isTransitioning && typeof this._currentSkipFn === "function") {
        const skipFn = this._currentSkipFn;
        this._currentSkipFn = null;
        skipFn();
      }
    }
    /**
     * Executes a coordinated scene transition to the target scene.
     *
     * @param {string} targetScene Identifier of the scene to transition to.
     * @param {any} [data={}] Associated data payload (case, day info, result, etc.).
     * @param {Object} [options]
     * @param {boolean} [options.force=false] If true, cancels any running transition and immediately starts this one.
     * @returns {Promise<{ from: string, to: string, data: any }>}
     */
    async transitionTo(targetScene, data = {}, options = {}) {
      if (!targetScene) {
        return { from: this._currentScene, to: this._currentScene, data };
      }
      if (this._isTransitioning) {
        if (options.force) {
          this.skipTransition();
        } else {
          this.skipTransition();
        }
      }
      const fromScene = this._currentScene;
      const duration = this.getTransitionDuration(targetScene);
      const context = {
        from: fromScene,
        to: targetScene,
        data,
        reducedMotion: this._reducedMotion,
        duration
      };
      this._isTransitioning = true;
      this.emit("transitionStart", context);
      const previousHandler = this._handlers.get(fromScene);
      if (previousHandler && typeof previousHandler.exit === "function") {
        try {
          await Promise.resolve(previousHandler.exit(data, context));
        } catch (err) {
          console.warn(`[SceneDirector] Exit hook error for ${fromScene}:`, err);
        }
      }
      this._currentScene = targetScene;
      this._applySceneAttribute(targetScene);
      const targetHandler = this._handlers.get(targetScene);
      return new Promise((resolve) => {
        let isSettled = false;
        const finish = () => {
          if (isSettled) return;
          isSettled = true;
          if (this._fallbackTimeout !== null) {
            clearTimeout(this._fallbackTimeout);
            this._fallbackTimeout = null;
          }
          this._isTransitioning = false;
          this._currentSkipFn = null;
          this.emit("transitionEnd", context);
          this.emit("sceneChange", context);
          resolve({ from: fromScene, to: targetScene, data });
        };
        this._currentSkipFn = () => {
          if (targetHandler && typeof targetHandler.skip === "function") {
            try {
              targetHandler.skip();
            } catch (_) {
            }
          }
          this.emit("transitionSkipped", context);
          finish();
        };
        if (duration === 0) {
          if (targetHandler && typeof targetHandler.enter === "function") {
            try {
              targetHandler.enter(data, context);
            } catch (err) {
              console.warn(`[SceneDirector] Enter hook error for ${targetScene}:`, err);
            }
          }
          finish();
          return;
        }
        try {
          if (targetHandler && typeof targetHandler.enter === "function") {
            const enterRes = targetHandler.enter(data, context);
            if (enterRes && typeof enterRes.then === "function") {
              enterRes.then(() => finish()).catch(() => finish());
            }
          }
        } catch (err) {
          console.warn(`[SceneDirector] Enter hook error for ${targetScene}:`, err);
        }
        const fallbackMs = Math.max(duration + 60, 100);
        this._fallbackTimeout = setTimeout(finish, fallbackMs);
      });
    }
    _applySceneAttribute(sceneName) {
      if (this.root && typeof this.root.setAttribute === "function") {
        this.root.setAttribute("data-active-scene", sceneName);
      }
    }
    /**
     * Destroys the SceneDirector, clearing timeouts and listeners.
     */
    destroy() {
      if (this._fallbackTimeout !== null) {
        clearTimeout(this._fallbackTimeout);
        this._fallbackTimeout = null;
      }
      this._listeners.clear();
      this._handlers.clear();
      this._isTransitioning = false;
      this._currentSkipFn = null;
    }
  };
  function createSceneDirector(options = {}) {
    return new SceneDirector(options);
  }

  // js/frontend/game-controller.js
  var TICK_INTERVAL_MS = 1e3;
  var SECONDS_PER_TICK = 1;
  var FEEDBACK_DISPLAY_MS = 1800;
  var GameController = class {
    /**
     * @param {BackendApi} backend  Backend API instance.
     * @param {Renderer}   renderer Frontend renderer.
     * @param {object}     [options]
     * @param {HTMLElement|Document} [options.root=document] Document root.
     */
    constructor(backend, renderer, options = {}) {
      this.backend = backend;
      this.renderer = renderer;
      this.root = options.root || (typeof document !== "undefined" ? document : null);
      this._timerHandle = null;
      this._awaitingTransition = false;
      this._started = false;
      this._currentCase = null;
      this._feedbackEl = null;
      this.sceneDirector = options.sceneDirector || createSceneDirector({ root: this.root });
    }
    // ─── Internal helpers ────────────────────────────────────────────────────
    _query(sel) {
      return this.root && typeof this.root.querySelector === "function" ? this.root.querySelector(sel) : null;
    }
    // ─── P3-01  Bootstrap ────────────────────────────────────────────────────
    /**
     * Initialises (or re-initialises) the backend campaign and performs the
     * initial full render of all connected UI panels.
     * P4-09: Shows day introduction modal and starts the shift timer.
     *
     * @param {object} [options]
     * @param {boolean} [options.autoStartTimer=true] Whether to start the timer immediately.
     * @returns {void}
     */
    startCampaign(options = {}) {
      const stateView = this.backend.startCampaign();
      this._started = true;
      this._awaitingTransition = false;
      this._pendingGameOverData = null;
      this._renderInitialState(stateView);
      this._showDayIntro(stateView.currentDay);
      this.sceneDirector?.transitionTo(SCENE_NAMES.DAY_BRIEF, {
        day: stateView.currentDay,
        stateView
      });
      this._startTimer();
    }
    /**
     * Called when the player clicks "Begin Shift" on the day intro modal.
     * Dismisses the intro modal and ensures the timer is running. (P4-09)
     */
    onStartShift() {
      this.renderer.hideDayIntroModal();
      soundEngine.playTransition();
      if (!this._timerHandle) {
        this._startTimer();
      }
      this.sceneDirector?.transitionTo(SCENE_NAMES.SHIFT_START).then(() => {
        this.sceneDirector?.transitionTo(SCENE_NAMES.CASE_REVIEW, {
          citizenCase: this._currentCase
        });
      });
    }
    /**
     * Restarts the campaign from Day 1 with fresh state. (P4-14)
     *
     * @returns {void}
     */
    restartCampaign() {
      this._stopTimer();
      const stateView = this.backend.restartCampaign();
      this._awaitingTransition = false;
      this._pendingGameOverData = null;
      this._hideFeedback();
      this.renderer.showScreen("gameplay");
      this._renderInitialState(stateView);
      this._showDayIntro(stateView.currentDay);
      this.sceneDirector?.transitionTo(SCENE_NAMES.DAY_BRIEF, {
        day: stateView.currentDay,
        stateView
      });
      this._startTimer();
    }
    /**
     * Performs the full initial render for a freshly started/reset state.
     *
     * @param {import('../backend/index.js').GameStateView} stateView
     * @private
     */
    _renderInitialState(stateView) {
      const rulebook = this.backend.getRulebook();
      if (this.renderer.gameplay?.rulebook) {
        this.renderer.gameplay.rulebook.renderRates(Object.values(rulebook));
      }
      const currentDay = stateView.currentDay ?? 1;
      const grants = this.backend.getGrantsForDay ? this.backend.getGrantsForDay(currentDay) : this.backend.getGrants();
      if (this.renderer.gameplay?.actionPanel) {
        this.renderer.gameplay.actionPanel.populateGrants(grants);
      }
      this._renderStateView(stateView);
      this._loadCurrentCitizen(stateView);
    }
    // ─── P4-09  Day Introduction ──────────────────────────────────────────────
    /**
     * Shows the day introduction modal with the current day's configuration.
     *
     * @param {number} day
     * @private
     */
    _showDayIntro(day) {
      try {
        const dayConfig = this.backend.getDayConfig(day);
        if (this.renderer.dayIntroModal && typeof this.renderer.showDayIntroModal === "function") {
          this.renderer.showDayIntroModal(dayConfig);
        }
      } catch (_) {
      }
    }
    // ─── P3-02  City metrics ─────────────────────────────────────────────────
    /**
     * Pushes the latest GameStateView into every connected UI sub-component.
     *
     * @param {import('../backend/index.js').GameStateView} stateView
     * @private
     */
    _renderStateView(stateView) {
      if (!stateView) return;
      const dailyCasesCount = this._getDailyCasesCount(stateView);
      if (this.renderer.gameplay?.topBar) {
        this.renderer.gameplay.topBar.update({
          day: stateView.currentDay,
          maxDays: 3,
          currentCaseIndex: stateView.currentCaseIndex,
          totalCases: dailyCasesCount,
          timeRemaining: stateView.timeRemaining,
          metrics: stateView.metrics
        });
      }
    }
    /**
     * Derives the total number of cases for the current day from a state view.
     * The backend does not expose this directly from GameStateView, so we
     * infer it from the number of daily cases the campaign manager holds.
     * As a fallback, we call getCurrentCase to check if one exists.
     *
     * @param {import('../backend/index.js').GameStateView} stateView
     * @returns {number}
     * @private
     */
    _getDailyCasesCount(stateView) {
      try {
        const { CAMPAIGN_DAYS: CAMPAIGN_DAYS2 } = this.backend._internalDays || {};
        if (CAMPAIGN_DAYS2 && CAMPAIGN_DAYS2[stateView.currentDay]) {
          return CAMPAIGN_DAYS2[stateView.currentDay].caseCount;
        }
      } catch (_) {
      }
      const dayCaseCounts = { 1: 5, 2: 6, 3: 7 };
      return dayCaseCounts[stateView.currentDay] ?? 5;
    }
    // ─── P3-03  Citizen dossier ──────────────────────────────────────────────
    /**
     * Loads the current citizen case from the backend and renders it.
     *
     * @param {import('../backend/index.js').GameStateView} [stateView]
     * @private
     */
    _loadCurrentCitizen(stateView) {
      const citizenCase = this.backend.getCurrentCase();
      this._currentCase = citizenCase;
      if (!citizenCase) {
        this._handleShiftEnd(stateView);
        return;
      }
      if (this.renderer.gameplay?.dossier) {
        if (typeof this.renderer.gameplay.dossier.animateIntake === "function") {
          const duration = this.sceneDirector?.getTransitionDuration(SCENE_NAMES.CASE_INTAKE) ?? 750;
          const reducedMotion = this.sceneDirector?.isReducedMotion() ?? false;
          this.sceneDirector?.transitionTo(SCENE_NAMES.CASE_INTAKE, { citizenCase });
          this.renderer.gameplay.dossier.animateIntake(citizenCase, { duration, reducedMotion }).then(() => {
            this.sceneDirector?.transitionTo(SCENE_NAMES.CASE_REVIEW, { citizenCase });
          });
        } else {
          this.renderer.gameplay.dossier.loadCitizen(citizenCase);
          soundEngine.playPaper();
        }
      }
      if (this.renderer.gameplay?.calculator) {
        this.renderer.gameplay.calculator.clear();
      }
      if (this.renderer.gameplay?.actionPanel) {
        const grants = this.backend.getGrants();
        this.renderer.gameplay.actionPanel.update({
          auditedCO2: 0,
          declaredCO2: citizenCase.declaredCO2,
          grants,
          status: "READY",
          actionsEnabled: true
        });
      }
      this._hideFeedback();
    }
    // ─── P3-05  Calculator ───────────────────────────────────────────────────
    /**
     * Handles a receipt item click: requests a single-item breakdown from the
     * backend and adds the result to the calculator tape.
     *
     * @param {{ receiptIndex: number, itemIndex: number, item: object }} detail
     */
    onReceiptItemClick(detail) {
      if (!this._currentCase || this._awaitingTransition) return;
      const { receiptIndex, itemIndex } = detail;
      let breakdown;
      try {
        breakdown = this.backend.getReceiptBreakdown({
          caseId: this._currentCase.id,
          selection: [{ receiptIndex, itemIndex }]
        });
      } catch (err) {
        console.warn("[GameController] Receipt breakdown error:", err.message);
        return;
      }
      for (const bItem of breakdown.items || []) {
        if (this.renderer.gameplay?.calculator) {
          this.renderer.gameplay.calculator.addEntry({
            label: bItem.label,
            qty: bItem.qty,
            unit: bItem.unit,
            co2: bItem.co2
          });
          soundEngine.playClick();
        }
      }
      this._syncActionPanelAudit();
    }
    /**
     * Reads the current calculator total and writes it into the action panel
     * assessment comparison.
     * @private
     */
    _syncActionPanelAudit() {
      if (!this.renderer.gameplay?.calculator) return;
      if (!this.renderer.gameplay?.actionPanel) return;
      if (!this._currentCase) return;
      const auditedCO2 = this.renderer.gameplay.calculator.getTotal();
      this.renderer.gameplay.actionPanel.updateAssessment(
        auditedCO2,
        this._currentCase.declaredCO2
      );
    }
    /**
     * Clears the calculator tape.
     */
    onClearCalculator() {
      if (this.renderer.gameplay?.calculator) {
        this.renderer.gameplay.calculator.clear();
        soundEngine.playClick();
      }
      this._syncActionPanelAudit();
    }
    // ─── P3-06/07/08  Action submission ─────────────────────────────────────
    /**
     * Submits an APPROVE action to the backend.
     */
    onApprove() {
      if (!this._currentCase || this._awaitingTransition) return;
      this._submitAction("APPROVE", null);
    }
    /**
     * Submits a FINE action to the backend.
     */
    onFine() {
      if (!this._currentCase || this._awaitingTransition) return;
      this._submitAction("FINE", null);
    }
    /**
     * Submits a GRANT action with the selected grant ID.
     *
     * @param {string} grantId
     */
    onGrant(grantId) {
      if (!this._currentCase || this._awaitingTransition) return;
      if (!grantId) {
        this._showInlineMessage("Select a grant program before stamping.");
        return;
      }
      this._submitAction("GRANT", grantId);
    }
    /**
     * Core action submission handler: validates via backend, updates metrics,
     * displays feedback, then transitions to next citizen.
     *
     * @param {'APPROVE'|'FINE'|'GRANT'} action
     * @param {string|null} grantId
     * @private
     */
    _submitAction(action, grantId) {
      this._setActionsEnabled(false);
      this._awaitingTransition = true;
      soundEngine.playStamp(action);
      let result;
      try {
        result = this.backend.submitAction({
          caseId: this._currentCase.id,
          action,
          grantId: grantId || void 0
        });
      } catch (err) {
        console.warn("[GameController] submitAction error:", err.message);
        this._setActionsEnabled(true);
        this._awaitingTransition = false;
        return;
      }
      this.sceneDirector?.transitionTo(SCENE_NAMES.CASE_RESOLVE, { action, result });
      if (this.renderer.gameplay?.dossier?.animateResolution) {
        const duration = this.sceneDirector?.getTransitionDuration(SCENE_NAMES.CASE_RESOLVE) ?? 650;
        const reducedMotion = this.sceneDirector?.isReducedMotion() ?? false;
        this.renderer.gameplay.dossier.animateResolution(action, { duration, reducedMotion });
      }
      if (this.renderer.gameplay?.topBar) {
        this.renderer.gameplay.topBar.setMetrics(result.metrics);
      }
      this._showActionFeedback(result);
      setTimeout(() => {
        this._handleActionResult(result);
      }, FEEDBACK_DISPLAY_MS);
    }
    // ─── P3-09 & P5B-08  Action feedback ──────────────────────────────────────
    /**
     * Derives distinct verdict label per P5B-08.
     * VERIFIED: Valid APPROVE or GRANT
     * VIOLATION: Valid FINE issued
     * OVERRULED: Incorrect decision
     *
     * @param {ActionResult} result
     * @returns {'VERIFIED'|'VIOLATION'|'OVERRULED'}
     * @private
     */
    _getVerdictLabel(result) {
      if (result.isValid) {
        return result.action === "FINE" ? "VIOLATION" : "VERIFIED";
      }
      return "OVERRULED";
    }
    /**
     * Renders the action feedback overlay/stamp and explanation text.
     *
     * @param {ActionResult} result
     * @private
     */
    _showActionFeedback(result) {
      if (this.renderer.gameplay?.actionPanel) {
        const statusText = result.isValid ? "\u2713 CORRECT" : "\u2717 INCORRECT";
        this.renderer.gameplay.actionPanel.setStatus(statusText);
      }
      if (result.isValid) {
        soundEngine.playSuccess();
      } else {
        soundEngine.playError();
      }
      this._showFeedbackOverlay(result);
    }
    /**
     * P5B-08: Displays an enhanced feedback banner with prominent stamp,
     * torn-paper-style result strip, clear ruling text, distinct verdict label,
     * and animated counting metric chips.
     *
     * @param {ActionResult} result
     * @private
     */
    _showFeedbackOverlay(result) {
      const dossierPanel = this._query("#dossier-panel");
      if (!dossierPanel) return;
      this._hideFeedback();
      const doc = typeof document !== "undefined" ? document : this.root && typeof this.root.createElement === "function" ? this.root : this.root?.ownerDocument;
      if (!doc || typeof doc.createElement !== "function") return;
      const overlay = doc.createElement("div");
      overlay.id = "action-feedback-overlay";
      overlay.setAttribute("role", "status");
      overlay.setAttribute("aria-live", "polite");
      const stampClass = result.isValid ? "feedback--valid" : "feedback--invalid";
      const stampLabel = result.action;
      const verdict = this._getVerdictLabel(result);
      const verdictClass = `verdict-badge--${verdict.toLowerCase()}`;
      const metricChipsHtml = this._buildEnhancedMetricChips(result.metricChanges);
      const metricLines = this._buildMetricChangeLines(result.metricChanges);
      const stampMap = {
        APPROVE: "assets/Approved_Stamp.png",
        FINE: "assets/FineIssued_Stamp.png",
        GRANT: "assets/GrantApproved_Stamp.png"
      };
      const stampAsset = stampMap[result.action] || "assets/Approved_Stamp.png";
      overlay.className = `action-feedback-overlay ${stampClass} verdict-mode--${verdict.toLowerCase()}`;
      overlay.innerHTML = `
      <div class="feedback-stamp-graphic-wrap">
        <img src="${stampAsset}" alt="${this._escapeHtml(stampLabel)} Stamp" class="feedback-stamp-image stamp-drop-anim" />
      </div>

      <div class="torn-paper-strip ${stampClass}">
        <div class="torn-strip-header">
          <span class="torn-strip-seal-text">COP31 MUNICIPAL AUDIT RULING</span>
          <span class="verdict-badge ${verdictClass}">${verdict}</span>
        </div>
        <div class="feedback-stamp">${this._escapeHtml(stampLabel)}</div>
        <div class="feedback-explanation">
          <p class="ruling-text">${this._escapeHtml(result.explanation)}</p>
        </div>
        ${metricChipsHtml}
        ${metricLines ? `<div class="feedback-metrics font-mono" style="display:none;">${metricLines}</div>` : ""}
      </div>
    `.trim();
      dossierPanel.appendChild(overlay);
      this._feedbackEl = overlay;
      void overlay.offsetHeight;
      overlay.classList.add("feedback-visible");
      if (!this.sceneDirector?.isReducedMotion()) {
        this._animateMetricCounters(overlay);
      }
    }
    /**
     * P5B-08: Generates animated metric change chips for Net-Zero, Budget, and Trust.
     *
     * @param {import('../backend/index.js').MetricChanges} changes
     * @returns {string}
     * @private
     */
    _buildEnhancedMetricChips(changes) {
      if (!changes) return "";
      const chips = [];
      if (typeof changes.netZero === "number" && changes.netZero !== 0) {
        const isPos = changes.netZero > 0;
        const sign = isPos ? "+" : "";
        const cls = isPos ? "metric-chip--positive" : "metric-chip--negative";
        chips.push(`
        <span class="metric-chip ${cls}" data-metric="netzero" data-val="${changes.netZero}">
          <span class="chip-label">NET-ZERO:</span>
          <span class="chip-val font-mono">${sign}${changes.netZero.toFixed(1)}%</span>
        </span>
      `.trim());
      }
      if (typeof changes.budget === "number" && changes.budget !== 0) {
        const isPos = changes.budget > 0;
        const sign = isPos ? "+" : "-";
        const cls = isPos ? "metric-chip--positive" : "metric-chip--negative";
        const formatted = `${sign}$${Math.round(Math.abs(changes.budget))}`;
        chips.push(`
        <span class="metric-chip ${cls}" data-metric="budget" data-val="${changes.budget}">
          <span class="chip-label">BUDGET:</span>
          <span class="chip-val font-mono">${formatted}</span>
        </span>
      `.trim());
      }
      if (typeof changes.trust === "number" && changes.trust !== 0) {
        const isPos = changes.trust > 0;
        const sign = isPos ? "+" : "";
        const cls = isPos ? "metric-chip--positive" : "metric-chip--negative";
        chips.push(`
        <span class="metric-chip ${cls}" data-metric="trust" data-val="${changes.trust}">
          <span class="chip-label">TRUST:</span>
          <span class="chip-val font-mono">${sign}${changes.trust.toFixed(1)}%</span>
        </span>
      `.trim());
      }
      if (chips.length === 0) return "";
      return `
      <div class="torn-strip-metrics" role="region" aria-label="Municipal Adjustments">
        <span class="torn-strip-seal-text">MUNICIPAL IMPACT:</span>
        <div class="metric-chips-group">${chips.join(" ")}</div>
      </div>
    `.trim();
    }
    /**
     * P5B-08: Smoothly counts up/down metric chip numbers into their final values.
     *
     * @param {HTMLElement} overlay
     * @private
     */
    _animateMetricCounters(overlay) {
      if (!overlay || typeof overlay.querySelectorAll !== "function") return;
      const chips = overlay.querySelectorAll(".metric-chip");
      chips.forEach((chip) => {
        const valEl = chip.querySelector?.(".chip-val");
        const rawVal = parseFloat(chip.getAttribute("data-val") || "0");
        const metric = chip.getAttribute("data-metric");
        if (!valEl || isNaN(rawVal)) return;
        const duration = 300;
        const startTime = Date.now();
        const isPos = rawVal > 0;
        const sign = isPos ? "+" : "";
        const timer = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const current = rawVal * progress;
          if (metric === "budget") {
            const sign2 = rawVal > 0 ? "+" : rawVal < 0 ? "-" : "";
            valEl.textContent = `${sign2}$${Math.round(Math.abs(current))}`;
          } else {
            valEl.textContent = `${sign}${current.toFixed(1)}%`;
          }
          if (progress >= 1) {
            clearInterval(timer);
            if (metric === "budget") {
              const sign2 = rawVal > 0 ? "+" : rawVal < 0 ? "-" : "";
              valEl.textContent = `${sign2}$${Math.round(Math.abs(rawVal))}`;
            } else {
              valEl.textContent = `${sign}${rawVal.toFixed(1)}%`;
            }
          }
        }, 30);
      });
    }
    /**
     * Builds a compact human-readable metric change summary.
     *
     * @param {import('../backend/index.js').MetricChanges} changes
     * @returns {string}
     * @private
     */
    _buildMetricChangeLines(changes) {
      if (!changes) return "";
      const lines = [];
      if (typeof changes.netZero === "number" && changes.netZero !== 0) {
        const sign = changes.netZero > 0 ? "+" : "";
        lines.push(`Net-Zero ${sign}${changes.netZero.toFixed(1)}%`);
      }
      if (typeof changes.budget === "number" && changes.budget !== 0) {
        const sign = changes.budget > 0 ? "+" : "";
        lines.push(`Budget ${sign}$${Math.round(Math.abs(changes.budget))} ${changes.budget > 0 ? "\u25B2" : "\u25BC"}`);
      }
      if (typeof changes.trust === "number" && changes.trust !== 0) {
        const sign = changes.trust > 0 ? "+" : "";
        lines.push(`Trust ${sign}${changes.trust.toFixed(1)}%`);
      }
      return lines.join(" \xB7 ");
    }
    /**
     * Removes the feedback overlay if present.
     * @private
     */
    _hideFeedback() {
      if (this._feedbackEl) {
        if (typeof this._feedbackEl.remove === "function") {
          this._feedbackEl.remove();
        } else if (this._feedbackEl.parentNode) {
          this._feedbackEl.parentNode.removeChild(this._feedbackEl);
        }
        this._feedbackEl = null;
      }
      const existing = this._query("#action-feedback-overlay");
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
    }
    /**
     * Shows an inline status message without submitting an action.
     *
     * @param {string} message
     * @private
     */
    _showInlineMessage(message) {
      if (this.renderer.gameplay?.actionPanel) {
        this.renderer.gameplay.actionPanel.setStatus(message);
      }
    }
    // ─── P3-10  Citizen transitions ──────────────────────────────────────────
    /**
     * Processes the backend ActionResult after the feedback display delay.
     * Decides whether to load the next citizen, end the shift, or end the campaign.
     *
     * @param {ActionResult} result
     * @private
     */
    _handleActionResult(result) {
      this._awaitingTransition = false;
      if (result.campaignOutcome) {
        this._stopTimer();
        this._handleCampaignEnd(result.campaignOutcome, result.shiftStats);
        return;
      }
      if (result.shiftEnded) {
        this._stopTimer();
        this._handleShiftEnd(null, result.shiftStats);
        return;
      }
      this.sceneDirector?.transitionTo(SCENE_NAMES.NEXT_CASE);
      const stateView = this.backend.getState();
      this._renderStateView(stateView);
      this._loadCurrentCitizen(stateView);
      this._setActionsEnabled(true);
    }
    // ─── P3-11  Shift statistics + shift-end flow ────────────────────────────
    /**
     * Handles shift end: retrieves shift summary and displays the modal.
     *
     * @param {import('../backend/index.js').GameStateView | null} stateView
     * @param {import('../backend/systems/game-state.js').ShiftStats} [statsOverride]
     * @private
     */
    _handleShiftEnd(stateView, statsOverride) {
      soundEngine.playTransition();
      const summary = this.backend.getShiftSummary();
      const stats = statsOverride || summary.shiftStats;
      const day = summary.day || stateView?.currentDay || 1;
      const summaryData = {
        day,
        processedCount: stats.processedCount,
        correctActions: stats.correctActions,
        co2ReducedKg: stats.co2ReducedKg,
        finesIssued: stats.finesIssued,
        grantsIssued: stats.grantsIssued
      };
      this.sceneDirector?.transitionTo(SCENE_NAMES.DAY_SUMMARY, summaryData);
      this.renderer.showSummaryModal(summaryData);
    }
    /**
     * Handles campaign end (victory or failure). Navigates to the game-over screen.
     * P4-12: Victory screen with campaign statistics.
     * P4-13: Failure screen with failure reason and metrics.
     *
     * @param {import('../backend/index.js').CampaignOutcome} outcome
     * @param {import('../backend/systems/game-state.js').ShiftStats} [shiftStats]
     * @private
     */
    _handleCampaignEnd(outcome, shiftStats) {
      const isVictory = outcome.status === "VICTORY";
      const stateView = this.backend.getState();
      const summary = this.backend.getShiftSummary();
      let campaignStats = null;
      try {
        campaignStats = this.backend.getCampaignStats();
      } catch (_) {
      }
      const gameOverData = {
        isVictory,
        outcome: outcome.status,
        reason: outcome.failureReason || null,
        daysCompleted: stateView.currentDay,
        maxDays: 3,
        netZero: outcome.metrics.netZero,
        trust: outcome.metrics.trust,
        budget: outcome.metrics.budget,
        campaignStats
      };
      this.sceneDirector?.transitionTo(SCENE_NAMES.VERDICT, gameOverData);
      if (isVictory) {
        const summaryData = {
          day: stateView.currentDay,
          processedCount: (shiftStats || summary.shiftStats).processedCount,
          correctActions: (shiftStats || summary.shiftStats).correctActions,
          co2ReducedKg: (shiftStats || summary.shiftStats).co2ReducedKg,
          finesIssued: (shiftStats || summary.shiftStats).finesIssued,
          grantsIssued: (shiftStats || summary.shiftStats).grantsIssued
        };
        this.renderer.showSummaryModal(summaryData);
        this._pendingGameOverData = gameOverData;
      } else {
        this.renderer.showScreen("game-over");
        if (this.renderer.gameOver) {
          this.renderer.gameOver.render(gameOverData);
        }
      }
    }
    /**
     * Called when the player clicks "Proceed" on the shift summary modal.
     * P4-11: If campaign ongoing and not last day, advance to next day with intro.
     * P4-12: If pending victory, show game-over victory screen.
     */
    onNextShift() {
      this.renderer.hideSummaryModal();
      if (this._pendingGameOverData) {
        const data = this._pendingGameOverData;
        this._pendingGameOverData = null;
        this.sceneDirector?.transitionTo(SCENE_NAMES.VERDICT, data);
        this.renderer.showScreen("game-over");
        if (this.renderer.gameOver) {
          this.renderer.gameOver.render(data);
        }
        return;
      }
      try {
        this.sceneDirector?.transitionTo(SCENE_NAMES.NEXT_DAY);
        const stateView = this.backend.advanceDay();
        this._awaitingTransition = false;
        this._hideFeedback();
        const currentDay = stateView.currentDay ?? 1;
        const grants = this.backend.getGrantsForDay ? this.backend.getGrantsForDay(currentDay) : this.backend.getGrants();
        if (this.renderer.gameplay?.actionPanel) {
          this.renderer.gameplay.actionPanel.populateGrants(grants);
        }
        this._renderStateView(stateView);
        this._loadCurrentCitizen(stateView);
        this._setActionsEnabled(true);
        this._showDayIntro(currentDay);
        this.sceneDirector?.transitionTo(SCENE_NAMES.DAY_BRIEF, { day: currentDay });
      } catch (err) {
        console.warn("[GameController] advanceDay error:", err.message);
      }
    }
    // ─── P3-12  Shift timer ──────────────────────────────────────────────────
    /**
     * Starts the countdown interval that feeds `campaign.tick()` every second.
     * @private
     */
    _startTimer() {
      this._stopTimer();
      this._timerHandle = setInterval(() => {
        this._onTimerTick();
      }, TICK_INTERVAL_MS);
    }
    /**
     * Stops the countdown interval.
     * @private
     */
    _stopTimer() {
      if (this._timerHandle !== null) {
        clearInterval(this._timerHandle);
        this._timerHandle = null;
      }
    }
    /**
     * Tick handler: asks the backend campaign to advance time, then updates UI.
     * If the timer expires, ends the shift.
     * @private
     */
    _onTimerTick() {
      if (this._awaitingTransition) return;
      let stateView;
      try {
        stateView = this.backend.tick(SECONDS_PER_TICK);
      } catch (err) {
        console.warn("[GameController] Timer tick error:", err.message);
        this._stopTimer();
        return;
      }
      if (this.renderer.gameplay?.topBar) {
        this.renderer.gameplay.topBar.setTimer(stateView.timeRemaining);
      }
      if (stateView.timeRemaining === 0) {
        this._stopTimer();
        if (!this._awaitingTransition) {
          this._awaitingTransition = true;
          this._setActionsEnabled(false);
          const outcome = this.backend.getCampaignOutcome();
          if (outcome) {
            this._handleCampaignEnd(outcome, null);
          } else {
            this._handleShiftEnd(stateView);
          }
        }
      }
    }
    // ─── Helpers ─────────────────────────────────────────────────────────────
    /**
     * Enables or disables the stamp action buttons.
     *
     * @param {boolean} enabled
     * @private
     */
    _setActionsEnabled(enabled) {
      if (this.renderer.gameplay?.actionPanel) {
        this.renderer.gameplay.actionPanel.setActionsEnabled(enabled);
      }
    }
    /**
     * HTML escape helper (frontend-only; no gameplay logic).
     *
     * @param {string} str
     * @returns {string}
     * @private
     */
    _escapeHtml(str) {
      if (typeof str !== "string") return String(str ?? "");
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    /**
     * Cleans up the controller (stops timer, removes feedback).
     */
    destroy() {
      this._stopTimer();
      this._hideFeedback();
      this.sceneDirector?.destroy();
    }
  };
  function createGameController(backend, renderer, options = {}) {
    return new GameController(backend, renderer, options);
  }

  // js/app.js
  function initApp(root = typeof document !== "undefined" ? document : null) {
    if (!root) {
      return { renderer: null, events: null, controller: null };
    }
    const renderer = createRenderer(root);
    const controller = createGameController(backendApi, renderer, { root });
    const events = setupUIEvents(root, {
      // Main menu
      onStartGame: () => {
        renderer.showScreen("gameplay");
        controller.startCampaign();
      },
      // Action stamps (P3-06, P3-07, P3-08)
      onApprove: () => controller.onApprove(),
      onFine: () => controller.onFine(),
      onGrant: (grantId) => controller.onGrant(grantId),
      // Grant selector change (no backend call needed; just keeps internal state)
      onGrantSelectChange: (_grantId) => {
      },
      // Calculator (P3-05)
      onReceiptItemClick: (detail) => controller.onReceiptItemClick(detail),
      onClearCalculator: () => controller.onClearCalculator(),
      // Responsive tabs
      onTabSelect: (targetId) => {
        if (renderer.gameplay?.setActiveTab) {
          renderer.gameplay.setActiveTab(targetId);
        }
      },
      // Summary modal (P3-11)
      onNextShift: () => controller.onNextShift(),
      onCloseSummaryModal: () => renderer.hideSummaryModal(),
      // Day intro modal (P4-09)
      onStartShift: () => controller.onStartShift(),
      // Game-over / restart (P4-14)
      onRestartGame: () => {
        controller.restartCampaign();
      },
      onReturnMenu: () => {
        controller.sceneDirector?.transitionTo("MENU");
        controller.destroy();
        renderer.showScreen("main-menu");
      }
    });
    if (renderer.gameplay?.dossier) {
      renderer.gameplay.dossier.onItemClick((detail) => {
        controller.onReceiptItemClick(detail);
      });
    }
    return { renderer, events, controller, sceneDirector: controller.sceneDirector };
  }
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    if (!window.__GAMEUP_INITIALIZED__) {
      window.__GAMEUP_INITIALIZED__ = true;
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => initApp(document));
      } else {
        initApp(document);
      }
    }
  }
})();
