/**
 * @file app.js
 * Application entry point — Phase 3 backend/frontend integration.
 *
 * Bootstraps the backend (via BackendApi), the frontend Renderer, and the
 * GameController that connects them.  The EventManager still owns all DOM
 * event listeners; it delegates to GameController callbacks.
 *
 * P3-01  Application bootstrap (startCampaign → first citizen + initial render)
 * P3-12  Timer is started inside GameController.startCampaign()
 */

import { backendApi } from './backend/index.js';
import { createRenderer } from './frontend/renderer.js';
import { setupUIEvents } from './frontend/events.js';
import { createGameController } from './frontend/game-controller.js';

/**
 * Initializes the full application: backend, renderer, controller and events.
 *
 * @param {HTMLElement|Document} [root=document]
 * @returns {{
 *   renderer: import('./frontend/renderer.js').Renderer,
 *   events:   import('./frontend/events.js').EventManager,
 *   controller: import('./frontend/game-controller.js').GameController
 * }}
 */
export function initApp(root = typeof document !== 'undefined' ? document : null) {
  if (!root) {
    return { renderer: null, events: null, controller: null };
  }

  // ── 1. Frontend renderer ──────────────────────────────────────────────────
  const renderer = createRenderer(root);

  // ── 2. Game controller (backend ↔ frontend bridge) ────────────────────────
  const controller = createGameController(backendApi, renderer, { root });

  // ── 3. DOM event wiring ───────────────────────────────────────────────────
  const events = setupUIEvents(root, {
    // Main menu
    onStartGame: () => {
      renderer.showScreen('gameplay');
      // P3-01: bootstrap campaign and initial render
      controller.startCampaign();
    },

    // Action stamps (P3-06, P3-07, P3-08)
    onApprove: () => controller.onApprove(),
    onFine: () => controller.onFine(),
    onGrant: (grantId) => controller.onGrant(grantId),

    // Grant selector change (no backend call needed; just keeps internal state)
    onGrantSelectChange: (_grantId) => { /* selection reflected on onGrant */ },

    // Calculator (P3-05)
    onReceiptItemClick: (detail) => controller.onReceiptItemClick(detail),
    onClearCalculator: () => controller.onClearCalculator(),

    // Responsive tabs
    onTabSelect: (targetId) => {
      if (renderer.gameplay?.setActiveTab) {
        renderer.gameplay.setActiveTab(targetId);
      }
    },

    // Summary modal (P3-11)
    onNextShift: () => controller.onNextShift(),
    onCloseSummaryModal: () => renderer.hideSummaryModal(),

    // Day intro modal (P4-09)
    onStartShift: () => controller.onStartShift(),

    // Game-over / restart (P4-14)
    onRestartGame: () => {
      controller.restartCampaign();
    },
    onReturnMenu: () => {
      controller.destroy();
      renderer.showScreen('main-menu');
    },
  });

  // Wire the dossier panel's receipt click through the gameplay screen
  // (GameplayScreen forwards onReceiptItemClick internally, so we also patch
  //  the already-constructed dossier option to call the controller.)
  if (renderer.gameplay?.dossier) {
    renderer.gameplay.dossier.onItemClick((detail) => {
      controller.onReceiptItemClick(detail);
    });
  }

  return { renderer, events, controller };
}

// Auto-bootstrap when loaded in a browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initApp(document));
  } else {
    initApp(document);
  }
}
