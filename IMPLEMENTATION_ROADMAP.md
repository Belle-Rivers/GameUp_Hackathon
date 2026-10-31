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

### 1D. Game State and Metrics

| ID    | Task                         | Description                                                      |
| ----- | ---------------------------- | ---------------------------------------------------------------- |
| P1-16 | Implement initial game state | Initialize the campaign, day, timer, cases and metrics.          |
| P1-17 | Implement city metrics       | Manage Net-Zero, Budget and Public Trust.                        |
| P1-18 | Implement metric guardrails  | Enforce limits and bankruptcy/failure conditions.                |
| P1-19 | Implement case progression   | Track processed cases and current case.                          |
| P1-20 | Implement shift statistics   | Track correct actions, fines, grants and CO2-related statistics. |

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

### 2C. Screens and Interactions

| ID    | Task                                    | Description                                        |
| ----- | --------------------------------------- | -------------------------------------------------- |
| P2-12 | Implement main menu                     | Display game title, introduction and start button. |
| P2-13 | Implement gameplay screen               | Assemble all gameplay components.                  |
| P2-14 | Implement summary modal                 | Display shift results and statistics.              |
| P2-15 | Implement game-over screen              | Create the campaign failure presentation.          |
| P2-16 | Implement button and modal interactions | Handle opening, closing and selection.             |

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

### 4B. Frontend Tasks

| ID    | Task                              | Description                                       |
| ----- | --------------------------------- | ------------------------------------------------- |
| P4-09 | Implement Day Introduction screen | Introduce the day's objectives and new mechanics. |
| P4-10 | Implement shift-end summary       | Show daily results and statistics.                |
| P4-11 | Implement next-day transition     | Display campaign progression.                     |
| P4-12 | Implement campaign victory screen | Celebrate completing the three-day campaign.      |
| P4-13 | Implement campaign failure screen | Explain why the city failed.                      |
| P4-14 | Implement campaign restart        | Allow players to start a fresh campaign.          |

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

## Phase 5 — Visual Polish, Animation and Audio

Frontend

Objective: Make the game feel like a finished product instead of an interactive prototype.

The PRD already has a good visual direction: a retro-futuristic municipal desktop with dark slate panels, paper-like citizen dossiers and colourful action stamps.

I would preserve this direction.

[Notes on Papers, Please - metamedia](https://images.openai.com/static-rsc-4/B1vcqBdL8hhtFaUlwJP0W_Q4MiZi1qg8u1sy4nQBu-O9c4IKBmwkExTbS94jQfZNTapW8KbdZDzSpsNTO1yfyHnfo2ZbH3vsIR1RE_eEUe52hUMcWuzBxmho39Qqd3RwmNuh9SPa5WHayt242T0bLGOTnlUKuyZwS6h8pm30q3s?purpose=inline)

[The Retro Futuristic UI Kit](https://images.openai.com/static-rsc-4/lOjhUBXhldgPvGEaauSwzLs56FGkW5UwSUcrA84_XjBFHc0vwPpFJrdvCx9KGVvAkpk8_IrV8HuvKufdCx6SJEpscL8QGfgUMzBTkM6jbOyF4oY-K_TOc3ep5EKWubXsC_sDAu8ud0d5KyaJvE50l-RDxWAT5UMRyvHv6k0LjBo?purpose=inline)

[边境检查员 - Border Patrol | indienova GameDB 游戏库](https://images.openai.com/static-rsc-4/Fr8WI9_PUOfkinI0aAlyCzvXPJADEoWJNN8uDzDMWF1zjOsnecQoT54azy81ZAhpNk4kk89OlY-htuor1YvYuSpMtYVv3AJZfwNvRka-TTDNABTuu2hFKC5-j_9yiTaYMfAavSeOp6RQvjT-gk5sXTocU5OyT4q3_ny742EUShg?purpose=inline)

10

### Tasks

| ID    | Task                      | Description                                                   |
| ----- | ------------------------- | ------------------------------------------------------------- |
| P5-01 | Finalize visual identity  | Apply the approved palette and typography consistently.       |
| P5-02 | Improve dossier visuals   | Make receipts and citizen notes look like physical documents. |
| P5-03 | Add stamp animations      | Create satisfying approval, fine and grant stamp animations.  |
| P5-04 | Add metric animations     | Animate changes in budget, trust and Net-Zero Progress.       |
| P5-05 | Add transitions           | Smoothly transition between citizens and screens.             |
| P5-06 | Add action feedback       | Visually distinguish correct and incorrect decisions.         |
| P5-07 | Implement audio engine    | Add synthesized stamp, success and error sounds.              |
| P5-08 | Add audio controls        | Allow players to mute or enable sound.                        |
| P5-09 | Improve responsive design | Check smaller resolutions and prevent clipped content.        |
| P5-10 | Add visual game identity  | Add COP31-inspired branding and Antalya municipal atmosphere. |

### Asset strategy

I would avoid external asset packs unless you really need them.

Use:

- CSS for the terminal interface.
- SVG for stamps, icons, municipal symbols and small illustrations.
- CSS animations for transitions.
- Web Audio API for sound effects.
- System fonts as fallbacks.

The game is based on documents and administrative work, so a polished interface can be more effective than elaborate illustrations.

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