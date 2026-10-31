/**
 * @typedef {Object} UIEventHandlers
 * @property {() => void} [onStartGame] Main menu start button.
 * @property {() => void} [onApprove] Stamp dock APPROVE button.
 * @property {() => void} [onFine] Stamp dock FINE button.
 * @property {(grantId: string) => void} [onGrant] Stamp dock GRANT button.
 * @property {(grantId: string) => void} [onGrantSelectChange] Grant dropdown changed.
 * @property {() => void} [onClearCalculator] Scratchpad clear button.
 * @property {(detail: { receiptIndex: number, itemIndex: number, item: any }) => void} [onReceiptItemClick] Receipt line item clicked.
 * @property {(targetId: string) => void} [onTabSelect] Responsive tab selected.
 * @property {() => void} [onNextShift] Summary modal proceed button.
 * @property {() => void} [onStartShift] Day intro modal start shift button.
 * @property {() => void} [onCloseSummaryModal] Summary modal dismissed.
 * @property {() => void} [onRestartGame] Game over restart button.
 * @property {() => void} [onReturnMenu] Game over return to menu button.
 */

/**
 * EventManager coordinates player interaction event bindings, delegators,
 * and keyboard shortcuts across the application shell.
 */
export class EventManager {
  /**
   * @param {HTMLElement|Document} [root=document] Root DOM node.
   * @param {UIEventHandlers} [handlers]
   */
  constructor(root = document, handlers = {}) {
    this.root = root;
    this.handlers = { ...handlers };
    this._listeners = [];

    this._setupGlobalKeyboard();
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

  _addListener(element, type, handler) {
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(type, handler);
      this._listeners.push({ element, type, handler });
    }
  }

  /**
   * Sets or updates an event handler callback.
   *
   * @param {keyof UIEventHandlers} eventName
   * @param {Function} handler
   */
  on(eventName, handler) {
    this.handlers[eventName] = handler;
  }

  /**
   * Sets up global keyboard shortcuts.
   */
  _setupGlobalKeyboard() {
    const keyTarget = typeof window !== 'undefined' ? window : this.root;
    if (keyTarget && typeof keyTarget.addEventListener === 'function') {
      const keyHandler = (event) => {
        const key = event.key;

        // Escape: Dismiss modal if open
        if (key === 'Escape') {
          const modal = this._query('#summary-modal');
          if (modal && !modal.hasAttribute('hidden') && !modal.hidden) {
            if (typeof this.handlers.onCloseSummaryModal === 'function') {
              this.handlers.onCloseSummaryModal();
            }
          }
        }

        // Numeric shortcuts (1 = Approve, 2 = Fine, 3 = Grant) when gameplay is active
        const gameplayScreen = this._query('#screen-gameplay');
        const isGameplayActive = gameplayScreen?.classList?.contains('active');

        if (isGameplayActive) {
          if (key === '1') {
            if (typeof this.handlers.onApprove === 'function') {
              this.handlers.onApprove();
            }
          } else if (key === '2') {
            if (typeof this.handlers.onFine === 'function') {
              this.handlers.onFine();
            }
          } else if (key === '3') {
            if (typeof this.handlers.onGrant === 'function') {
              const select = this._query('#grant-select');
              const selectedGrant = select?.value || '';
              this.handlers.onGrant(selectedGrant);
            }
          }
        }
      };

      this._addListener(keyTarget, 'keydown', keyHandler);
    }
  }

  /**
   * Attaches click and change listeners to interactive buttons and selectors.
   */
  attach() {
    // 1. Main Menu Start
    const btnStart = this._query('#btn-start-game');
    if (btnStart) {
      this._addListener(btnStart, 'click', (e) => {
        if (typeof this.handlers.onStartGame === 'function') {
          this.handlers.onStartGame(e);
        }
      });
    }

    // 2. Responsive Tabs
    const tabButtons = this._queryAll('.workspace-tab-btn');
    for (const btn of tabButtons) {
      this._addListener(btn, 'click', () => {
        const targetId = btn.getAttribute('data-target') || btn.dataset?.target;
        if (targetId && typeof this.handlers.onTabSelect === 'function') {
          this.handlers.onTabSelect(targetId);
        }
      });
    }

    // 3. Action Stamps
    const btnApprove = this._query('#btn-action-approve');
    if (btnApprove) {
      this._addListener(btnApprove, 'click', () => {
        if (typeof this.handlers.onApprove === 'function') {
          this.handlers.onApprove();
        }
      });
    }

    const btnFine = this._query('#btn-action-fine');
    if (btnFine) {
      this._addListener(btnFine, 'click', () => {
        if (typeof this.handlers.onFine === 'function') {
          this.handlers.onFine();
        }
      });
    }

    const btnGrant = this._query('#btn-action-grant');
    if (btnGrant) {
      this._addListener(btnGrant, 'click', () => {
        const select = this._query('#grant-select');
        const selectedGrant = select?.value || '';
        if (typeof this.handlers.onGrant === 'function') {
          this.handlers.onGrant(selectedGrant);
        }
      });
    }

    // 4. Grant Selector Dropdown
    const selectGrant = this._query('#grant-select');
    if (selectGrant) {
      this._addListener(selectGrant, 'change', (e) => {
        const val = e.target?.value ?? selectGrant.value;
        if (typeof this.handlers.onGrantSelectChange === 'function') {
          this.handlers.onGrantSelectChange(val);
        }
      });
    }

    // 5. Calculator Clear
    const btnCalcClear = this._query('#btn-calc-clear');
    if (btnCalcClear) {
      this._addListener(btnCalcClear, 'click', () => {
        if (typeof this.handlers.onClearCalculator === 'function') {
          this.handlers.onClearCalculator();
        }
      });
    }

    // 6. Summary Modal Next Shift
    const btnNextShift = this._query('#btn-next-shift');
    if (btnNextShift) {
      this._addListener(btnNextShift, 'click', () => {
        if (typeof this.handlers.onNextShift === 'function') {
          this.handlers.onNextShift();
        }
      });
    }

    // 6b. Day Intro Modal Start Shift
    const btnStartShift = this._query('#btn-start-shift');
    if (btnStartShift) {
      this._addListener(btnStartShift, 'click', () => {
        if (typeof this.handlers.onStartShift === 'function') {
          this.handlers.onStartShift();
        }
      });
    }

    // 7. Game Over Buttons
    const btnRestart = this._query('#btn-restart-game');
    if (btnRestart) {
      this._addListener(btnRestart, 'click', () => {
        if (typeof this.handlers.onRestartGame === 'function') {
          this.handlers.onRestartGame();
        }
      });
    }

    const btnReturnMenu = this._query('#btn-return-menu');
    if (btnReturnMenu) {
      this._addListener(btnReturnMenu, 'click', () => {
        if (typeof this.handlers.onReturnMenu === 'function') {
          this.handlers.onReturnMenu();
        }
      });
    }
  }

  /**
   * Detaches all registered listeners.
   */
  destroy() {
    for (const { element, type, handler } of this._listeners) {
      if (element && typeof element.removeEventListener === 'function') {
        element.removeEventListener(type, handler);
      }
    }
    this._listeners = [];
  }
}

/**
 * Convenience helper to set up UI events.
 *
 * @param {HTMLElement|Document} [root]
 * @param {UIEventHandlers} [handlers]
 * @returns {EventManager}
 */
export function setupUIEvents(root = document, handlers = {}) {
  const manager = new EventManager(root, handlers);
  manager.attach();
  return manager;
}

