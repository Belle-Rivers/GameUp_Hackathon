import { soundEngine } from '../audio.js';

/**
 * @typedef {Object} TopBarMetrics
 * @property {number} [netZero] Net-Zero progress percentage [0, 100].
 * @property {number} [budget] Municipal budget in USD.
 * @property {number} [trust] Public Trust percentage [0, 100].
 */

/**
 * @typedef {Object} TopBarData
 * @property {number} [day] Current campaign day (1, 2, 3).
 * @property {number} [maxDays] Total campaign days (e.g., 3).
 * @property {number} [currentCaseIndex] Index (0-based) of the current case.
 * @property {number} [totalCases] Total cases in the shift.
 * @property {number} [timeRemaining] Time remaining in seconds.
 * @property {TopBarMetrics} [metrics] Current municipal metrics.
 */

/**
 * Formats a budget number to standard currency display (e.g. $5,000, -$200).
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatBudget(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return '$0';
  }
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toLocaleString('en-US');
  return isNegative ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Formats seconds into MM:SS display (e.g., 120 -> "02:00").
 *
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTimer(totalSeconds) {
  if (typeof totalSeconds !== 'number' || !Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '00:00';
  }
  const total = Math.floor(totalSeconds);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * TopBarComponent manages the header status bar displaying day/case counters,
 * city meters (Net-Zero, Budget, Public Trust), and countdown timer.
 */
export class TopBarComponent {
  /**
   * @param {HTMLElement|Document} root Root DOM element containing top-bar elements.
   */
  constructor(root = document) {
    this.root = root;
    this._prevMetrics = { netZero: null, budget: null, trust: null };
    this._prevTimerSeconds = null;
    this.elements = this._queryElements();
    this._initAudioToggle();
    this._initTerminalToggle();
  }

  _queryElements() {
    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    return {
      dayBadge: q('#top-bar-day'),
      caseBadge: q('#top-bar-case'),
      netzeroContainer: q('#meter-netzero-container'),
      netzeroVal: q('#meter-netzero-val'),
      netzeroBar: q('#meter-netzero-bar'),
      budgetContainer: q('#meter-budget-container'),
      budgetVal: q('#meter-budget-val'),
      budgetBar: q('#meter-budget-bar'),
      trustContainer: q('#meter-trust-container'),
      trustVal: q('#meter-trust-val'),
      trustBar: q('#meter-trust-bar'),
      timerDisplay: q('#timer-display'),
      timerContainer: q('#timer-container'),
      btnAudioToggle: q('#btn-audio-toggle'),
      btnTerminalToggle: q('#btn-terminal-toggle'),
    };
  }

  _initAudioToggle() {
    if (!this.elements.btnAudioToggle) return;
    this._updateAudioIcon();
    this.elements.btnAudioToggle.addEventListener('click', () => {
      soundEngine.toggleMute();
      this._updateAudioIcon();
    });
  }

  _initTerminalToggle() {
    this._terminalMode = false;
    try {
      if (typeof localStorage !== 'undefined') {
        this._terminalMode = localStorage.getItem('gameup_terminal_mode') === 'true';
      }
    } catch (_) {
      this._terminalMode = false;
    }

    if (this._terminalMode) {
      this._applyTerminalMode(true);
    }

    if (this.elements.btnTerminalToggle) {
      this._updateTerminalButton();
      this.elements.btnTerminalToggle.addEventListener('click', () => {
        this.toggleTerminalMode();
      });
    }
  }

  /**
   * Toggles the CRT/terminal display mode on and off.
   *
   * @returns {boolean} New terminal mode state.
   */
  toggleTerminalMode() {
    this.setTerminalMode(!this._terminalMode);
    return this._terminalMode;
  }

  /**
   * Sets CRT/terminal mode state.
   *
   * @param {boolean} enabled
   */
  setTerminalMode(enabled) {
    this._terminalMode = Boolean(enabled);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('gameup_terminal_mode', this._terminalMode ? 'true' : 'false');
      }
    } catch (_) {
      // Ignored if storage unavailable
    }
    this._applyTerminalMode(this._terminalMode);
    this._updateTerminalButton();
  }

  /**
   * Returns whether terminal mode is active.
   *
   * @returns {boolean}
   */
  isTerminalMode() {
    return this._terminalMode;
  }

  _applyTerminalMode(enabled) {
    const target = (typeof document !== 'undefined' && document.body) ? document.body : (this.root?.body || this.root);
    if (target?.classList) {
      if (enabled) {
        target.classList.add('terminal-mode');
      } else {
        target.classList.remove('terminal-mode');
      }
    }
  }

  _updateTerminalButton() {
    if (!this.elements.btnTerminalToggle) return;
    const btn = this.elements.btnTerminalToggle;
    if (this._terminalMode) {
      btn.classList.add('terminal-active');
      btn.setAttribute('aria-label', 'Disable CRT Terminal Mode');
      btn.setAttribute('title', 'CRT Mode: Active (Click to Disable)');
    } else {
      btn.classList.remove('terminal-active');
      btn.setAttribute('aria-label', 'Enable CRT Terminal Mode');
      btn.setAttribute('title', 'CRT Mode: Off (Click to Enable)');
    }
  }

  _updateAudioIcon() {
    if (!this.elements.btnAudioToggle) return;
    const isMuted = soundEngine.isMuted();
    const iconSpan = this.elements.btnAudioToggle.querySelector?.('.audio-icon') || this.elements.btnAudioToggle;
    iconSpan.textContent = isMuted ? '🔇' : '🔊';
    this.elements.btnAudioToggle.setAttribute('aria-label', isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects');
    this.elements.btnAudioToggle.setAttribute('title', isMuted ? 'Sound: Muted (Click to Unmute)' : 'Sound: Active (Click to Mute)');
  }

  /**
   * Updates the top bar display with new state data.
   *
   * @param {TopBarData} data
   */
  update(data = {}) {
    if (!data) return;

    // Day badge: "DAY 1 OF 3"
    if (this.elements.dayBadge && (data.day !== undefined || data.maxDays !== undefined)) {
      const day = data.day ?? 1;
      const maxDays = data.maxDays ?? 3;
      this.elements.dayBadge.textContent = `DAY ${day} OF ${maxDays}`;
    }

    // Case badge: "CASE 1/8"
    if (this.elements.caseBadge && (data.currentCaseIndex !== undefined || data.totalCases !== undefined)) {
      const caseNum = (data.currentCaseIndex !== undefined) ? data.currentCaseIndex + 1 : 1;
      const total = data.totalCases ?? 1;
      this.elements.caseBadge.textContent = `CASE ${caseNum}/${total}`;
    }

    // Metrics
    if (data.metrics) {
      this.setMetrics(data.metrics);
    }

    // Timer
    if (data.timeRemaining !== undefined) {
      this.setTimer(data.timeRemaining);
    }
  }

  /**
   * P5B-07: Triggers expressive feedback (bounce animation & floating delta chip)
   * when a metric changes.
   *
   * @param {'netZero'|'budget'|'trust'} type
   * @param {number} delta
   * @param {HTMLElement|null} container
   * @param {HTMLElement|null} valEl
   * @private
   */
  _triggerMetricFeedback(type, delta, container, valEl) {
    if (!delta || delta === 0) return;
    const isPos = delta > 0;
    const bounceCls = isPos ? 'metric-bounce-up' : 'metric-bounce-down';

    // 1. Value / container bounce
    if (valEl?.classList) {
      valEl.classList.remove('metric-bounce-up', 'metric-bounce-down');
      void (valEl.offsetWidth || 0); // trigger reflow
      valEl.classList.add(bounceCls);
      setTimeout(() => {
        valEl.classList?.remove(bounceCls);
      }, 450);
    }

    // 2. Floating delta chip
    if (container && typeof container.appendChild === 'function' && !this._isReducedMotion()) {
      const doc = typeof document !== 'undefined'
        ? document
        : (this.root && typeof this.root.createElement === 'function' ? this.root : this.root?.ownerDocument);
      if (doc && typeof doc.createElement === 'function') {
        const chip = doc.createElement('span');
        chip.className = `floating-delta-chip ${isPos ? 'delta-pos' : 'delta-neg'}`;

        let text = '';
        if (type === 'budget') {
          const sign = isPos ? '+' : '-';
          text = `${sign}$${Math.round(Math.abs(delta))}`;
        } else {
          const sign = isPos ? '+' : '';
          text = `${sign}${delta.toFixed(1)}%`;
        }
        chip.textContent = text;
        container.appendChild(chip);

        setTimeout(() => {
          if (typeof chip.remove === 'function') {
            chip.remove();
          } else if (chip.parentNode) {
            chip.parentNode.removeChild(chip);
          }
        }, 750);
      }
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
   * Sets city metrics values and progress bar widths.
   *
   * @param {TopBarMetrics} metrics
   * @param {{netZero?: number, budget?: number, trust?: number}|null} [changes]
   *   Optional backend-supplied metric deltas used for floating HUD feedback.
   *   When omitted, values update silently (e.g. initial render or day change).
   */
  setMetrics(metrics = {}, changes = null) {
    if (metrics.netZero !== undefined) {
      const netZeroClamped = Math.max(0, Math.min(100, Math.round(metrics.netZero)));
      if (changes && typeof changes.netZero === 'number' && changes.netZero !== 0) {
        this._triggerMetricFeedback('netZero', changes.netZero, this.elements.netzeroContainer, this.elements.netzeroVal);
      }
      this._prevMetrics.netZero = netZeroClamped;

      if (this.elements.netzeroVal) {
        this.elements.netzeroVal.textContent = `${netZeroClamped}%`;
      }
      if (this.elements.netzeroBar) {
        this.elements.netzeroBar.style.width = `${netZeroClamped}%`;
        const track = this.elements.netzeroBar.closest?.('.meter-track');
        if (track) track.setAttribute('aria-valuenow', String(netZeroClamped));
      }
    }

    if (metrics.budget !== undefined) {
      const currentBudget = Math.round(metrics.budget);
      if (changes && typeof changes.budget === 'number' && changes.budget !== 0) {
        this._triggerMetricFeedback('budget', changes.budget, this.elements.budgetContainer, this.elements.budgetVal);
      }
      this._prevMetrics.budget = currentBudget;

      if (this.elements.budgetVal) {
        this.elements.budgetVal.textContent = formatBudget(metrics.budget);
      }
      if (this.elements.budgetBar) {
        // Budget meter: normalized against typical initial budget ($5,000) or capped at 100%
        const normalized = Math.max(0, Math.min(100, Math.round((metrics.budget / 5000) * 100)));
        this.elements.budgetBar.style.width = `${normalized}%`;
        const track = this.elements.budgetBar.closest?.('.meter-track');
        if (track) track.setAttribute('aria-valuenow', String(normalized));
      }
    }

    if (metrics.trust !== undefined) {
      const trustClamped = Math.max(0, Math.min(100, Math.round(metrics.trust)));
      if (changes && typeof changes.trust === 'number' && changes.trust !== 0) {
        this._triggerMetricFeedback('trust', changes.trust, this.elements.trustContainer, this.elements.trustVal);
      }
      this._prevMetrics.trust = trustClamped;

      if (this.elements.trustVal) {
        this.elements.trustVal.textContent = `${trustClamped}%`;
      }
      if (this.elements.trustBar) {
        this.elements.trustBar.style.width = `${trustClamped}%`;
        const track = this.elements.trustBar.closest?.('.meter-track');
        if (track) track.setAttribute('aria-valuenow', String(trustClamped));
      }
    }
  }

  /**
   * Updates timer display and applies visual warning if time is low (<= 30s).
   *
   * @param {number} seconds
   */
  setTimer(seconds) {
    if (this.elements.timerDisplay) {
      this.elements.timerDisplay.textContent = formatTimer(seconds);
    }
    if (this.elements.timerContainer) {
      const sec = typeof seconds === 'number' ? seconds : null;
      if (sec !== null && sec <= 30 && sec > 0) {
        this.elements.timerContainer.classList.add('timer-warning');
        if (sec <= 10) {
          this.elements.timerContainer.classList.add('timer-critical');
        } else {
          this.elements.timerContainer.classList.remove('timer-critical');
        }

        // P5B-07 / P5B-12: Subtle clock tick only in the final critical seconds.
        if (sec <= 10 && this._prevTimerSeconds !== sec) {
          soundEngine.playTick(true);
          if (sec === 10 || sec === 5) {
            soundEngine.playCountdownSting();
          }
        }
      } else {
        this.elements.timerContainer.classList.remove('timer-warning');
        this.elements.timerContainer.classList.remove('timer-critical');
      }
      this._prevTimerSeconds = sec;
    }
  }
}

/**
 * Creates and initializes a TopBarComponent instance.
 *
 * @param {HTMLElement|Document} [root]
 * @returns {TopBarComponent}
 */
export function createTopBar(root = document) {
  return new TopBarComponent(root);
}

