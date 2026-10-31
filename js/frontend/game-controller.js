/**
 * @file game-controller.js
 * Game Controller — Phase 3 integration layer.
 *
 * Bridges the backend API with the frontend Renderer/screens.
 * All gameplay logic remains in the backend; this module only drives
 * UI state changes in response to backend results.
 *
 * P3-01  Bootstrap: start campaign, load first citizen, initial render.
 * P3-02  Connect city metrics to top bar.
 * P3-03  Connect current citizen case to dossier panel.
 * P3-04  Connect emission rulebook to rulebook panel.
 * P3-05  Connect receipt item clicks → breakdown → calculator entries.
 * P3-06  Connect APPROVE action.
 * P3-07  Connect FINE action.
 * P3-08  Connect GRANT action.
 * P3-09  Action feedback (correct/incorrect stamp + explanation).
 * P3-10  Citizen transitions (load next citizen after action resolves).
 * P3-11  Shift statistics → summary modal.
 * P3-12  Shift timer — real interval connected to campaign.tick().
 *
 * @typedef {import('../backend/index.js').BackendApi} BackendApi
 * @typedef {import('./renderer.js').Renderer} Renderer
 * @typedef {import('../backend/index.js').ActionResult} ActionResult
 */

/**
 * Duration in milliseconds between each timer tick.
 * @type {number}
 */
const TICK_INTERVAL_MS = 1000;

/**
 * How many seconds each interval tick deducts from the shift timer.
 * @type {number}
 */
const SECONDS_PER_TICK = 1;

/**
 * Milliseconds the action feedback overlay stays visible before
 * the next citizen is loaded. (P3-09 / P3-10)
 * @type {number}
 */
const FEEDBACK_DISPLAY_MS = 1800;

/**
 * GameController coordinates integration between the backend and the
 * frontend presentation layer for a single active session.
 */
export class GameController {
  /**
   * @param {BackendApi} backend  Backend API instance.
   * @param {Renderer}   renderer Frontend renderer.
   * @param {object}     [options]
   * @param {HTMLElement|Document} [options.root=document] Document root.
   */
  constructor(backend, renderer, options = {}) {
    /** @type {BackendApi} */
    this.backend = backend;

    /** @type {Renderer} */
    this.renderer = renderer;

    /** @type {HTMLElement|Document} */
    this.root = options.root || (typeof document !== 'undefined' ? document : null);

    /** @type {number|null} Internal setInterval handle. */
    this._timerHandle = null;

    /** @type {boolean} True while an action result is being displayed. */
    this._awaitingTransition = false;

    /** @type {boolean} True after startCampaign() has been called. */
    this._started = false;

    /** @type {import('../backend/index.js').CitizenCaseView | null} */
    this._currentCase = null;

    this._feedbackEl = null;
  }

  // ─── Internal helpers ────────────────────────────────────────────────────

  _query(sel) {
    return this.root && typeof this.root.querySelector === 'function'
      ? this.root.querySelector(sel)
      : null;
  }

  // ─── P3-01  Bootstrap ────────────────────────────────────────────────────

  /**
   * Initialises (or re-initialises) the backend campaign and performs the
   * initial full render of all connected UI panels.
   * P4-09: Shows day introduction modal and starts the shift timer.
   *
   * @param {object} [options]
   * @param {boolean} [options.autoStartTimer=true] Whether to start the timer immediately.
   * @returns {void}
   */
  startCampaign(options = {}) {
    const stateView = this.backend.startCampaign();
    this._started = true;
    this._awaitingTransition = false;
    this._pendingGameOverData = null;

    this._renderInitialState(stateView);

    // P4-09: Show day intro modal
    this._showDayIntro(stateView.currentDay);

    // Start shift timer
    this._startTimer();
  }

  /**
   * Called when the player clicks "Begin Shift" on the day intro modal.
   * Dismisses the intro modal and ensures the timer is running. (P4-09)
   */
  onStartShift() {
    this.renderer.hideDayIntroModal();
    if (!this._timerHandle) {
      this._startTimer();
    }
  }

  /**
   * Restarts the campaign from Day 1 with fresh state. (P4-14)
   *
   * @returns {void}
   */
  restartCampaign() {
    this._stopTimer();
    const stateView = this.backend.restartCampaign();
    this._awaitingTransition = false;
    this._pendingGameOverData = null;
    this._hideFeedback();

    this.renderer.showScreen('gameplay');
    this._renderInitialState(stateView);

    // P4-09/P4-14: Show day intro for Day 1 and start timer
    this._showDayIntro(stateView.currentDay);
    this._startTimer();
  }

  /**
   * Performs the full initial render for a freshly started/reset state.
   *
   * @param {import('../backend/index.js').GameStateView} stateView
   * @private
   */
  _renderInitialState(stateView) {
    // P3-04 – Rulebook
    const rulebook = this.backend.getRulebook();
    if (this.renderer.gameplay?.rulebook) {
      this.renderer.gameplay.rulebook.renderRates(Object.values(rulebook));
    }

    // P3-08 / P4-09 – Grant selector (populate with day-appropriate grants)
    const currentDay = stateView.currentDay ?? 1;
    const grants = this.backend.getGrantsForDay
      ? this.backend.getGrantsForDay(currentDay)
      : this.backend.getGrants();
    if (this.renderer.gameplay?.actionPanel) {
      this.renderer.gameplay.actionPanel.populateGrants(grants);
    }

    // P3-02 – Metrics + P3-11 – Case counter
    this._renderStateView(stateView);

    // P3-03 – First citizen
    this._loadCurrentCitizen(stateView);
  }

  // ─── P4-09  Day Introduction ──────────────────────────────────────────────

  /**
   * Shows the day introduction modal with the current day's configuration.
   *
   * @param {number} day
   * @private
   */
  _showDayIntro(day) {
    try {
      const dayConfig = this.backend.getDayConfig(day);
      if (this.renderer.dayIntroModal && typeof this.renderer.showDayIntroModal === 'function') {
        this.renderer.showDayIntroModal(dayConfig);
      }
    } catch (_) {
      // Ignored if getDayConfig is unavailable
    }
  }

  // ─── P3-02  City metrics ─────────────────────────────────────────────────

  /**
   * Pushes the latest GameStateView into every connected UI sub-component.
   *
   * @param {import('../backend/index.js').GameStateView} stateView
   * @private
   */
  _renderStateView(stateView) {
    if (!stateView) return;

    const dailyCasesCount = this._getDailyCasesCount(stateView);

    if (this.renderer.gameplay?.topBar) {
      this.renderer.gameplay.topBar.update({
        day: stateView.currentDay,
        maxDays: 3,
        currentCaseIndex: stateView.currentCaseIndex,
        totalCases: dailyCasesCount,
        timeRemaining: stateView.timeRemaining,
        metrics: stateView.metrics,
      });
    }
  }

  /**
   * Derives the total number of cases for the current day from a state view.
   * The backend does not expose this directly from GameStateView, so we
   * infer it from the number of daily cases the campaign manager holds.
   * As a fallback, we call getCurrentCase to check if one exists.
   *
   * @param {import('../backend/index.js').GameStateView} stateView
   * @returns {number}
   * @private
   */
  _getDailyCasesCount(stateView) {
    // We ask the backend for the campaign days configuration
    try {
      const { CAMPAIGN_DAYS } = this.backend._internalDays || {};
      if (CAMPAIGN_DAYS && CAMPAIGN_DAYS[stateView.currentDay]) {
        return CAMPAIGN_DAYS[stateView.currentDay].caseCount;
      }
    } catch (_) { /* ignore */ }

    // Fallback: use the day config exposed via backend internals or a known static map
    const dayCaseCounts = { 1: 5, 2: 6, 3: 7 };
    return dayCaseCounts[stateView.currentDay] ?? 5;
  }

  // ─── P3-03  Citizen dossier ──────────────────────────────────────────────

  /**
   * Loads the current citizen case from the backend and renders it.
   *
   * @param {import('../backend/index.js').GameStateView} [stateView]
   * @private
   */
  _loadCurrentCitizen(stateView) {
    const citizenCase = this.backend.getCurrentCase();
    this._currentCase = citizenCase;

    if (!citizenCase) {
      // No more citizens — shift complete via case exhaustion
      this._handleShiftEnd(stateView);
      return;
    }

    // Render dossier
    if (this.renderer.gameplay?.dossier) {
      this.renderer.gameplay.dossier.loadCitizen(citizenCase);
    }

    // Reset calculator for new citizen
    if (this.renderer.gameplay?.calculator) {
      this.renderer.gameplay.calculator.clear();
    }

    // Reset action panel comparison; populate grants
    if (this.renderer.gameplay?.actionPanel) {
      const grants = this.backend.getGrants();
      this.renderer.gameplay.actionPanel.update({
        auditedCO2: 0,
        declaredCO2: citizenCase.declaredCO2,
        grants,
        status: 'READY',
        actionsEnabled: true,
      });
    }

    this._hideFeedback();
  }

  // ─── P3-05  Calculator ───────────────────────────────────────────────────

  /**
   * Handles a receipt item click: requests a single-item breakdown from the
   * backend and adds the result to the calculator tape.
   *
   * @param {{ receiptIndex: number, itemIndex: number, item: object }} detail
   */
  onReceiptItemClick(detail) {
    if (!this._currentCase || this._awaitingTransition) return;

    const { receiptIndex, itemIndex } = detail;

    let breakdown;
    try {
      breakdown = this.backend.getReceiptBreakdown({
        caseId: this._currentCase.id,
        selection: [{ receiptIndex, itemIndex }],
      });
    } catch (err) {
      console.warn('[GameController] Receipt breakdown error:', err.message);
      return;
    }

    // Each item from the breakdown adds a tape entry
    for (const bItem of breakdown.items || []) {
      if (this.renderer.gameplay?.calculator) {
        this.renderer.gameplay.calculator.addEntry({
          label: bItem.label,
          qty: bItem.qty,
          unit: bItem.unit,
          co2: bItem.co2,
        });
      }
    }

    // Also update the "audited" reading in the action panel to reflect tape total
    this._syncActionPanelAudit();
  }

  /**
   * Reads the current calculator total and writes it into the action panel
   * assessment comparison.
   * @private
   */
  _syncActionPanelAudit() {
    if (!this.renderer.gameplay?.calculator) return;
    if (!this.renderer.gameplay?.actionPanel) return;
    if (!this._currentCase) return;

    const auditedCO2 = this.renderer.gameplay.calculator.getTotal();
    this.renderer.gameplay.actionPanel.updateAssessment(
      auditedCO2,
      this._currentCase.declaredCO2
    );
  }

  /**
   * Clears the calculator tape.
   */
  onClearCalculator() {
    if (this.renderer.gameplay?.calculator) {
      this.renderer.gameplay.calculator.clear();
    }
    this._syncActionPanelAudit();
  }

  // ─── P3-06/07/08  Action submission ─────────────────────────────────────

  /**
   * Submits an APPROVE action to the backend.
   */
  onApprove() {
    if (!this._currentCase || this._awaitingTransition) return;
    this._submitAction('APPROVE', null);
  }

  /**
   * Submits a FINE action to the backend.
   */
  onFine() {
    if (!this._currentCase || this._awaitingTransition) return;
    this._submitAction('FINE', null);
  }

  /**
   * Submits a GRANT action with the selected grant ID.
   *
   * @param {string} grantId
   */
  onGrant(grantId) {
    if (!this._currentCase || this._awaitingTransition) return;
    if (!grantId) {
      this._showInlineMessage('Select a grant program before stamping.');
      return;
    }
    this._submitAction('GRANT', grantId);
  }

  /**
   * Core action submission handler: validates via backend, updates metrics,
   * displays feedback, then transitions to next citizen.
   *
   * @param {'APPROVE'|'FINE'|'GRANT'} action
   * @param {string|null} grantId
   * @private
   */
  _submitAction(action, grantId) {
    // Disable actions while processing
    this._setActionsEnabled(false);
    this._awaitingTransition = true;

    let result;
    try {
      result = this.backend.submitAction({
        caseId: this._currentCase.id,
        action,
        grantId: grantId || undefined,
      });
    } catch (err) {
      console.warn('[GameController] submitAction error:', err.message);
      this._setActionsEnabled(true);
      this._awaitingTransition = false;
      return;
    }

    // P3-02 – Update metrics immediately
    if (this.renderer.gameplay?.topBar) {
      this.renderer.gameplay.topBar.setMetrics(result.metrics);
    }

    // P3-09 – Show feedback
    this._showActionFeedback(result);

    // P3-10 – Transition to next citizen after delay
    setTimeout(() => {
      this._handleActionResult(result);
    }, FEEDBACK_DISPLAY_MS);
  }

  // ─── P3-09  Action feedback ──────────────────────────────────────────────

  /**
   * Renders the action feedback overlay/stamp and explanation text.
   *
   * @param {ActionResult} result
   * @private
   */
  _showActionFeedback(result) {
    if (this.renderer.gameplay?.actionPanel) {
      const statusText = result.isValid ? '✓ CORRECT' : '✗ INCORRECT';
      this.renderer.gameplay.actionPanel.setStatus(statusText);
    }

    this._showFeedbackOverlay(result);
  }

  /**
   * Displays a transient feedback banner with the backend explanation.
   *
   * @param {ActionResult} result
   * @private
   */
  _showFeedbackOverlay(result) {
    const dossierPanel = this._query('#dossier-panel');
    if (!dossierPanel) return;

    // Remove any previous feedback element
    this._hideFeedback();

    const overlay = document.createElement('div');
    overlay.id = 'action-feedback-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');

    const stampClass = result.isValid ? 'feedback--valid' : 'feedback--invalid';
    const stampLabel = result.action;
    const metricLines = this._buildMetricChangeLines(result.metricChanges);

    overlay.className = `action-feedback-overlay ${stampClass}`;
    overlay.innerHTML = `
      <div class="feedback-stamp">${this._escapeHtml(stampLabel)}</div>
      <div class="feedback-explanation">${this._escapeHtml(result.explanation)}</div>
      ${metricLines ? `<div class="feedback-metrics font-mono">${metricLines}</div>` : ''}
    `.trim();

    dossierPanel.appendChild(overlay);
    this._feedbackEl = overlay;

    // Force reflow for CSS transition
    void overlay.offsetHeight;
    overlay.classList.add('feedback-visible');
  }

  /**
   * Builds a compact human-readable metric change summary.
   *
   * @param {import('../backend/index.js').MetricChanges} changes
   * @returns {string}
   * @private
   */
  _buildMetricChangeLines(changes) {
    if (!changes) return '';
    const lines = [];
    if (typeof changes.netZero === 'number' && changes.netZero !== 0) {
      const sign = changes.netZero > 0 ? '+' : '';
      lines.push(`Net-Zero ${sign}${changes.netZero.toFixed(1)}%`);
    }
    if (typeof changes.budget === 'number' && changes.budget !== 0) {
      const sign = changes.budget > 0 ? '+' : '';
      lines.push(`Budget ${sign}$${Math.round(Math.abs(changes.budget))} ${changes.budget > 0 ? '▲' : '▼'}`);
    }
    if (typeof changes.trust === 'number' && changes.trust !== 0) {
      const sign = changes.trust > 0 ? '+' : '';
      lines.push(`Trust ${sign}${changes.trust.toFixed(1)}%`);
    }
    return lines.join(' · ');
  }

  /**
   * Removes the feedback overlay if present.
   * @private
   */
  _hideFeedback() {
    if (this._feedbackEl) {
      if (typeof this._feedbackEl.remove === 'function') {
        this._feedbackEl.remove();
      } else if (this._feedbackEl.parentNode) {
        this._feedbackEl.parentNode.removeChild(this._feedbackEl);
      }
      this._feedbackEl = null;
    }

    // Also remove by ID in case reference was lost
    const existing = this._query('#action-feedback-overlay');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  }

  /**
   * Shows an inline status message without submitting an action.
   *
   * @param {string} message
   * @private
   */
  _showInlineMessage(message) {
    if (this.renderer.gameplay?.actionPanel) {
      this.renderer.gameplay.actionPanel.setStatus(message);
    }
  }

  // ─── P3-10  Citizen transitions ──────────────────────────────────────────

  /**
   * Processes the backend ActionResult after the feedback display delay.
   * Decides whether to load the next citizen, end the shift, or end the campaign.
   *
   * @param {ActionResult} result
   * @private
   */
  _handleActionResult(result) {
    this._awaitingTransition = false;

    if (result.campaignOutcome) {
      // Campaign ended (victory or failure)
      this._stopTimer();
      this._handleCampaignEnd(result.campaignOutcome, result.shiftStats);
      return;
    }

    if (result.shiftEnded) {
      this._stopTimer();
      this._handleShiftEnd(null, result.shiftStats);
      return;
    }

    // Load next citizen (P3-10)
    const stateView = this.backend.getState();
    this._renderStateView(stateView);
    this._loadCurrentCitizen(stateView);
    this._setActionsEnabled(true);
  }

  // ─── P3-11  Shift statistics + shift-end flow ────────────────────────────

  /**
   * Handles shift end: retrieves shift summary and displays the modal.
   *
   * @param {import('../backend/index.js').GameStateView | null} stateView
   * @param {import('../backend/systems/game-state.js').ShiftStats} [statsOverride]
   * @private
   */
  _handleShiftEnd(stateView, statsOverride) {
    const summary = this.backend.getShiftSummary();
    const stats = statsOverride || summary.shiftStats;
    const day = summary.day || (stateView?.currentDay) || 1;

    const summaryData = {
      day,
      processedCount: stats.processedCount,
      correctActions: stats.correctActions,
      co2ReducedKg: stats.co2ReducedKg,
      finesIssued: stats.finesIssued,
      grantsIssued: stats.grantsIssued,
    };

    // Show summary modal
    this.renderer.showSummaryModal(summaryData);
  }

  /**
   * Handles campaign end (victory or failure). Navigates to the game-over screen.
   * P4-12: Victory screen with campaign statistics.
   * P4-13: Failure screen with failure reason and metrics.
   *
   * @param {import('../backend/index.js').CampaignOutcome} outcome
   * @param {import('../backend/systems/game-state.js').ShiftStats} [shiftStats]
   * @private
   */
  _handleCampaignEnd(outcome, shiftStats) {
    const isVictory = outcome.status === 'VICTORY';
    const stateView = this.backend.getState();

    // Retrieve summary before transitioning
    const summary = this.backend.getShiftSummary();

    // P4-08/P4-12/P4-13 – Retrieve campaign stats for comprehensive results
    let campaignStats = null;
    try {
      campaignStats = this.backend.getCampaignStats();
    } catch (_) { /* ignore if not available */ }

    const gameOverData = {
      isVictory,
      outcome: outcome.status,
      reason: outcome.failureReason || null,
      daysCompleted: stateView.currentDay,
      maxDays: 3,
      netZero: outcome.metrics.netZero,
      trust: outcome.metrics.trust,
      budget: outcome.metrics.budget,
      campaignStats,
    };

    if (isVictory) {
      // P4-12: Show a brief summary first, then navigate to game-over screen
      const summaryData = {
        day: stateView.currentDay,
        processedCount: (shiftStats || summary.shiftStats).processedCount,
        correctActions: (shiftStats || summary.shiftStats).correctActions,
        co2ReducedKg: (shiftStats || summary.shiftStats).co2ReducedKg,
        finesIssued: (shiftStats || summary.shiftStats).finesIssued,
        grantsIssued: (shiftStats || summary.shiftStats).grantsIssued,
      };
      this.renderer.showSummaryModal(summaryData);

      // Store outcome data for when player proceeds from summary
      this._pendingGameOverData = gameOverData;
    } else {
      // P4-13: Immediate failure: go straight to game-over
      this.renderer.showScreen('game-over');
      if (this.renderer.gameOver) {
        this.renderer.gameOver.render(gameOverData);
      }
    }
  }

  /**
   * Called when the player clicks "Proceed" on the shift summary modal.
   * P4-11: If campaign ongoing and not last day, advance to next day with intro.
   * P4-12: If pending victory, show game-over victory screen.
   */
  onNextShift() {
    this.renderer.hideSummaryModal();

    // P4-12 – Pending campaign end (victory after Day 3 summary)
    if (this._pendingGameOverData) {
      const data = this._pendingGameOverData;
      this._pendingGameOverData = null;
      this.renderer.showScreen('game-over');
      if (this.renderer.gameOver) {
        this.renderer.gameOver.render(data);
      }
      return;
    }

    // P4-11 – Advance to the next day
    try {
      const stateView = this.backend.advanceDay();

      // Re-render the gameplay screen with the new day's state
      this._awaitingTransition = false;
      this._hideFeedback();

      // Update grant selector for the new day's available grants
      const currentDay = stateView.currentDay ?? 1;
      const grants = this.backend.getGrantsForDay
        ? this.backend.getGrantsForDay(currentDay)
        : this.backend.getGrants();
      if (this.renderer.gameplay?.actionPanel) {
        this.renderer.gameplay.actionPanel.populateGrants(grants);
      }

      // Render updated metrics + case counter
      this._renderStateView(stateView);

      // Load the first citizen of the new day
      this._loadCurrentCitizen(stateView);
      this._setActionsEnabled(true);

      // P4-09/P4-11 – Show day intro for the new day
      this._showDayIntro(currentDay);
    } catch (err) {
      console.warn('[GameController] advanceDay error:', err.message);
    }
  }

  // ─── P3-12  Shift timer ──────────────────────────────────────────────────

  /**
   * Starts the countdown interval that feeds `campaign.tick()` every second.
   * @private
   */
  _startTimer() {
    this._stopTimer();
    this._timerHandle = setInterval(() => {
      this._onTimerTick();
    }, TICK_INTERVAL_MS);
  }

  /**
   * Stops the countdown interval.
   * @private
   */
  _stopTimer() {
    if (this._timerHandle !== null) {
      clearInterval(this._timerHandle);
      this._timerHandle = null;
    }
  }

  /**
   * Tick handler: asks the backend campaign to advance time, then updates UI.
   * If the timer expires, ends the shift.
   * @private
   */
  _onTimerTick() {
    if (this._awaitingTransition) return;

    let stateView;
    try {
      // Use the BackendApi.tick() method (P3-12)
      stateView = this.backend.tick(SECONDS_PER_TICK);
    } catch (err) {
      console.warn('[GameController] Timer tick error:', err.message);
      this._stopTimer();
      return;
    }

    // Update timer display
    if (this.renderer.gameplay?.topBar) {
      this.renderer.gameplay.topBar.setTimer(stateView.timeRemaining);
    }

    // Check if shift ended due to timer expiry
    if (stateView.timeRemaining === 0) {
      this._stopTimer();

      if (!this._awaitingTransition) {
        this._awaitingTransition = true;
        this._setActionsEnabled(false);

        // Check for campaign outcome on time expiry (day 3)
        const outcome = this.backend.getCampaignOutcome();
        if (outcome) {
          this._handleCampaignEnd(outcome, null);
        } else {
          this._handleShiftEnd(stateView);
        }
      }
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Enables or disables the stamp action buttons.
   *
   * @param {boolean} enabled
   * @private
   */
  _setActionsEnabled(enabled) {
    if (this.renderer.gameplay?.actionPanel) {
      this.renderer.gameplay.actionPanel.setActionsEnabled(enabled);
    }
  }

  /**
   * HTML escape helper (frontend-only; no gameplay logic).
   *
   * @param {string} str
   * @returns {string}
   * @private
   */
  _escapeHtml(str) {
    if (typeof str !== 'string') return String(str ?? '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Cleans up the controller (stops timer, removes feedback).
   */
  destroy() {
    this._stopTimer();
    this._hideFeedback();
  }
}

/**
 * Factory for GameController.
 *
 * @param {BackendApi} backend
 * @param {Renderer} renderer
 * @param {object} [options]
 * @returns {GameController}
 */
export function createGameController(backend, renderer, options = {}) {
  return new GameController(backend, renderer, options);
}
