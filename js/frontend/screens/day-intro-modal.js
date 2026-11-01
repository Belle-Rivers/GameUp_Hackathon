import { soundEngine } from '../audio.js';
import { SCENE_NAMES } from '../scene-director.js';

/**
 * @file day-intro-modal.js
 * Day Introduction Modal — Subphase 4B (P4-09) & Phase 5B Day Briefing Scene (P5B-03).
 *
 * Displays an operational briefing introducing the day's objectives, time limit,
 * citizen case quota, active grants, and new mechanics before the shift begins.
 * Includes office lighting reflecting time-of-day, sliding quota card, and
 * cancellable typewriter briefing text.
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
 * @property {boolean} [reducedMotion] Whether animations should complete immediately.
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
    this._typewriterTimer = null;
    this._fullDescription = '';
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
      card: this._query('.briefing-scene-card') || this._query('.modal-card'),
      timeOfDay: this._query('#day-intro-time-of-day'),
      badge: this._query('#day-intro-badge'),
      title: this._query('#day-intro-title'),
      description: this._query('#day-intro-description'),
      cases: this._query('#day-intro-cases'),
      time: this._query('#day-intro-time'),
      statsGrid: this._query('.intro-stats-grid'),
      mechanicsList: this._query('#day-intro-mechanics'),
      btnStartShift: this._query('#btn-start-shift'),
    };
  }

  _attachEvents() {
    if (this.elements.btnStartShift) {
      this.elements.btnStartShift.addEventListener('click', (event) => {
        soundEngine.playDayBell();
        this.skipTypewriter();
        if (typeof this.options.onStartShift === 'function') {
          this.options.onStartShift(event);
        }
      });
    }

    // Clicking the briefing card skips typewriter text
    if (this.elements.card) {
      this.elements.card.addEventListener('click', () => {
        this.skipTypewriter();
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
   * P5B-03: Registers the DAY_BRIEF scene with Agent A's SceneDirector.
   *
   * @param {import('../scene-director.js').SceneDirector} sceneDirector
   */
  registerWithSceneDirector(sceneDirector) {
    if (!sceneDirector || typeof sceneDirector.registerScene !== 'function') return;

    sceneDirector.registerScene(SCENE_NAMES.DAY_BRIEF, {
      enter: (data, context) => {
        const introData = data?.dayConfig || data;
        if (introData && introData.description) {
          this.open(introData);
        } else if (!this.isOpen()) {
          this.open();
        } else {
          this._animateEnter();
        }
        if (context?.reducedMotion) {
          this.snapToSettled();
        }
      },
      exit: () => this.close(),
      skip: () => this.snapToSettled(),
      duration: 400,
    });
  }

  /**
   * Replays the briefing card entrance without reopening or re-rendering.
   *
   * @private
   */
  _animateEnter() {
    if (!this.elements.card?.classList) return;
    this.elements.card.classList.remove('briefing-card-enter');
    void (this.elements.card.offsetWidth || 0);
    this.elements.card.classList.add('briefing-card-enter');
    if (this._fullDescription && !this.options.reducedMotion && !this._isReducedMotion() && typeof window !== 'undefined') {
      this._startTypewriter(this._fullDescription);
    }
  }

  /**
   * Renders the day intro modal with configuration data and time-of-day lighting.
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

    this._fullDescription = description;

    // P5B-03: Office lighting reflecting time of day
    if (this.elements.modal) {
      this.elements.modal.setAttribute('data-briefing-day', String(day));
    }

    if (this.elements.timeOfDay) {
      const times = {
        1: '08:00 EEST • MORNING BRIEFING',
        2: '13:00 EEST • MIDDAY SOLAR PEAK',
        3: '17:30 EEST • FINAL DUSK QUOTA',
      };
      this.elements.timeOfDay.textContent = times[day] || `DAY ${day} BRIEFING`;
    }

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
   * Starts progressive typewriter reveal of the briefing text.
   *
   * @param {string} text
   * @private
   */
  _startTypewriter(text) {
    this._clearTypewriter();
    if (!this.elements.description || !text) return;

    this.elements.description.textContent = '';
    let idx = 0;
    const speed = 14; // ms per char

    this._typewriterTimer = setInterval(() => {
      if (idx < text.length) {
        this.elements.description.textContent += text[idx];
        idx++;
        if (idx % 6 === 0) {
          soundEngine.playTypewriter();
        }
      } else {
        this._clearTypewriter();
      }
    }, speed);
  }

  /**
   * Cancels any active typewriter timer.
   * @private
   */
  _clearTypewriter() {
    if (this._typewriterTimer) {
      clearInterval(this._typewriterTimer);
      this._typewriterTimer = null;
    }
  }

  /**
   * Instantly snaps typewriter text to full content.
   */
  skipTypewriter() {
    this._clearTypewriter();
    if (this.elements.description && this._fullDescription) {
      this.elements.description.textContent = this._fullDescription;
    }
  }

  /**
   * Opens the day intro modal with data and sliding animations.
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
      this.elements.modal.classList?.add('briefing-active');
      this.elements.card?.classList?.add('briefing-card-enter');
    }
    soundEngine.playDrawer();

    if (this._fullDescription && !this.options.reducedMotion && !this._isReducedMotion() && typeof window !== 'undefined') {
      this._startTypewriter(this._fullDescription);
    }
  }

  show(data) {
    this.open(data);
  }

  /**
   * Closes the day intro modal.
   */
  close() {
    this._clearTypewriter();
    if (this.elements.modal) {
      if (typeof this.elements.modal.setAttribute === 'function') {
        this.elements.modal.setAttribute('hidden', '');
      }
      this.elements.modal.hidden = true;
      this.elements.modal.classList?.remove('briefing-active');
      this.elements.card?.classList?.remove('briefing-card-enter');
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

  isVisible() {
    return this.isOpen();
  }

  /**
   * Snaps briefing visual presentation to settled state.
   */
  snapToSettled() {
    this.skipTypewriter();
    if (this.elements.card?.classList) {
      this.elements.card.classList.remove('briefing-card-enter');
    }
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
