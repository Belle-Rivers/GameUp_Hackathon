import { createMainMenuScreen, MainMenuScreen } from './screens/main-menu.js';
import { createGameplayScreen, GameplayScreen } from './screens/gameplay-screen.js';
import { createSummaryModal, SummaryModalComponent } from './screens/summary-screen.js';
import { createGameOverScreen, GameOverScreenComponent } from './screens/game-over-screen.js';

/**
 * Valid screen identifier strings.
 * @typedef {'main-menu' | 'gameplay' | 'game-over'} ScreenId
 */

/**
 * @typedef {Object} RendererOptions
 * @property {MainMenuScreen} [mainMenu]
 * @property {GameplayScreen} [gameplay]
 * @property {SummaryModalComponent} [summaryModal]
 * @property {GameOverScreenComponent} [gameOver]
 * @property {(screenId: ScreenId) => void} [onScreenChange]
 */

/**
 * Renderer coordinates the visibility and presentation of top-level application screens
 * and modals, ensuring only one primary screen is active at any time.
 */
export class Renderer {
  /**
   * @param {HTMLElement|Document} [root=document]
   * @param {RendererOptions} [options]
   */
  constructor(root = document, options = {}) {
    this.root = root;
    this.options = options;

    this.mainMenu = options.mainMenu || createMainMenuScreen(root);
    this.gameplay = options.gameplay || createGameplayScreen(root);
    this.summaryModal = options.summaryModal || createSummaryModal(root);
    this.gameOver = options.gameOver || createGameOverScreen(root);

    this.currentScreen = 'main-menu';
  }

  /**
   * Normalizes screen identifiers (e.g. 'screen-main-menu' -> 'main-menu').
   *
   * @param {string} screenId
   * @returns {ScreenId}
   */
  _normalizeScreenId(screenId) {
    if (!screenId) return 'main-menu';
    const normalized = screenId.replace(/^screen-/, '');
    if (normalized === 'main-menu' || normalized === 'gameplay' || normalized === 'game-over') {
      return normalized;
    }
    return 'main-menu';
  }

  /**
   * Activates the specified screen and deactivates all other screens.
   *
   * @param {string} screenId Screen identifier ('main-menu', 'gameplay', 'game-over').
   */
  showScreen(screenId) {
    const target = this._normalizeScreenId(screenId);

    // Hide all screens
    this.mainMenu.hide();
    this.gameplay.hide();
    this.gameOver.hide();

    // Show target screen
    switch (target) {
      case 'gameplay':
        this.gameplay.show();
        break;
      case 'game-over':
        this.gameOver.show();
        break;
      case 'main-menu':
      default:
        this.mainMenu.show();
        break;
    }

    this.currentScreen = target;

    if (typeof this.options.onScreenChange === 'function') {
      this.options.onScreenChange(target);
    }
  }

  /**
   * Returns the currently active screen ID.
   *
   * @returns {ScreenId}
   */
  getCurrentScreen() {
    return this.currentScreen;
  }

  /**
   * Opens the shift summary modal.
   *
   * @param {Object} [shiftData]
   */
  showSummaryModal(shiftData) {
    this.summaryModal.open(shiftData);
  }

  /**
   * Closes the shift summary modal.
   */
  hideSummaryModal() {
    this.summaryModal.close();
  }

  /**
   * Checks whether the summary modal is open.
   *
   * @returns {boolean}
   */
  isSummaryModalOpen() {
    return this.summaryModal.isOpen();
  }

  /**
   * Updates screens with new state view data.
   *
   * @param {Object} stateView
   */
  update(stateView = {}) {
    if (this.currentScreen === 'gameplay') {
      this.gameplay.update(stateView);
    }
  }

  /**
   * Alias for update().
   *
   * @param {Object} stateView
   */
  render(stateView) {
    this.update(stateView);
  }
}

/**
 * Factory for creating a Renderer instance.
 *
 * @param {HTMLElement|Document} [root]
 * @param {RendererOptions} [options]
 * @returns {Renderer}
 */
export function createRenderer(root = document, options = {}) {
  return new Renderer(root, options);
}

