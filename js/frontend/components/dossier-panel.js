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

  return `
    <div class="receipt-item-row" data-receipt-index="${receiptIndex}" data-item-index="${itemIndex}"${rateKeyAttr} tabindex="0" role="button" aria-label="Calculate ${escapeHtml(item.label)}">
      <span class="item-label">${escapeHtml(item.label)}</span>
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
    ENERGY: 'assets/Electric_Meter.png',
    HEATING: 'assets/NaturalGas_Heater.png',
    GAS: 'assets/NaturalGas_Heater.png',
    GROCERY: 'assets/LocalFruits.png',
    FOOD: 'assets/LocalFruits.png',
    TRAVEL: 'assets/plane.png',
    FLIGHT: 'assets/plane.png',
    COMMUTE: 'assets/petrol.png',
    WASTE: 'assets/garbage.png',
  };
  const iconSrc = iconMap[type] || '';
  const iconImg = iconSrc ? `<img src="${iconSrc}" alt="" class="receipt-category-icon" aria-hidden="true" />` : '';

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
   * Loads and renders a citizen case dossier.
   *
   * @param {CitizenDossierData} citizenCase
   */
  loadCitizen(citizenCase) {
    if (!citizenCase) return;
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

