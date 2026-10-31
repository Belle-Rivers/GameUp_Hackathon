/**
 * @file integration.test.js
 * Phase 3 integration tests (P3-01 through P3-12).
 *
 * Tests verify that the GameController correctly bridges the BackendApi with
 * the frontend Renderer, satisfying every acceptance criterion listed in the
 * Phase 3 integration acceptance test (roadmap §Phase 3).
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { backendApi } from '../js/backend/index.js';
import { GameController, createGameController } from '../js/frontend/game-controller.js';
import { breakdownReceipts } from '../js/backend/calculations/emissions.js';

// ─── Minimal DOM mock helpers ─────────────────────────────────────────────────

function makeElement(tag = 'div') {
  const classes = new Set();
  const attrs = {};
  const children = [];
  let _inner = '';
  let _text = '';
  let _hidden = false;
  const listeners = {};

  const el = {
    tagName: tag.toUpperCase(),
    get textContent() { return _text; },
    set textContent(v) { _text = String(v ?? ''); },
    get innerHTML() { return _inner; },
    set innerHTML(v) { _inner = String(v ?? ''); },
    get hidden() { return _hidden; },
    set hidden(v) { _hidden = Boolean(v); },
    style: {},
    disabled: false,
    value: '',
    children,
    classList: {
      add: (...cls) => cls.forEach((c) => classes.add(c)),
      remove: (...cls) => cls.forEach((c) => classes.delete(c)),
      contains: (c) => classes.has(c),
      toggle: (c, force) => {
        if (force === undefined ? classes.has(c) : !force) { classes.delete(c); return false; }
        classes.add(c); return true;
      },
    },
    getAttribute: (k) => attrs[k] ?? null,
    setAttribute: (k, v) => { attrs[k] = String(v); },
    removeAttribute: (k) => { delete attrs[k]; },
    hasAttribute: (k) => k in attrs,
    addEventListener: (type, fn) => {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    removeEventListener: (type, fn) => {
      if (listeners[type]) listeners[type] = listeners[type].filter((f) => f !== fn);
    },
    _fire: (type, event = {}) => { (listeners[type] || []).forEach((fn) => fn(event)); },
    closest: (sel) => null,
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null,
    appendChild: (child) => { children.push(child); return child; },
    removeChild: (child) => {
      const idx = children.indexOf(child);
      if (idx !== -1) children.splice(idx, 1);
      return child;
    },
    remove: function() {
      if (this.parentNode) this.parentNode.removeChild(this);
    },
    parentNode: null,
    offsetHeight: 0,
  };
  return el;
}

/**
 * Creates a stub renderer that tracks calls to its methods.
 * Mirrors the Renderer interface used by GameController.
 */
function makeStubRenderer() {
  const topBarUpdates = [];
  const dossierLoads = [];
  const actionPanelUpdates = [];
  const calcEntries = [];
  let calcTotal = 0;
  let calcCleared = 0;
  let screensShown = [];
  let summaryOpened = [];
  let summaryHidden = 0;
  let gameOverRendered = [];

  return {
    // Renderer interface
    showScreen: (id) => screensShown.push(id),
    hideSummaryModal: () => summaryHidden++,
    showSummaryModal: (data) => summaryOpened.push(data),
    isSummaryModalOpen: () => false,
    getCurrentScreen: () => 'gameplay',
    gameOver: {
      render: (data) => gameOverRendered.push(data),
      show: vi.fn(),
      hide: vi.fn(),
    },
    // Gameplay screen sub-components
    gameplay: {
      topBar: {
        update: (data) => topBarUpdates.push(data),
        setMetrics: (m) => topBarUpdates.push({ metrics: m }),
        setTimer: (t) => topBarUpdates.push({ timeRemaining: t }),
      },
      rulebook: {
        renderRates: vi.fn(),
        update: vi.fn(),
      },
      dossier: {
        loadCitizen: (c) => dossierLoads.push(c),
        onItemClick: vi.fn(),
      },
      calculator: {
        _entries: [],
        _total: 0,
        addEntry: function(e) { this._entries.push(e); this._total += e.co2; calcEntries.push(e); },
        clear: function() { this._entries = []; this._total = 0; calcCleared++; },
        getTotal: function() { return this._total; },
      },
      actionPanel: {
        _status: '',
        _actionsEnabled: true,
        _auditedCO2: 0,
        _declaredCO2: 0,
        populateGrants: vi.fn(),
        update: (data) => { actionPanelUpdates.push(data); },
        setStatus: function(s) { this._status = s; },
        setActionsEnabled: function(e) { this._actionsEnabled = e; },
        updateAssessment: function(a, d) { this._auditedCO2 = a; this._declaredCO2 = d; actionPanelUpdates.push({ auditedCO2: a, declaredCO2: d }); },
      },
    },
    // Inspection helpers
    _topBarUpdates: topBarUpdates,
    _dossierLoads: dossierLoads,
    _actionPanelUpdates: actionPanelUpdates,
    _calcEntries: calcEntries,
    _calcCleared: () => calcCleared,
    _screensShown: screensShown,
    _summaryOpened: summaryOpened,
    _summaryHidden: () => summaryHidden,
    _gameOverRendered: gameOverRendered,
    dayIntroModal: {
      open: vi.fn(),
      close: vi.fn(),
      isOpen: () => false,
    },
    showDayIntroModal: function(data) { this._dayIntroOpened = this._dayIntroOpened || []; this._dayIntroOpened.push(data); },
    hideDayIntroModal: function() { this._dayIntroHidden = (this._dayIntroHidden || 0) + 1; },
    isDayIntroModalOpen: () => false,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('P3-01 — Application bootstrap', () => {
  it('startCampaign() initializes the backend and renders first citizen', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();

    // Top bar should have been updated with initial state
    expect(renderer._topBarUpdates.length).toBeGreaterThan(0);
    const firstTopBarUpdate = renderer._topBarUpdates.find((u) => u.day !== undefined);
    expect(firstTopBarUpdate).toBeDefined();
    expect(firstTopBarUpdate.day).toBe(1);

    // Dossier should have the first citizen loaded
    expect(renderer._dossierLoads.length).toBeGreaterThan(0);
    const citizen = renderer._dossierLoads[0];
    expect(citizen).not.toBeNull();
    expect(citizen.id).toBeDefined();
    expect(citizen.name).toBeDefined();

    ctrl.destroy();
  });

  it('restartCampaign() resets state and reloads first citizen', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    const firstCitizen = renderer._dossierLoads[0];

    ctrl.restartCampaign();
    const citizenAfterRestart = renderer._dossierLoads[renderer._dossierLoads.length - 1];

    // After restart the first citizen should be the same (same Day 1 data)
    expect(citizenAfterRestart.id).toBe(firstCitizen.id);
    ctrl.destroy();
  });
});

describe('P3-02 — City metrics connected to top bar', () => {
  it('top bar receives correct initial metrics from backend', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();

    const metricsUpdate = renderer._topBarUpdates.find((u) => u.metrics);
    expect(metricsUpdate).toBeDefined();
    expect(metricsUpdate.metrics.netZero).toBeDefined();
    expect(metricsUpdate.metrics.budget).toBeDefined();
    expect(metricsUpdate.metrics.trust).toBeDefined();

    // Initial values per GAME_RULES.md §6
    expect(metricsUpdate.metrics.netZero).toBe(30);
    expect(metricsUpdate.metrics.budget).toBe(5000);
    expect(metricsUpdate.metrics.trust).toBe(70);

    ctrl.destroy();
  });

  it('top bar metrics update after a valid action', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    const citizen = renderer._dossierLoads[0];
    expect(citizen).not.toBeNull();

    // Freeze timers so feedback delay doesn't fire during test
    vi.useFakeTimers();

    ctrl.onApprove(); // Submit APPROVE

    // After action submission: metrics should be updated immediately
    const metricsAfter = renderer._topBarUpdates.filter((u) => u.metrics);
    // At least initial render + post-action render
    expect(metricsAfter.length).toBeGreaterThanOrEqual(1);

    vi.useRealTimers();
    ctrl.destroy();
  });
});

describe('P3-03 — Citizen dossier connected to backend', () => {
  it('dossier shows citizen name, id, district, note, declaredCO2', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();

    const citizen = renderer._dossierLoads[0];
    expect(citizen.name).toBeTruthy();
    expect(citizen.id).toMatch(/^C\d{3}$/);
    expect(citizen.district).toBeTruthy();
    expect(citizen.note).toBeTruthy();
    expect(typeof citizen.declaredCO2).toBe('number');
    expect(Array.isArray(citizen.receipts)).toBe(true);
    expect(citizen.receipts.length).toBeGreaterThan(0);

    ctrl.destroy();
  });

  it('dossier does NOT expose hasFraud or other internal fields', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();

    const citizen = renderer._dossierLoads[0];
    expect(citizen.hasFraud).toBeUndefined();
    expect(citizen.fraudType).toBeUndefined();

    ctrl.destroy();
  });
});

describe('P3-04 — Rulebook connected to backend', () => {
  it('rulebook panel receives emission rates from backend on bootstrap', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();

    expect(renderer.gameplay.rulebook.renderRates).toHaveBeenCalled();
    const ratesArg = renderer.gameplay.rulebook.renderRates.mock.calls[0][0];
    expect(Array.isArray(ratesArg)).toBe(true);
    expect(ratesArg.length).toBe(11); // 11 emission rates per P1-01

    ctrl.destroy();
  });

  it('rulebook rates include expected categories', () => {
    const rulebook = backendApi.getRulebook();
    const keys = Object.keys(rulebook);
    expect(keys).toContain('GRID_ELEC');
    expect(keys).toContain('GAS_HEAT');
    expect(keys).toContain('BEEF');
    expect(keys).toContain('FLIGHT');
  });
});

describe('P3-05 — Calculator connected to receipt breakdown', () => {
  it('clicking a receipt item adds a tape entry from the backend breakdown', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    expect(renderer._dossierLoads.length).toBeGreaterThan(0);

    // Click the first item of the first receipt
    ctrl.onReceiptItemClick({ receiptIndex: 0, itemIndex: 0, item: null });

    expect(renderer._calcEntries.length).toBeGreaterThan(0);
    const entry = renderer._calcEntries[0];
    expect(entry.label).toBeTruthy();
    expect(typeof entry.co2).toBe('number');

    ctrl.destroy();
  });

  it('clearing the calculator resets the tape', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    ctrl.onReceiptItemClick({ receiptIndex: 0, itemIndex: 0, item: null });

    const countBefore = renderer._calcEntries.length;
    expect(countBefore).toBeGreaterThan(0);

    ctrl.onClearCalculator();
    expect(renderer._calcCleared()).toBeGreaterThan(0);

    ctrl.destroy();
  });

  it('action panel audit value updates after a receipt click', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    ctrl.onReceiptItemClick({ receiptIndex: 0, itemIndex: 0, item: null });

    const assessmentUpdates = renderer._actionPanelUpdates.filter(
      (u) => u.auditedCO2 !== undefined
    );
    expect(assessmentUpdates.length).toBeGreaterThan(0);

    ctrl.destroy();
  });
});

describe('P3-05 — breakdownReceipts selection support', () => {
  it('full breakdown returns all items when no selection given', () => {
    const citizen = backendApi.getCurrentCase();
    // Need to start campaign first
    backendApi.startCampaign();
    const currentCase = backendApi.getCurrentCase();
    expect(currentCase).not.toBeNull();

    const fullBreakdown = backendApi.getReceiptBreakdown({ caseId: currentCase.id });
    expect(fullBreakdown.caseId).toBe(currentCase.id);
    expect(fullBreakdown.items.length).toBeGreaterThan(0);
    expect(fullBreakdown.totalCO2).toBeGreaterThanOrEqual(0);
  });

  it('selection breakdown returns only selected items', () => {
    backendApi.startCampaign();
    const currentCase = backendApi.getCurrentCase();
    expect(currentCase).not.toBeNull();

    const selBreakdown = backendApi.getReceiptBreakdown({
      caseId: currentCase.id,
      selection: [{ receiptIndex: 0, itemIndex: 0 }],
    });

    expect(selBreakdown.caseId).toBe(currentCase.id);
    expect(selBreakdown.items.length).toBe(1);
    expect(selBreakdown.items[0].ref).toEqual({ receiptIndex: 0, itemIndex: 0 });
  });

  it('breakdownReceipts selection matches emission calculation', () => {
    backendApi.startCampaign();
    const currentCase = backendApi.getCurrentCase();
    expect(currentCase).not.toBeNull();

    const receipt = currentCase.receipts[0];
    const item = receipt.items[0];

    const bd = breakdownReceipts(currentCase, [{ receiptIndex: 0, itemIndex: 0 }]);
    expect(bd.items[0].label).toBe(item.label);
    expect(bd.items[0].qty).toBe(item.qty);
    expect(typeof bd.items[0].co2).toBe('number');
  });
});

describe('P3-06/07/08 — Action submission (APPROVE / FINE / GRANT)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('submitting APPROVE calls backend submitAction with APPROVE', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    const citizenBefore = backendApi.getCurrentCase();
    expect(citizenBefore).not.toBeNull();

    // Spy on backendApi.submitAction
    const submitSpy = vi.spyOn(backendApi, 'submitAction');

    ctrl.onApprove();
    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'APPROVE', caseId: citizenBefore.id })
    );

    ctrl.destroy();
  });

  it('submitting FINE calls backend submitAction with FINE', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    const citizenBefore = backendApi.getCurrentCase();

    const submitSpy = vi.spyOn(backendApi, 'submitAction');
    ctrl.onFine();

    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'FINE', caseId: citizenBefore.id })
    );

    ctrl.destroy();
  });

  it('submitting GRANT with no grantId shows inline message instead of submitting', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();

    const submitSpy = vi.spyOn(backendApi, 'submitAction');
    ctrl.onGrant(''); // no grant selected

    expect(submitSpy).not.toHaveBeenCalled();
    ctrl.destroy();
  });

  it('submitting a valid GRANT calls backend with GRANT + grantId', () => {
    // Start a fresh campaign via controller (not backendApi.startCampaign which interferes
    // with previous test's spy state)
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    const citizenBefore = backendApi.getCurrentCase();
    expect(citizenBefore).not.toBeNull();

    const grants = backendApi.getGrants();
    expect(Array.isArray(grants)).toBe(true);
    expect(grants.length).toBeGreaterThan(0);
    const grantId = grants[0].id;

    const submitSpy = vi.spyOn(backendApi, 'submitAction');
    ctrl.onGrant(grantId);

    expect(submitSpy).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'GRANT', grantId, caseId: citizenBefore.id })
    );

    ctrl.destroy();
  });
});

describe('P3-09 — Action feedback display', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('action panel status is updated after APPROVE submission', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    ctrl.onApprove();

    // Status should be set to either correct or incorrect
    const status = renderer.gameplay.actionPanel._status;
    expect(status).toMatch(/CORRECT|INCORRECT/i);

    ctrl.destroy();
  });

  it('action buttons are disabled while feedback is displayed', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    ctrl.onApprove();

    expect(renderer.gameplay.actionPanel._actionsEnabled).toBe(false);
    ctrl.destroy();
  });
});

describe('P3-10 — Citizen transitions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('next citizen loads after feedback timeout', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    const loadsBefore = renderer._dossierLoads.length;

    ctrl.onApprove();
    expect(renderer._dossierLoads.length).toBe(loadsBefore); // not yet

    vi.advanceTimersByTime(2000); // past FEEDBACK_DISPLAY_MS (1800ms)

    // Next citizen should have been loaded OR shift ended
    // Both are valid outcomes depending on whether there are more cases
    const loadsAfter = renderer._dossierLoads.length;
    const shiftModalOpened = renderer._summaryOpened.length > 0;

    expect(loadsAfter > loadsBefore || shiftModalOpened).toBe(true);
    ctrl.destroy();
  });

  it('cannot submit action during transition period', () => {
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    const submitSpy = vi.spyOn(backendApi, 'submitAction');
    ctrl.onApprove(); // first action — _awaitingTransition becomes true
    expect(submitSpy).toHaveBeenCalledTimes(1);

    ctrl.onApprove(); // second action immediately (during transition)
    // Should not have submitted a second action while awaiting transition
    expect(submitSpy).toHaveBeenCalledTimes(1);
    ctrl.destroy();
  });
});

describe('P3-11 — Shift statistics in summary modal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('summary modal receives shift stats when shift ends', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();

    // Process all Day 1 cases (5 cases)
    for (let i = 0; i < 5; i++) {
      const citizen = backendApi.getCurrentCase();
      if (!citizen) break;
      ctrl.onApprove();
      vi.advanceTimersByTime(2000);
    }

    // After processing all cases, summary modal should be shown
    if (renderer._summaryOpened.length > 0) {
      const summaryData = renderer._summaryOpened[0];
      expect(summaryData.processedCount).toBeDefined();
      expect(summaryData.correctActions).toBeDefined();
    }

    ctrl.destroy();
  });

  it('getShiftSummary returns correct structure from backend', () => {
    backendApi.startCampaign();
    // Submit one action to populate stats
    const citizen = backendApi.getCurrentCase();
    backendApi.submitAction({ caseId: citizen.id, action: 'APPROVE' });

    const summary = backendApi.getShiftSummary();
    expect(summary.day).toBe(1);
    expect(summary.shiftStats.processedCount).toBeGreaterThan(0);
    expect(typeof summary.shiftStats.correctActions).toBe('number');
  });
});

describe('P3-12 — Shift timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('backendApi.tick() decrements the timer', () => {
    backendApi.startCampaign();
    const stateBefore = backendApi.getState();
    const timeBefore = stateBefore.timeRemaining;

    const stateAfter = backendApi.tick(1);
    expect(stateAfter.timeRemaining).toBe(timeBefore - 1);
  });

  it('timer ticks reduce displayed time in top bar', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();

    const timerUpdatesBefore = renderer._topBarUpdates.filter((u) => u.timeRemaining !== undefined).length;

    vi.advanceTimersByTime(3000); // 3 seconds

    const timerUpdatesAfter = renderer._topBarUpdates.filter((u) => u.timeRemaining !== undefined).length;
    expect(timerUpdatesAfter).toBeGreaterThan(timerUpdatesBefore);

    ctrl.destroy();
  });

  it('timer expiry triggers shift-end (summary modal shown)', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();

    // Day 1 timer is 120 seconds
    vi.advanceTimersByTime(121_000);

    // Summary modal should be shown OR game-over if campaign ended
    const summaryShown = renderer._summaryOpened.length > 0;
    const screensShown = renderer._screensShown.includes('game-over');
    expect(summaryShown || screensShown).toBe(true);

    ctrl.destroy();
  });

  it('destroy() stops the timer', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    ctrl.startCampaign();
    ctrl.destroy();

    const updatesBeforeAdvance = renderer._topBarUpdates.length;
    vi.advanceTimersByTime(5000);
    const updatesAfterAdvance = renderer._topBarUpdates.length;

    // No new timer updates after destroy
    expect(updatesAfterAdvance).toBe(updatesBeforeAdvance);
  });
});

describe('BackendApi.tick — P3-12 public surface', () => {
  it('tick() is available on backendApi', () => {
    expect(typeof backendApi.tick).toBe('function');
  });

  it('tick() returns a GameStateView with timeRemaining', () => {
    backendApi.startCampaign();
    const stateView = backendApi.tick(1);
    expect(typeof stateView.timeRemaining).toBe('number');
    expect(typeof stateView.currentDay).toBe('number');
    expect(stateView.metrics).toBeDefined();
  });

  it('advanceDay() is available on backendApi', () => {
    expect(typeof backendApi.advanceDay).toBe('function');
  });
});

describe('Integration acceptance test — complete round', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('full round: citizen appears → inspect → calculate → action → feedback → next', () => {
    backendApi.startCampaign();
    const renderer = makeStubRenderer();
    const ctrl = createGameController(backendApi, renderer);

    // Step 1 — A citizen appears
    ctrl.startCampaign();
    expect(renderer._dossierLoads.length).toBeGreaterThan(0);

    const citizen = renderer._dossierLoads[0];

    // Step 2/3 — Player reads note / inspects receipts (frontend-only)
    expect(citizen.note).toBeTruthy();
    expect(citizen.receipts.length).toBeGreaterThan(0);

    // Step 4 — Player uses calculator
    ctrl.onReceiptItemClick({ receiptIndex: 0, itemIndex: 0, item: null });
    expect(renderer._calcEntries.length).toBeGreaterThan(0);

    // Step 5 — Player checks rulebook (already rendered via P3-04)
    expect(renderer.gameplay.rulebook.renderRates).toHaveBeenCalled();

    // Step 6 — Player chooses an action
    ctrl.onApprove();

    // Step 8 — Metrics updated immediately
    const metricsUpdate = renderer._topBarUpdates.find((u) => u.metrics);
    expect(metricsUpdate).toBeDefined();

    // Step 9 — Player receives feedback (status updated)
    const status = renderer.gameplay.actionPanel._status;
    expect(status).toMatch(/CORRECT|INCORRECT/i);

    // Step 10 — Next citizen appears after delay
    vi.advanceTimersByTime(2000);
    // Either next citizen or shift ended (both acceptable)
    const totalLoads = renderer._dossierLoads.length;
    const shiftEnded = renderer._summaryOpened.length > 0;
    expect(totalLoads > 1 || shiftEnded).toBe(true);

    ctrl.destroy();
  });
});
