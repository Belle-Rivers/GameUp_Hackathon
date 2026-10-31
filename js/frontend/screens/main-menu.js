/**
 * @typedef {Object} MainMenuOptions
 * @property {() => void} [onStart] Callback invoked when the start button is clicked.
 */

/**
 * MainMenuScreen controls the initial landing and briefing screen (#screen-main-menu).
 * It presents the game title, directive briefing, and the "Initialize Shift Terminal" action.
 */
export class MainMenuScreen {
  /**
   * @param {HTMLElement|Document} [root=document] Root DOM node containing main menu elements.
   * @param {MainMenuOptions} [options]
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
      screen: q('#screen-main-menu'),
      btnStart: q('#btn-start-game'),
      title: q('.menu-title'),
      subtitle: q('.menu-subtitle'),
      briefing: q('.menu-briefing'),
    };
  }

  _attachEvents() {
    if (this.elements.btnStart) {
      this.elements.btnStart.addEventListener('click', (event) => {
        if (typeof this.options.onStart === 'function') {
          this.options.onStart(event);
        }
      });
    }
  }

  /**
   * Activates and reveals the main menu screen.
   */
  show() {
    if (this.elements.screen?.classList) {
      this.elements.screen.classList.add('active');
    }
  }

  /**
   * Hides the main menu screen.
   */
  hide() {
    if (this.elements.screen?.classList) {
      this.elements.screen.classList.remove('active');
    }
  }

  /**
   * Checks whether the main menu is currently the active screen.
   *
   * @returns {boolean}
   */
  isActive() {
    return Boolean(this.elements.screen?.classList?.contains('active'));
  }

  /**
   * Updates the displayed title.
   *
   * @param {string} title
   */
  setTitle(title) {
    if (this.elements.title) {
      this.elements.title.textContent = title;
    }
  }

  /**
   * Updates the displayed subtitle.
   *
   * @param {string} subtitle
   */
  setSubtitle(subtitle) {
    if (this.elements.subtitle) {
      this.elements.subtitle.textContent = subtitle;
    }
  }
}

export const MainMenuComponent = MainMenuScreen;

/**
 * Factory for creating a MainMenuScreen instance.
 *
 * @param {HTMLElement|Document} [root]
 * @param {MainMenuOptions} [options]
 * @returns {MainMenuScreen}
 */
export function createMainMenuScreen(root = document, options = {}) {
  return new MainMenuScreen(root, options);
}

