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

/**
 * Municipal assessment rates. These are fixed gameplay benchmark values, not
 * official scientific, government, or COP31-certified emission factors.
 *
 * @type {EmissionRulebook}
 */
export const EMISSION_RULEBOOK = {
  GRID_ELEC: {
    key: 'GRID_ELEC',
    category: 'Electricity',
    activity: 'Grid electricity',
    rate: 0.5,
    unit: 'kg CO₂/kWh',
  },
  GAS_HEAT: {
    key: 'GAS_HEAT',
    category: 'Heating',
    activity: 'Natural gas',
    rate: 2.0,
    unit: 'kg CO₂/m³',
  },
  SOLAR_OFFSET: {
    key: 'SOLAR_OFFSET',
    category: 'Electricity',
    activity: 'Rooftop solar offset',
    rate: -0.4,
    unit: 'kg CO₂/kWh',
  },
  BEEF: {
    key: 'BEEF',
    category: 'Food',
    activity: 'Beef / ruminant meat',
    rate: 15.0,
    unit: 'kg CO₂/pack',
  },
  IMPORTED_GOODS: {
    key: 'IMPORTED_GOODS',
    category: 'Food',
    activity: 'Imported out-of-season goods',
    rate: 5.0,
    unit: 'kg CO₂/item',
  },
  LOCAL_FOOD: {
    key: 'LOCAL_FOOD',
    category: 'Food',
    activity: 'Local organic / plant food',
    rate: 0.5,
    unit: 'kg CO₂/pack',
  },
  GASOLINE: {
    key: 'GASOLINE',
    category: 'Transportation',
    activity: 'Gasoline travel',
    rate: 0.2,
    unit: 'kg CO₂/km',
  },
  FLIGHT: {
    key: 'FLIGHT',
    category: 'Transportation',
    activity: 'Domestic air travel',
    rate: 150.0,
    unit: 'kg CO₂/ticket',
  },
  PUBLIC_TRANSIT: {
    key: 'PUBLIC_TRANSIT',
    category: 'Transportation',
    activity: 'Public electric transit',
    rate: 0.0,
    unit: 'kg CO₂/km',
  },
  LANDFILL: {
    key: 'LANDFILL',
    category: 'Waste',
    activity: 'Landfill waste',
    rate: 3.0,
    unit: 'kg CO₂e/kg',
  },
  COMPOST: {
    key: 'COMPOST',
    category: 'Waste',
    activity: 'Composted organic waste',
    rate: 0.1,
    unit: 'kg CO₂e/kg',
  },
};

export {};
