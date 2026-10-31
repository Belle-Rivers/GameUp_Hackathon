/**
 * @typedef {Object} GrantOption
 * @property {string} id Unique grant ID (e.g. 'HEAT_PUMP').
 * @property {string} name Grant display name.
 * @property {number} cost Grant cost in USD.
 * @property {number} netZeroBoost Net-Zero boost in percentage points.
 * @property {string} [futureImpact] Future impact description.
 */

/**
 * Standard municipal grant catalog per GAME_RULES.md / PRD.
 *
 * @type {GrantOption[]}
 */
export const DEFAULT_GRANTS = [
  {
    id: 'HEAT_PUMP',
    name: 'Heat Pump Conversion',
    cost: 400,
    netZeroBoost: 10,
    futureImpact: '75% reduction in heating-related CO₂.',
  },
  {
    id: 'COMPOST_KIT',
    name: 'Urban Compost Kit',
    cost: 150,
    netZeroBoost: 8,
    futureImpact: '90% reduction in methane-related CO₂e.',
  },
  {
    id: 'TRANSIT_PASS',
    name: 'Annual Green Transit Pass',
    cost: 200,
    netZeroBoost: 7,
    futureImpact: 'Zeroes commute emissions.',
  },
  {
    id: 'COOL_ROOF',
    name: 'Cool/Green Roof Permit',
    cost: 300,
    netZeroBoost: 9,
    futureImpact: '40% reduction in cooling-related electricity consumption.',
  },
];

/**
 * Escapes HTML characters.
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
 * Formats grant option label (e.g. "Heat Pump Conversion ($400 | +10% Net-Zero)").
 *
 * @param {GrantOption} grant
 * @returns {string}
 */
export function formatGrantLabel(grant) {
  return `${grant.name} ($${grant.cost} | +${grant.netZeroBoost}% Net-Zero)`;
}

/**
 * ActionPanelComponent manages the right column workspace:
 * - Assessment ledger comparison (Audited, Declared, Variance)
 * - Grant selector dropdown
 * - Stamp action dock buttons (APPROVE, FINE, GRANT)
 * - Action panel status indicator
 */
export class ActionPanelComponent {
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
    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    return {
      status: q('#action-panel-status'),
      auditedVal: q('#summary-audited-val'),
      declaredVal: q('#summary-declared-val'),
      varianceVal: q('#summary-variance-val'),
      varianceRow: q('.variance-row'),
      grantSelect: q('#grant-select'),
      btnApprove: q('#btn-action-approve'),
      btnFine: q('#btn-action-fine'),
      btnGrant: q('#btn-action-grant'),
    };
  }

  _attachEvents() {
    if (this.elements.btnApprove) {
      this.elements.btnApprove.addEventListener('click', () => {
        if (this.options.onApprove) this.options.onApprove();
      });
    }

    if (this.elements.btnFine) {
      this.elements.btnFine.addEventListener('click', () => {
        if (this.options.onFine) this.options.onFine();
      });
    }

    if (this.elements.btnGrant) {
      this.elements.btnGrant.addEventListener('click', () => {
        const selected = this.getSelectedGrant();
        if (this.options.onGrant) this.options.onGrant(selected);
      });
    }

    if (this.elements.grantSelect) {
      this.elements.grantSelect.addEventListener('change', (e) => {
        const val = e.target?.value || '';
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
      return `<option value="${escapeHtml(g.id)}">${escapeHtml(label)}</option>`;
    }).join('\n');

    this.elements.grantSelect.innerHTML = `${defaultOption}\n${optionsHtml}`;
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
    return this.elements.grantSelect?.value || '';
  }

  /**
   * Sets the selected grant option by ID.
   *
   * @param {string} grantId
   */
  setSelectedGrant(grantId = '') {
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
      const sign = variance > 0 ? '+' : '';
      this.elements.varianceVal.textContent = `${sign}${variance.toFixed(1)} kg`;
    }

    if (this.elements.varianceRow) {
      this.elements.varianceRow.classList.remove('variance--positive', 'variance--negative', 'variance--zero');
      if (Math.abs(variance) <= 2.0) {
        this.elements.varianceRow.classList.add('variance--zero');
      } else if (variance > 0) {
        // Underdeclared by citizen -> Positive variance (actual > declared)
        this.elements.varianceRow.classList.add('variance--positive');
      } else {
        // Overdeclared by citizen -> Negative variance (actual < declared)
        this.elements.varianceRow.classList.add('variance--negative');
      }
    }
  }

  /**
   * Sets status indicator text in panel header.
   *
   * @param {string} statusText
   */
  setStatus(statusText = 'READY') {
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
}

/**
 * Factory for ActionPanelComponent.
 *
 * @param {HTMLElement|Document} [root]
 * @param {Object} [options]
 * @returns {ActionPanelComponent}
 */
export function createActionPanel(root = document, options = {}) {
  return new ActionPanelComponent(root, options);
}

