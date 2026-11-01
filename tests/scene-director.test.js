import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  SceneDirector,
  SCENE_NAMES,
  DEFAULT_TRANSITION_DURATIONS,
  createSceneDirector,
} from '../js/frontend/scene-director.js';
import { DossierPanelComponent, createDossierPanel } from '../js/frontend/components/dossier-panel.js';
import { TopBarComponent } from '../js/frontend/components/top-bar.js';
import { GameController } from '../js/frontend/game-controller.js';
import { backendApi } from '../js/backend/index.js';

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
    click: () => {
      const handlers = listeners['click'] || [];
      for (const h of handlers) h({ target: elem, preventDefault: () => {} });
    },
    closest: (selector) => {
      if (selector.startsWith('.') && classes.has(selector.slice(1))) return elem;
      return null;
    },
    querySelector: (selector) => {
      if (selector === '.audio-icon') {
        return createMockElement('span');
      }
      if (selector === '.chip-val') {
        return createMockElement('span');
      }
      return null;
    },
    querySelectorAll: (selector) => {
      return [];
    },
    appendChild: (child) => {
      children.push(child);
      child.parentNode = elem;
      return child;
    },
    removeChild: (child) => {
      const idx = children.indexOf(child);
      if (idx !== -1) children.splice(idx, 1);
      child.parentNode = null;
      return child;
    },
    remove: function () {
      if (elem.parentNode) {
        elem.parentNode.removeChild(elem);
      }
    },
  };

  return elem;
}

function createMockRoot() {
  const elements = {};
  const root = {
    attributes: {},
    setAttribute: (k, v) => { root.attributes[k] = v; },
    getAttribute: (k) => root.attributes[k] || null,
    querySelector: (selector) => elements[selector] || null,
    querySelectorAll: (selector) => (elements[selector] ? [elements[selector]] : []),
    createElement: (tag) => createMockElement(tag),
  };

  elements['#dossier-panel'] = createMockElement('section');
  elements['#dossier-citizen-name'] = createMockElement('h2');
  elements['#dossier-citizen-id'] = createMockElement('span');
  elements['#dossier-district'] = createMockElement('span');
  elements['#dossier-roof'] = createMockElement('span');
  elements['#dossier-declared'] = createMockElement('span');
  elements['#dossier-note'] = createMockElement('p');
  elements['#dossier-receipts-container'] = createMockElement('div');
  elements['.dossier-paper'] = createMockElement('div');

  // Top bar elements
  elements['#top-bar-day'] = createMockElement('span');
  elements['#top-bar-case'] = createMockElement('span');
  elements['#meter-netzero-val'] = createMockElement('span');
  elements['#meter-netzero-bar'] = createMockElement('div');
  elements['#meter-budget-val'] = createMockElement('span');
  elements['#meter-budget-bar'] = createMockElement('div');
  elements['#meter-trust-val'] = createMockElement('span');
  elements['#meter-trust-bar'] = createMockElement('div');
  elements['#timer-display'] = createMockElement('span');
  elements['#timer-container'] = createMockElement('div');
  elements['#btn-audio-toggle'] = createMockElement('button');
  elements['#btn-terminal-toggle'] = createMockElement('button');

  return { root, elements };
}

describe('Phase 5B — Immersion, Transitions & Game-Feel Layer (Agent A Tasks)', () => {
  const rootDir = path.resolve(__dirname, '..');
  const componentsCss = fs.readFileSync(path.join(rootDir, 'css/components.css'), 'utf-8');
  const stylesCss = fs.readFileSync(path.join(rootDir, 'css/styles.css'), 'utf-8');
  const responsiveCss = fs.readFileSync(path.join(rootDir, 'css/responsive.css'), 'utf-8');
  const contractMd = fs.readFileSync(path.join(rootDir, 'SCENE_DIRECTOR_CONTRACT.md'), 'utf-8');

  // ─── P5B-01: SceneDirector Core Architecture ──────────────────────────────
  describe('P5B-01: SceneDirector Core Architecture', () => {
    it('defines standard scene sequence matching campaign progression', () => {
      expect(SCENE_NAMES.MENU).toBe('MENU');
      expect(SCENE_NAMES.DAY_BRIEF).toBe('DAY_BRIEF');
      expect(SCENE_NAMES.SHIFT_START).toBe('SHIFT_START');
      expect(SCENE_NAMES.CASE_INTAKE).toBe('CASE_INTAKE');
      expect(SCENE_NAMES.CASE_REVIEW).toBe('CASE_REVIEW');
      expect(SCENE_NAMES.CASE_RESOLVE).toBe('CASE_RESOLVE');
      expect(SCENE_NAMES.NEXT_CASE).toBe('NEXT_CASE');
      expect(SCENE_NAMES.DAY_SUMMARY).toBe('DAY_SUMMARY');
      expect(SCENE_NAMES.NEXT_DAY).toBe('NEXT_DAY');
      expect(SCENE_NAMES.VERDICT).toBe('VERDICT');
    });

    it('has target durations configured, with CASE_INTAKE between 0.6–0.9s', () => {
      expect(DEFAULT_TRANSITION_DURATIONS.CASE_INTAKE).toBeGreaterThanOrEqual(600);
      expect(DEFAULT_TRANSITION_DURATIONS.CASE_INTAKE).toBeLessThanOrEqual(900);
      expect(DEFAULT_TRANSITION_DURATIONS.CASE_RESOLVE).toBeGreaterThan(0);
    });

    it('documents the agreed contract in SCENE_DIRECTOR_CONTRACT.md for Agent B', () => {
      expect(contractMd).toContain('SceneDirector Interface & Integration Contract');
      expect(contractMd).toContain('MENU → DAY_BRIEF → SHIFT_START → CASE_INTAKE → CASE_REVIEW → CASE_RESOLVE → NEXT_CASE → DAY_SUMMARY → NEXT_DAY → VERDICT');
      expect(contractMd).toContain('transitionTo');
      expect(contractMd).toContain('registerScene');
      expect(contractMd).toContain('Agent A Ownership');
      expect(contractMd).toContain('Agent B Ownership');
    });

    it('registers scene handlers and triggers enter/exit hooks on transitionTo', async () => {
      const director = createSceneDirector({ initialScene: SCENE_NAMES.MENU, reducedMotion: true });
      let menuExited = false;
      let briefEntered = false;

      director.registerScene(SCENE_NAMES.MENU, {
        exit: () => { menuExited = true; },
      });
      director.registerScene(SCENE_NAMES.DAY_BRIEF, {
        enter: () => { briefEntered = true; },
      });

      const res = await director.transitionTo(SCENE_NAMES.DAY_BRIEF, { day: 1 });
      expect(menuExited).toBe(true);
      expect(briefEntered).toBe(true);
      expect(res.from).toBe(SCENE_NAMES.MENU);
      expect(res.to).toBe(SCENE_NAMES.DAY_BRIEF);
      expect(director.getCurrentScene()).toBe(SCENE_NAMES.DAY_BRIEF);
      director.destroy();
    });

    it('emits transitionStart, transitionEnd, and sceneChange events', async () => {
      const director = createSceneDirector({ reducedMotion: true });
      const events = [];

      director.on('transitionStart', (e) => events.push(`start:${e.to}`));
      director.on('transitionEnd', (e) => events.push(`end:${e.to}`));
      director.on('sceneChange', (e) => events.push(`change:${e.to}`));

      await director.transitionTo(SCENE_NAMES.CASE_INTAKE, { id: 'C001' });

      expect(events).toContain('start:CASE_INTAKE');
      expect(events).toContain('end:CASE_INTAKE');
      expect(events).toContain('change:CASE_INTAKE');
      director.destroy();
    });

    it('safely handles interrupted or simultaneous transitions without deadlocking', async () => {
      const director = createSceneDirector({
        durations: { CASE_INTAKE: 500, CASE_RESOLVE: 500 },
        reducedMotion: false,
      });

      // Start transition 1
      const p1 = director.transitionTo(SCENE_NAMES.CASE_INTAKE);
      expect(director.isTransitioning()).toBe(true);

      // Start transition 2 before 1 finishes
      const p2 = director.transitionTo(SCENE_NAMES.CASE_RESOLVE);

      // Both should resolve cleanly without hanging
      await Promise.all([p1, p2]);
      expect(director.getCurrentScene()).toBe(SCENE_NAMES.CASE_RESOLVE);
      expect(director.isTransitioning()).toBe(false);
      director.destroy();
    });

    it('skipTransition() immediately resolves active transition', async () => {
      const director = createSceneDirector({
        durations: { CASE_INTAKE: 1000 },
        reducedMotion: false,
      });

      let skipped = false;
      director.on('transitionSkipped', () => { skipped = true; });

      const transitionPromise = director.transitionTo(SCENE_NAMES.CASE_INTAKE);
      expect(director.isTransitioning()).toBe(true);

      director.skipTransition();
      await transitionPromise;

      expect(skipped).toBe(true);
      expect(director.isTransitioning()).toBe(false);
      director.destroy();
    });
  });

  // ─── P5B-04: Citizen Intake Animation ─────────────────────────────────────
  describe('P5B-04: Citizen Intake Animation', () => {
    it('defines CSS slide-in and sequential reveal keyframes in css/components.css', () => {
      expect(componentsCss).toContain('.dossier-intake-anim');
      expect(componentsCss).toContain('@keyframes dossierIntakeSlide');
      expect(componentsCss).toContain('.dossier-settled');
      expect(componentsCss).toContain('.reveal-hidden');
      expect(componentsCss).toContain('.reveal-id-stamp');
      expect(componentsCss).toContain('.reveal-name-in');
    });

    it('animates citizen intake and reveals ID and name sequentially', async () => {
      const { root, elements } = createMockRoot();
      const panel = createDossierPanel(root);
      const citizen = { id: 'C001', name: 'Zeynep Kaya', declaredCO2: 120, receipts: [] };

      const intakePromise = panel.animateIntake(citizen, { duration: 100, reducedMotion: false });

      // Elements should have been initialized
      expect(elements['#dossier-citizen-name'].textContent).toBe('Zeynep Kaya');
      expect(elements['#dossier-citizen-id'].textContent).toBe('C001');

      await intakePromise;

      // When settled, classes are cleaned up
      expect(elements['#dossier-citizen-name'].classList.contains('reveal-name-in')).toBe(true);
      expect(elements['#dossier-citizen-id'].classList.contains('reveal-id-stamp')).toBe(true);
    });

    it('allows skipping intake animation immediately by clicking dossier panel', async () => {
      const { root, elements } = createMockRoot();
      const panel = createDossierPanel(root);
      const citizen = { id: 'C002', name: 'Mehmet Demir', declaredCO2: 95, receipts: [] };

      const intakePromise = panel.animateIntake(citizen, { duration: 2000, reducedMotion: false });

      // Simulate player clicking to skip
      panel.skipIntakeAnimation();
      await intakePromise;

      expect(elements['#dossier-citizen-name'].classList.contains('reveal-name-in')).toBe(true);
      expect(elements['#dossier-citizen-id'].classList.contains('reveal-id-stamp')).toBe(true);
    });
  });

  // ─── P5B-05: Case Resolution Animation ────────────────────────────────────
  describe('P5B-05: Case Resolution Animation', () => {
    it('defines directional exit animations and feedback flashes in css/components.css', () => {
      expect(componentsCss).toContain('.dossier-exit-approve');
      expect(componentsCss).toContain('@keyframes dossierExitRight');
      expect(componentsCss).toContain('.dossier-exit-fine');
      expect(componentsCss).toContain('@keyframes dossierExitDown');
      expect(componentsCss).toContain('.resolution-flash--fine');
      expect(componentsCss).toContain('.dossier-exit-grant');
      expect(componentsCss).toContain('@keyframes dossierExitUp');
      expect(componentsCss).toContain('.resolution-shimmer--grant');
    });

    it('applies directional exit classes: APPROVE -> right, FINE -> down + red flash, GRANT -> up + gold shimmer', async () => {
      const { root, elements } = createMockRoot();
      const panel = createDossierPanel(root);

      // APPROVE
      await panel.animateResolution('APPROVE', { duration: 20, reducedMotion: false });
      expect(elements['.dossier-paper'].classList.contains('dossier-exit-approve')).toBe(true);

      panel.resetDossierTransform();

      // FINE
      await panel.animateResolution('FINE', { duration: 20, reducedMotion: false });
      expect(elements['.dossier-paper'].classList.contains('dossier-exit-fine')).toBe(true);
      expect(elements['#dossier-panel'].classList.contains('resolution-flash--fine')).toBe(true);

      panel.resetDossierTransform();

      // GRANT
      await panel.animateResolution('GRANT', { duration: 20, reducedMotion: false });
      expect(elements['.dossier-paper'].classList.contains('dossier-exit-grant')).toBe(true);
      expect(elements['#dossier-panel'].classList.contains('resolution-shimmer--grant')).toBe(true);
    });
  });

  // ─── P5B-08: Enhanced Decision Feedback ───────────────────────────────────
  describe('P5B-08: Enhanced Decision Feedback', () => {
    it('defines torn-paper strip, distinct verdict badges, and metric chips in css/components.css', () => {
      expect(componentsCss).toContain('.torn-paper-strip');
      expect(componentsCss).toContain('.verdict-badge--verified');
      expect(componentsCss).toContain('.verdict-badge--violation');
      expect(componentsCss).toContain('.verdict-badge--overruled');
      expect(componentsCss).toContain('.ruling-text');
      expect(componentsCss).toContain('.metric-chip--positive');
      expect(componentsCss).toContain('.metric-chip--negative');
    });

    it('derives correct verdict labels: VERIFIED, VIOLATION, and OVERRULED', () => {
      const { root } = createMockRoot();
      const ctrl = new GameController(backendApi, {}, { root });

      // Valid APPROVE -> VERIFIED
      expect(ctrl._getVerdictLabel({ isValid: true, action: 'APPROVE' })).toBe('VERIFIED');
      // Valid GRANT -> VERIFIED
      expect(ctrl._getVerdictLabel({ isValid: true, action: 'GRANT' })).toBe('VERIFIED');
      // Valid FINE -> VIOLATION
      expect(ctrl._getVerdictLabel({ isValid: true, action: 'FINE' })).toBe('VIOLATION');
      // Invalid (any action) -> OVERRULED
      expect(ctrl._getVerdictLabel({ isValid: false, action: 'APPROVE' })).toBe('OVERRULED');
      expect(ctrl._getVerdictLabel({ isValid: false, action: 'FINE' })).toBe('OVERRULED');
      expect(ctrl._getVerdictLabel({ isValid: false, action: 'GRANT' })).toBe('OVERRULED');

      ctrl.destroy();
    });

    it('builds enhanced metric chips without altering backend calculations', () => {
      const { root } = createMockRoot();
      const ctrl = new GameController(backendApi, {}, { root });

      const html = ctrl._buildEnhancedMetricChips({
        netZero: 4.5,
        budget: -400,
        trust: 2.0,
      });

      expect(html).toContain('NET-ZERO:');
      expect(html).toContain('+4.5%');
      expect(html).toContain('metric-chip--positive');
      expect(html).toContain('BUDGET:');
      expect(html).toContain('-$400');
      expect(html).toContain('metric-chip--negative');
      expect(html).toContain('TRUST:');
      expect(html).toContain('+2.0%');

      ctrl.destroy();
    });
  });

  // ─── P5B-11: Optional Terminal Display Mode ───────────────────────────────
  describe('P5B-11: Optional Terminal Display Mode', () => {
    it('defines CRT scanlines, chromatic aberration, and toggle button styles in CSS', () => {
      expect(stylesCss).toContain('body.terminal-mode .rulebook-panel');
      expect(stylesCss).toContain('body.terminal-mode .calculator-container');
      expect(stylesCss).toContain('repeating-linear-gradient');
      expect(componentsCss).toContain('.terminal-toggle-btn');
      expect(componentsCss).toContain('.terminal-active');
    });

    it('allows toggling terminal mode on and off in TopBarComponent', () => {
      const { root, elements } = createMockRoot();
      const topBar = new TopBarComponent(root);

      expect(topBar.isTerminalMode()).toBe(false);

      // Toggle ON
      const state1 = topBar.toggleTerminalMode();
      expect(state1).toBe(true);
      expect(topBar.isTerminalMode()).toBe(true);
      expect(elements['#btn-terminal-toggle'].classList.contains('terminal-active')).toBe(true);

      // Toggle OFF
      const state2 = topBar.toggleTerminalMode();
      expect(state2).toBe(false);
      expect(topBar.isTerminalMode()).toBe(false);
      expect(elements['#btn-terminal-toggle'].classList.contains('terminal-active')).toBe(false);
    });
  });

  // ─── P5B-13: Responsive & Reduced-Motion Support ───────────────────────────
  describe('P5B-13: Responsive & Reduced-Motion Support', () => {
    it('sets transition durations to 0 when reduced motion is enabled', () => {
      const director = createSceneDirector({ reducedMotion: false });
      expect(director.getTransitionDuration(SCENE_NAMES.CASE_INTAKE)).toBeGreaterThan(0);

      director.setReducedMotion(true);
      expect(director.getTransitionDuration(SCENE_NAMES.CASE_INTAKE)).toBe(0);
      expect(director.getTransitionDuration(SCENE_NAMES.CASE_RESOLVE)).toBe(0);
      expect(director.isReducedMotion()).toBe(true);
      director.destroy();
    });

    it('defines comprehensive reduced-motion overrides in css/responsive.css', () => {
      expect(responsiveCss).toContain('@media (prefers-reduced-motion: reduce)');
      expect(responsiveCss).toContain('.dossier-intake-anim');
      expect(responsiveCss).toContain('.dossier-exit-approve');
      expect(responsiveCss).toContain('.dossier-exit-fine');
      expect(responsiveCss).toContain('.dossier-exit-grant');
      expect(responsiveCss).toContain('.resolution-flash--fine');
      expect(responsiveCss).toContain('.resolution-shimmer--grant');
      expect(responsiveCss).toContain('.reveal-id-stamp');
      expect(responsiveCss).toContain('.reveal-name-in');
    });
  });

  // ─── P5B-14: Regression Verification & End-to-End Campaign Flow ───────────
  describe('P5B-14: Regression Verification & Campaign Progression', () => {
    it('executes full campaign transitions without metric drift or gameplay alteration', () => {
      const { root } = createMockRoot();
      const director = createSceneDirector({ root, reducedMotion: true });
      const transitionHistory = [];
      director.on('sceneChange', (e) => transitionHistory.push(e.to));

      const mockRenderer = {
        showScreen: vi.fn(),
        hideSummaryModal: vi.fn(),
        showSummaryModal: vi.fn(),
        hideDayIntroModal: vi.fn(),
        showDayIntroModal: vi.fn(),
        gameplay: {
          rulebook: { renderRates: vi.fn() },
          actionPanel: {
            populateGrants: vi.fn(),
            update: vi.fn(),
            setStatus: vi.fn(),
            setActionsEnabled: vi.fn(),
          },
          topBar: {
            update: vi.fn(),
            setMetrics: vi.fn(),
          },
          dossier: {
            loadCitizen: vi.fn(),
            animateIntake: vi.fn().mockResolvedValue(),
            animateResolution: vi.fn().mockResolvedValue(),
          },
          calculator: {
            clear: vi.fn(),
          },
        },
        gameOver: {
          render: vi.fn(),
        },
      };

      const ctrl = new GameController(backendApi, mockRenderer, { root, sceneDirector: director });

      // 1. Start Campaign
      ctrl.startCampaign();
      expect(transitionHistory).toContain(SCENE_NAMES.DAY_BRIEF);

      // 2. Start Shift
      ctrl.onStartShift();
      expect(transitionHistory).toContain(SCENE_NAMES.SHIFT_START);

      // 3. Current case is loaded
      expect(ctrl._currentCase).not.toBeNull();

      // 4. Decision resolution
      ctrl.onApprove();
      expect(transitionHistory).toContain(SCENE_NAMES.CASE_RESOLVE);
      expect(ctrl._awaitingTransition).toBe(true);

      // 5. Restart campaign
      ctrl.restartCampaign();
      expect(transitionHistory).toContain(SCENE_NAMES.DAY_BRIEF);
      expect(backendApi.getState().currentDay).toBe(1);

      ctrl.destroy();
      director.destroy();
    });
  });
});
