/**
 * @file day-intro-modal.js
 * Day Introduction Modal — Subphase 4B (P4-09).
 *
 * Displays an operational briefing introducing the day's objectives, time limit,
 * citizen case quota, active grants, and new mechanics before the shift begins.
 */

/**
 * @typedef {Object} DayIntroData
 * @property {number} day Day number (1, 2, or 3).
 * @property {string} title Narrative title of the shift.
 * @property {string} description Overview of shift complexity and mechanics.
 * @property {number} caseCount Number of citizen cases to audit.
 * @property {number} timeLimitSeconds Time limit for the shift in seconds.
 * @property {string[]} mechanics Key mechanics introduced or active in the day.
 * @property {Array<{id: string, name: string}>|string[]} [availableGrants] Mitigation grants available.
 */

/**
 * @typedef {Object} DayIntroModalOptions
 * @property {() => void} [onStartShift] Callback when player starts/acknowledges the shift.
 */

/**
 * DayIntroModalComponent manages the day introduction briefing modal dialog (#day-intro-modal).
 */
export class DayIntroModalComponent {
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
    return this.root && typeof this.root.querySelector === 'function'
      ? this.root.querySelector(sel)
      : null;
  }

  _queryElements() {
    return {
      modal: this._query('#day-intro-modal'),
      badge: this._query('#day-intro-badge'),
      title: this._query('#day-intro-title'),
      description: this._query('#day-intro-description'),
      cases: this._query('#day-intro-cases'),
      time: this._query('#day-intro-time'),
      mechanicsList: this._query('#day-intro-mechanics'),
      btnStartShift: this._query('#btn-start-shift'),
    };
  }

  _attachEvents() {
    if (this.elements.btnStartShift) {
      this.elements.btnStartShift.addEventListener('click', (event) => {
        this.close();
        if (typeof this.options.onStartShift === 'function') {
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
    const description = data.description || '';
    const caseCount = data.caseCount ?? data.cases ?? 5;
    const timeLimit = data.timeLimitSeconds ?? data.shiftDuration ?? 120;
    const mechanics = Array.isArray(data.mechanics) ? data.mechanics : [];

    if (this.elements.badge) {
      this.elements.badge.textContent = `OPERATIONAL BRIEFING • DAY ${day} OF 3`;
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
      this.elements.mechanicsList.innerHTML = mechanics
        .map((m) => `<li>${this._escapeHtml(m)}</li>`)
        .join('');
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
      if (typeof this.elements.modal.removeAttribute === 'function') {
        this.elements.modal.removeAttribute('hidden');
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
      if (typeof this.elements.modal.setAttribute === 'function') {
        this.elements.modal.setAttribute('hidden', '');
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
    const hasHiddenAttr = typeof this.elements.modal.hasAttribute === 'function'
      ? this.elements.modal.hasAttribute('hidden')
      : Boolean(this.elements.modal.hidden);
    return !hasHiddenAttr && !this.elements.modal.hidden;
  }

  _escapeHtml(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

/**
 * Factory for DayIntroModalComponent.
 *
 * @param {HTMLElement|Document} [root]
 * @param {DayIntroModalOptions} [options]
 * @returns {DayIntroModalComponent}
 */
export function createDayIntroModal(root = document, options = {}) {
  return new DayIntroModalComponent(root, options);
}

