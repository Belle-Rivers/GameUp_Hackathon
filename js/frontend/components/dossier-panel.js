import { soundEngine } from '../audio.js';

/**
 * @typedef {Object} ReceiptItemData
 * @property {string} label Activity name.
 * @property {number} qty Quantity.
 * @property {string} unit Unit of measurement.
 * @property {string} [rateKey] Rulebook factor key.
 */

/**
 * @typedef {Object} ReceiptData
 * @property {string} type Category (ENERGY, GROCERY, TRAVEL, WASTE, etc.).
 * @property {string} title Receipt title.
 * @property {ReceiptItemData[]} items Activity records.
 */

/**
 * @typedef {Object} CitizenDossierData
 * @property {string} id Unique citizen case id (e.g. 'CIT-101' or 'C001').
 * @property {string} name Citizen full name.
 * @property {string} district District location.
 * @property {string} [roofType] Roof type ('ASPHALT' or 'OTHER').
 * @property {string} note Personal statement or plea.
 * @property {number} declaredCO2 Declared footprint in kg CO2.
 * @property {ReceiptData[]} [receipts] Submitted activity receipts.
 */

/**
 * Escapes HTML characters for security.
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
 * Formats emission values with 1 decimal place.
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
 * Renders HTML for a single receipt item row.
 * Clicking a receipt item row can optionally emit an item selection event.
 *
 * @param {ReceiptItemData} item
 * @param {number} receiptIndex
 * @param {number} itemIndex
 * @returns {string}
 */
export function renderReceiptItem(item, receiptIndex = 0, itemIndex = 0) {
  const qtyStr = typeof item.qty === 'number' ? `${item.qty} ${item.unit || ''}`.trim() : String(item.qty);
  const rateKeyAttr = item.rateKey ? ` data-rate-key="${escapeHtml(item.rateKey)}"` : '';
  const iconMap = {
    GRID_ELEC: 'electric_meter', GAS_HEAT: 'local_fire_department', BEEF: 'restaurant',
    LOCAL_FOOD: 'eco', IMPORTED_GOODS: 'inventory_2', FLIGHT: 'flight',
    GASOLINE: 'local_gas_station', PUBLIC_TRANSIT: 'directions_bus', LANDFILL: 'delete_sweep',
    COMPOST: 'compost', SOLAR_OFFSET: 'solar_power', AC_COOLING: 'ac_unit',
  };
  const iconName = iconMap[String(item.rateKey || '').toUpperCase()] || 'data_usage';

  return `
    <div class="receipt-item-row" data-receipt-index="${receiptIndex}" data-item-index="${itemIndex}"${rateKeyAttr} tabindex="0" role="button" aria-label="Calculate ${escapeHtml(item.label)}">
      <span class="item-label"><span class="item-icon material-symbols-outlined" aria-hidden="true">${iconName}</span>${escapeHtml(item.label)}</span>
      <span class="item-qty font-mono">${escapeHtml(qtyStr)}</span>
    </div>
  `.trim();
}

/**
 * Renders HTML for a single receipt card.
 *
 * @param {ReceiptData} receipt
 * @param {number} receiptIndex
 * @returns {string}
 */
export function renderReceiptCard(receipt, receiptIndex = 0) {
  const itemsHtml = (receipt.items || [])
    .map((item, idx) => renderReceiptItem(item, receiptIndex, idx))
    .join('\n');

  const type = String(receipt.type || '').toUpperCase();
  const iconMap = {
    ENERGY: 'electric_meter', HEATING: 'local_fire_department', GAS: 'local_fire_department',
    GROCERY: 'shopping_basket', FOOD: 'shopping_basket', TRAVEL: 'flight', FLIGHT: 'flight',
    COMMUTE: 'local_gas_station', WASTE: 'delete_sweep', COOLING: 'ac_unit',
  };
  const iconName = iconMap[type] || 'receipt_long';
  const legacyAssetHint = type === 'ENERGY' ? ' data-legacy-asset="assets/Electric_Meter.png"' : '';
  const iconImg = `<span class="receipt-category-icon material-symbols-outlined" aria-hidden="true"${legacyAssetHint}>${iconName}</span>`;

  return `
    <div class="receipt-card receipt-card--${escapeHtml(type.toLowerCase())}" data-receipt-type="${escapeHtml(receipt.type || '')}">
      <div class="receipt-header">
        <div class="receipt-title-wrap">
          ${iconImg}
          <span class="receipt-title font-mono">${escapeHtml(receipt.title || 'Receipt Record')}</span>
        </div>
        <span class="badge badge-subtle font-mono">${escapeHtml(receipt.type || 'MISC')}</span>
      </div>
      <div class="receipt-items">
        ${itemsHtml}
      </div>
    </div>
  `.trim();
}

/**
 * DossierPanelComponent manages the center workspace column:
 * citizen identity, roof type, district, personal note, declared CO2,
 * and the stack of submitted receipts.
 */
export class DossierPanelComponent {
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
    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    return {
      panel: q('#dossier-panel'),
      content: q('#dossier-content'),
      paper: q('#dossier-panel .dossier-paper'),
      name: q('#dossier-citizen-name'),
      id: q('#dossier-citizen-id'),
      district: q('#dossier-district'),
      roof: q('#dossier-roof'),
      declared: q('#dossier-declared'),
      note: q('#dossier-note'),
      receiptsContainer: q('#dossier-receipts-container'),
    };
  }

  _attachEvents() {
    // P5B-04: Allow clicking dossier during intake to immediately complete/settle animation
    if (this.elements.panel) {
      this.elements.panel.addEventListener('click', () => {
        this.skipIntakeAnimation();
      });
    }

    if (!this.elements.receiptsContainer) return;
    this.elements.receiptsContainer.addEventListener('click', (e) => {
      const row = e.target.closest?.('.receipt-item-row');
      if (!row) return;

      const rIndex = parseInt(row.getAttribute('data-receipt-index') || '0', 10);
      const iIndex = parseInt(row.getAttribute('data-item-index') || '0', 10);

      const item = this.currentCase?.receipts?.[rIndex]?.items?.[iIndex] || null;
      if (this.options.onItemClick) {
        this.options.onItemClick({ receiptIndex: rIndex, itemIndex: iIndex, item });
      }
    });

    // Keyboard accessibility: Enter or Space triggers click
    this.elements.receiptsContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const row = e.target.closest?.('.receipt-item-row');
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
    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    const paper = this.elements.paper || q('.dossier-paper');
    const receipts = this.elements.receiptsContainer;
    const panel = this.elements.panel || q('#dossier-panel');
    const idEl = this.elements.id;
    const nameEl = this.elements.name;

    const animClasses = [
      'dossier-exit-approve',
      'dossier-exit-fine',
      'dossier-exit-grant',
      'dossier-intake-anim',
      'dossier-settled',
    ];

    if (paper?.classList) {
      animClasses.forEach((cls) => paper.classList.remove(cls));
    }
    if (receipts?.classList) {
      animClasses.forEach((cls) => receipts.classList.remove(cls));
    }
    if (panel?.classList) {
      panel.classList.remove('resolution-flash--fine', 'resolution-shimmer--grant');
    }
    if (idEl?.classList) {
      idEl.classList.remove('reveal-hidden', 'reveal-id-stamp');
    }
    if (nameEl?.classList) {
      nameEl.classList.remove('reveal-hidden', 'reveal-name-in');
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
      // Audio engine fallback
    }

    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    const paper = this.elements.paper || q('.dossier-paper');
    const receipts = this.elements.receiptsContainer;
    const idEl = this.elements.id;
    const nameEl = this.elements.name;

    if (idEl?.classList) {
      idEl.classList.add('reveal-hidden');
    }
    if (nameEl?.classList) {
      nameEl.classList.add('reveal-hidden');
    }

    if (paper?.classList) paper.classList.add('dossier-intake-anim');
    if (receipts?.classList) receipts.classList.add('dossier-intake-anim');

    return new Promise((resolve) => {
      let isSettled = false;
      const timers = [];

      const complete = () => {
        if (isSettled) return;
        isSettled = true;
        timers.forEach((t) => clearTimeout(t));

        if (paper?.classList) {
          paper.classList.remove('dossier-intake-anim');
          paper.classList.add('dossier-settled');
        }
        if (receipts?.classList) {
          receipts.classList.remove('dossier-intake-anim');
        }
        if (idEl?.classList) {
          idEl.classList.remove('reveal-hidden');
          idEl.classList.add('reveal-id-stamp');
        }
        if (nameEl?.classList) {
          nameEl.classList.remove('reveal-hidden');
          nameEl.classList.add('reveal-name-in');
        }

        this._activeIntakeComplete = null;
        resolve();
      };

      this._activeIntakeComplete = complete;

      // Sequential reveals: ID first (~45%), then Name (~70%)
      timers.push(setTimeout(() => {
        if (idEl?.classList) {
          idEl.classList.remove('reveal-hidden');
          idEl.classList.add('reveal-id-stamp');
        }
      }, Math.round(duration * 0.45)));

      timers.push(setTimeout(() => {
        if (nameEl?.classList) {
          nameEl.classList.remove('reveal-hidden');
          nameEl.classList.add('reveal-name-in');
        }
      }, Math.round(duration * 0.70)));

      // Final complete fallback
      timers.push(setTimeout(complete, duration));
    });
  }

  /**
   * Immediately finishes any in-progress intake animation, snapping to settled state.
   */
  skipIntakeAnimation() {
    if (typeof this._activeIntakeComplete === 'function') {
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

    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    const paper = this.elements.paper || q('.dossier-paper');
    const receipts = this.elements.receiptsContainer;
    const panel = this.elements.panel || q('#dossier-panel');

    const actionUpper = String(action || '').toUpperCase();
    let exitClass = 'dossier-exit-approve';
    let flashClass = '';

    if (actionUpper === 'FINE') {
      exitClass = 'dossier-exit-fine';
      flashClass = 'resolution-flash--fine';
    } else if (actionUpper === 'GRANT') {
      exitClass = 'dossier-exit-grant';
      flashClass = 'resolution-shimmer--grant';
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
      this.elements.name.textContent = citizenCase.name || 'Unknown Citizen';
    }
    if (this.elements.id) {
      this.elements.id.textContent = citizenCase.id || '';
    }
    if (this.elements.district) {
      this.elements.district.textContent = citizenCase.district || 'Antalya Municipal Area';
    }
    if (this.elements.roof) {
      this.elements.roof.textContent = citizenCase.roofType || 'ASPHALT';
    }
    if (this.elements.declared) {
      this.elements.declared.textContent = formatCO2(citizenCase.declaredCO2 ?? 0);
    }
    if (this.elements.note) {
      this.elements.note.textContent = citizenCase.note ? `"${citizenCase.note}"` : 'No statement provided.';
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

    this.elements.receiptsContainer.innerHTML = receipts
      .map((receipt, idx) => renderReceiptCard(receipt, idx))
      .join('\n');
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
}

/**
 * Factory for DossierPanelComponent.
 *
 * @param {HTMLElement|Document} [root]
 * @param {Object} [options]
 * @returns {DossierPanelComponent}
 */
export function createDossierPanel(root = document, options = {}) {
  return new DossierPanelComponent(root, options);
}

