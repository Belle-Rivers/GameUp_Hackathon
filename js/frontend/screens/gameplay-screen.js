import { createTopBar, TopBarComponent } from '../components/top-bar.js';
import { createRulebookPanel, RulebookPanelComponent } from '../components/rulebook-panel.js';
import { createDossierPanel, DossierPanelComponent } from '../components/dossier-panel.js';
import { createCalculatorPanel, CalculatorPanelComponent } from '../components/calculator-panel.js';
import { createActionPanel, ActionPanelComponent } from '../components/action-panel.js';

/**
 * @typedef {Object} GameplayScreenOptions
 * @property {() => void} [onApprove] Callback when APPROVE is clicked.
 * @property {() => void} [onFine] Callback when FINE is clicked.
 * @property {(grantId: string) => void} [onGrant] Callback when GRANT is clicked.
 * @property {(grantId: string) => void} [onGrantSelectChange] Callback when selected grant changes.
 * @property {(detail: { receiptIndex: number, itemIndex: number, item: any }) => void} [onReceiptItemClick] Callback when a receipt item is clicked.
 * @property {() => void} [onClearCalculator] Callback when calculator CLEAR is clicked.
 * @property {(targetId: string) => void} [onTabChange] Callback when responsive workspace tab changes.
 */

/**
 * GameplayScreen coordinates the complete gameplay workstation:
 * - Top status bar (day, case counter, city meters, countdown timer)
 * - Rulebook panel (emission benchmarks, policy directives)
 * - Citizen dossier panel (identity, plea note, activity receipts)
 * - Calculator panel (interactive scratchpad)
 * - Action panel (assessment ledger, grant selector, stamp action dock)
 * - Responsive workspace tab bar navigation
 */
export class GameplayScreen {
  /**
   * @param {HTMLElement|Document} [root=document] Root DOM node containing gameplay elements.
   * @param {GameplayScreenOptions} [options]
   */
  constructor(root = document, options = {}) {
    this.root = root;
    this.options = options;

    this.screenElement = this._query('#screen-gameplay');
    this.workspaceGrid = this._query('#workspace');
    this.tabsBar = this._query('.workspace-tabs-bar');

    this.topBar = createTopBar(root);
    this.rulebook = createRulebookPanel(root);
    this.dossier = createDossierPanel(root, {
      onReceiptItemClick: (detail) => {
        if (typeof this.options.onReceiptItemClick === 'function') {
          this.options.onReceiptItemClick(detail);
        }
      },
    });
    this.calculator = createCalculatorPanel(root, {
      onClear: () => {
        if (typeof this.options.onClearCalculator === 'function') {
          this.options.onClearCalculator();
        }
      },
    });
    this.actionPanel = createActionPanel(root, {
      onApprove: () => {
        if (typeof this.options.onApprove === 'function') {
          this.options.onApprove();
        }
      },
      onFine: () => {
        if (typeof this.options.onFine === 'function') {
          this.options.onFine();
        }
      },
      onGrant: (grantId) => {
        if (typeof this.options.onGrant === 'function') {
          this.options.onGrant(grantId);
        }
      },
      onGrantSelectChange: (grantId) => {
        if (typeof this.options.onGrantSelectChange === 'function') {
          this.options.onGrantSelectChange(grantId);
        }
      },
    });

    this.activeTabId = 'rulebook-panel';
    this._attachTabEvents();
  }

  _query(sel) {
    return this.root && typeof this.root.querySelector === 'function'
      ? this.root.querySelector(sel)
      : null;
  }

  _queryAll(sel) {
    return this.root && typeof this.root.querySelectorAll === 'function'
      ? Array.from(this.root.querySelectorAll(sel))
      : [];
  }

  _attachTabEvents() {
    const tabButtons = this._queryAll('.workspace-tab-btn');
    for (const btn of tabButtons) {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target') || btn.dataset?.target;
        if (targetId) {
          this.setActiveTab(targetId);
        }
      });
    }
  }

  /**
   * Switches the active workspace tab for small/tablet viewport layouts.
   *
   * @param {string} targetId ID of the target panel without '#' (e.g. 'rulebook-panel')
   */
  setActiveTab(targetId) {
    this.activeTabId = targetId;

    if (this.workspaceGrid) {
      if (typeof this.workspaceGrid.setAttribute === 'function') {
        this.workspaceGrid.setAttribute('data-tab-mode', 'tabs');
      }
    }

    const tabButtons = this._queryAll('.workspace-tab-btn');
    for (const btn of tabButtons) {
      const btnTarget = btn.getAttribute('data-target') || btn.dataset?.target;
      if (btnTarget === targetId) {
        btn.classList?.add('active');
      } else {
        btn.classList?.remove('active');
      }
    }

    const panelIds = ['rulebook-panel', 'dossier-panel', 'action-panel'];
    for (const id of panelIds) {
      const panel = this._query(`#${id}`);
      if (panel?.classList) {
        if (id === targetId) {
          panel.classList.add('tab-active');
        } else {
          panel.classList.remove('tab-active');
        }
      }
    }

    if (typeof this.options.onTabChange === 'function') {
      this.options.onTabChange(targetId);
    }
  }

  /**
   * Returns the currently active tab ID.
   *
   * @returns {string}
   */
  getActiveTab() {
    return this.activeTabId;
  }

  /**
   * Activates and reveals the gameplay screen.
   */
  show() {
    if (this.screenElement?.classList) {
      this.screenElement.classList.add('active');
    }
  }

  /**
   * Hides the gameplay screen.
   */
  hide() {
    if (this.screenElement?.classList) {
      this.screenElement.classList.remove('active');
    }
  }

  /**
   * Checks whether the gameplay screen is currently visible.
   *
   * @returns {boolean}
   */
  isActive() {
    return Boolean(this.screenElement?.classList?.contains('active'));
  }

  /**
   * Updates all assembled sub-components from a unified state or partial updates.
   *
   * @param {Object} [data]
   */
  update(data = {}) {
    if (data.topBar) {
      this.topBar.update(data.topBar);
    } else if (data.day !== undefined || data.metrics || data.timeRemaining !== undefined) {
      this.topBar.update({
        day: data.day,
        maxDays: data.maxDays,
        currentCaseIndex: data.currentCaseIndex,
        totalCases: data.totalCases,
        timeRemaining: data.timeRemaining,
        metrics: data.metrics,
      });
    }

    if (data.rulebook) {
      this.rulebook.update(data.rulebook);
    } else if (data.rates || data.policies) {
      this.rulebook.update({
        rates: data.rates,
        policies: data.policies,
      });
    }

    if (data.citizen) {
      if (typeof this.dossier.update === 'function') {
        this.dossier.update(data.citizen);
      } else if (typeof this.dossier.loadCitizen === 'function') {
        this.dossier.loadCitizen(data.citizen);
      }
    } else if (data.dossier) {
      if (typeof this.dossier.update === 'function') {
        this.dossier.update(data.dossier);
      } else if (typeof this.dossier.loadCitizen === 'function') {
        this.dossier.loadCitizen(data.dossier);
      }
    }

    if (data.actionPanel) {
      this.actionPanel.update(data.actionPanel);
    } else if (data.comparison || data.grants || data.auditedCO2 !== undefined) {
      this.actionPanel.update({
        auditedCO2: data.auditedCO2 ?? data.comparison?.auditedCO2,
        declaredCO2: data.declaredCO2 ?? data.comparison?.declaredCO2,
        grants: data.grants,
        status: data.actionStatus ?? data.status,
      });
    }

    if (data.calculator) {
      if (Array.isArray(data.calculator.entries)) {
        this.calculator.clear();
        for (const entry of data.calculator.entries) {
          this.calculator.addEntry(entry);
        }
      }
    }
  }

  /**
   * Alias for update().
   *
   * @param {Object} [data]
   */
  render(data) {
    this.update(data);
  }
}

export const GameplayScreenComponent = GameplayScreen;

/**
 * Factory for GameplayScreen.
 *
 * @param {HTMLElement|Document} [root]
 * @param {GameplayScreenOptions} [options]
 * @returns {GameplayScreen}
 */
export function createGameplayScreen(root = document, options = {}) {
  return new GameplayScreen(root, options);
}
