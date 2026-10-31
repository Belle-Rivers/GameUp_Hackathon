/**
 * Formats the audit accuracy percentage.
 *
 * @param {number} correctActions Number of correct actions.
 * @param {number} processedCount Total number of citizen cases processed.
 * @returns {string} E.g. "87.5%" or "0.0%"
 */
export function formatAccuracy(correctActions, processedCount) {
  if (typeof processedCount !== 'number' || processedCount <= 0) {
    return '0.0%';
  }
  const correct = typeof correctActions === 'number' && correctActions > 0 ? correctActions : 0;
  const pct = (correct / processedCount) * 100;
  return `${pct.toFixed(1)}%`;
}

/**
 * @typedef {Object} ShiftSummaryData
 * @property {number} [day] Current campaign day (e.g. 1).
 * @property {string} [title] Optional custom modal title.
 * @property {number} [processedCount] Cases processed in shift.
 * @property {number} [correctActions] Correctly audited actions.
 * @property {string|number} [accuracy] Accuracy percentage or ratio.
 * @property {string|number} [co2ReducedKg] CO2 corrected/reduced.
 * @property {number} [finesIssued] Valid fines issued.
 * @property {number} [grantsIssued] Valid grants awarded.
 */

/**
 * @typedef {Object} SummaryModalOptions
 * @property {() => void} [onProceed] Callback invoked when the user proceeds to the next shift.
 * @property {() => void} [onClose] Callback invoked when modal is dismissed.
 */

/**
 * SummaryModalComponent manages the end-of-shift performance dialog (#summary-modal).
 * It presents cases processed, audit accuracy, and CO2 corrected/mitigated.
 */
export class SummaryModalComponent {
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
    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    return {
      modal: q('#summary-modal'),
      title: q('#modal-shift-title'),
      content: q('#summary-modal-content'),
      casesProcessed: q('#modal-cases-processed'),
      accuracy: q('#modal-accuracy'),
      co2Reduced: q('#modal-co2-reduced'),
      finesIssued: q('#modal-fines-issued'),
      grantsIssued: q('#modal-grants-issued'),
      btnNextShift: q('#btn-next-shift'),
    };
  }

  _attachEvents() {
    if (this.elements.btnNextShift) {
      this.elements.btnNextShift.addEventListener('click', (event) => {
        if (typeof this.options.onProceed === 'function') {
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
    } else if (data.day !== undefined && this.elements.title) {
      this.elements.title.textContent = `DAY ${data.day} PERFORMANCE REPORT`;
    }

    if (this.elements.casesProcessed) {
      const count = data.processedCount ?? 0;
      this.elements.casesProcessed.textContent = String(count);
    }

    if (this.elements.accuracy) {
      if (typeof data.accuracy === 'string') {
        this.elements.accuracy.textContent = data.accuracy;
      } else if (typeof data.accuracy === 'number') {
        this.elements.accuracy.textContent = `${data.accuracy.toFixed(1)}%`;
      } else {
        const accuracyStr = formatAccuracy(data.correctActions ?? 0, data.processedCount ?? 0);
        this.elements.accuracy.textContent = accuracyStr;
      }
    }

    if (this.elements.co2Reduced) {
      if (typeof data.co2ReducedKg === 'string') {
        this.elements.co2Reduced.textContent = data.co2ReducedKg;
      } else if (typeof data.co2ReducedKg === 'number') {
        this.elements.co2Reduced.textContent = `${data.co2ReducedKg.toFixed(1)} kg`;
      } else {
        this.elements.co2Reduced.textContent = '0.0 kg';
      }
    }

    // P4-10 – Fines and grants issued in shift summary
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
      if (typeof this.elements.modal.removeAttribute === 'function') {
        this.elements.modal.removeAttribute('hidden');
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
      if (typeof this.elements.modal.setAttribute === 'function') {
        this.elements.modal.setAttribute('hidden', '');
      }
      this.elements.modal.hidden = true;
    }
    if (typeof this.options.onClose === 'function') {
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
    const hasHiddenAttr = typeof this.elements.modal.hasAttribute === 'function'
      ? this.elements.modal.hasAttribute('hidden')
      : Boolean(this.elements.modal.hidden);
    return !hasHiddenAttr && !this.elements.modal.hidden;
  }
}

export const SummaryScreen = SummaryModalComponent;

/**
 * Factory for SummaryModalComponent.
 *
 * @param {HTMLElement|Document} [root]
 * @param {SummaryModalOptions} [options]
 * @returns {SummaryModalComponent}
 */
export function createSummaryModal(root = document, options = {}) {
  return new SummaryModalComponent(root, options);
}

// Re-export GameOverScreenComponent for convenience
export {
  GameOverScreenComponent,
  GameOverScreen,
  createGameOverScreen,
  getFailureMessage,
} from './game-over-screen.js';

