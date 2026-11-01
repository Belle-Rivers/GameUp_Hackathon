/**
 * @typedef {Object} RulebookRateItem
 * @property {string} [key] Unique key (e.g. 'GRID_ELEC').
 * @property {string} category Category name (e.g. 'Electricity').
 * @property {string} activity Activity title (e.g. 'Grid Electricity').
 * @property {number} rate Benchmark rate in kg CO2 per unit.
 * @property {string} unit Unit string (e.g. 'kg CO₂/kWh').
 */

/**
 * @typedef {Object} PolicyDirectiveItem
 * @property {string} code Directive code (e.g. 'DIR-3101').
 * @property {string} title Directive title.
 * @property {string} text Directive description.
 */

/**
 * Standard municipal policy directives per GAME_RULES.md.
 *
 * @type {PolicyDirectiveItem[]}
 */
export const DEFAULT_POLICY_DIRECTIVES = [
  {
    code: 'DIR-3101',
    title: 'Unverified Carbon Offsets',
    text: 'Offsets lacking official COP31 municipal registry seals are illegal deductions and must be rejected with fine penalties.',
  },
  {
    code: 'DIR-3102',
    title: 'Permitted Tolerance Range',
    text: 'A variance within ±2.0 kg CO₂ between calculated and declared totals is permissible as acceptable reporting variance.',
  },
  {
    code: 'DIR-3103',
    title: 'Municipal Mitigation Grants',
    text: 'Citizens with qualifying high-emission defects (natural gas >100 m³, waste >30 kg, mobility >300 km, or AC >150 kWh on asphalt roof) may be awarded grants.',
  },
];

/**
 * Renders the HTML markup for a single rate item card.
 *
 * @param {RulebookRateItem} rate
 * @returns {string}
 */
export function renderRateItem(rate) {
  const rateFormatted = typeof rate.rate === 'number' ? rate.rate.toFixed(2) : String(rate.rate);
  const sign = rate.rate < 0 ? '' : '';
  const unitStr = rate.unit ? ` ${rate.unit}` : ' kg CO₂/unit';

  const key = String(rate.key || '').toUpperCase();
  const iconMap = {
    GRID_ELEC: 'assets/Electric_Meter.png',
    GAS_HEAT: 'assets/NaturalGas_Heater.png',
    BEEF: 'assets/LocalFruits.png',
    LOCAL_FOOD: 'assets/LocalFruits.png',
    FLIGHT: 'assets/plane.png',
    GASOLINE_KM: 'assets/petrol.png',
    WASTE_KG: 'assets/garbage.png',
    AC_COOLING: 'assets/RooftopSolarEnergy.png',
    SOLAR_REDUCTION: 'assets/RooftopSolarEnergy.png',
    HEAT_PUMP_GRANT: 'assets/NaturalGas_Heater.png',
  };
  const iconSrc = iconMap[key] || '';
  const iconImg = iconSrc ? `<img src="${iconSrc}" alt="" class="rate-icon" aria-hidden="true" />` : '';

  return `
    <div class="rate-item card card-compact" data-rate-key="${escapeHtml(rate.key || '')}">
      <div class="rate-header">
        <div class="rate-title-wrap">
          ${iconImg}
          <span class="rate-name">${escapeHtml(rate.activity || rate.name || '')}</span>
        </div>
        <span class="rate-value font-mono">${sign}${rateFormatted}${escapeHtml(unitStr)}</span>
      </div>
      <span class="rate-category font-mono">${escapeHtml(rate.category || 'General')}</span>
    </div>
  `.trim();
}

/**
 * Renders the HTML markup for a single policy directive card.
 *
 * @param {PolicyDirectiveItem} policy
 * @returns {string}
 */
export function renderPolicyItem(policy) {
  return `
    <div class="policy-card card card-compact" data-policy-code="${escapeHtml(policy.code)}">
      <span class="policy-code font-mono">${escapeHtml(policy.code)}</span>
      <h4 class="policy-heading">${escapeHtml(policy.title)}</h4>
      <p class="policy-text">${escapeHtml(policy.text)}</p>
    </div>
  `.trim();
}

/**
 * Basic HTML escaping helper for safe innerHTML updates.
 *
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * RulebookPanelComponent manages rendering the left column containing
 * official benchmark emission rates and municipal policy directives.
 */
export class RulebookPanelComponent {
  /**
   * @param {HTMLElement|Document} root Root DOM element or panel container.
   */
  constructor(root = document) {
    this.root = root;
    this.ratesContainer = this.root && typeof this.root.querySelector === 'function'
      ? this.root.querySelector('#rulebook-rates-list')
      : null;
    this.contentContainer = this.root && typeof this.root.querySelector === 'function'
      ? this.root.querySelector('#rulebook-content')
      : null;
  }

  /**
   * Populates the rates list from a dictionary or array of emission rates.
   *
   * @param {Record<string, RulebookRateItem> | RulebookRateItem[]} rates
   */
  renderRates(rates = []) {
    if (!this.ratesContainer) return;
    const rateArray = Array.isArray(rates) ? rates : Object.values(rates || {});
    this.ratesContainer.innerHTML = rateArray.map(renderRateItem).join('\n');
  }

  /**
   * Populates policy directives into the rulebook panel.
   *
   * @param {PolicyDirectiveItem[]} [policies]
   */
  renderPolicies(policies = DEFAULT_POLICY_DIRECTIVES) {
    if (!this.contentContainer) return;
    let policySection = this.contentContainer.querySelector('.rulebook-section--policies');
    if (!policySection) {
      // Find existing policy section or append
      const sections = this.contentContainer.querySelectorAll('.rulebook-section');
      if (sections.length > 1) {
        policySection = sections[1];
      }
    }
    if (policySection) {
      const heading = '<h3 class="section-title">Policy Directives</h3>';
      const itemsHtml = policies.map(renderPolicyItem).join('\n');
      policySection.innerHTML = `${heading}\n${itemsHtml}`;
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
}

/**
 * Factory for RulebookPanelComponent.
 *
 * @param {HTMLElement|Document} [root]
 * @returns {RulebookPanelComponent}
 */
export function createRulebookPanel(root = document) {
  return new RulebookPanelComponent(root);
}

