/**
 * @typedef {Object} TapeEntry
 * @property {string} label Description of activity or quantity added.
 * @property {number} co2 Emission contribution calculated.
 * @property {string} [unit] Measurement unit.
 * @property {number} [qty] Quantity.
 */

/**
 * Basic HTML escaping helper.
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
 * Formats CO2 with 1 decimal place.
 *
 * @param {number} val
 * @returns {string}
 */
export function formatCO2(val) {
  if (typeof val !== 'number' || !Number.isFinite(val)) {
    return '0.0 kg CO₂';
  }
  return `${val.toFixed(1)} kg CO₂`;
}

/**
 * CalculatorPanelComponent manages the interactive scratchpad calculator.
 * Note: Per architecture rules, the frontend scratchpad does not invent its own
 * emission rates — it displays tape entries and calculated totals supplied by
 * user additions or backend breakdowns.
 */
export class CalculatorPanelComponent {
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
    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    return {
      display: q('#calc-display'),
      tape: q('#calc-tape'),
      btnClear: q('#btn-calc-clear'),
    };
  }

  _attachEvents() {
    if (this.elements.btnClear) {
      this.elements.btnClear.addEventListener('click', () => {
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
    if (!entry || typeof entry.co2 !== 'number' || !Number.isFinite(entry.co2)) {
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
      this.elements.display.textContent = formatCO2(this.total);
    }

    if (this.elements.tape) {
      if (this.entries.length === 0) {
        this.elements.tape.innerHTML = `
          <span class="tape-placeholder text-muted">Click receipt items to calculate footprint.</span>
        `.trim();
        return;
      }

      const rows = this.entries.map((entry) => {
        const sign = entry.co2 >= 0 ? '+' : '';
        const qtyPrefix = entry.qty !== undefined && entry.unit ? `[${entry.qty} ${entry.unit}] ` : '';
        const co2Str = `${sign}${entry.co2.toFixed(1)} kg`;
        return `
          <div class="tape-entry font-mono" style="display:flex; justify-content:space-between; font-size:var(--text-xs); margin-bottom:2px;">
            <span class="tape-label">${escapeHtml(qtyPrefix)}${escapeHtml(entry.label)}</span>
            <span class="tape-value ${entry.co2 < 0 ? 'text-success' : ''}">${escapeHtml(co2Str)}</span>
          </div>
        `.trim();
      });

      this.elements.tape.innerHTML = rows.join('\n');
    }
  }
}

/**
 * Factory for CalculatorPanelComponent.
 *
 * @param {HTMLElement|Document} [root]
 * @param {Object} [options]
 * @returns {CalculatorPanelComponent}
 */
export function createCalculatorPanel(root = document, options = {}) {
  return new CalculatorPanelComponent(root, options);
}

