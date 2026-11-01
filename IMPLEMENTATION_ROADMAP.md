# Municipal Carbon Assessor — Development Plan

Based on your attached PRD · COP31 Game Jam MVP

My opinion in one sentence: This is a strong game-jam concept because it combines the investigative gameplay of Papers, Please with meaningful climate decisions, and its mechanics are achievable without a game engine.

I would keep the concept and most of the PRD intact, but organize the implementation more carefully so your agents don't mix gameplay calculations, game state, data and UI.

# 1. Proposed architecture: Separate Backend and Frontend

Your PRD already identifies three main responsibilities: game state and calculations, UI rendering and event handling, and citizen/rulebook data. I recommend separating them into two independent layers.

## Municipal Carbon Assessor

FRONTEND

Presentation layer

Everything the player sees and interacts with.

- Game interface and layout
- Citizen dossier and receipts
- Rulebook display
- Calculator interface
- Action stamps and grant selection
- City metric bars
- Timer display
- Shift summaries and modals
- Audio and visual feedback

Calls, events and data returned

BACKEND

Game logic layer

Everything that determines how the game works.

- Citizen case database
- Emission benchmark database
- Emission calculation engine
- Audit and fraud verification
- Grant eligibility and validation
- Action resolution and penalties
- City metrics management
- Game state management
- Timer and shift progression rules
- Campaign and win/loss conditions

An important technical clarification: Because this is a pure HTML/CSS/JavaScript offline game, there won't be an actual server-side backend. The backend here means the internal game logic, which runs locally in the browser.

This is intentional. You don't need a server, database, API, authentication or hosting infrastructure.


# 2. Important decisions before implementation

I noticed a few things in the PRD that I would resolve before allowing the agents to implement the mechanics.

These aren't reasons to redesign the game. They're safeguards against having to rewrite things halfway through development.

| Issue                      | What needs clarification                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Grant vs. fine vs. approve | Can a citizen receive a grant and still be fined for underdeclaring emissions? The current flow suggests only one action per citizen. |
| Net-Zero Progress          | Is reaching 100% before Day 3 allowed, or must the player complete all three days?                                                    |
| Grant effects              | Are the +7–10% boosts immediate, while future emission reductions are only descriptive? Or should future cases reflect the grant?     |
| Emission benchmarks        | Are the listed emission rates fixed game-design values or intended to represent real-world verified factors?                          |
| Calculator                 | Does clicking a receipt item add its emission contribution, or its quantity and rate separately?                                      |
| Timer                      | What happens to an unfinished citizen dossier when the shift timer reaches zero?                                                      |
| Campaign failure           | Does bankruptcy or zero public trust end the entire campaign immediately, or only the current day?                                    |

There are also two mathematical details worth addressing:

1\. Discrepancy ratio

Your formula divides by actual emissions. If actual emissions are zero, this creates a division-by-zero problem. The audit engine should handle zero-emission cases explicitly.

2\. Fraud detection

The `hasFraud` field is useful for constructing test cases, but the actual gameplay should determine fraud from the receipts, declaration and policy rules—not simply trust a hidden Boolean flag.

The `fraudType` field can remain useful for categorizing the case and validating the case data.

I would also clarify whether the ±2 kg tolerance applies to every action, including grants, or only approval and fines.

## My recommended MVP decisions

To keep the implementation manageable, I suggest:

- One action per citizen, as currently described.
- Grants are alternatives to fines and approvals.
- A valid grant increases Net-Zero Progress immediately.
- Grant future impacts are descriptive only; don't simulate future household emissions in this MVP.
- The campaign requires completing all three days to win, with 100% Net-Zero Progress at the end of Day 3.
- Bankruptcy and zero trust cause immediate campaign failure.
- An unfinished case when the timer expires is not counted as processed.
- Use fixed, clearly labelled gameplay benchmark values rather than presenting the PRD's emission rates as official COP31 or Antalya government figures.

These are proposed decisions, not facts already established in the PRD. I'd have you approve them before Phase 1.

**Approval status:** Approved under P0-05. The authoritative record is `GAME_RULES.md` §13.

# 3. Phase-by-phase implementation roadmap

I recommend seven phases, with each phase having a clear completion gate.

The phases are intentionally sequential: first establish the backend, then connect the frontend, then complete the campaign, then polish and test.

## Implementation overview

1. Phase 0 — Project foundation

   Repository, architecture and contracts.
2. Phase 1 — Backend core

   Data, emissions, audits, grants and metrics.
3. Phase 2 — Frontend foundation

   Screens, layout and reusable UI components.
4. Phase 3 — Gameplay integration

   Connect backend and frontend into a playable round.
5. Phase 4 — Campaign and progression

   Three-day campaign, difficulty and outcomes.
6. Phase 5 — Visual and audio polish

   Animations, feedback, sound and responsive design.
7. Phase 6 — QA and submission

   Testing, balancing, documentation and final build.

## Phase 0 — Project Foundation



Preparation

Before implementation



Objective: Establish the project structure and prevent the agents from inventing different architectures or changing the approved game rules.

### Tasks

| ID    | Task                                                                                 | Owner   |
| ----- | ------------------------------------------------------------------------------------ | ------- |
| P0-01 | Create the project repository and initialize the folder structure.                   | Shared  |
| P0-02 | Create the backend/frontend architectural boundaries.                                | Backend |
| P0-03 | Define the shared data contracts for cases, receipts, grants and game state.         | Backend |
| P0-04 | Define the frontend/backend communication interface.                                 | Shared  |
| P0-05 | Resolve the gameplay ambiguities identified above and record the approved decisions. | Product |
| P0-06 | Create the initial README and ATTRIBUTION documentation.                             | Shared  |

**P0-01 status:** Completed — folder structure initialized per `PROJECT_ARCHITECTURE.md`. `README.md` and `ATTRIBUTION.md` were added under P0-06.

**P0-02 status:** Completed — `js/backend/index.js` is the backend's public entry point and aggregates the documented backend domains. Frontend modules must import backend functionality only through this entry point and must not contain gameplay logic.

**P0-03 status:** Completed — shared data contracts defined as JSDoc typedefs in `cases.js` (citizen case, receipt, receipt item), `grants.js` (grant and eligibility), `rulebook.js` (emission rate), and `game-state.js` (game state, city metrics, shift statistics). Contract fields follow `GAME_RULES.md` §3, §5–§9 and the PRD case/game-state schemas.

**P0-04 status:** Completed — frontend/backend communication interface defined as JSDoc typedefs in `js/backend/index.js` (`BackendApi`, sanitized case/state views, receipt breakdown, action request/result, shift summary, campaign outcome) and referenced from `js/app.js`. Frontend requests operations and displays results; validation, calculations, metrics, and outcomes remain backend-owned. Timer/day-transition operations beyond this core surface remain with P3-12/P4.

**P0-05 status:** Completed — the recommended MVP decisions are approved and recorded as D-01–D-12 in `GAME_RULES.md` §13. The Cool/Green Roof “high summer AC” threshold was later approved as D-15/D-16, resolving §13.1.

**P0-06 status:** Completed — initial `README.md` and `ATTRIBUTION.md` created. Final submission documentation remains part of P6-15/P6-16.

### Expected deliverables

- Empty but organized project structure.
- Approved data schemas.
- Approved game rules and constants.
- A documented interface between frontend and backend.

### Completion criteria

- Both agents understand the same data structures.
- Frontend and backend responsibilities are documented.
- No gameplay implementation has started without approved rules.

## Phase 1 — Backend Core Implementation

Backend only

Objective: Build the complete game logic independently of the UI.

This is the most important technical phase because incorrect emission calculations or action resolutions will undermine the entire game.

### 1A. Data Layer

| ID    | Task                               | Description                                                                   |
| ----- | ---------------------------------- | ----------------------------------------------------------------------------- |
| P1-01 | Implement emission rulebook        | Store all emission rates and categories from the PRD.                         |
| P1-02 | Implement grant database           | Store grant IDs, eligibility requirements, costs and effects.                 |
| P1-03 | Implement citizen case database    | Create the citizen profiles, receipts, declarations and notes using the canonical rulebook keys (D-13). |
| P1-04 | Implement case validation          | Verify IDs, required fields, receipt types, quantities and rate references.   |
| P1-05 | Implement campaign day definitions | Store the number of cases, time limits and introduced mechanics for each day. |

**P1-01 status:** Completed — `js/backend/data/rulebook.js` exports the 11 municipal assessment rates from `GAME_RULES.md` §3.1, grouped by category with their rate keys, activity labels, values and units. The PRD-defined keys `GRID_ELEC`, `GAS_HEAT`, `LOCAL_FOOD`, `BEEF` and `FLIGHT` are preserved; remaining keys use consistent uppercase identifiers for the same activities. These 11 keys are canonical for all case data per D-13, and P1-03 must use them exactly.

**P1-02 status:** Completed — `js/backend/data/grants.js` exports all four grants from `GAME_RULES.md` §5 with their IDs, names, costs, Net-Zero boosts, eligibility requirements and future-impact descriptions. The Cool/Green Roof Permit uses the approved `summerAcAboveKwh: 150` threshold (D-15) and the case-data convention in D-16, so P1-13 can validate that grant from citizen records.

**P1-03 status:** Completed — `js/backend/data/cases.js` exports the `CITIZEN_CASES` array using the 11 canonical rate keys from `EMISSION_RULEBOOK` (D-13). Each case includes receipts with valid `rateKey` values, declared CO₂, citizen metadata and the required `roofType` (D-16), providing a data layer for shift‑level case processing. Summer AC usage, when present, follows the `COOLING` receipt convention (D-16).

**P1-04 status:** Completed — `js/backend/data/cases.js` exports the `validateCase`, `validateReceipt` and `validateReceiptItem` functions that verify case IDs (format `C###`), required fields (name, district, declaredCO₂, receipt structure), receipt types and titles, item quantities and units, and that every `rateKey` references a known emission rate in the rulebook. These validators are used by the backend before any action resolution and provide clear error messages for the player.

**P1-05 status:** Completed — `js/backend/data/days.js` exports the `CAMPAIGN_DAYS` constant with the number of citizen cases, time limits (in seconds) and introduced mechanics for each of the three campaign days, as documented in `README.md` and `GAME_RULES.md` §6–§7. Day 1 has 5 cases and a 120‑second timer; Day 2 has 6 cases and a 100‑second timer; Day 3 has 7 cases and a 90‑second timer. The mechanics fields list the gameplay concepts first introduced on each day (e.g. fraud on Day 2, Cool/Roof permit on Day 3) without prescribing their exact implementation.

**P1-06 status:** Completed — `js/backend/calculations/emissions.js` exports `calculateItemEmissions` and `calculateActualEmissions`. The calculator resolves each item's `rateKey` against `EMISSION_RULEBOOK` (throwing on unknown keys per `GAME_RULES.md` §7.2), multiplies quantity by rate, sums all receipt items in a case, and clamps the assessed total to zero per §3.2. Coverage includes the roadmap examples, multi-receipt sums, solar offsets, clamping and unknown rate keys.

**P1-07 status:** Completed — `js/backend/calculations/emissions.js` exports `calculateReceiptBreakdown`, which returns the approved `ReceiptBreakdown` contract: every item's contribution with its receipt/item reference, subtotals grouped by receipt category (`receipt.type`), and the case total. Item and category values preserve negative offsets while `totalCO2` is clamped to zero per `GAME_RULES.md` §3.2/§3.3. Coverage includes item references, category grouping across receipts, offsets, sample cases, and unknown rate keys.

**P1-08 status:** Completed — `js/backend/calculations/emissions.js` exports `compareDeclaration`, which compares a case's clamped actual emissions with its `declaredCO2` and returns the signed discrepancy (`actual − declared`) and discrepancy ratio. When actual emissions are zero, the ratio is `null` to avoid division by zero per `GAME_RULES.md` §3.4 and D-08. The ±2 kg tolerance and decision classification remain P1-09 scope.

**P1-09 status:** Completed — `js/backend/calculations/emissions.js` exports `detectDiscrepancy`, which returns the absolute discrepancy, whether it is within the ±2 kg tolerance, and whether the case has zero actual emissions. Detection uses the absolute discrepancy so zero-emission cases do not depend on the discrepancy ratio (D-08). Approval and fine decision logic remain P1-11/P1-12 scope.

**P1-10 status:** Completed — `js/backend/calculations/emissions.js` exports `verifyOffsets`, which inspects a citizen case for invalid or unverified offset claims. According to municipal carbon audit policy (`GAME_RULES.md` §3.1, §4.2, §7.3), `SOLAR_OFFSET` (-0.40 kg CO₂/kWh) is the only approved offset factor. Any receipt item claiming an offset that does not reference an approved offset factor, non-positive solar quantities, or claims of unverified third-party/private offsets in citizen records/notes are identified as invalid claims (`hasUnverifiedOffset: true`). Approval and fine action validation remain P1-11/P1-12 scope.

**Test tooling status:** Completed — Vitest is configured per D-14 through `package.json` and `vitest.config.js`. Run `npm test` for a single run or `npm run test:watch` during development. Tests in `tests/` mirror the implemented backend modules; each future backend module must add its tests as it is implemented.

### 1B. Calculation Engine

| ID    | Task                             | Description                                                       |
| ----- | -------------------------------- | ----------------------------------------------------------------- |
| P1-06 | Implement emission calculator    | Calculate actual emissions from all receipt items.                |
| P1-07 | Implement receipt breakdown      | Calculate the emission contribution of each item and receipt.     |
| P1-08 | Implement declaration comparison | Compare declared and actual emissions.                            |
| P1-09 | Implement discrepancy detection  | Handle the ±2 kg tolerance and zero-emission cases.               |
| P1-10 | Implement offset verification    | Identify invalid or unverified offset claims according to policy. |

### 1C. Audit and Action Systems

| ID    | Task                          | Description                                                 |
| ----- | ----------------------------- | ----------------------------------------------------------- |
| P1-11 | Implement approval validation | Determine whether approval is correct.                      |
| P1-12 | Implement fine validation     | Check underdeclaration and invalid offset claims.           |
| P1-13 | Implement grant eligibility   | Match household defects with eligible grants using the Cool/Green Roof rules in D-15/D-16. |
| P1-14 | Implement grant validation    | Ensure the selected grant matches the eligible issue.       |
| P1-15 | Implement action resolution   | Calculate the financial and metric effects of every action. |

**P1-11 status:** Completed — `js/backend/systems/audit.js` exports `validateApproval`, which validates citizen declarations against calculated emissions within the approved ±2 kg tolerance (`|actual - declared| <= 2`) and verifies that no unapproved or unverified offset claims exist per `GAME_RULES.md` §4.1. Zero-emission and clamped solar offset cases are handled without division-by-zero dependencies per D-08.

**P1-12 status:** Completed — `js/backend/systems/audit.js` exports `validateFine`, which enforces penalties when emissions are underdeclared by more than 2 kg (`actual - declared > 2`) or when the citizen claims an unverified offset per `GAME_RULES.md` §4.2. Fine amount is calculated as `max(0, actual - declared) * 10` per D-11, ensuring unverified offset claims never generate negative fines or unfair penalties when overdeclared.

**P1-13 status:** Completed — `js/backend/systems/grant-system.js` exports `checkGrantEligibility`, `getEligibleGrants`, and `determineEligibleGrant`. Household defect quantities are aggregated directly from receipt items across categories: natural gas heating (`GAS_HEAT` > 100 m³ for `HEAT_PUMP`), landfill waste (`LANDFILL` > 30 kg for `COMPOST_KIT`), gasoline travel (`GASOLINE` > 300 km for `TRANSIT_PASS`), and summer cooling AC electricity (`GRID_ELEC` in `COOLING` receipts > 150 kWh with `roofType === 'ASPHALT'` for `COOL_ROOF`) per `GAME_RULES.md` §5, §7.2, D-15, and D-16.

**P1-14 status:** Completed — `js/backend/systems/grant-system.js` exports `validateGrant` and `calculateGrantMetricChanges`. Validates that the selected grant matches the citizen's eligible defect. Valid grants yield the catalog cost and Net-Zero boost; mismatched or unselected grants return invalid validation with appropriate penalty costs per `GAME_RULES.md` §4.3.

**P1-15 status:** Completed — `js/backend/systems/audit.js` exports `resolveAction` and action effect definitions (`APPROVAL_ACTION_EFFECTS`, `FINE_ACTION_EFFECTS`). Calculates the exact metric changes (Net-Zero, budget, public trust) and generates human-readable explanations for all three action types (APPROVE, FINE, GRANT) under both valid and invalid conditions per `GAME_RULES.md` §4 and §6.

### 1D. Game State and Metrics

| ID    | Task                         | Description                                                      |
| ----- | ---------------------------- | ---------------------------------------------------------------- |
| P1-16 | Implement initial game state | Initialize the campaign, day, timer, cases and metrics.          |
| P1-17 | Implement city metrics       | Manage Net-Zero, Budget and Public Trust.                        |
| P1-18 | Implement metric guardrails  | Enforce limits and bankruptcy/failure conditions.                |
| P1-19 | Implement case progression   | Track processed cases and current case.                          |
| P1-20 | Implement shift statistics   | Track correct actions, fines, grants and CO2-related statistics. |

**P1-16 status:** Completed — `js/backend/systems/game-state.js` exports `createInitialGameState`, initializing campaign day, daily cases from `CITIZEN_CASES`, time limit from `CAMPAIGN_DAYS` (120s for Day 1), initial metrics (Net-Zero 30%, Budget $5,000, Public Trust 70%), and empty shift statistics. `campaign.js` and `index.js` expose this through `startCampaign` / `restartCampaign`.

**P1-17 status:** Completed — `js/backend/systems/metrics.js` exports `createInitialMetrics`, `applyMetricChanges`, and `clampPercentage`. Manages Net-Zero progress, Municipal Budget, and Public Trust according to the exact formulas in `GAME_RULES.md` §6 and action effects in §4.

**P1-18 status:** Completed — `js/backend/systems/metrics.js` exports `isBankrupt`, `isTrustDepleted`, `checkFailureConditions`, `checkVictoryCondition`, and enforces metric bounds via `METRIC_BOUNDS`. Ensures percentage metrics are clamped between [0, 100]% while budget is checked before clamping so bankruptcy is accurately detected when budget <= 0 or trust <= 0 per `GAME_RULES.md` §6.5 and §10.2.

**P1-19 status:** Completed — `js/backend/systems/game-state.js` exports `getCurrentCase`, `hasNextCase`, `advanceCase`, `tickTimer`, and `applyAuditAction`. Tracks current case index, enforces single-case advancement on action completion, ends shifts when the daily case list finishes or the timer hits zero without processing unfinished cases per `GAME_RULES.md` §8.4 and §8.5.

**P1-20 status:** Completed — `js/backend/systems/game-state.js` exports `createInitialShiftStats` and `recordActionInShiftStats`. Accurately increments `processedCount`, `correctActions`, `finesIssued`, and `grantsIssued` only when actions are completed and verified per `GAME_RULES.md` §9. Accessible via `getShiftSummary` in `index.js` and `campaign.js`.

### Backend testing

Each module must have independent tests.

| Test                                         | Expected result             |
| -------------------------------------------- | --------------------------- |
| Receipt contains 100 kWh of grid electricity | 50 kg CO2                   |
| Receipt contains 10 m³ of natural gas        | 20 kg CO2                   |
| Receipt contains 2 beef packs                | 30 kg CO2                   |
| Correct approval within tolerance            | Correct approval effects    |
| Incorrect approval outside tolerance         | Oversight penalty           |
| Underdeclared emissions                      | Fine eligibility            |
| Valid grant for eligible household           | Correct cost and boost      |
| Grant issued for ineligible household        | Wasted subsidy penalty      |
| Budget falls below zero                      | Correct bankruptcy handling |
| Trust reaches zero                           | Campaign failure            |
| Net-Zero exceeds 100%                        | Clamped to 100%             |

Phase 1 completion gate

The backend must be able to load a citizen, calculate their emissions, validate all possible actions, apply their effects and return the updated game state without requiring any frontend code.

## Phase 2 — Frontend Foundation

Frontend only

Objective: Build the complete interface using mock data, without depending on the unfinished backend.

This is where Antigravity can be particularly useful for visual inspection.

### 2A. Application Shell

| ID    | Task                             | Description                                             |
| ----- | -------------------------------- | ------------------------------------------------------- |
| P2-01 | Create application shell         | Set up the HTML structure and screen containers.        |
| P2-02 | Implement CSS design system      | Define colors, typography, spacing and reusable styles. |
| P2-03 | Implement three-column workspace | Create rulebook, dossier and action panels.             |
| P2-04 | Implement responsive layout      | Ensure the interface adapts to smaller screens.         |

**P2-01 status:** Completed — `index.html` sets up the semantic HTML5 application shell, linking all four stylesheets (`styles.css`, `layout.css`, `components.css`, `responsive.css`) and loading `js/app.js`. Configures core screen containers (`#screen-main-menu`, `#screen-gameplay`, `#screen-game-over`, `#summary-modal`), top bar with city metrics and timer, and the three-column workspace structure (`#workspace`).

**P2-02 status:** Completed — `css/styles.css` and `css/components.css` define the municipal retro-futuristic design system adhering to PRD §6.2. Declares color tokens (`--bg-app`, `--surface-panel`, `--surface-card`, `--paper-dossier`, `--paper-text`, `--accent-cyan`, `--accent-gold`, stamp colors), typography (`JetBrains Mono`, `Inter`), spacing scale, base resets, and reusable component classes for cards, badges, buttons, meters, and stamp actions.

**P2-03 status:** Completed — `css/layout.css` establishes the fixed viewport (`100vw`, `100vh`) shell, active/inactive screen management, `#top-bar` header layout, and the CSS Grid 3-column workspace (`#workspace`). Sectioned into `#rulebook-panel` (left), contrasting paper `#dossier-panel` (center), and terminal `#action-panel` (right) with scrollable container bodies and bottom-anchored stamp dock.

**P2-04 status:** Completed — `css/responsive.css` implements media queries for large screens, medium laptops/desktops (1024px–1280px), tablets (769px–1024px), mobile devices (<=768px and <=480px), short viewports (height <=720px), and accessibility (`prefers-reduced-motion`), ensuring flexible columns, tab switching, and touch-friendly controls.

### 2B. Interface Components

| ID    | Task                           | Description                                           |
| ----- | ------------------------------ | ----------------------------------------------------- |
| P2-05 | Implement top bar              | Display Net-Zero, Budget, Trust and timer.            |
| P2-06 | Implement rulebook panel       | Display emission rates and policy directives.         |
| P2-07 | Implement citizen dossier      | Display citizen information and personal notes.       |
| P2-08 | Implement receipt components   | Display energy, grocery, travel and waste records.    |
| P2-09 | Implement calculator interface | Create the interactive scratchpad.                    |
| P2-10 | Implement action dock          | Create approval, fine and grant controls.             |
| P2-11 | Implement grant selector       | Allow players to inspect and select available grants. |

**P2-05 status:** Completed — `js/frontend/components/top-bar.js` exports `TopBarComponent`, `createTopBar`, `formatBudget`, and `formatTimer`. Binds to `#top-bar` DOM nodes, presenting campaign day, case count, clamped percentage meters (Net-Zero and Trust), normalized Budget meter, and MM:SS countdown timer with low-time warning classes.

**P2-06 status:** Completed — `js/frontend/components/rulebook-panel.js` exports `RulebookPanelComponent`, `createRulebookPanel`, `renderRateItem`, and `renderPolicyItem`. Renders official emission benchmark rates and municipal policy directives (`DIR-3101`, `DIR-3102`, `DIR-3103`) into `#rulebook-panel` with semantic badges and XSS-safe text escaping.

**P2-07 status:** Completed — `js/frontend/components/dossier-panel.js` exports `DossierPanelComponent`, `createDossierPanel`, and `formatCO2`. Binds to `#dossier-panel` fields to display citizen full name, case ID, district, roof type, formatted declared carbon footprint, and citizen statement/note.

**P2-08 status:** Completed — `js/frontend/components/dossier-panel.js` implements `renderReceiptCard` and `renderReceiptItem`. Dynamically renders utility, grocery, travel, and cooling receipts with category badges, item quantities, and interactive click/keyboard event hooks referencing line item indices.

**P2-09 status:** Completed — `js/frontend/components/calculator-panel.js` exports `CalculatorPanelComponent`, `createCalculatorPanel`, and `formatCO2`. Manages scratchpad tape entries, displays formatted running CO₂ totals, provides clear controls, and respects the architecture boundary by consuming calculated inputs without duplicating backend formula calculations.

**P2-10 status:** Completed — `js/frontend/components/action-panel.js` exports `ActionPanelComponent` and `createActionPanel`. Binds to `#stamp-dock` and `#assessment-summary-box`, displaying audited vs. declared comparison with variance indicators, handling APPROVE, FINE, and GRANT click events, and supporting action enablement states.

**P2-11 status:** Completed — `js/frontend/components/action-panel.js` implements `populateGrants`, `getSelectedGrant`, `setSelectedGrant`, and `formatGrantLabel`. Populates and controls `#grant-select` with catalog entries (Heat Pump, Compost Kit, Transit Voucher, Cool Roof) showing subsidies and Net-Zero boost percentages.

### 2C. Screens and Interactions

| ID    | Task                                    | Description                                        |
| ----- | --------------------------------------- | -------------------------------------------------- |
| P2-12 | Implement main menu                     | Display game title, introduction and start button. |
| P2-13 | Implement gameplay screen               | Assemble all gameplay components.                  |
| P2-14 | Implement summary modal                 | Display shift results and statistics.              |
| P2-15 | Implement game-over screen              | Create the campaign failure presentation.          |
| P2-16 | Implement button and modal interactions | Handle opening, closing and selection.             |

**P2-12 status:** Completed — `js/frontend/screens/main-menu.js` exports `MainMenuScreen`, `MainMenuComponent`, and `createMainMenuScreen`. Binds to `#screen-main-menu` and `#btn-start-game`. Manages active state via `show()` / `hide()` / `isActive()`. Supports `setTitle()`, `setSubtitle()`, and `onStart` callback. The HTML `#screen-main-menu` container was already authored in `index.html` with the game title, briefing cards, and start button per P2-01.

**P2-13 status:** Completed — `js/frontend/screens/gameplay-screen.js` exports `GameplayScreen`, `GameplayScreenComponent`, and `createGameplayScreen`. Composes all five workspace sub-components (`TopBarComponent`, `RulebookPanelComponent`, `DossierPanelComponent`, `CalculatorPanelComponent`, `ActionPanelComponent`) under one coordinator. Implements responsive tab management (`setActiveTab()`, `getActiveTab()`), unified `update()` delegation, and `show()` / `hide()` / `isActive()` screen control. Action callbacks (`onApprove`, `onFine`, `onGrant`, `onGrantSelectChange`, `onReceiptItemClick`, `onClearCalculator`, `onTabChange`) are forwarded to options.

**P2-14 status:** Completed — `js/frontend/screens/summary-screen.js` exports `SummaryModalComponent`, `SummaryScreen`, `createSummaryModal`, and `formatAccuracy`. Manages `#summary-modal` hidden-attribute visibility. `open(data)` / `close()` / `isOpen()` implement standard dialog semantics. Renders cases processed, audit accuracy (as computed percentage), and CO₂ corrected. `onProceed` callback fires from `#btn-next-shift`. Re-exports game-over screen exports for convenience.

**P2-15 status:** Completed — `js/frontend/screens/game-over-screen.js` exports `GameOverScreenComponent`, `GameOverScreen`, `createGameOverScreen`, and `getFailureMessage`. Renders failure (BANKRUPTCY, PUBLIC_TRUST, NET_ZERO_TARGET) and victory modes with appropriate badges, titles, reason text, and final metric values. `onRestart` and `onReturnMenu` callbacks wired to `#btn-restart-game` and `#btn-return-menu`.

**P2-16 status:** Completed — `js/frontend/renderer.js` exports `Renderer` and `createRenderer`, coordinating exclusive single-screen visibility across all three screens and the summary modal. `js/frontend/events.js` exports `EventManager` and `setupUIEvents`, wiring all interactive elements (start, tabs, stamps, grant selector, calculator clear, modal proceed, restart, return-to-menu) and keyboard shortcuts (Escape to dismiss modal; 1/2/3 for APPROVE/FINE/GRANT during gameplay). `js/app.js` exports `initApp` which bootstraps `Renderer` + `EventManager` and auto-runs in browser context. `ActionPanelComponent.update()` and `DossierPanelComponent.update()` added to satisfy the unified update interface.

### Frontend completion gate

- Every screen is visually complete.
- Mock citizen data renders correctly.
- All interactive elements work with mock callbacks.
- The interface works at the intended game resolution.
- No game calculations are duplicated in the frontend.

Important: Don't spend hours perfecting the visuals here. The objective is a complete interface, not final polish.

## Phase 3 — Backend/Frontend Integration

Integration

Objective: Turn the separate modules into an actual playable game.

This is where the frontend stops using mock data and starts communicating with the real backend.

### Tasks

| ID    | Task                            | Description                                                 |
| ----- | ------------------------------- | ----------------------------------------------------------- |
| P3-01 | Implement application bootstrap | Initialize backend state and load the first citizen.        |
| P3-02 | Connect city metrics            | Render actual backend values in the top bar.                |
| P3-03 | Connect citizen dossier         | Load the correct citizen and their receipts.                |
| P3-04 | Connect rulebook                | Display benchmark values from backend data.                 |
| P3-05 | Connect calculator              | Calculate and display selected receipt contributions.       |
| P3-06 | Connect approval action         | Send approval requests to the audit system.                 |
| P3-07 | Connect fine action             | Send fine requests and display results.                     |
| P3-08 | Connect grant action            | Connect grant selection and validation.                     |
| P3-09 | Implement action feedback       | Display correct/incorrect action feedback and explanations. |
| P3-10 | Implement citizen transitions   | Load the next citizen after an action is resolved.          |
| P3-11 | Connect shift statistics        | Display processed cases and cumulative statistics.          |
| P3-12 | Implement shift timer           | Connect the timer to campaign progression.                  |

**P3-01 status:** Completed — `js/app.js` and `js/frontend/game-controller.js` bootstrap the campaign session via `backendApi.startCampaign()`, initializing Day 1 state, loading the first citizen dossier, populating rulebook rates and mitigation grants, and rendering initial top-bar metrics.

**P3-02 status:** Completed — `GameController._renderStateView` binds backend `GameStateView.metrics` directly into `TopBarComponent.setMetrics`, accurately updating Net-Zero progress, Municipal Budget, and Public Trust on shift start and immediately following each audited action resolution.

**P3-03 status:** Completed — `GameController._loadCurrentCitizen` consumes `backendApi.getCurrentCase()` to populate `DossierPanelComponent` with citizen identity, district, roof type, personal plea note, declared CO₂, and submitted activity receipts without leaking test or internal audit metadata.

**P3-04 status:** Completed — Rulebook benchmarks from `backendApi.getRulebook()` and grant programs from `backendApi.getGrants()` are wired during initialization to `RulebookPanelComponent.renderRates` and `ActionPanelComponent.populateGrants`.

**P3-05 status:** Completed — `emissions.breakdownReceipts` supports item-level calculations via `selection: [{ receiptIndex, itemIndex }]`. Clicking line items delegates to `GameController.onReceiptItemClick` which queries `backendApi.getReceiptBreakdown` and feeds calculated values to `CalculatorPanelComponent.addEntry`, keeping gameplay logic exclusively within the backend.

**P3-06 status:** Completed — `GameController.onApprove` transmits `AuditActionRequest` with action `'APPROVE'` to `backendApi.submitAction`, triggering backend validation, metric application, shift stat tracking, and feedback rendering.

**P3-07 status:** Completed — `GameController.onFine` submits action `'FINE'` to `backendApi.submitAction`, penalizing underdeclarations and unverified offset deductions per `GAME_RULES.md` §4.2.

**P3-08 status:** Completed — `GameController.onGrant` validates selection of an active grant program from the dropdown, submitting action `'GRANT'` with `grantId` to `backendApi.submitAction` and resolving eligibility, budget deductions, and Net-Zero boosts.

**P3-09 status:** Completed — `GameController._showActionFeedback` and `GameController._showFeedbackOverlay` present transient visual stamp feedback (`✓ CORRECT` or `✗ INCORRECT`), backend human-readable explanations, and metric impact lines on `#dossier-panel` with `.action-feedback-overlay` CSS transitions.

**P3-10 status:** Completed — Following feedback display delay, `GameController._handleActionResult` advances to the next citizen case via `backendApi.getCurrentCase()`, clearing the calculator and resetting action panel inputs while disallowing action re-submission during the transition window.

**P3-11 status:** Completed — Upon shift completion (exhausting daily cases or timer expiry), `GameController._handleShiftEnd` invokes `backendApi.getShiftSummary()` to present cases processed, correct audit count, audit accuracy percentage, and CO₂ reduced inside `SummaryModalComponent`.

**P3-12 status:** Completed — `GameController._startTimer` drives an active 1-second interval dispatching to `backendApi.tick(1)`. Updates top-bar countdown display, triggers low-time warnings (<=30s), and automatically concludes the shift when remaining time reaches 0 without auditing unfinished dossiers.

### Integration acceptance test

A complete round should work like this:

1. A citizen appears.
2. The player reads the personal note.
3. The player inspects receipts.
4. The player uses the calculator.
5. The player checks the rulebook.
6. The player chooses an action.
7. The backend validates the action.
8. The metrics update.
9. The player receives feedback.
10. The next citizen appears.

At this point, you should have a fully playable single-day prototype.

Major milestone

Phase 3 completion = Minimum playable game.

If time becomes critically limited, you already have a playable product that can be demonstrated.

## Phase 4 — Three-Day Campaign and Progression

Backend + Frontend

Objective: Transform the single-day prototype into the complete three-day campaign described in the PRD.

### 4A. Backend Tasks

| ID    | Task                               | Description                                                         |
| ----- | ---------------------------------- | ------------------------------------------------------------------- |
| P4-01 | Implement Day 1 configuration      | Five cases, 120 seconds, basic audits and initial grants.           |
| P4-02 | Implement Day 2 configuration      | Six cases, 100 seconds, greenwashing and expanded grants.           |
| P4-03 | Implement Day 3 configuration      | Seven cases, 90 seconds, complex receipts and subtle discrepancies. |
| P4-04 | Implement daily case selection     | Load the correct cases for each day.                                |
| P4-05 | Implement campaign transitions     | Advance to the next day after a successful shift.                   |
| P4-06 | Implement campaign win conditions  | Evaluate Net-Zero Progress after Day 3.                             |
| P4-07 | Implement campaign loss conditions | Handle bankruptcy and zero public trust.                            |
| P4-08 | Implement campaign statistics      | Aggregate performance across all three days.                        |

**P4-01 status:** Completed — `js/backend/data/days.js` configures Day 1 with 5 citizen cases, a 120-second time limit (`timeLimitSeconds`), and initial mitigation grants (`HEAT_PUMP`, `COMPOST_KIT`). Day 1 cases in `js/backend/data/cases.js` focus on basic receipt arithmetic, declaration comparisons, and introduce Heat Pump Subsidy and Compost Kit eligibility.

**P4-02 status:** Completed — `js/backend/data/days.js` configures Day 2 with 6 citizen cases, a 100-second time limit (`timeLimitSeconds`), and expanded grants incorporating all four programs (`HEAT_PUMP`, `COMPOST_KIT`, `TRANSIT_PASS`, `COOL_ROOF`). Day 2 cases introduce flight records, greenwashing claims, and unverified carbon offset fraud (`UNVERIFIED_OFFSET`, `UNDERDECLARED_KWH`).

**P4-03 status:** Completed — `js/backend/data/days.js` configures Day 3 with 7 citizen cases, a 90-second time limit (`timeLimitSeconds`), and all four mitigation grants. Day 3 cases feature complex multi-receipt structures, subtle declaration discrepancies testing the ±2 kg tolerance boundary, and conflicting personal notes.

**P4-04 status:** Completed — `js/backend/systems/game-state.js` implements `getCasesForDay(day)` loading the designated cases for each day (5 on Day 1, 6 on Day 2, 7 on Day 3 for 18 total cases). All 18 cases pass schema validation without leaking test or internal audit fields in sanitized views.

**P4-05 status:** Completed — `js/backend/systems/game-state.js` and `CampaignManager.advanceDay()` transition the campaign to the subsequent day upon shift conclusion, carrying over municipal metrics (Net-Zero, Budget, Public Trust), setting the respective day's time limit and cases, resetting shift statistics, and preventing transition if the campaign has ended or failed.

**P4-06 status:** Completed — Win conditions are evaluated at the conclusion of Day 3 (via timer expiration or case completion). Reaching 100% Net-Zero before Day 3 does not terminate early per D-02. If Net-Zero Progress >= 100%, Budget > 0, and Public Trust > 0 after Day 3, victory status (`VICTORY`) is awarded; otherwise, campaign failure with reason `NET_ZERO_TARGET` is applied.

**P4-07 status:** Completed — Immediate campaign termination is triggered upon municipal bankruptcy (`budget <= 0`, reason `BANKRUPTCY`) or public trust depletion (`trust <= 0`, reason `PUBLIC_TRUST`). When terminated, `campaignEnded` and `shiftEnded` are locked, preventing further action submissions or day advancement.

**P4-08 status:** Completed — `js/backend/systems/game-state.js` and `CampaignManager.getCampaignStats()` aggregate cumulative performance (`totalProcessed`, `totalCorrect`, `totalFines`, `totalGrants`, `daysCompleted`) across all shifts, preserving campaign totals across day transitions while isolating daily shift statistics, and resetting cleanly upon campaign restart.

### 4B. Frontend Tasks

| ID    | Task                              | Description                                       |
| ----- | --------------------------------- | ------------------------------------------------- |
| P4-09 | Implement Day Introduction screen | Introduce the day's objectives and new mechanics. |
| P4-10 | Implement shift-end summary       | Show daily results and statistics.                |
| P4-11 | Implement next-day transition     | Display campaign progression.                     |
| P4-12 | Implement campaign victory screen | Celebrate completing the three-day campaign.      |
| P4-13 | Implement campaign failure screen | Explain why the city failed.                      |
| P4-14 | Implement campaign restart        | Allow players to start a fresh campaign.          |

**P4-09 status:** Completed — `js/frontend/screens/day-intro-modal.js` introduces the `DayIntroModalComponent` (#day-intro-modal), which renders an operational briefing for the active day including title, description, citizen quota, time limit, and bulleted mechanics. It is displayed on campaign start and day transitions, and integrated into `Renderer`, `GameController`, `EventManager`, and `index.html`.

**P4-10 status:** Completed — `js/frontend/screens/summary-screen.js` and `index.html` were updated to render shift-end metrics and statistics, including cases processed, audit accuracy percentage, estimated CO2 corrected/mitigated, fines issued, and grants awarded.

**P4-11 status:** Completed — `GameController.onNextShift()` triggers `backendApi.advanceDay()`, updates city metrics and top bar day/quota indicators, refreshes the grant selector with day-specific programs, resets the calculator and dossier for the new shift's first citizen, and displays the next day's operational introduction.

**P4-12 status:** Completed — `js/frontend/screens/game-over-screen.js` and `index.html` implement the victory presentation. Upon completing Day 3 with Net-Zero >= 100%, Budget > 0, and Public Trust > 0, the game-over screen presents celebratory gold badges, final city metrics, and cumulative campaign totals (total citizens audited, correct actions, valid fines issued, and valid grants awarded).

**P4-13 status:** Completed — `GameOverScreenComponent` presents explanatory failure causes for bankruptcy (`BANKRUPTCY`), public trust depletion (`PUBLIC_TRUST`), and Net-Zero deficit at Day 3 conclusion (`NET_ZERO_TARGET`). It renders danger badges, failure messages, days completed, and final metrics.

**P4-14 status:** Completed — Restart controls (`#btn-restart-game`) reset campaign state via `backendApi.restartCampaign()`, reset municipal metrics (Net-Zero 30%, Budget $5,000, Trust 70%), clear cumulative stats, reset to Day 1, reload Day 1 citizen cases, show the Day 1 introduction briefing, and restart the shift countdown timer.

### Progression acceptance tests

- Day 1 contains exactly five cases.
- Day 2 contains exactly six cases.
- Day 3 contains exactly seven cases.
- Each day has its correct time limit.
- New mechanics appear on their designated days.
- Metrics carry over between days.
- A failed campaign cannot accidentally continue.
- Completing all three days triggers the correct ending.

Important: Do not implement saving/loading or persistent player accounts. A campaign can remain entirely in browser memory for this jam.

## Phase 5 — Visual Identity, Game Assets, Animation and Audio

**Role:** Frontend

**Objective:** Transform the playable three-day campaign into a visually distinctive, cohesive game experience. Establish a recognizable world, introduce appropriate visual assets, and improve the presentation and feedback of the existing gameplay.

### 5.1 Visual Direction

**Working visual identity: Antalya Climate Operations Office**

The game takes place in a near-future municipal climate assessment office inspired by Antalya's Mediterranean environment.

The visual direction combines:

- A contemporary municipal operations centre.
- A physical audit desk with citizen dossiers and official documents.
- Modern climate-monitoring technology and data visualization.
- Mediterranean architectural and environmental details.
- Tactile administrative interactions such as stamps, folders, paper records and official seals.

The result should feel like a modern indie simulation game, not a generic website dashboard and not a direct imitation of *Papers, Please*.

#### Visual characteristics

- **Primary surfaces:** deep navy, charcoal and slate.
- **Secondary surfaces:** warm ivory, paper beige and muted grey.
- **Accent colours:** Mediterranean teal, turquoise, amber and restrained coral/red.
- **Typography:** clean, highly readable sans-serif for interface content; monospaced typography for case IDs, figures, records and technical information.
- **Documents:** layered paper, subtle texture, realistic shadows, receipt edges and official markings.
- **Technology:** clean charts, carbon indicators, small status lights and technical diagrams.
- **Environment:** warm Mediterranean daylight, modern municipal architecture and subtle Antalya-inspired city details.

Avoid excessive neon, generic sci-fi holograms, overly decorative dashboards, pixel-art styling, and inconsistent asset styles.

### 5.2 Tasks

| ID | Task | Description |
|---|---|---|
| P5-01 | Establish visual identity and design system | Define the visual style, colour palette, typography, spacing, component appearance, visual hierarchy and reusable design tokens. Create a consistent visual language for all existing screens. |
| P5-02 | Source and prepare game assets | Identify, create or generate suitable assets for the office environment, documents, climate illustrations, icons and action stamps. Verify licensing and organize assets in the approved project structure. |
| P5-03 | Create the municipal office environment | Introduce a distinctive office setting using a background illustration and appropriate visual layers. Integrate desk/environment details without interfering with gameplay controls or readability. |
| P5-04 | Redesign citizen dossiers and documents | Give receipts, utility bills, transport records, citizen notes and official forms a physical-document appearance. Preserve the existing case data and inspection functionality. |
| P5-05 | Improve gameplay HUD and climate visualization | Present Net-Zero Progress, Budget, Public Trust, timers, case information and relevant emissions data as clear game UI elements. Use appropriate indicators, icons, charts and visual hierarchy. |
| P5-06 | Implement tactile action stamps and animations | Create distinctive APPROVE, FINE and GRANT feedback. Add satisfying stamp animations and visual confirmation while preserving the existing action flow and backend results. |
| P5-07 | Implement screen transitions and decision feedback | Improve transitions between citizens, daily shifts, summaries and campaign screens. Clearly distinguish successful, incorrect and consequential decisions without changing their gameplay effects. |
| P5-08 | Implement audio and sound controls | Add suitable interface and gameplay sounds for document interactions, stamps, successful decisions, errors and transitions. Provide mute/volume controls and respect browser audio restrictions. |
| P5-09 | Improve responsive presentation and accessibility | Verify the game at the intended desktop resolution and smaller supported viewports. Prevent clipped content, preserve readable text, provide visible interaction states and respect reduced-motion preferences. |
| P5-10 | Integrate, polish and verify game identity | Apply the visual identity consistently across the full campaign, including introduction, daily summaries, victory and failure screens. Verify that all Phase 1–4 gameplay functionality remains intact. |

**P5-01 status:** Completed — Established the Antalya Climate Operations Office visual design system across `css/styles.css`, `css/layout.css`, and `css/components.css`. Defined comprehensive design tokens for deep Mediterranean night/slate surfaces, warm manila dossier paper, tactile shadows, Antalya turquoise accents, and authentic administrative stamp ink colors while maintaining full compatibility with core PRD tokens.

**P5-02 status:** Completed — Curated and integrated the full Antalya Climate Operations Office asset collection under `assets/`, including background artwork, physical dossier and receipt textures, category climate icons, official seals, and authentic APPROVE/FINE/GRANT stamps. Documented licensing and usage details in `ATTRIBUTION.md`.

**P5-03 status:** Completed — Created the municipal office setting using `assets/Antalya_Office_background.jpg` in `css/layout.css` for `.gameplay-screen` with ambient Mediterranean lighting and vignette. Framed the 3-column workstation with tactile desk surfaces that establish environmental depth while ensuring high contrast and non-interference with controls.

**P5-04 status:** Completed — Redesigned the citizen dossier and supporting records in `js/frontend/components/dossier-panel.js` and `css/components.css`. Embedded the official COP31 embossed seal, paperclip citizen plea note, and categorized physical receipt styles with climate icons (`assets/Electric_Meter.png`, `assets/NaturalGas_Heater.png`, `assets/LocalFruits.png`, `assets/plane.png`, `assets/petrol.png`, `assets/garbage.png`), while keeping all receipt items clickable and keyboard-accessible.

**P5-05 status:** Completed — Upgraded the gameplay HUD in `js/frontend/components/top-bar.js`, `js/frontend/components/rulebook-panel.js`, and `css/layout.css`. Implemented retro-futuristic console gauges for Net-Zero, Budget, and Public Trust, pulsing countdown clock warnings for <= 30 seconds, audio mute controls, and categorized climate benchmark icons in the rulebook.

**P5-06 status:** Completed — Implemented tactile rubber stamp actions and visual feedback in `js/frontend/game-controller.js` and `css/components.css`. Action dock buttons feature heavy 3D bevels and depression states. Submitting an action displays high-resolution stamps (`assets/Approved_Stamp.png`, `assets/FineIssued_Stamp.png`, `assets/GrantApproved_Stamp.png`) with animated downward stamp physics (`@keyframes stampDown`), ink shadow, and accompanying stamp thuds.

**P5-07 status:** Completed — Enhanced screen transitions and decision feedback. Feedback overlay presents the authentic stamp graphic, clear validation badges, and detailed metric changes. Main Menu, Day Introduction modal, Shift Summary modal, and Executive Verdict screens all received unified Mediterranean administrative polish.

**P5-08 status:** Completed — Built a zero-dependency procedural Web Audio API synthesizer engine in `js/frontend/audio.js`. Implemented synthesized stamp thuds, success chimes, penalty buzzes, paper rustles, calculator clicks, and shift transition bells. Added audio mute toggle button in the top bar with persistence in localStorage and graceful browser autoplay handling.

**P5-09 status:** Completed — Optimized responsive layouts across 1280px laptops, 1024px tablets, and <= 768px viewports in `css/responsive.css`. Implemented `@media (prefers-reduced-motion: reduce)` accessibility overrides to instantly render stamps without scale/rotation physics, and verified high contrast text readability.

**P5-10 status:** Completed — Verified full game identity and end-to-end campaign integrity. Rebuilt `js/bundle.js` with esbuild, confirmed zero console warnings or broken layouts, and verified that all 273 unit, integration, and visual polish tests pass cleanly with zero gameplay regressions.

### 5.3 Asset Strategy

Use a combination of original/generated artwork, appropriately licensed external assets, SVG and CSS.

#### Priority assets

1. **Main office background**
   - Wide landscape illustration.
   - Modern municipal office with a desk and large window.
   - Mediterranean city environment inspired by Antalya.
   - Warm natural daylight and contemporary climate-technology details.

2. **Document assets**
   - Paper textures and document backgrounds.
   - Receipt and invoice illustrations.
   - Official municipal seals and document markings.
   - Folders, clips, handwritten annotations and paper edges.

3. **Climate illustrations**
   - Solar panels and renewable energy.
   - Residential buildings and heating systems.
   - Public transport and electric vehicles.
   - Waste separation and composting.
   - Urban greenery and sustainable infrastructure.

4. **Action assets**
   - APPROVED stamp.
   - FINE ISSUED stamp.
   - GRANT APPROVED stamp.
   - Optional municipal seals and status markers.

5. **Interface assets**
   - Consistent icons.
   - Metric indicators.
   - Small charts and progress indicators.
   - Buttons, badges and status symbols.

#### Asset implementation rules

- Prefer CC0 assets or assets with clearly compatible licenses.
- Verify the license of each individual asset, not just the website hosting it.
- Record creator, source, license and modifications in `ATTRIBUTION.md`.
- Do not use assets extracted from *Papers, Please* or other copyrighted games.
- Do not mix unrelated visual styles.
- Prefer transparent PNG or SVG for isolated objects and icons.
- Use CSS for interface surfaces, layout, shadows, borders and simple effects.
- Use SVG for scalable icons, seals, diagrams and simple illustrations.
- Use PNG for detailed illustrations and textured artwork.
- Optimize image sizes and avoid unnecessarily large assets.
- Do not introduce an external asset framework or npm dependency.

### 5.4 Gameplay and Architecture Preservation

Phase 5 is a presentation phase. It must not change the authoritative gameplay behavior implemented in Phases 1–4.

The following must remain intact:

- Carbon emission calculations and emission factors.
- Declaration tolerance and discrepancy calculations.
- Fraud and offset verification.
- Approval, fine and grant validation.
- Grant eligibility and costs.
- Budget, Public Trust and Net-Zero Progress changes.
- Citizen and case progression.
- Timers, day configurations and campaign transitions.
- Victory and failure conditions.
- Existing game statistics and campaign restart behavior.

The frontend must continue to display backend results rather than independently calculate or decide gameplay outcomes.

Animations and audio must respond to actual gameplay results. Do not show a successful approval animation when the backend rejects the action.

Visual redesign must not remove, hide or weaken information required to inspect a case and make a correct decision.

### 5.5 Verification and Acceptance Criteria

Phase 5 is complete when:

- The game has a recognizable visual identity that is distinct from a conventional website dashboard.
- The municipal office environment establishes a clear sense of place.
- Citizen records and supporting documents look like intentional game objects.
- The three action types have distinctive, satisfying visual feedback.
- Existing gameplay information remains readable and accessible.
- Metrics visibly respond to backend results.
- Transitions and animations do not interrupt or break gameplay.
- Audio can be muted or controlled.
- The game works at its intended desktop resolution and supported smaller resolutions.
- All campaign screens receive consistent visual treatment.
- All newly sourced assets have verified licenses and required attribution.
- No Phase 1–4 gameplay behavior has been changed.
- No new console errors or gameplay regressions are introduced.

**Testing requirement:** Run the full three-day campaign and verify the main gameplay loop, all three actions, correct and incorrect decisions, metric updates, daily summaries, victory, failure and campaign restart.

If an existing Phase 1–4 issue is discovered, document it separately rather than silently changing gameplay during visual implementation.

### 5.6 Recommended Implementation Order

1. Finalize the visual direction and design tokens.
2. Select and prepare a small coherent asset collection.
3. Establish the office environment.
4. Redesign the dossier and document presentation.
5. Improve the gameplay HUD and data visualization.
6. Add action stamps and feedback.
7. Add transitions and audio.
8. Test responsive behavior and accessibility.
9. Polish all campaign screens and run regression testing.

**Scope principle:** Prioritize a small number of high-quality, consistent assets over a large collection of unrelated decorations. The game should feel like a complete experience while keeping the existing gameplay clear, functional and easy to understand.


# Phase 5B — Immersion, Transitions & Game-Feel Layer

**Objective:** Transform the game from a static dashboard into a living municipal office through motion design, layered overlays, scene transitions, and physical-feeling interactions.

The game is functionally complete and has its visual identity and static assets. The remaining problem is that state changes happen in place, with modals appearing over the same screen. The experience should feel more like working at a physical office: dossiers arrive and leave, decisions are stamped, citizens move through the process, and the office changes throughout the campaign.

This phase should require near-zero new raster assets. Prioritize CSS, SVG, animation, layered overlays, and scene choreography.

## Design principles

1. **Nothing simply appears; everything arrives.** Dossiers slide in, stamps slam down, citizens leave, and the next case arrives.
2. **The office is a character.** Daylight changes throughout the campaign, with subtle ambient motion such as dust, blinking indicators, and light through the window.
3. **Screens are scenes, not modals.** Briefings, shift summaries, and final verdicts should feel like full-screen scene changes rather than ordinary pop-ups.

---

## P5B-01 — SceneDirector

Create a centralized frontend scene-transition orchestrator.

The intended scene sequence is:

`MENU → DAY_BRIEF → SHIFT_START → CASE_INTAKE → CASE_REVIEW → CASE_RESOLVE → NEXT_CASE → DAY_SUMMARY → NEXT_DAY → VERDICT`

Requirements:

- Implement a clear `transitionTo(scene, data)` interface.
- Coordinate scene entry and exit animations.
- Support configurable transition durations.
- Prevent conflicting transitions from running simultaneously.
- Handle interrupted, skipped, or failed animations safely.
- Preserve the existing gameplay flow and backend authority.
- Keep the SceneDirector presentation-only; it must not become a second gameplay state machine.

**Ownership:** Agent A — Frontend Lead.

**P5B-01 status:** Completed — Established the centralized frontend SceneDirector orchestrator in `js/frontend/scene-director.js`. Provides `transitionTo(scene, data)` with configurable durations, safe timeout fallbacks, skip capabilities, and full reduced-motion support across the sequence `MENU → DAY_BRIEF → SHIFT_START → CASE_INTAKE → CASE_REVIEW → CASE_RESOLVE → NEXT_CASE → DAY_SUMMARY → NEXT_DAY → VERDICT`. Preserves backend authority with zero business rule duplication. Documented complete integration contract in `SCENE_DIRECTOR_CONTRACT.md`.

## P5B-02 — Cinematic Main Menu

Transform the main menu into an atmospheric opening scene.

Requirements:

- Slow Ken Burns-style movement on the office background.
- Title reveal using a typing or fade-in effect.
- Start button reveal after the title.
- Subtle film grain and vignette.
- Restrained visual effects that preserve readability.

**Ownership:** Agent B — Frontend Presentation.

## P5B-03 — Day Briefing

Create a full-screen day briefing scene.

Requirements:

- Office lighting that reflects the time of day.
- Day and quota card that slides into view.
- Typewriter-style briefing text.
- Clear action to begin the shift.
- Transition from the briefing into the working scene.

Use existing campaign data. Do not change quotas or day progression.

**Ownership:** Agent B — Frontend Presentation.

## P5B-04 — Citizen Intake Animation

Make each new citizen dossier feel physically delivered to the auditor.

Requirements:

- The previous case slides out before the next dossier arrives.
- The new dossier slides upward from the bottom of the screen.
- The dossier settles with a slight rotation and shadow.
- Case ID and citizen name are revealed in sequence.
- Subtle paper-rustle audio where supported.
- Target duration: approximately 0.6–0.9 seconds.
- Animation must be skippable or safely completed.

**Ownership:** Agent A — Frontend Lead.

**P5B-04 status:** Completed — Implemented physical citizen intake delivery in `js/frontend/components/dossier-panel.js` and `css/components.css`. Dossier slides upward from bottom screen over 750ms with 3D settling rotation and realistic shadow. Case ID and citizen name are revealed sequentially. Includes paper-rustle audio and safe click-to-skip handling.

## P5B-05 — Case Resolution Animation

Give every decision a distinct physical-feeling conclusion.

Requirements:

- APPROVE: dossier exits to the right.
- FINE: dossier exits downward with a red visual flash.
- GRANT: dossier exits upward with a gold shimmer.
- Preserve the existing result feedback interaction until the player dismisses it.
- The next case arrives through the established intake flow.

Do not change the gameplay meaning or effects of any decision.

**Ownership:** Agent A — Frontend Lead.

**P5B-05 status:** Completed — Implemented case resolution animations in `js/frontend/components/dossier-panel.js` and `css/components.css`. APPROVE exits to the right, FINE exits downward with a red visual flash, and GRANT exits upward with a gold shimmer. Coordinated with SceneDirector `CASE_RESOLVE` without altering gameplay outcomes.

## P5B-06 — Ambient Office

Make the office feel alive during case review.

Possible effects:

- Subtle dust motes.
- Gentle light gradient or daylight variation.
- Blinking indicator LED.
- Soft movement of light through the window.

Requirements:

- Ambient effects must not interfere with interaction.
- Use `pointer-events: none` where appropriate.
- Keep effects subtle and performance-friendly.
- Respect reduced-motion settings.
- Change the office mood to reflect the campaign day or time of day where appropriate.

**Ownership:** Agent B — Frontend Presentation.

## P5B-07 — Metric HUD

Improve the visual feedback of metric changes and timer urgency.

Requirements:

- Short bounce or emphasis animation when a metric changes.
- Red flash for negative changes where appropriate.
- Timer urgency styling when fewer than 30 seconds remain.
- Subtle tick-tock effect if suitable.
- Floating metric delta chips displaying the changes supplied by the backend.

The frontend must display supplied values and must not calculate or modify metrics.

**Ownership:** Agent B — Frontend Presentation.

## P5B-08 — Enhanced Decision Feedback

Improve the visual presentation of decision results.

Requirements:

- Prominent decision stamp.
- Torn-paper-style result strip.
- Clear ruling text.
- Metric changes that count up or animate into their final values.
- Distinct verdict labels:
  - VERIFIED
  - VIOLATION
  - OVERRULED
- Visually distinguish correct decisions from incorrect decisions.

Use existing backend-provided results and metric changes. Do not recalculate them in the frontend.

**Ownership:** Agent A — Frontend Lead.

**P5B-08 status:** Completed — Enhanced decision feedback in `js/frontend/game-controller.js` and `css/components.css`. Added torn-paper result strip with serrated edges, prominent rubber stamps, clear ruling text, animated counting metric chips for Net-Zero, Budget, and Trust, and distinct verdict labels: VERIFIED, VIOLATION, and OVERRULED.

## P5B-09 — Day-End Summary

Create a full-screen shift-report scene.

Requirements:

- Transition away from the active office scene.
- Dimmed office background.
- SHIFT REPORT document that appears to land on the desk.
- Report information revealed progressively.
- Stamp or seal animation.
- Clear action to continue to the next day.

Use existing campaign results. Do not calculate or change report values.

**Ownership:** Agent B — Frontend Presentation.

## P5B-10 — Victory and Game-Over Cinematics

Give the campaign ending a distinct visual identity.

### Game over

- Dim the office.
- Present a termination or failure notice.
- Use restrained flicker or audio feedback for trust-collapse or bankruptcy outcomes where appropriate.
- Make the final result clear and readable.

### Victory

- Brighten the office.
- Present a certificate or final approval document.
- Use a satisfying final stamp or seal.
- Give the player a clear sense of completion.

The backend determines the ending. The frontend only presents the outcome it provides.

**Ownership:** Agent B — Frontend Presentation.

## P5B-11 — Optional Terminal Display Mode

Add an optional CRT/terminal visual treatment for terminal-style panels only.

Possible effects:

- Subtle scanlines.
- Restrained chromatic aberration.
- User-accessible toggle.
- Persist the setting using the existing settings approach if available; otherwise, use a session-only setting rather than introducing unnecessary infrastructure.

**Ownership:** Agent A — Integration.

**P5B-11 status:** Completed — Added optional retro-futuristic CRT/terminal mode in `css/styles.css` and `css/components.css`. Applies subtle scanlines, phosphor glow, and restrained chromatic aberration to terminal panels. Accessible via `#btn-terminal-toggle` in the top bar with persistence in `localStorage`.

## P5B-12 — Audio Transitions

Add subtle synthesized or existing audio cues for important transitions.

Possible sounds:

- Transition whoosh.
- Drawer movement.
- Page turn or paper rustle.
- Day-start bell.
- Final countdown sting.
- Decision stamp.

Requirements:

- Follow the existing audio architecture.
- Provide mute/volume controls consistently with the existing game.
- Avoid unnecessary external audio dependencies.
- Keep sounds subtle and non-intrusive.
- Respect browser audio restrictions and user interaction requirements.
- Audio failures must not break gameplay.

**Ownership:** Agent B — Frontend Presentation.

## P5B-13 — Responsive and Reduced-Motion Support

Ensure the new experience works across relevant screen sizes and accessibility preferences.

Requirements:

- Respect `prefers-reduced-motion`.
- Replace long animations with short transitions or immediate state changes when reduced motion is enabled.
- Ensure no input remains locked because an animation failed.
- Do not rely exclusively on `animationend` or `transitionend`.
- Keep dossiers, feedback, buttons, and HUD elements usable on smaller screens.

**Ownership:** Agent A — Integration.

**P5B-13 status:** Completed — Implemented responsive and accessibility motion hardening in `css/responsive.css` and `js/frontend/scene-director.js`. Respects `prefers-reduced-motion: reduce` by zeroing transition durations and bypassing transforms. Protected all transitions with safety timeouts to guarantee user inputs never lock.

## P5B-14 — Regression Verification

Verify the complete game after the immersion layer is integrated.

Test the actual project build and test procedures. Do not assume a particular bundle filename or test count without inspecting the project.

Manual verification should cover:

- Main menu and game start.
- Every day briefing.
- Case intake and case review.
- APPROVE, FINE, and GRANT.
- Correct and incorrect decisions.
- Metric changes and timer behavior.
- Day-end summaries.
- Next-day progression.
- Victory and game-over outcomes.
- Restart behavior.
- Audio controls and mute behavior.
- Reduced-motion behavior.
- Terminal display mode.

Acceptance criteria:

- Existing gameplay rules and outcomes remain unchanged.
- No metric drift or duplicate state updates.
- No animation leaves the game stuck.
- No new console errors.
- Existing tests continue to pass.
- The full campaign remains playable from beginning to end.

Report the actual test count, build procedure, and manual verification results.

**Ownership:** Agent A — Integration and Final Verification.

**P5B-14 status:** Completed — Executed full test and build verification. All 292 Vitest tests across 16 test files pass cleanly (`npm test`). Production bundle built successfully (`esbuild js/app.js --bundle --format=iife --outfile=js/bundle.js` -> 175.4kb). Verified full 3-day campaign loop, decision types, metric updates, reduced motion, and restart behavior with zero regressions.

---

## Implementation order and agent coordination

### Stage 1 — Core architecture

1. P5B-01 — SceneDirector.

Agent A establishes the transition interface and shares its contract with Agent B before dependent scene transitions are implemented.

### Stage 2 — Core gameplay experience

2. P5B-04 — Citizen Intake Animation.
3. P5B-05 — Case Resolution Animation.
4. P5B-08 — Enhanced Decision Feedback.

These tasks have the highest impact on the repeated gameplay loop.

### Stage 3 — Surrounding scenes and atmosphere

5. P5B-02 — Cinematic Main Menu.
6. P5B-03 — Day Briefing.
7. P5B-09 — Day-End Summary.
8. P5B-10 — Victory and Game-Over Cinematics.
9. P5B-06 — Ambient Office.
10. P5B-07 — Metric HUD.
11. P5B-12 — Audio Transitions.

Agent B owns these tasks and uses Agent A's agreed SceneDirector interface.

### Stage 4 — Integration and hardening

12. P5B-11 — Optional Terminal Display Mode.
13. P5B-13 — Responsive and Reduced-Motion Support.
14. P5B-14 — Regression Verification.

Agent A owns integration and final verification.

## Asset strategy

No new raster assets are required for this phase.

Prefer:

- CSS animations and transitions.
- CSS-generated film grain and vignette.
- SVG stamps, seals, and paper details.
- CSS transforms for dossier movement.
- Layered gradients for daylight changes.
- CSS/SVG techniques for metric animations and visual effects.
- Existing office, dossier, and character assets.

An optional generated citizen silhouette portrait may be considered only if the existing assets do not adequately support the intake scene.

## Overall acceptance criteria

Phase 5B is complete when:

1. Scene transitions are intentional and coordinated through the SceneDirector.
2. Cases visibly arrive and depart rather than simply changing in place.
3. Decisions have distinct visual feedback and recognizable outcomes.
4. Briefings, summaries, and verdicts feel like scenes rather than ordinary modals.
5. The office atmosphere changes throughout the campaign.
6. HUD and metric changes provide clear visual feedback.
7. Audio enhances the experience without becoming intrusive.
8. Reduced-motion and responsive behavior work correctly.
9. Existing gameplay logic, rules, and outcomes remain unchanged.
10. The complete campaign passes regression verification.

**Important:** Phase 5B supplements Phase 5. It does not replace or renumber the existing Phase 6 or any later roadmap phase.



## Phase 6 — Quality Assurance and Final Submission

Final verification

Objective: Make sure the game works reliably, the rules are fair, and the final submission is ready.

### 6A. Backend QA

| ID    | Task                         | Description                                                 |
| ----- | ---------------------------- | ----------------------------------------------------------- |
| P6-01 | Verify emission calculations | Test every emission category and formula.                   |
| P6-02 | Verify audit outcomes        | Test correct and incorrect approvals and fines.             |
| P6-03 | Verify grants                | Test every grant's eligibility and effects.                 |
| P6-04 | Verify metric boundaries     | Test zero, negative and maximum values.                     |
| P6-05 | Verify campaign logic        | Test all possible day transitions and endings.              |
| P6-06 | Verify edge cases            | Test missing receipts, empty quantities and zero emissions. |

### 6B. Frontend QA

| ID    | Task                         | Description                               |
| ----- | ---------------------------- | ----------------------------------------- |
| P6-07 | Test every button            | Ensure all controls work.                 |
| P6-08 | Test calculator interactions | Verify receipt selection and clearing.    |
| P6-09 | Test timer interactions      | Verify expiration and transitions.        |
| P6-10 | Test modal interactions      | Verify opening, closing and restart.      |
| P6-11 | Test responsive layouts      | Check common desktop and laptop sizes.    |
| P6-12 | Test audio fallback          | Verify autoplay restrictions are handled. |

### 6C. Final Build and Submission

| ID    | Task                              | Description                                                                       |
| ----- | --------------------------------- | --------------------------------------------------------------------------------- |
| P6-13 | Perform full campaign playthrough | Complete all three days from start to finish.                                     |
| P6-14 | Check browser console             | Resolve all errors and warnings that affect gameplay.                             |
| P6-15 | Prepare README                    | Include controls, game description and technical information.                     |
| P6-16 | Prepare ATTRIBUTION               | Document external assets and licences, if any.                                    |
| P6-17 | Prepare submission build          | Verify the game runs from its final static files.                                 |
| P6-18 | Prepare presentation              | Create screenshots, a short description and a gameplay demonstration if required. |

### Final acceptance checklist

- Game starts successfully.
- All 18 citizen cases are playable.
- Emission calculations are correct.
- All action types work.
- Grants have the correct eligibility and effects.
- Metrics update correctly.
- Timer works on all three days.
- Campaign victory and failure work.
- Restart works.
- Audio works or gracefully remains silent.
- No critical console errors.
- No external paid services or dependencies.
- Attribution and submission documentation are complete.

# 4. How to organize agent execution

I recommend treating each task as an independently assigned unit of work, with one important restriction:

Do not let the agents start the next phase until the current phase's completion criteria are satisfied.

Here's how I would distribute responsibilities.

| Phase   | Primary agent | Supporting agent                    |
| ------- | ------------- | ----------------------------------- |
| Phase 0 | OpenCode      | Antigravity                         |
| Phase 1 | OpenCode      | Antigravity for logic review        |
| Phase 2 | Antigravity   | OpenCode for implementation support |
| Phase 3 | OpenCode      | Antigravity for integration testing |
| Phase 4 | OpenCode      | Antigravity for UI implementation   |
| Phase 5 | Antigravity   | OpenCode for fixes                  |
| Phase 6 | OpenCode      | Antigravity for independent QA      |

These are suggested responsibilities, not tool limitations. Either agent can implement code, but assigning ownership prevents both from modifying the same files simultaneously.

## Agent execution rules

I'd establish these rules before starting:

1. Read the approved PRD and architectural documentation before implementing.
2. Implement only the assigned task IDs.
3. Do not modify unrelated files or change approved gameplay rules.
4. Keep backend and frontend responsibilities separate.
5. Do not introduce dependencies without approval.
6. Write or update tests alongside backend functionality.
7. After completing a task, report modified files, tests performed and outstanding issues.
8. Never mark a task complete if its acceptance criteria haven't been verified.
9. Update the implementation roadmap and project status after every completed task.
10. If a task reveals a missing or contradictory requirement, stop and report it instead of inventing a solution.

# 5. Suggested 48-hour execution schedule

The seven phases are development stages, not necessarily seven separate time blocks. Some can overlap once their dependencies are satisfied.

| Time        | Phase   | Target                            |
| ----------- | ------- | --------------------------------- |
| 0–2 hours   | Phase 0 | Architecture and contracts        |
| 2–10 hours  | Phase 1 | Backend logic                     |
| 6–14 hours  | Phase 2 | Frontend foundation (can overlap) |
| 14–21 hours | Phase 3 | Playable single-day game          |
| 21–27 hours | Phase 4 | Full three-day campaign           |
| 27–35 hours | Phase 5 | Visual and audio polish           |
| 35–44 hours | Phase 6 | QA and balancing                  |
| 44–48 hours | Final   | Submission and contingency        |

I'd prioritize getting the first playable version by approximately hour 20–22. That gives you enough time to recover from unexpected agent errors or free-quota limitations.

# 6. My final recommendations

There are three architectural decisions I particularly want you to preserve throughout development:

1\. Keep the backend independent of the UI.

For example, the emission calculator should be able to calculate a citizen's emissions even if the frontend doesn't exist yet. This is what makes the project testable and prevents UI changes from breaking gameplay.

2\. Make the game data-driven.

Citizen cases, emission rates, grants and campaign configurations should be stored separately from the logic that processes them.

This will make adding or modifying citizen cases much easier, especially when balancing the difficulty.

3\. Protect the 48-hour scope.

Don't introduce persistent storage, multiplayer, a real municipal API, complicated AI-generated content at runtime or elaborate animations. Your PRD already has enough gameplay depth.

## What I suggest doing next

Before writing implementation prompts, I'd establish three small governing documents:

- `PROJECT_ARCHITECTURE.md` — folder structure, backend/frontend responsibilities and communication contracts.
- `IMPLEMENTATION_ROADMAP.md` — the seven phases, task IDs, dependencies and completion statuses.
- `GAME_RULES.md` — approved formulas, action outcomes, grant rules, metrics and campaign conditions.

Then agents can follow the same source of truth throughout development.

I'd start with Phase 0, not Phase 1. Getting the architecture and gameplay decisions approved first will save you from having OpenCode and Antigravity independently invent incompatible implementations.

One final point: your PRD's 18 citizen cases are a good starting point, but I'd make sure each case has a known expected answer and expected metric changes. That gives you a ready-made test dataset for the entire game.