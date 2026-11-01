import { soundEngine } from '../audio.js';

/**
 * @typedef {Object} MainMenuOptions
 * @property {() => void} [onStart] Callback invoked when the start button is clicked.
 * @property {boolean} [reducedMotion] Whether animations should be skipped.
 */

/**
 * MainMenuScreen controls the initial landing and briefing screen (#screen-main-menu).
 * Implements P5B-02: Cinematic opening scene with Ken Burns office movement,
 * film grain/vignette overlays, sequential title reveal, and button entrance.
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
      backdrop: q('.menu-backdrop-kenburns'),
      vignette: q('.menu-vignette-grain'),
      container: q('.menu-container'),
      badge: q('.menu-badge-reveal'),
      title: q('.menu-title'),
      subtitle: q('.menu-subtitle'),
      briefing: q('.menu-briefing'),
      btnStart: q('#btn-start-game'),
    };
  }

  _attachEvents() {
    if (this.elements.btnStart) {
      this.elements.btnStart.addEventListener('click', (event) => {
        soundEngine.playWhoosh();
        if (typeof this.options.onStart === 'function') {
          this.options.onStart(event);
        }
      });
    }
  }

  /**
   * Activates and reveals the main menu screen with atmospheric presentation.
   */
  show() {
    if (this.elements.screen?.classList) {
      this.elements.screen.classList.add('active');
    }
    this.animateReveal();
  }

  /**
   * Hides the main menu screen.
   */
  hide() {
    if (this.elements.screen?.classList) {
      this.elements.screen.classList.remove('active');
      this.elements.screen.classList.remove('menu-reveal-active');
    }
  }

  /**
   * P5B-02: Triggers sequential atmospheric entrance animation.
   *
   * @param {object} [opts]
   * @param {boolean} [opts.reducedMotion]
   */
  animateReveal(opts = {}) {
    const reducedMotion = opts.reducedMotion ?? this.options.reducedMotion ?? this._isReducedMotion();
    if (!this.elements.screen?.classList) return;

    if (reducedMotion) {
      this.skipAnimation();
      return;
    }

    this.elements.screen.classList.remove('menu-reveal-active');
    // Force reflow
    void (this.elements.screen.offsetWidth || 0);
    this.elements.screen.classList.add('menu-reveal-active');
  }

  /**
   * Immediately skips animations to settled resting state.
   */
  skipAnimation() {
    if (this.elements.screen?.classList) {
      this.elements.screen.classList.remove('menu-reveal-active');
      this.elements.screen.classList.add('menu-settled');
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

