/**
 * @file progression-frontend.test.js
 * Subphase 4B: Progression Frontend Tests (P4-09 through P4-14).
 *
 * Verifies:
 * - P4-09: Day Introduction modal (objectives, quota, timer, mechanics)
 * - P4-10: Shift-end summary (cases, accuracy, CO2 reduced, fines, grants)
 * - P4-11: Next-day transition (state carryover, new day config, intro display)
 * - P4-12: Campaign victory screen (celebration, full 3-day stats, metrics)
 * - P4-13: Campaign failure screen (bankruptcy, trust collapse, net-zero deficit)
 * - P4-14: Campaign restart (full reset of metrics, cases, stats, day 1 intro)
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { backendApi } from '../js/backend/index.js';
import {
  DayIntroModalComponent,
  createDayIntroModal,
} from '../js/frontend/screens/day-intro-modal.js';
import {
  SummaryModalComponent,
  createSummaryModal,
} from '../js/frontend/screens/summary-screen.js';
import {
  GameOverScreenComponent,
  createGameOverScreen,
  getFailureMessage,
} from '../js/frontend/screens/game-over-screen.js';
import { createGameController } from '../js/frontend/game-controller.js';
import { createRenderer } from '../js/frontend/renderer.js';

// Minimal mock DOM helper
function createMockElement(tagName = 'div', attributes = {}) {
  const classes = new Set();
  const children = [];
  const listeners = {};
  const attrs = { ...attributes };
  let _text = '';
  let _inner = '';
  let _hidden = false;

  const elem = {
    tagName: tagName.toUpperCase(),
    get textContent() { return _text; },
    set textContent(val) { _text = String(val ?? ''); },
    get innerHTML() { return _inner; },
    set innerHTML(val) { _inner = String(val ?? ''); },
    get hidden() { return _hidden; },
    set hidden(val) { _hidden = Boolean(val); },
    style: {},
    dataset: {},
    disabled: false,
    value: '',
    children,
    classList: {
      add: (...cls) => cls.forEach((c) => classes.add(c)),
      remove: (...cls) => cls.forEach((c) => classes.delete(c)),
      contains: (c) => classes.has(c),
      toggle: (c, force) => {
        if (force === undefined ? classes.has(c) : !force) {
          classes.delete(c);
          return false;
        }
        classes.add(c);
        return true;
      },
    },
    getAttribute: (k) => attrs[k] ?? null,
    setAttribute: (k, v) => { attrs[k] = String(v); },
    removeAttribute: (k) => { delete attrs[k]; },
    hasAttribute: (k) => k in attrs,
    addEventListener: (type, handler) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(handler);
    },
    dispatchEvent: (event) => {
      const handlers = listeners[event.type] || [];
      handlers.forEach((h) => h(event));
    },
    appendChild: (child) => {
      children.push(child);
      child.parentNode = elem;
      return child;
    },
    removeChild: (child) => {
      const idx = children.indexOf(child);
      if (idx !== -1) children.splice(idx, 1);
      return child;
    },
    remove: function () {
      if (this.parentNode) this.parentNode.removeChild(this);
    },
    parentNode: null,
    querySelector: (sel) => null,
    querySelectorAll: () => [],
    replaceChildren: (...newChildren) => {
      children.length = 0;
      newChildren.forEach((c) => {
        children.push(c);
        c.parentNode = elem;
      });
    },
  };

  return elem;
}

function createProgressionMockDom() {
  const elements = {
    // Top Bar
    '#top-bar': createMockElement('header'),
    '#top-bar-day': createMockElement('span'),
    '#top-bar-case': createMockElement('span'),
    '#meter-netzero-val': createMockElement('span'),
    '#meter-netzero-bar': createMockElement('div'),
    '#meter-budget-val': createMockElement('span'),
    '#meter-budget-bar': createMockElement('div'),
    '#meter-trust-val': createMockElement('span'),
    '#meter-trust-bar': createMockElement('div'),
    '#timer-display': createMockElement('span'),
    '#timer-container': createMockElement('div'),

    // Screens
    '#screen-main-menu': createMockElement('section'),
    '#screen-gameplay': createMockElement('section'),
    '#screen-game-over': createMockElement('section'),

    // Day Intro Modal
    '#day-intro-modal': createMockElement('div', { hidden: '' }),
    '#day-intro-badge': createMockElement('div'),
    '#day-intro-title': createMockElement('h2'),
    '#day-intro-description': createMockElement('p'),
    '#day-intro-cases': createMockElement('span'),
    '#day-intro-time': createMockElement('span'),
    '#day-intro-mechanics': createMockElement('ul'),
    '#btn-start-shift': createMockElement('button'),

    // Summary Modal
    '#summary-modal': createMockElement('div', { hidden: '' }),
    '#modal-shift-title': createMockElement('h2'),
    '#summary-modal-content': createMockElement('div'),
    '#modal-cases-processed': createMockElement('span'),
    '#modal-accuracy': createMockElement('span'),
    '#modal-co2-reduced': createMockElement('span'),
    '#modal-fines-issued': createMockElement('span'),
    '#modal-grants-issued': createMockElement('span'),
    '#btn-next-shift': createMockElement('button'),

    // Game Over Screen
    '#game-over-badge': createMockElement('div'),
    '#game-over-title': createMockElement('h1'),
    '#game-over-reason': createMockElement('p'),
    '#game-over-stats': createMockElement('div'),
    '#game-over-days': createMockElement('span'),
    '#game-over-netzero': createMockElement('span'),
    '#game-over-trust': createMockElement('span'),
    '#game-over-budget': createMockElement('span'),
    '#game-over-total-processed': createMockElement('span'),
    '#game-over-total-correct': createMockElement('span'),
    '#game-over-total-fines': createMockElement('span'),
    '#game-over-total-grants': createMockElement('span'),
    '#btn-restart-game': createMockElement('button'),
    '#btn-return-menu': createMockElement('button'),

    // Dossier & Action Panel
    '#dossier-panel': createMockElement('section'),
    '#dossier-citizen-name': createMockElement('h2'),
    '#dossier-citizen-id': createMockElement('span'),
    '#dossier-district': createMockElement('span'),
    '#dossier-roof': createMockElement('span'),
    '#dossier-declared': createMockElement('span'),
    '#dossier-note': createMockElement('p'),
    '#dossier-receipts-container': createMockElement('div'),
    '#action-panel': createMockElement('section'),
    '#action-panel-status': createMockElement('span'),
    '#grant-select': createMockElement('select'),
    '#btn-action-approve': createMockElement('button'),
    '#btn-action-fine': createMockElement('button'),
    '#btn-action-grant': createMockElement('button'),
    '#calc-display': createMockElement('div'),
    '#calc-tape': createMockElement('div'),
    '#btn-calc-clear': createMockElement('button'),
    '#summary-audited-val': createMockElement('span'),
    '#summary-declared-val': createMockElement('span'),
    '#summary-variance-val': createMockElement('span'),
    '#rulebook-panel': createMockElement('aside'),
    '#rulebook-content': createMockElement('div'),
    '#rulebook-rates-list': createMockElement('div'),
  };

  const root = {
    querySelector: (sel) => elements[sel] || null,
    querySelectorAll: (sel) => (elements[sel] ? [elements[sel]] : []),
  };

  return { root, elements };
}

describe('Subphase 4B: Frontend Tasks (P4-09 to P4-14)', () => {

  describe('P4-09: Day Introduction Screen / Modal', () => {
    it('creates DayIntroModalComponent and renders Day 1 configuration', () => {
      const { root, elements } = createProgressionMockDom();
      const modal = createDayIntroModal(root);

      const day1Config = backendApi.getDayConfig(1);
      modal.render(day1Config);

      expect(elements['#day-intro-badge'].textContent).toContain('DAY 1 OF 3');
      expect(elements['#day-intro-title'].textContent).toContain('INTRODUCTION');
      expect(elements['#day-intro-description'].textContent).toContain('Basic Audits');
      expect(elements['#day-intro-cases'].textContent).toBe('5 Citizens');
      expect(elements['#day-intro-time'].textContent).toContain('120s');
    });

    it('renders Day 2 configuration with greenwashing mechanics and expanded grants', () => {
      const { root, elements } = createProgressionMockDom();
      const modal = createDayIntroModal(root);

      const day2Config = backendApi.getDayConfig(2);
      modal.render(day2Config);

      expect(elements['#day-intro-badge'].textContent).toContain('DAY 2 OF 3');
      expect(elements['#day-intro-title'].textContent).toContain('INVESTIGATION');
      expect(elements['#day-intro-cases'].textContent).toBe('6 Citizens');
      expect(elements['#day-intro-time'].textContent).toContain('100s');
    });

    it('renders Day 3 configuration with high complexity shift details', () => {
      const { root, elements } = createProgressionMockDom();
      const modal = createDayIntroModal(root);

      const day3Config = backendApi.getDayConfig(3);
      modal.render(day3Config);

      expect(elements['#day-intro-badge'].textContent).toContain('DAY 3 OF 3');
      expect(elements['#day-intro-title'].textContent).toContain('FINAL AUDIT');
      expect(elements['#day-intro-cases'].textContent).toBe('7 Citizens');
      expect(elements['#day-intro-time'].textContent).toContain('90s');
    });

    it('manages modal visibility via open(), close(), and isOpen()', () => {
      const { root, elements } = createProgressionMockDom();
      const modal = createDayIntroModal(root);

      modal.open(backendApi.getDayConfig(1));
      expect(modal.isOpen()).toBe(true);
      expect(elements['#day-intro-modal'].hidden).toBe(false);

      modal.close();
      expect(modal.isOpen()).toBe(false);
      expect(elements['#day-intro-modal'].hidden).toBe(true);
    });

    it('invokes onStartShift callback when player clicks begin shift', () => {
      const { root, elements } = createProgressionMockDom();
      const onStartShift = vi.fn();
      createDayIntroModal(root, { onStartShift });

      elements['#btn-start-shift'].dispatchEvent({ type: 'click' });
      expect(onStartShift).toHaveBeenCalledTimes(1);
    });
  });

  describe('P4-10: Shift-End Summary', () => {
    it('renders daily results, statistics, fines, and grants in summary modal', () => {
      const { root, elements } = createProgressionMockDom();
      const summary = createSummaryModal(root);

      summary.render({
        day: 1,
        processedCount: 5,
        correctActions: 4,
        co2ReducedKg: 24.5,
        finesIssued: 2,
        grantsIssued: 1,
      });

      expect(elements['#modal-shift-title'].textContent).toBe('DAY 1 PERFORMANCE REPORT');
      expect(elements['#modal-cases-processed'].textContent).toBe('5');
      expect(elements['#modal-accuracy'].textContent).toBe('80.0%');
      expect(elements['#modal-co2-reduced'].textContent).toBe('24.5 kg');
      expect(elements['#modal-fines-issued'].textContent).toBe('2');
      expect(elements['#modal-grants-issued'].textContent).toBe('1');
    });

    it('handles zero or missing values gracefully in shift summary', () => {
      const { root, elements } = createProgressionMockDom();
      const summary = createSummaryModal(root);

      summary.render({ day: 2 });
      expect(elements['#modal-cases-processed'].textContent).toBe('0');
      expect(elements['#modal-accuracy'].textContent).toBe('0.0%');
      expect(elements['#modal-co2-reduced'].textContent).toBe('0.0 kg');
      expect(elements['#modal-fines-issued'].textContent).toBe('0');
      expect(elements['#modal-grants-issued'].textContent).toBe('0');
    });
  });

  describe('P4-11: Next-Day Transition', () => {
    it('advancing day via controller updates metrics, day counter, and shows day intro', () => {
      backendApi.startCampaign();
      const { root, elements } = createProgressionMockDom();
      const renderer = createRenderer(root);
      const ctrl = createGameController(backendApi, renderer, { root });

      ctrl.startCampaign();
      expect(renderer.isDayIntroModalOpen()).toBe(true);
      expect(elements['#top-bar-day'].textContent).toContain('DAY 1');

      // Player completes Day 1 by advancing
      ctrl.onNextShift(); // triggers backendApi.advanceDay()

      // Metrics carry over and day 2 intro is displayed
      const stateView = backendApi.getState();
      expect(stateView.currentDay).toBe(2);
      expect(elements['#top-bar-day'].textContent).toContain('DAY 2');
      expect(renderer.isDayIntroModalOpen()).toBe(true);
      expect(elements['#day-intro-title'].textContent).toContain('DAY 2: INVESTIGATION');

      ctrl.destroy();
    });

    it('carries over municipal metrics between Day 1 and Day 2', () => {
      backendApi.startCampaign();
      const { root } = createProgressionMockDom();
      const renderer = createRenderer(root);
      const ctrl = createGameController(backendApi, renderer, { root });

      ctrl.startCampaign();

      // Submit an action on Day 1 to change metrics
      const c1 = backendApi.getCurrentCase();
      backendApi.submitAction({ caseId: c1.id, action: 'FINE' });
      const metricsAfterAction = backendApi.getState().metrics;

      // Advance to Day 2
      ctrl.onNextShift();

      const day2State = backendApi.getState();
      expect(day2State.currentDay).toBe(2);
      expect(day2State.metrics.budget).toBe(metricsAfterAction.budget);
      expect(day2State.metrics.trust).toBe(metricsAfterAction.trust);
      expect(day2State.metrics.netZero).toBe(metricsAfterAction.netZero);

      ctrl.destroy();
    });
  });

  describe('P4-12: Campaign Victory Screen', () => {
    it('renders victory screen with celebratory badge, final metrics, and campaign statistics', () => {
      const { root, elements } = createProgressionMockDom();
      const gameOver = createGameOverScreen(root);

      gameOver.render({
        isVictory: true,
        daysCompleted: 3,
        maxDays: 3,
        netZero: 106,
        trust: 78,
        budget: 4200,
        campaignStats: {
          totalProcessed: 18,
          totalCorrect: 16,
          totalFines: 6,
          totalGrants: 4,
          daysCompleted: 3,
        },
      });

      expect(elements['#game-over-title'].textContent).toBe('CAMPAIGN VICTORY');
      expect(elements['#game-over-badge'].textContent).toBe('COP31 TARGET ACHIEVED');
      expect(elements['#game-over-badge'].classList.contains('badge-gold')).toBe(true);
      expect(elements['#game-over-days'].textContent).toBe('3 of 3');
      expect(elements['#game-over-netzero'].textContent).toBe('106%');
      expect(elements['#game-over-trust'].textContent).toBe('78%');
      expect(elements['#game-over-budget'].textContent).toBe('$4,200');
      expect(elements['#game-over-total-processed'].textContent).toBe('18');
      expect(elements['#game-over-total-correct'].textContent).toBe('16');
      expect(elements['#game-over-total-fines'].textContent).toBe('6');
      expect(elements['#game-over-total-grants'].textContent).toBe('4');
    });
  });

  describe('P4-13: Campaign Failure Screen', () => {
    it('renders failure screen with explanatory reason for bankruptcy', () => {
      const { root, elements } = createProgressionMockDom();
      const gameOver = createGameOverScreen(root);

      gameOver.render({
        isVictory: false,
        reason: 'BANKRUPTCY',
        daysCompleted: 1,
        maxDays: 3,
        netZero: 28,
        trust: 55,
        budget: 0,
        campaignStats: { totalProcessed: 3, totalCorrect: 1 },
      });

      expect(elements['#game-over-title'].textContent).toBe('CAMPAIGN FAILED');
      expect(elements['#game-over-badge'].textContent).toBe('TERMINATION OF COMMISSION');
      expect(elements['#game-over-badge'].classList.contains('badge-danger')).toBe(true);
      expect(elements['#game-over-reason'].textContent).toBe('Municipal Budget Depleted ($0 remaining).');
      expect(elements['#game-over-budget'].textContent).toBe('$0');
    });

    it('renders failure screen for public trust collapse', () => {
      const { root, elements } = createProgressionMockDom();
      const gameOver = createGameOverScreen(root);

      gameOver.render({
        isVictory: false,
        reason: 'PUBLIC_TRUST',
        daysCompleted: 2,
        trust: 0,
      });

      expect(elements['#game-over-reason'].textContent).toContain('Public Trust Collapsed');
      expect(elements['#game-over-trust'].textContent).toBe('0%');
    });

    it('renders failure screen for Net-Zero deficit at end of Day 3', () => {
      const { root, elements } = createProgressionMockDom();
      const gameOver = createGameOverScreen(root);

      gameOver.render({
        isVictory: false,
        reason: 'NET_ZERO_TARGET',
        daysCompleted: 3,
        netZero: 82,
        trust: 60,
        budget: 2000,
      });

      expect(elements['#game-over-reason'].textContent).toContain('100% Net-Zero target');
      expect(elements['#game-over-netzero'].textContent).toBe('82%');
    });
  });

  describe('P4-14: Campaign Restart', () => {
    it('restartCampaign resets metrics, day to 1, reloads first case, and shows day 1 intro', () => {
      backendApi.startCampaign();
      const { root, elements } = createProgressionMockDom();
      const renderer = createRenderer(root);
      const ctrl = createGameController(backendApi, renderer, { root });

      ctrl.startCampaign();

      // Submit an action to modify state
      const c1 = backendApi.getCurrentCase();
      backendApi.submitAction({ caseId: c1.id, action: 'FINE' });

      // Restart campaign
      ctrl.restartCampaign();

      const stateView = backendApi.getState();
      expect(stateView.currentDay).toBe(1);
      expect(stateView.currentCaseIndex).toBe(0);
      expect(stateView.metrics.netZero).toBe(30);
      expect(stateView.metrics.budget).toBe(5000);
      expect(stateView.metrics.trust).toBe(70);

      expect(renderer.isDayIntroModalOpen()).toBe(true);
      expect(elements['#top-bar-day'].textContent).toContain('DAY 1');

      ctrl.destroy();
    });
  });
});

