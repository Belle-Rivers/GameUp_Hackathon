/**
 * Returns human-readable failure explanation based on backend failure reason code.
 *
 * @param {string} [reason]
 * @returns {string}
 */
export function getFailureMessage(reason) {
  switch (reason) {
    case 'BANKRUPTCY':
      return 'Municipal Budget Depleted ($0 remaining).';
    case 'PUBLIC_TRUST':
      return 'Public Trust Collapsed (0% remaining). Civil unrest has forced terminal shutdown.';
    case 'NET_ZERO_TARGET':
      return 'Failed to achieve 100% Net-Zero target by the end of Day 3.';
    default:
      return typeof reason === 'string' && reason.length > 0
        ? reason
        : 'The municipal carbon assessment campaign has concluded.';
  }
}

/**
 * @typedef {Object} CampaignOutcomeViewData
 * @property {boolean} [isVictory] Whether the player achieved victory.
 * @property {string} [outcome] Outcome code ('VICTORY' or 'FAILURE').
 * @property {string} [reason] Failure reason code or custom description.
 * @property {number} [daysCompleted] Total days completed.
 * @property {number} [maxDays] Total campaign days (default: 3).
 * @property {number} [netZero] Final Net-Zero percentage.
 * @property {number} [trust] Final Public Trust percentage.
 * @property {number} [budget] Final budget amount.
 */

/**
 * @typedef {Object} GameOverScreenOptions
 * @property {() => void} [onRestart] Callback invoked when Restart Campaign is clicked.
 * @property {() => void} [onReturnMenu] Callback invoked when Return to Main Menu is clicked.
 */

/**
 * GameOverScreenComponent controls the terminal termination / campaign victory screen (#screen-game-over).
 */
export class GameOverScreenComponent {
  /**
   * @param {HTMLElement|Document} [root=document] Root DOM node containing game-over elements.
   * @param {GameOverScreenOptions} [options]
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
      screen: q('#screen-game-over'),
      badge: q('#game-over-badge'),
      title: q('#game-over-title'),
      reason: q('#game-over-reason'),
      stats: q('#game-over-stats'),
      days: q('#game-over-days'),
      netzero: q('#game-over-netzero'),
      trust: q('#game-over-trust'),
      budget: q('#game-over-budget'),
      totalProcessed: q('#game-over-total-processed'),
      totalCorrect: q('#game-over-total-correct'),
      totalFines: q('#game-over-total-fines'),
      totalGrants: q('#game-over-total-grants'),
      btnRestart: q('#btn-restart-game'),
      btnReturnMenu: q('#btn-return-menu'),
    };
  }

  _attachEvents() {
    if (this.elements.btnRestart) {
      this.elements.btnRestart.addEventListener('click', (event) => {
        if (typeof this.options.onRestart === 'function') {
          this.options.onRestart(event);
        }
      });
    }

    if (this.elements.btnReturnMenu) {
      this.elements.btnReturnMenu.addEventListener('click', (event) => {
        if (typeof this.options.onReturnMenu === 'function') {
          this.options.onReturnMenu(event);
        }
      });
    }
  }

  /**
   * Renders victory or failure outcome content and final statistics.
   *
   * @param {CampaignOutcomeViewData} [data]
   */
  render(data = {}) {
    const isVictory = Boolean(data.isVictory || data.outcome === 'VICTORY');

    if (this.elements.badge) {
      if (isVictory) {
        this.elements.badge.textContent = 'COP31 TARGET ACHIEVED';
        this.elements.badge.classList?.remove('badge-danger');
        this.elements.badge.classList?.add('badge-gold');
      } else {
        this.elements.badge.textContent = 'TERMINATION OF COMMISSION';
        this.elements.badge.classList?.remove('badge-gold');
        this.elements.badge.classList?.add('badge-danger');
      }
    }

    if (this.elements.title) {
      this.elements.title.textContent = isVictory ? 'CAMPAIGN VICTORY' : 'CAMPAIGN FAILED';
    }

    if (this.elements.reason) {
      if (isVictory) {
        this.elements.reason.textContent = data.reason
          ? data.reason
          : 'Muratpaşa district has met municipal carbon targets within lawful budget tolerances.';
      } else {
        this.elements.reason.textContent = getFailureMessage(data.reason);
      }
    }

    const daysCompleted = data.daysCompleted ?? 1;
    const maxDays = data.maxDays ?? 3;
    if (this.elements.days) {
      this.elements.days.textContent = `${daysCompleted} of ${maxDays}`;
    }

    if (this.elements.netzero) {
      const nz = typeof data.netZero === 'number' ? Math.round(data.netZero) : 0;
      this.elements.netzero.textContent = `${nz}%`;
    }

    if (this.elements.trust) {
      const tr = typeof data.trust === 'number' ? Math.round(data.trust) : 0;
      this.elements.trust.textContent = `${tr}%`;
    }

    // P4-12/P4-13 – Budget display
    if (this.elements.budget) {
      const bd = typeof data.budget === 'number' ? Math.round(data.budget) : 0;
      this.elements.budget.textContent = `$${bd.toLocaleString('en-US')}`;
    }

    // P4-12/P4-13 – Campaign statistics
    const cs = data.campaignStats || {};
    if (this.elements.totalProcessed) {
      this.elements.totalProcessed.textContent = String(cs.totalProcessed ?? 0);
    }
    if (this.elements.totalCorrect) {
      this.elements.totalCorrect.textContent = String(cs.totalCorrect ?? 0);
    }
    if (this.elements.totalFines) {
      this.elements.totalFines.textContent = String(cs.totalFines ?? 0);
    }
    if (this.elements.totalGrants) {
      this.elements.totalGrants.textContent = String(cs.totalGrants ?? 0);
    }
  }

  /**
   * Reveals the game-over screen and displays outcome results.
   *
   * @param {CampaignOutcomeViewData} [data]
   */
  show(data) {
    if (data) {
      this.render(data);
    }
    if (this.elements.screen?.classList) {
      this.elements.screen.classList.add('active');
    }
  }

  /**
   * Hides the game-over screen.
   */
  hide() {
    if (this.elements.screen?.classList) {
      this.elements.screen.classList.remove('active');
    }
  }

  /**
   * Returns whether the game-over screen is active.
   *
   * @returns {boolean}
   */
  isActive() {
    return Boolean(this.elements.screen?.classList?.contains('active'));
  }
}

export const GameOverScreen = GameOverScreenComponent;

/**
 * Factory for GameOverScreenComponent.
 *
 * @param {HTMLElement|Document} [root]
 * @param {GameOverScreenOptions} [options]
 * @returns {GameOverScreenComponent}
 */
export function createGameOverScreen(root = document, options = {}) {
  return new GameOverScreenComponent(root, options);
}

