import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  MainMenuScreen,
  createMainMenuScreen,
} from '../js/frontend/screens/main-menu.js';
import {
  GameplayScreen,
  createGameplayScreen,
} from '../js/frontend/screens/gameplay-screen.js';
import {
  formatAccuracy,
  SummaryModalComponent,
  createSummaryModal,
} from '../js/frontend/screens/summary-screen.js';
import {
  getFailureMessage,
  GameOverScreenComponent,
  createGameOverScreen,
} from '../js/frontend/screens/game-over-screen.js';
import {
  Renderer,
  createRenderer,
} from '../js/frontend/renderer.js';
import {
  EventManager,
  setupUIEvents,
} from '../js/frontend/events.js';
import { initApp } from '../js/app.js';

// DOM mock helper
function createMockElement(tagName = 'div', attributes = {}) {
  const listeners = {};
  const classes = new Set();
  const children = [];

  const elem = {
    tagName: tagName.toUpperCase(),
    textContent: '',
    innerHTML: '',
    style: {},
    attributes: { ...attributes },
    dataset: {},
    disabled: false,
    value: '',
    hidden: false,
    classList: {
      add: (...clsList) => clsList.forEach((cls) => classes.add(cls)),
      remove: (...clsList) => clsList.forEach((cls) => classes.delete(cls)),
      contains: (cls) => classes.has(cls),
      toggle: (cls, force) => {
        if (force === undefined) {
          if (classes.has(cls)) {
            classes.delete(cls);
            return false;
          }
          classes.add(cls);
          return true;
        }
        if (force) {
          classes.add(cls);
          return true;
        }
        classes.delete(cls);
        return false;
      },
    },
    getAttribute: (name) => {
      if (name in elem.attributes) return elem.attributes[name];
      if (name === 'hidden' && elem.hidden) return '';
      return null;
    },
    setAttribute: (name, val) => {
      elem.attributes[name] = String(val);
      if (name === 'hidden') elem.hidden = true;
    },
    removeAttribute: (name) => {
      delete elem.attributes[name];
      if (name === 'hidden') elem.hidden = false;
    },
    hasAttribute: (name) => {
      if (name in elem.attributes) return true;
      if (name === 'hidden') return Boolean(elem.hidden);
      return false;
    },
    addEventListener: (type, handler) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(handler);
    },
    removeEventListener: (type, handler) => {
      if (listeners[type]) {
        listeners[type] = listeners[type].filter((h) => h !== handler);
      }
    },
    dispatchEvent: (event) => {
      const handlers = listeners[event.type] || [];
      for (const h of handlers) h(event);
    },
    closest: (selector) => {
      if (selector.startsWith('.') && classes.has(selector.slice(1))) return elem;
      return null;
    },
    querySelector: (sel) => {
      return children.find((c) => c._matchesSelector && c._matchesSelector(sel)) || null;
    },
    querySelectorAll: (sel) => {
      return children.filter((c) => c._matchesSelector && c._matchesSelector(sel));
    },
    _classes: classes,
    _listeners: listeners,
    _children: children,
    _matchesSelector: (sel) => {
      if (sel.startsWith('#') && elem.attributes.id === sel.slice(1)) return true;
      if (sel.startsWith('.') && classes.has(sel.slice(1))) return true;
      return false;
    },
  };

  return elem;
}

function createFullMockDom() {
  // Screen 1: Main Menu
  const screenMainMenu = createMockElement('section', { id: 'screen-main-menu' });
  screenMainMenu.classList.add('screen', 'main-menu-screen', 'active');
  const btnStartGame = createMockElement('button', { id: 'btn-start-game' });
  const menuTitle = createMockElement('h1', { class: 'menu-title' });
  menuTitle.classList.add('menu-title');
  const menuSubtitle = createMockElement('p', { class: 'menu-subtitle' });
  menuSubtitle.classList.add('menu-subtitle');
  const menuBriefing = createMockElement('div', { class: 'menu-briefing' });
  menuBriefing.classList.add('menu-briefing');

  // Screen 2: Gameplay
  const screenGameplay = createMockElement('section', { id: 'screen-gameplay' });
  screenGameplay.classList.add('screen', 'gameplay-screen');
  const topBar = createMockElement('header', { id: 'top-bar' });
  const topBarDay = createMockElement('span', { id: 'top-bar-day' });
  const topBarCase = createMockElement('span', { id: 'top-bar-case' });
  const meterNetZeroVal = createMockElement('span', { id: 'meter-netzero-val' });
  const meterNetZeroBar = createMockElement('div', { id: 'meter-netzero-bar' });
  const meterBudgetVal = createMockElement('span', { id: 'meter-budget-val' });
  const meterBudgetBar = createMockElement('div', { id: 'meter-budget-bar' });
  const meterTrustVal = createMockElement('span', { id: 'meter-trust-val' });
  const meterTrustBar = createMockElement('div', { id: 'meter-trust-bar' });
  const timerDisplay = createMockElement('span', { id: 'timer-display' });
  const timerContainer = createMockElement('div', { id: 'timer-container' });

  // Workspace Tabs
  const workspaceTabsBar = createMockElement('nav', { class: 'workspace-tabs-bar' });
  workspaceTabsBar.classList.add('workspace-tabs-bar');
  const tabRulebook = createMockElement('button', { class: 'workspace-tab-btn', 'data-target': 'rulebook-panel' });
  tabRulebook.classList.add('workspace-tab-btn', 'active');
  const tabDossier = createMockElement('button', { class: 'workspace-tab-btn', 'data-target': 'dossier-panel' });
  tabDossier.classList.add('workspace-tab-btn');
  const tabAction = createMockElement('button', { class: 'workspace-tab-btn', 'data-target': 'action-panel' });
  tabAction.classList.add('workspace-tab-btn');

  // Workspace
  const workspace = createMockElement('main', { id: 'workspace' });
  const rulebookPanel = createMockElement('aside', { id: 'rulebook-panel' });
  const rulebookContent = createMockElement('div', { id: 'rulebook-content' });
  const rulebookRatesList = createMockElement('div', { id: 'rulebook-rates-list' });

  const dossierPanel = createMockElement('section', { id: 'dossier-panel' });
  const dossierCitizenName = createMockElement('h2', { id: 'dossier-citizen-name' });
  const dossierCitizenId = createMockElement('span', { id: 'dossier-citizen-id' });
  const dossierDistrict = createMockElement('span', { id: 'dossier-district' });
  const dossierRoof = createMockElement('span', { id: 'dossier-roof' });
  const dossierDeclared = createMockElement('span', { id: 'dossier-declared' });
  const dossierNote = createMockElement('p', { id: 'dossier-note' });
  const dossierReceiptsContainer = createMockElement('div', { id: 'dossier-receipts-container' });

  const actionPanel = createMockElement('section', { id: 'action-panel' });
  const actionPanelStatus = createMockElement('span', { id: 'action-panel-status' });
  const calcDisplay = createMockElement('div', { id: 'calc-display' });
  const calcTape = createMockElement('div', { id: 'calc-tape' });
  const btnCalcClear = createMockElement('button', { id: 'btn-calc-clear' });
  const summaryAuditedVal = createMockElement('span', { id: 'summary-audited-val' });
  const summaryDeclaredVal = createMockElement('span', { id: 'summary-declared-val' });
  const summaryVarianceVal = createMockElement('span', { id: 'summary-variance-val' });
  const grantSelect = createMockElement('select', { id: 'grant-select' });
  const btnActionApprove = createMockElement('button', { id: 'btn-action-approve' });
  const btnActionFine = createMockElement('button', { id: 'btn-action-fine' });
  const btnActionGrant = createMockElement('button', { id: 'btn-action-grant' });

  // Screen 3: Game Over
  const screenGameOver = createMockElement('section', { id: 'screen-game-over' });
  screenGameOver.classList.add('screen', 'game-over-screen');
  const gameOverBadge = createMockElement('div', { id: 'game-over-badge' });
  gameOverBadge.classList.add('badge', 'badge-danger');
  const gameOverTitle = createMockElement('h1', { id: 'game-over-title' });
  const gameOverReason = createMockElement('p', { id: 'game-over-reason' });
  const gameOverStats = createMockElement('div', { id: 'game-over-stats' });
  const gameOverDays = createMockElement('span', { id: 'game-over-days' });
  const gameOverNetzero = createMockElement('span', { id: 'game-over-netzero' });
  const gameOverTrust = createMockElement('span', { id: 'game-over-trust' });
  const gameOverBudget = createMockElement('span', { id: 'game-over-budget' });
  const gameOverTotalProcessed = createMockElement('span', { id: 'game-over-total-processed' });
  const gameOverTotalCorrect = createMockElement('span', { id: 'game-over-total-correct' });
  const gameOverTotalFines = createMockElement('span', { id: 'game-over-total-fines' });
  const gameOverTotalGrants = createMockElement('span', { id: 'game-over-total-grants' });
  const btnRestartGame = createMockElement('button', { id: 'btn-restart-game' });
  const btnReturnMenu = createMockElement('button', { id: 'btn-return-menu' });

  // Modal: Summary Modal
  const summaryModal = createMockElement('div', { id: 'summary-modal', hidden: '' });
  summaryModal.hidden = true;
  summaryModal.setAttribute('hidden', '');
  const modalShiftTitle = createMockElement('h2', { id: 'modal-shift-title' });
  const summaryModalContent = createMockElement('div', { id: 'summary-modal-content' });
  const modalCasesProcessed = createMockElement('span', { id: 'modal-cases-processed' });
  const modalAccuracy = createMockElement('span', { id: 'modal-accuracy' });
  const modalCo2Reduced = createMockElement('span', { id: 'modal-co2-reduced' });
  const btnNextShift = createMockElement('button', { id: 'btn-next-shift' });

  // Modal: Day Intro Modal
  const dayIntroModal = createMockElement('div', { id: 'day-intro-modal', hidden: '' });
  dayIntroModal.hidden = true;
  dayIntroModal.setAttribute('hidden', '');
  const dayIntroBadge = createMockElement('div', { id: 'day-intro-badge' });
  const dayIntroTitle = createMockElement('h2', { id: 'day-intro-title' });
  const dayIntroDescription = createMockElement('p', { id: 'day-intro-description' });
  const dayIntroCases = createMockElement('span', { id: 'day-intro-cases' });
  const dayIntroTime = createMockElement('span', { id: 'day-intro-time' });
  const dayIntroMechanics = createMockElement('ul', { id: 'day-intro-mechanics' });
  const btnStartShift = createMockElement('button', { id: 'btn-start-shift' });

  const elementMap = {
    '#screen-main-menu': screenMainMenu,
    '#btn-start-game': btnStartGame,
    '.menu-title': menuTitle,
    '.menu-subtitle': menuSubtitle,
    '.menu-briefing': menuBriefing,

    '#screen-gameplay': screenGameplay,
    '#top-bar': topBar,
    '#top-bar-day': topBarDay,
    '#top-bar-case': topBarCase,
    '#meter-netzero-val': meterNetZeroVal,
    '#meter-netzero-bar': meterNetZeroBar,
    '#meter-budget-val': meterBudgetVal,
    '#meter-budget-bar': meterBudgetBar,
    '#meter-trust-val': meterTrustVal,
    '#meter-trust-bar': meterTrustBar,
    '#timer-display': timerDisplay,
    '#timer-container': timerContainer,

    '.workspace-tabs-bar': workspaceTabsBar,
    '#workspace': workspace,
    '#rulebook-panel': rulebookPanel,
    '#rulebook-content': rulebookContent,
    '#rulebook-rates-list': rulebookRatesList,

    '#dossier-panel': dossierPanel,
    '#dossier-citizen-name': dossierCitizenName,
    '#dossier-citizen-id': dossierCitizenId,
    '#dossier-district': dossierDistrict,
    '#dossier-roof': dossierRoof,
    '#dossier-declared': dossierDeclared,
    '#dossier-note': dossierNote,
    '#dossier-receipts-container': dossierReceiptsContainer,

    '#action-panel': actionPanel,
    '#action-panel-status': actionPanelStatus,
    '#calc-display': calcDisplay,
    '#calc-tape': calcTape,
    '#btn-calc-clear': btnCalcClear,
    '#summary-audited-val': summaryAuditedVal,
    '#summary-declared-val': summaryDeclaredVal,
    '#summary-variance-val': summaryVarianceVal,
    '#grant-select': grantSelect,
    '#btn-action-approve': btnActionApprove,
    '#btn-action-fine': btnActionFine,
    '#btn-action-grant': btnActionGrant,

    '#screen-game-over': screenGameOver,
    '#game-over-badge': gameOverBadge,
    '#game-over-title': gameOverTitle,
    '#game-over-reason': gameOverReason,
    '#game-over-stats': gameOverStats,
    '#game-over-days': gameOverDays,
    '#game-over-netzero': gameOverNetzero,
    '#game-over-trust': gameOverTrust,
    '#game-over-budget': gameOverBudget,
    '#game-over-total-processed': gameOverTotalProcessed,
    '#game-over-total-correct': gameOverTotalCorrect,
    '#game-over-total-fines': gameOverTotalFines,
    '#game-over-total-grants': gameOverTotalGrants,
    '#btn-restart-game': btnRestartGame,
    '#btn-return-menu': btnReturnMenu,

    '#summary-modal': summaryModal,
    '#modal-shift-title': modalShiftTitle,
    '#summary-modal-content': summaryModalContent,
    '#modal-cases-processed': modalCasesProcessed,
    '#modal-accuracy': modalAccuracy,
    '#modal-co2-reduced': modalCo2Reduced,
    '#btn-next-shift': btnNextShift,

    '#day-intro-modal': dayIntroModal,
    '#day-intro-badge': dayIntroBadge,
    '#day-intro-title': dayIntroTitle,
    '#day-intro-description': dayIntroDescription,
    '#day-intro-cases': dayIntroCases,
    '#day-intro-time': dayIntroTime,
    '#day-intro-mechanics': dayIntroMechanics,
    '#btn-start-shift': btnStartShift,
  };

  const listeners = {};
  const root = {
    querySelector: (sel) => elementMap[sel] || null,
    querySelectorAll: (sel) => {
      if (sel === '.workspace-tab-btn') {
        return [tabRulebook, tabDossier, tabAction];
      }
      return elementMap[sel] ? [elementMap[sel]] : [];
    },
    addEventListener: (type, handler) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(handler);
    },
    removeEventListener: (type, handler) => {
      if (listeners[type]) {
        listeners[type] = listeners[type].filter((h) => h !== handler);
      }
    },
    dispatchEvent: (event) => {
      const handlers = listeners[event.type] || [];
      for (const h of handlers) h(event);
    },
    _elements: elementMap,
    _listeners: listeners,
  };

  return { root, elements: elementMap };
}

describe('Subphase 2C: Screens and Interactions (P2-12 to P2-16)', () => {
  let mockEnv;

  beforeEach(() => {
    mockEnv = createFullMockDom();
  });

  describe('P2-12: Main Menu Screen', () => {
    it('initializes and binds to main menu DOM nodes', () => {
      const menu = createMainMenuScreen(mockEnv.root);
      expect(menu).toBeInstanceOf(MainMenuScreen);
      expect(menu.isActive()).toBe(true);
    });

    it('manages active state with show() and hide()', () => {
      const menu = createMainMenuScreen(mockEnv.root);
      expect(menu.isActive()).toBe(true);

      menu.hide();
      expect(menu.isActive()).toBe(false);
      expect(mockEnv.elements['#screen-main-menu'].classList.contains('active')).toBe(false);

      menu.show();
      expect(menu.isActive()).toBe(true);
      expect(mockEnv.elements['#screen-main-menu'].classList.contains('active')).toBe(true);
    });

    it('updates title and subtitle text', () => {
      const menu = createMainMenuScreen(mockEnv.root);
      menu.setTitle('ANTALYA DISTRICT ASSESSOR');
      menu.setSubtitle('Protocol Revision 31.5');
      expect(mockEnv.elements['.menu-title'].textContent).toBe('ANTALYA DISTRICT ASSESSOR');
      expect(mockEnv.elements['.menu-subtitle'].textContent).toBe('Protocol Revision 31.5');
    });

    it('triggers onStart callback when "Initialize Shift Terminal" button is clicked', () => {
      const onStart = vi.fn();
      createMainMenuScreen(mockEnv.root, { onStart });

      mockEnv.elements['#btn-start-game'].dispatchEvent({ type: 'click' });
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('P2-13: Gameplay Screen Assembly', () => {
    it('assembles all 5 workspace components within one cohesive screen', () => {
      const gameplay = createGameplayScreen(mockEnv.root);
      expect(gameplay).toBeInstanceOf(GameplayScreen);
      expect(gameplay.topBar).toBeDefined();
      expect(gameplay.rulebook).toBeDefined();
      expect(gameplay.dossier).toBeDefined();
      expect(gameplay.calculator).toBeDefined();
      expect(gameplay.actionPanel).toBeDefined();
    });

    it('handles responsive workspace tab navigation', () => {
      const onTabChange = vi.fn();
      const gameplay = createGameplayScreen(mockEnv.root, { onTabChange });

      expect(gameplay.getActiveTab()).toBe('rulebook-panel');

      // Switch to dossier panel
      gameplay.setActiveTab('dossier-panel');
      expect(gameplay.getActiveTab()).toBe('dossier-panel');
      expect(mockEnv.elements['#dossier-panel'].classList.contains('tab-active')).toBe(true);
      expect(mockEnv.elements['#rulebook-panel'].classList.contains('tab-active')).toBe(false);
      expect(mockEnv.elements['#workspace'].getAttribute('data-tab-mode')).toBe('tabs');
      expect(onTabChange).toHaveBeenCalledWith('dossier-panel');

      // Switch to action panel via tab button click
      const tabButtons = mockEnv.root.querySelectorAll('.workspace-tab-btn');
      const actionBtn = tabButtons[2];
      actionBtn.dispatchEvent({ type: 'click' });
      expect(gameplay.getActiveTab()).toBe('action-panel');
      expect(mockEnv.elements['#action-panel'].classList.contains('tab-active')).toBe(true);
    });

    it('delegates unified state update to subcomponents', () => {
      const gameplay = createGameplayScreen(mockEnv.root);
      gameplay.update({
        topBar: {
          day: 2,
          currentCaseIndex: 3,
          totalCases: 8,
          metrics: { netZero: 45, budget: 4200, trust: 65 },
          timeRemaining: 95,
        },
        citizen: {
          id: 'CIT-204',
          name: 'Mehmet Demir',
          district: 'Konyaaltı',
          declaredCO2: 180.5,
          note: 'Heat pump pending installation.',
        },
        actionPanel: {
          auditedCO2: 182.0,
          declaredCO2: 180.5,
          status: 'PENDING_APPROVAL',
        },
      });

      expect(mockEnv.elements['#top-bar-day'].textContent).toBe('DAY 2 OF 3');
      expect(mockEnv.elements['#top-bar-case'].textContent).toBe('CASE 4/8');
      expect(mockEnv.elements['#dossier-citizen-name'].textContent).toBe('Mehmet Demir');
      expect(mockEnv.elements['#dossier-citizen-id'].textContent).toBe('CIT-204');
      expect(mockEnv.elements['#summary-declared-val'].textContent).toBe('180.5 kg');
    });

    it('forwards action decisions (APPROVE, FINE, GRANT) to configured options', () => {
      const onApprove = vi.fn();
      const onFine = vi.fn();
      const onGrant = vi.fn();

      createGameplayScreen(mockEnv.root, { onApprove, onFine, onGrant });

      mockEnv.elements['#btn-action-approve'].dispatchEvent({ type: 'click' });
      expect(onApprove).toHaveBeenCalledTimes(1);

      mockEnv.elements['#btn-action-fine'].dispatchEvent({ type: 'click' });
      expect(onFine).toHaveBeenCalledTimes(1);

      mockEnv.elements['#grant-select'].value = 'HEAT_PUMP';
      mockEnv.elements['#btn-action-grant'].dispatchEvent({ type: 'click' });
      expect(onGrant).toHaveBeenCalledWith('HEAT_PUMP');
    });
  });

  describe('P2-14: Shift Summary Modal', () => {
    it('formats audit accuracy percentage accurately', () => {
      expect(formatAccuracy(7, 8)).toBe('87.5%');
      expect(formatAccuracy(10, 10)).toBe('100.0%');
      expect(formatAccuracy(0, 5)).toBe('0.0%');
      expect(formatAccuracy(0, 0)).toBe('0.0%');
    });

    it('opens and closes modal using standard HTML hidden attribute', () => {
      const onClose = vi.fn();
      const modal = createSummaryModal(mockEnv.root, { onClose });

      expect(modal.isOpen()).toBe(false);

      modal.open({
        day: 1,
        processedCount: 8,
        correctActions: 7,
        co2ReducedKg: 420,
      });

      expect(modal.isOpen()).toBe(true);
      expect(mockEnv.elements['#modal-shift-title'].textContent).toBe('DAY 1 PERFORMANCE REPORT');
      expect(mockEnv.elements['#modal-cases-processed'].textContent).toBe('8');
      expect(mockEnv.elements['#modal-accuracy'].textContent).toBe('87.5%');
      expect(mockEnv.elements['#modal-co2-reduced'].textContent).toBe('420.0 kg');

      modal.close();
      expect(modal.isOpen()).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('invokes onProceed callback when "Proceed to Next Shift" button is clicked', () => {
      const onProceed = vi.fn();
      createSummaryModal(mockEnv.root, { onProceed });

      mockEnv.elements['#btn-next-shift'].dispatchEvent({ type: 'click' });
      expect(onProceed).toHaveBeenCalledTimes(1);
    });
  });

  describe('P2-15: Game Over Screen', () => {
    it('returns authoritative failure reason messages', () => {
      expect(getFailureMessage('BANKRUPTCY')).toBe('Municipal Budget Depleted ($0 remaining).');
      expect(getFailureMessage('PUBLIC_TRUST')).toContain('Public Trust Collapsed');
      expect(getFailureMessage('NET_ZERO_TARGET')).toContain('100% Net-Zero target');
      expect(getFailureMessage('Custom violation')).toBe('Custom violation');
    });

    it('renders failure presentation correctly', () => {
      const gameOver = createGameOverScreen(mockEnv.root);
      gameOver.show({
        isVictory: false,
        reason: 'BANKRUPTCY',
        daysCompleted: 1,
        maxDays: 3,
        netZero: 28,
        trust: 45,
      });

      expect(gameOver.isActive()).toBe(true);
      expect(mockEnv.elements['#game-over-title'].textContent).toBe('CAMPAIGN FAILED');
      expect(mockEnv.elements['#game-over-badge'].textContent).toBe('TERMINATION OF COMMISSION');
      expect(mockEnv.elements['#game-over-badge'].classList.contains('badge-danger')).toBe(true);
      expect(mockEnv.elements['#game-over-reason'].textContent).toBe('Municipal Budget Depleted ($0 remaining).');
      expect(mockEnv.elements['#game-over-days'].textContent).toBe('1 of 3');
      expect(mockEnv.elements['#game-over-netzero'].textContent).toBe('28%');
      expect(mockEnv.elements['#game-over-trust'].textContent).toBe('45%');
    });

    it('renders victory presentation correctly', () => {
      const gameOver = createGameOverScreen(mockEnv.root);
      gameOver.show({
        isVictory: true,
        daysCompleted: 3,
        maxDays: 3,
        netZero: 104,
        trust: 82,
      });

      expect(gameOver.isActive()).toBe(true);
      expect(mockEnv.elements['#game-over-title'].textContent).toBe('CAMPAIGN VICTORY');
      expect(mockEnv.elements['#game-over-badge'].textContent).toBe('COP31 TARGET ACHIEVED');
      expect(mockEnv.elements['#game-over-badge'].classList.contains('badge-gold')).toBe(true);
      expect(mockEnv.elements['#game-over-days'].textContent).toBe('3 of 3');
      expect(mockEnv.elements['#game-over-netzero'].textContent).toBe('104%');
      expect(mockEnv.elements['#game-over-trust'].textContent).toBe('82%');
    });

    it('triggers restart and return to menu callbacks', () => {
      const onRestart = vi.fn();
      const onReturnMenu = vi.fn();
      createGameOverScreen(mockEnv.root, { onRestart, onReturnMenu });

      mockEnv.elements['#btn-restart-game'].dispatchEvent({ type: 'click' });
      expect(onRestart).toHaveBeenCalledTimes(1);

      mockEnv.elements['#btn-return-menu'].dispatchEvent({ type: 'click' });
      expect(onReturnMenu).toHaveBeenCalledTimes(1);
    });
  });

  describe('P2-16: Button & Modal Interactions (Renderer, EventManager, App)', () => {
    it('Renderer manages exclusive screen activation', () => {
      const onScreenChange = vi.fn();
      const renderer = createRenderer(mockEnv.root, { onScreenChange });

      // Starts at main-menu
      expect(renderer.getCurrentScreen()).toBe('main-menu');

      // Switch to gameplay
      renderer.showScreen('gameplay');
      expect(renderer.getCurrentScreen()).toBe('gameplay');
      expect(mockEnv.elements['#screen-gameplay'].classList.contains('active')).toBe(true);
      expect(mockEnv.elements['#screen-main-menu'].classList.contains('active')).toBe(false);
      expect(mockEnv.elements['#screen-game-over'].classList.contains('active')).toBe(false);

      // Switch to game-over
      renderer.showScreen('game-over');
      expect(renderer.getCurrentScreen()).toBe('game-over');
      expect(mockEnv.elements['#screen-game-over'].classList.contains('active')).toBe(true);
      expect(mockEnv.elements['#screen-gameplay'].classList.contains('active')).toBe(false);
    });

    it('EventManager binds and dispatches interactive UI events', () => {
      const onStartGame = vi.fn();
      const onApprove = vi.fn();
      const onFine = vi.fn();
      const onGrant = vi.fn();
      const onGrantSelectChange = vi.fn();
      const onNextShift = vi.fn();

      const events = setupUIEvents(mockEnv.root, {
        onStartGame,
        onApprove,
        onFine,
        onGrant,
        onGrantSelectChange,
        onNextShift,
      });

      mockEnv.elements['#btn-start-game'].dispatchEvent({ type: 'click' });
      expect(onStartGame).toHaveBeenCalledTimes(1);

      mockEnv.elements['#btn-action-approve'].dispatchEvent({ type: 'click' });
      expect(onApprove).toHaveBeenCalledTimes(1);

      mockEnv.elements['#btn-action-fine'].dispatchEvent({ type: 'click' });
      expect(onFine).toHaveBeenCalledTimes(1);

      mockEnv.elements['#grant-select'].value = 'COMPOST_KIT';
      mockEnv.elements['#btn-action-grant'].dispatchEvent({ type: 'click' });
      expect(onGrant).toHaveBeenCalledWith('COMPOST_KIT');

      mockEnv.elements['#grant-select'].dispatchEvent({ type: 'change', target: { value: 'TRANSIT_PASS' } });
      expect(onGrantSelectChange).toHaveBeenCalledWith('TRANSIT_PASS');

      mockEnv.elements['#btn-next-shift'].dispatchEvent({ type: 'click' });
      expect(onNextShift).toHaveBeenCalledTimes(1);

      events.destroy();
    });

    it('handles keyboard shortcuts for modal dismissal and stamp actions', () => {
      const onCloseSummaryModal = vi.fn();
      const onApprove = vi.fn();
      const onFine = vi.fn();
      const onGrant = vi.fn();

      setupUIEvents(mockEnv.root, {
        onCloseSummaryModal,
        onApprove,
        onFine,
        onGrant,
      });

      // 1. Escape key when modal is open
      mockEnv.elements['#summary-modal'].hidden = false;
      mockEnv.elements['#summary-modal'].removeAttribute('hidden');
      mockEnv.root.dispatchEvent({ type: 'keydown', key: 'Escape' });
      expect(onCloseSummaryModal).toHaveBeenCalledTimes(1);

      // 2. Numeric keys 1, 2, 3 when gameplay screen is active
      mockEnv.elements['#screen-gameplay'].classList.add('active');
      mockEnv.root.dispatchEvent({ type: 'keydown', key: '1' });
      expect(onApprove).toHaveBeenCalledTimes(1);

      mockEnv.root.dispatchEvent({ type: 'keydown', key: '2' });
      expect(onFine).toHaveBeenCalledTimes(1);

      mockEnv.elements['#grant-select'].value = 'COOL_ROOF';
      mockEnv.root.dispatchEvent({ type: 'keydown', key: '3' });
      expect(onGrant).toHaveBeenCalledWith('COOL_ROOF');
    });

    it('initApp() bootstraps application with full interactivity', () => {
      const app = initApp(mockEnv.root);
      expect(app.renderer).toBeDefined();
      expect(app.events).toBeDefined();

      // Clicking start game should switch to gameplay screen
      mockEnv.elements['#btn-start-game'].dispatchEvent({ type: 'click' });
      expect(app.renderer.getCurrentScreen()).toBe('gameplay');
      expect(mockEnv.elements['#screen-gameplay'].classList.contains('active')).toBe(true);

      // Opening and proceeding through shift summary modal
      app.renderer.showSummaryModal({ day: 1, processedCount: 5, correctActions: 4 });
      expect(app.renderer.isSummaryModalOpen()).toBe(true);

      mockEnv.elements['#btn-next-shift'].dispatchEvent({ type: 'click' });
      expect(app.renderer.isSummaryModalOpen()).toBe(false);

      // Game over restart switches back to gameplay
      mockEnv.elements['#btn-restart-game'].dispatchEvent({ type: 'click' });
      expect(app.renderer.getCurrentScreen()).toBe('gameplay');

      // Return to main menu switches back to main-menu
      mockEnv.elements['#btn-return-menu'].dispatchEvent({ type: 'click' });
      expect(app.renderer.getCurrentScreen()).toBe('main-menu');
    });
  });
});

