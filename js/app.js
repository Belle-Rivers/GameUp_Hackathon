import { createRenderer } from './frontend/renderer.js';
import { setupUIEvents } from './frontend/events.js';

/**
 * Initializes the frontend application and binds interactive screen transitions.
 *
 * @param {HTMLElement|Document} [root=document]
 * @returns {{ renderer: import('./frontend/renderer.js').Renderer, events: import('./frontend/events.js').EventManager }}
 */
export function initApp(root = typeof document !== 'undefined' ? document : null) {
  if (!root) {
    return { renderer: null, events: null };
  }

  const renderer = createRenderer(root);

  const events = setupUIEvents(root, {
    onStartGame: () => {
      renderer.showScreen('gameplay');
    },
    onRestartGame: () => {
      renderer.showScreen('gameplay');
    },
    onReturnMenu: () => {
      renderer.showScreen('main-menu');
    },
    onNextShift: () => {
      renderer.hideSummaryModal();
    },
    onCloseSummaryModal: () => {
      renderer.hideSummaryModal();
    },
    onTabSelect: (targetId) => {
      if (renderer.gameplay?.setActiveTab) {
        renderer.gameplay.setActiveTab(targetId);
      }
    },
  });

  return { renderer, events };
}

// Auto-bootstrap when loaded in a browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initApp(document));
  } else {
    initApp(document);
  }
}
