import { describe, expect, it, beforeEach } from 'vitest';
import {
  formatBudget,
  formatTimer,
  TopBarComponent,
  createTopBar,
} from '../js/frontend/components/top-bar.js';
import {
  renderRateItem,
  renderPolicyItem,
  DEFAULT_POLICY_DIRECTIVES,
  RulebookPanelComponent,
  createRulebookPanel,
} from '../js/frontend/components/rulebook-panel.js';
import {
  formatCO2,
  renderReceiptItem,
  renderReceiptCard,
  DossierPanelComponent,
  createDossierPanel,
} from '../js/frontend/components/dossier-panel.js';
import {
  CalculatorPanelComponent,
  createCalculatorPanel,
} from '../js/frontend/components/calculator-panel.js';
import {
  formatGrantLabel,
  DEFAULT_GRANTS,
  ActionPanelComponent,
  createActionPanel,
} from '../js/frontend/components/action-panel.js';

// Minimal mock DOM element helper for Node test environment
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
    classList: {
      add: (cls) => classes.add(cls),
      remove: (cls) => classes.delete(cls),
      contains: (cls) => classes.has(cls),
    },
    getAttribute: (name) => elem.attributes[name] ?? null,
    setAttribute: (name, val) => {
      elem.attributes[name] = String(val);
    },
    addEventListener: (type, handler) => {
      listeners[type] = listeners[type] || [];
      listeners[type].push(handler);
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

function createMockRoot(elementMap) {
  return {
    querySelector: (selector) => elementMap[selector] || null,
    querySelectorAll: (selector) => (elementMap[selector] ? [elementMap[selector]] : []),
  };
}

describe('Subphase 2B: Interface Components (P2-05 to P2-11)', () => {

  describe('P2-05: Top Bar Component', () => {
    it('formats budget amounts accurately in positive and negative cases', () => {
      expect(formatBudget(5000)).toBe('$5,000');
      expect(formatBudget(0)).toBe('$0');
      expect(formatBudget(-250)).toBe('-$250');
      expect(formatBudget(1234567)).toBe('$1,234,567');
      expect(formatBudget(null)).toBe('$0');
    });

    it('formats seconds into MM:SS correctly', () => {
      expect(formatTimer(120)).toBe('02:00');
      expect(formatTimer(90)).toBe('01:30');
      expect(formatTimer(5)).toBe('00:05');
      expect(formatTimer(0)).toBe('00:00');
      expect(formatTimer(-10)).toBe('00:00');
    });

    it('updates top bar DOM elements with game state and metrics', () => {
      const dayBadge = createMockElement('span', { id: 'top-bar-day' });
      const caseBadge = createMockElement('span', { id: 'top-bar-case' });
      const netzeroVal = createMockElement('span', { id: 'meter-netzero-val' });
      const netzeroBar = createMockElement('div', { id: 'meter-netzero-bar' });
      const budgetVal = createMockElement('span', { id: 'meter-budget-val' });
      const budgetBar = createMockElement('div', { id: 'meter-budget-bar' });
      const trustVal = createMockElement('span', { id: 'meter-trust-val' });
      const trustBar = createMockElement('div', { id: 'meter-trust-bar' });
      const timerDisplay = createMockElement('span', { id: 'timer-display' });
      const timerContainer = createMockElement('div', { id: 'timer-container' });

      const root = createMockRoot({
        '#top-bar-day': dayBadge,
        '#top-bar-case': caseBadge,
        '#meter-netzero-val': netzeroVal,
        '#meter-netzero-bar': netzeroBar,
        '#meter-budget-val': budgetVal,
        '#meter-budget-bar': budgetBar,
        '#meter-trust-val': trustVal,
        '#meter-trust-bar': trustBar,
        '#timer-display': timerDisplay,
        '#timer-container': timerContainer,
      });

      const topBar = createTopBar(root);
      topBar.update({
        day: 2,
        maxDays: 3,
        currentCaseIndex: 3,
        totalCases: 8,
        timeRemaining: 75,
        metrics: { netZero: 45, budget: 3800, trust: 80 },
      });

      expect(dayBadge.textContent).toBe('DAY 2 OF 3');
      expect(caseBadge.textContent).toBe('CASE 4/8');
      expect(netzeroVal.textContent).toBe('45%');
      expect(netzeroBar.style.width).toBe('45%');
      expect(budgetVal.textContent).toBe('$3,800');
      expect(trustVal.textContent).toBe('80%');
      expect(trustBar.style.width).toBe('80%');
      expect(timerDisplay.textContent).toBe('01:15');
      expect(timerContainer.classList.contains('timer-warning')).toBe(false);

      // Low time triggers warning class
      topBar.setTimer(25);
      expect(timerDisplay.textContent).toBe('00:25');
      expect(timerContainer.classList.contains('timer-warning')).toBe(true);
    });
  });

  describe('P2-06: Rulebook Panel Component', () => {
    it('renders rate items correctly into HTML string with escaping', () => {
      const html = renderRateItem({
        key: 'GRID_ELEC',
        activity: 'Grid Electricity',
        rate: 0.5,
        unit: 'kg CO₂/kWh',
        category: 'Electricity',
      });
      expect(html).toContain('Grid Electricity');
      expect(html).toContain('0.50 kg CO₂/kWh');
      expect(html).toContain('Electricity');
      expect(html).toContain('data-rate-key="GRID_ELEC"');
    });

    it('renders policy directive card with code and title', () => {
      const html = renderPolicyItem({
        code: 'DIR-3101',
        title: 'Unverified Offsets',
        text: 'Private offsets are invalid.',
      });
      expect(html).toContain('DIR-3101');
      expect(html).toContain('Unverified Offsets');
      expect(html).toContain('Private offsets are invalid.');
    });

    it('updates rates list container', () => {
      const ratesList = createMockElement('div', { id: 'rulebook-rates-list' });
      const root = createMockRoot({ '#rulebook-rates-list': ratesList });
      const panel = createRulebookPanel(root);

      panel.renderRates([
        { key: 'GAS_HEAT', activity: 'Natural Gas', rate: 2.0, unit: 'kg CO₂/m³', category: 'Heating' },
        { key: 'BEEF', activity: 'Beef', rate: 15.0, unit: 'kg CO₂/pack', category: 'Food' },
      ]);

      expect(ratesList.innerHTML).toContain('Natural Gas');
      expect(ratesList.innerHTML).toContain('2.00 kg CO₂/m³');
      expect(ratesList.innerHTML).toContain('Beef');
      expect(ratesList.innerHTML).toContain('15.00 kg CO₂/pack');
    });
  });

  describe('P2-07 & P2-08: Citizen Dossier and Receipt Components', () => {
    it('formats CO2 footprint with 1 decimal place', () => {
      expect(formatCO2(120)).toBe('120.0 kg CO₂');
      expect(formatCO2(45.67)).toBe('45.7 kg CO₂');
      expect(formatCO2(0)).toBe('0.0 kg CO₂');
      expect(formatCO2(null)).toBe('0.0 kg CO₂');
    });

    it('renders receipt item row with data attributes for interaction', () => {
      const item = { label: 'Natural Gas', qty: 80, unit: 'm³', rateKey: 'GAS_HEAT' };
      const html = renderReceiptItem(item, 0, 1);
      expect(html).toContain('Natural Gas');
      expect(html).toContain('80 m³');
      expect(html).toContain('data-receipt-index="0"');
      expect(html).toContain('data-item-index="1"');
      expect(html).toContain('data-rate-key="GAS_HEAT"');
    });

    it('renders receipt card with category badge and items', () => {
      const receipt = {
        type: 'ENERGY',
        title: 'TEDAŞ Meter Log',
        items: [{ label: 'Electricity', qty: 100, unit: 'kWh' }],
      };
      const html = renderReceiptCard(receipt, 0);
      expect(html).toContain('TEDAŞ Meter Log');
      expect(html).toContain('ENERGY');
      expect(html).toContain('Electricity');
      expect(html).toContain('100 kWh');
    });

    it('loads citizen into dossier DOM fields', () => {
      const nameElem = createMockElement('span', { id: 'dossier-citizen-name' });
      const idElem = createMockElement('span', { id: 'dossier-citizen-id' });
      const districtElem = createMockElement('span', { id: 'dossier-district' });
      const roofElem = createMockElement('span', { id: 'dossier-roof' });
      const declaredElem = createMockElement('span', { id: 'dossier-declared' });
      const noteElem = createMockElement('span', { id: 'dossier-note' });
      const receiptsContainer = createMockElement('div', { id: 'dossier-receipts-container' });

      const root = createMockRoot({
        '#dossier-citizen-name': nameElem,
        '#dossier-citizen-id': idElem,
        '#dossier-district': districtElem,
        '#dossier-roof': roofElem,
        '#dossier-declared': declaredElem,
        '#dossier-note': noteElem,
        '#dossier-receipts-container': receiptsContainer,
      });

      const dossier = createDossierPanel(root);
      dossier.loadCitizen({
        id: 'CIT-101',
        name: 'Ayla Yılmaz',
        district: 'Muratpaşa',
        roofType: 'ASPHALT',
        declaredCO2: 120.0,
        note: 'Insulation is poor.',
        receipts: [
          {
            type: 'ENERGY',
            title: 'TEDAŞ Smart Meter Log',
            items: [{ label: 'Natural Gas', qty: 80, unit: 'm³', rateKey: 'GAS_HEAT' }],
          },
        ],
      });

      expect(nameElem.textContent).toBe('Ayla Yılmaz');
      expect(idElem.textContent).toBe('CIT-101');
      expect(districtElem.textContent).toBe('Muratpaşa');
      expect(roofElem.textContent).toBe('ASPHALT');
      expect(declaredElem.textContent).toBe('120.0 kg CO₂');
      expect(noteElem.textContent).toContain('Insulation is poor.');
      expect(receiptsContainer.innerHTML).toContain('TEDAŞ Smart Meter Log');
      expect(receiptsContainer.innerHTML).toContain('Natural Gas');
    });
  });

  describe('P2-09: Calculator Interface Component', () => {
    it('manages tape entries and computes running total', () => {
      const display = createMockElement('div', { id: 'calc-display' });
      const tape = createMockElement('div', { id: 'calc-tape' });
      const btnClear = createMockElement('button', { id: 'btn-calc-clear' });

      const root = createMockRoot({
        '#calc-display': display,
        '#calc-tape': tape,
        '#btn-calc-clear': btnClear,
      });

      const calc = createCalculatorPanel(root);
      expect(calc.getTotal()).toBe(0);

      calc.addEntry({ label: 'Grid Electricity', qty: 100, unit: 'kWh', co2: 50.0 });
      expect(calc.getTotal()).toBe(50.0);
      expect(display.textContent).toBe('50.0 kg CO₂');
      expect(tape.innerHTML).toContain('Grid Electricity');
      expect(tape.innerHTML).toContain('+50.0 kg');

      calc.addEntry({ label: 'Natural Gas', qty: 20, unit: 'm³', co2: 40.0 });
      expect(calc.getTotal()).toBe(90.0);
      expect(display.textContent).toBe('90.0 kg CO₂');

      calc.clear();
      expect(calc.getTotal()).toBe(0);
      expect(display.textContent).toBe('0.0 kg CO₂');
      expect(tape.innerHTML).toContain('Click receipt items');
    });

    it('triggers onClear callback when clear button is clicked', () => {
      const btnClear = createMockElement('button', { id: 'btn-calc-clear' });
      const root = createMockRoot({ '#btn-calc-clear': btnClear });
      let cleared = false;

      createCalculatorPanel(root, { onClear: () => { cleared = true; } });
      btnClear.dispatchEvent({ type: 'click' });
      expect(cleared).toBe(true);
    });
  });

  describe('P2-10 & P2-11: Action Dock and Grant Selector Components', () => {
    it('formats grant option display label', () => {
      const label = formatGrantLabel({
        id: 'HEAT_PUMP',
        name: 'Heat Pump Conversion',
        cost: 400,
        netZeroBoost: 10,
      });
      expect(label).toBe('Heat Pump Conversion ($400 | +10% Net-Zero)');
    });

    it('populates grant selector with options', () => {
      const grantSelect = createMockElement('select', { id: 'grant-select' });
      const root = createMockRoot({ '#grant-select': grantSelect });
      const actionPanel = createActionPanel(root);

      actionPanel.populateGrants(DEFAULT_GRANTS);
      expect(grantSelect.innerHTML).toContain('value="HEAT_PUMP"');
      expect(grantSelect.innerHTML).toContain('Heat Pump Conversion');
      expect(grantSelect.innerHTML).toContain('value="COMPOST_KIT"');
      expect(grantSelect.innerHTML).toContain('value="TRANSIT_PASS"');
      expect(grantSelect.innerHTML).toContain('value="COOL_ROOF"');
    });

    it('updates assessment ledger values and variance classes', () => {
      const auditedVal = createMockElement('span', { id: 'summary-audited-val' });
      const declaredVal = createMockElement('span', { id: 'summary-declared-val' });
      const varianceVal = createMockElement('span', { id: 'summary-variance-val' });
      const varianceRow = createMockElement('div', {});
      varianceRow.classList.add('variance-row');

      const root = createMockRoot({
        '#summary-audited-val': auditedVal,
        '#summary-declared-val': declaredVal,
        '#summary-variance-val': varianceVal,
        '.variance-row': varianceRow,
      });

      const actionPanel = createActionPanel(root);

      // Within ±2 tolerance
      actionPanel.updateAssessment(101.5, 100.0);
      expect(auditedVal.textContent).toBe('101.5 kg');
      expect(declaredVal.textContent).toBe('100.0 kg');
      expect(varianceVal.textContent).toBe('+1.5 kg');
      expect(varianceRow.classList.contains('variance--zero')).toBe(true);

      // Underdeclared (actual > declared by > 2kg)
      actionPanel.updateAssessment(150.0, 100.0);
      expect(varianceVal.textContent).toBe('+50.0 kg');
      expect(varianceRow.classList.contains('variance--positive')).toBe(true);

      // Overdeclared (actual < declared by > 2kg)
      actionPanel.updateAssessment(80.0, 100.0);
      expect(varianceVal.textContent).toBe('-20.0 kg');
      expect(varianceRow.classList.contains('variance--negative')).toBe(true);
    });

    it('dispatches action callbacks for APPROVE, FINE, and GRANT buttons', () => {
      const btnApprove = createMockElement('button', { id: 'btn-action-approve' });
      const btnFine = createMockElement('button', { id: 'btn-action-fine' });
      const btnGrant = createMockElement('button', { id: 'btn-action-grant' });
      const grantSelect = createMockElement('select', { id: 'grant-select' });

      const root = createMockRoot({
        '#btn-action-approve': btnApprove,
        '#btn-action-fine': btnFine,
        '#btn-action-grant': btnGrant,
        '#grant-select': grantSelect,
      });

      let approveTriggered = false;
      let fineTriggered = false;
      let grantIssued = null;

      const actionPanel = createActionPanel(root, {
        onApprove: () => { approveTriggered = true; },
        onFine: () => { fineTriggered = true; },
        onGrant: (grantId) => { grantIssued = grantId; },
      });

      btnApprove.dispatchEvent({ type: 'click' });
      expect(approveTriggered).toBe(true);

      btnFine.dispatchEvent({ type: 'click' });
      expect(fineTriggered).toBe(true);

      grantSelect.value = 'COOL_ROOF';
      btnGrant.dispatchEvent({ type: 'click' });
      expect(grantIssued).toBe('COOL_ROOF');
    });

    it('can enable and disable action controls', () => {
      const btnApprove = createMockElement('button', { id: 'btn-action-approve' });
      const btnFine = createMockElement('button', { id: 'btn-action-fine' });
      const btnGrant = createMockElement('button', { id: 'btn-action-grant' });
      const grantSelect = createMockElement('select', { id: 'grant-select' });

      const root = createMockRoot({
        '#btn-action-approve': btnApprove,
        '#btn-action-fine': btnFine,
        '#btn-action-grant': btnGrant,
        '#grant-select': grantSelect,
      });

      const actionPanel = createActionPanel(root);
      actionPanel.setActionsEnabled(false);
      expect(btnApprove.disabled).toBe(true);
      expect(btnFine.disabled).toBe(true);
      expect(btnGrant.disabled).toBe(true);
      expect(grantSelect.disabled).toBe(true);

      actionPanel.setActionsEnabled(true);
      expect(btnApprove.disabled).toBe(false);
      expect(btnFine.disabled).toBe(false);
    });
  });
});

