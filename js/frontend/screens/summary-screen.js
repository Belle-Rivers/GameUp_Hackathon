import { soundEngine } from '../audio.js';

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
 * @property {boolean} [reducedMotion] Whether animations should complete immediately.
 */

/**
 * SummaryModalComponent manages the end-of-shift performance dialog (#summary-modal).
 * P5B-09: Presents physical SHIFT REPORT document landing on the desk, progressive
 * data reveal, official approval seal animation, and smooth shift advance.
 */
export class SummaryModalComponent {
  /**
   * @param {HTMLElement|Document} [root=document] Root DOM node containing summary-modal.
   * @param {SummaryModalOptions} [options]
   */
  constructor(root = document, options = {}) {
    this.root = root;
    this.options = options;
    this._stampTimer = null;
    this.elements = this._queryElements();
    this._attachEvents();
  }

  _queryElements() {
    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    return {
      modal: q('#summary-modal'),
      documentCard: q('.shift-report-document') || q('.modal-card'),
      sealWrap: q('.shift-report-seal-wrap'),
      stampGraphic: q('.shift-report-stamp-graphic-wrap'),
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
        soundEngine.playPaper();
        if (typeof this.options.onProceed === 'function') {
          this.options.onProceed(event);
        }
      });
    }

    // Clicking document skips progressive reveal and stamp delay
    if (this.elements.documentCard) {
      this.elements.documentCard.addEventListener('click', () => {
        this.skipAnimation();
      });
    }
  }

  _isReducedMotion() {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (_) {
        return false;
      }
    }
    return false;
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
   * Opens the summary modal and populates shift statistics with physical landing.
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
      this.elements.modal.classList?.add('shift-report-active');
    }

    soundEngine.playPaper();

    const isReduced = this.options.reducedMotion || this._isReducedMotion();
    if (this.elements.documentCard?.classList) {
      if (isReduced) {
        this.elements.documentCard.classList.remove('document-landing-anim');
      } else {
        this.elements.documentCard.classList.add('document-landing-anim');
      }
    }

    // Progressive stamp seal slam
    if (this.elements.stampGraphic) {
      if (isReduced) {
        this.elements.stampGraphic.classList?.add('stamp-visible');
      } else {
        this.elements.stampGraphic.classList?.remove('stamp-visible');
        if (this._stampTimer) clearTimeout(this._stampTimer);
        this._stampTimer = setTimeout(() => {
          this.elements.stampGraphic?.classList?.add('stamp-visible');
          soundEngine.playStamp('APPROVE');
        }, 450);
      }
    }
  }

  /**
   * Immediately skips document reveal animations to completed resting state.
   */
  skipAnimation() {
    if (this._stampTimer) {
      clearTimeout(this._stampTimer);
      this._stampTimer = null;
    }
    if (this.elements.documentCard?.classList) {
      this.elements.documentCard.classList.remove('document-landing-anim');
    }
    if (this.elements.stampGraphic?.classList) {
      this.elements.stampGraphic.classList.add('stamp-visible');
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
    if (this._stampTimer) {
      clearTimeout(this._stampTimer);
      this._stampTimer = null;
    }
    if (this.elements.modal) {
      if (typeof this.elements.modal.setAttribute === 'function') {
        this.elements.modal.setAttribute('hidden', '');
      }
      this.elements.modal.hidden = true;
      this.elements.modal.classList?.remove('shift-report-active');
    }
    if (this.elements.documentCard?.classList) {
      this.elements.documentCard.classList.remove('document-landing-anim');
    }
    if (this.elements.stampGraphic?.classList) {
      this.elements.stampGraphic.classList.remove('stamp-visible');
    }
    if (typeof this.options.onClose === 'function') {
      this.options.onClose();
    }
  }

  hide() {
    this.close();
  }

  /**
   * Checks whether the summary modal is currently open.
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

  isVisible() {
    return this.isOpen();
  }
}

export const SummaryModal = SummaryModalComponent;

/**
 * Factory for creating a SummaryModalComponent instance.
 *
 * @param {HTMLElement|Document} [root]
 * @param {SummaryModalOptions} [options]
 * @returns {SummaryModalComponent}
 */
export function createSummaryModal(root = document, options = {}) {
  return new SummaryModalComponent(root, options);
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

