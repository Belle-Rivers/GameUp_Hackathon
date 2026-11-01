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
    this.elements = this._queryElements();
    this._initAudioToggle();
  }

  _queryElements() {
    const q = (sel) => (this.root && typeof this.root.querySelector === 'function' ? this.root.querySelector(sel) : null);
    return {
      dayBadge: q('#top-bar-day'),
      caseBadge: q('#top-bar-case'),
      netzeroVal: q('#meter-netzero-val'),
      netzeroBar: q('#meter-netzero-bar'),
      budgetVal: q('#meter-budget-val'),
      budgetBar: q('#meter-budget-bar'),
      trustVal: q('#meter-trust-val'),
      trustBar: q('#meter-trust-bar'),
      timerDisplay: q('#timer-display'),
      timerContainer: q('#timer-container'),
      btnAudioToggle: q('#btn-audio-toggle'),
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
   * Sets city metrics values and progress bar widths.
   *
   * @param {TopBarMetrics} metrics
   */
  setMetrics(metrics = {}) {
    if (metrics.netZero !== undefined) {
      const netZeroClamped = Math.max(0, Math.min(100, Math.round(metrics.netZero)));
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
      if (typeof seconds === 'number' && seconds <= 30 && seconds > 0) {
        this.elements.timerContainer.classList.add('timer-warning');
      } else {
        this.elements.timerContainer.classList.remove('timer-warning');
      }
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

