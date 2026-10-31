# Product Requirement Document (PRD): Municipal Carbon Assessor (COP31 MVP)

---

## 1. Document Overview & Project Vision

### 1.1 Executive Summary

**Municipal Carbon Assessor: Antalya Protocol** is a single-page, web-based simulation game inspired by *Papers, Please*. Set in a climate-resilient municipality leading up to COP31 in Antalya, the player acts as a Municipal Carbon Auditor. The player inspects citizen household logs (energy meters, grocery receipts, travel logs), verifies self-declared carbon footprints against official emissions benchmarks, flags greenwashing or misdeclarations, and issues real-world mitigation grants (e.g., heat pump subsidies, municipal compost bins, public transit vouchers, cool roofs).

### 1.2 Core Objectives

* **COP31 Alignment:** Features four key COP31 Action Agenda priorities: *Carbon Footprint & Conscious Consumption*, *Climate Literacy & Greenwashing Verification*, *Climate-Resilient Cities*, and *Zero Waste & Methane Reduction*.
* **48-Hour Scope Guarantee:** Built using pure HTML5, CSS3, and Vanilla JavaScript (ES6+). Uses zero heavy game engines or external npm dependencies to enable AI coding agents (Antigravity, OpenCode) to construct, test, and refactor the entire repository in minutes.
* **Cost & Licensing:** 100% free-tier stack. Uses CSS/SVG procedural visuals and Web Audio API synthesized sound effects, requiring zero proprietary or licensed external assets.

---

## 2. Core Game Loop & Design Specification

### 2.1 Daily Shift Loop

```
[Start Daily Shift (120s)] 
        │
        ▼
[Load Citizen Dossier] ───► [Read Citizen Personal Note]
        │
        ▼
[Inspect Receipts & Logs] ───► [Cross-Reference Policy Rulebook]
        │
        ▼
[Perform Emission Math] ───► Calculate Total Actual CO2 (kg) vs. Declared CO2 (kg)
        │
        ▼
[Select Action Stamp] 
        ├──> APPROVE ASSESSMENT  (Declared == Actual, No violation)
        ├──> ISSUE FINE           (Declared < Actual, Fraud or unverified offset)
        └──> ISSUE SOLUTION GRANT (Valid inefficiency identified + Grant applied)
        │
        ▼
[Update City Metrics] ───► Modify Net-Zero Meter, City Budget, Public Trust
        │
        ▼
[Next Citizen / End Shift Summary Screen]

```

### 2.2 City System Metrics

The top UI bar tracks three dynamic meters that reflect the player's cumulative performance:

| Metric Name | Starting Value | Win/Loss Impact | Description |
| --- | --- | --- | --- |
| **Net-Zero Progress** | `30%` | **Win Condition:** Reaching `100%` at end of Day 3 | Measures citywide decarbonization. Increases when valid Solution Grants are issued and fraudulent emissions are halted. |
| **City Budget** | `$5,000` | **Loss Condition:** Drops to `$0` (Bankruptcy) | Funds municipal operations. Increases from tax collection and fines; decreases when issuing subsidies/grants. |
| **Public Trust** | `70%` | **Loss Condition:** Drops to `0%` (Rebellion) | Measures citizen approval. Increases when issuing fair grants and approving accurate files; drops when fining compliant citizens or denying needed grants. |

---

## 3. Mathematical & Scoring System

### 3.1 Policy Reference Benchmark Rates (The Rulebook)

```
========================================================================
             MUNICIPAL CARBON AUDIT RULEBOOK (COP31 BENCHMARKS)
========================================================================
1. ENERGY & HEATING
   - Grid Electricity: 0.50 kg CO2 per kWh
   - Natural Gas Heating: 2.00 kg CO2 per m³
   - Solar Rooftop Offset: -0.40 kg CO2 per kWh generated

2. FOOD & CONSUMPTION
   - Beef / Ruminant Meat: 15.00 kg CO2 per pack (1 kg)
   - Imported Out-of-Season Goods: 5.00 kg CO2 per item
   - Local Organic / Plant Food: 0.50 kg CO2 per pack

3. MOBILITY & TRANSPORT
   - Gasoline Vehicle Travel: 0.20 kg CO2 per km
   - Domestic Air Travel: 150.00 kg CO2 per ticket
   - Public Electric Transit: 0.00 kg CO2 per km

4. WASTE & METHANE
   - Landfill Waste: 3.00 kg CO2e per kg
   - Organic Diverted / Composted: 0.10 kg CO2e per kg
========================================================================

```

### 3.2 Emission Calculation Formulas

$$\text{Actual Emissions } (E_{act}) = \sum (Q_i \times R_i)$$

*Where $Q_i$ is the quantity of item $i$, and $R_i$ is the benchmark emission rate from the Rulebook.*

$$\text{Discrepancy Ratio } (D) = \frac{E_{act} - E_{dec}}{E_{act}}$$

*Where $E_{dec}$ is the citizen's self-declared carbon footprint.*

### 3.3 Action Resolution Logic & Metric Effects

```
IF Player Action == "APPROVE":
    IF |E_act - E_dec| <= 2.0 kg:  // Correct Approval
        City Budget    += (E_act * $0.50)   [Tax Collected]
        Public Trust   += 3%
        Net-Zero Meter += 1%
    ELSE:                           // Missed Fraud Penalty
        City Budget    -= $200              [Audit Oversight Penalty]
        Public Trust   -= 5%
        Net-Zero Meter -= 2%

IF Player Action == "FINE":
    IF E_dec < (E_act - 2.0 kg) OR HasUnverifiedGreenwashOffset: // Correct Fine
        Fine Amount     = (E_act - E_dec) * $10.00
        City Budget    += Fine Amount
        Public Trust   -= 2%                [Citizens dislike fines even when fair]
        Net-Zero Meter += 3%                [Enforcement deters future emissions]
    ELSE:                           // Wrongful Fine
        City Budget    -= $300              [Legal Appeal Cost]
        Public Trust   -= 12%               [Public Outrage]

IF Player Action == "GRANT":
    IF Citizen Has Eligible Issue AND Selected Grant Matches Issue: // Valid Solution
        Grant Cost      = Grant.Cost
        City Budget    -= Grant Cost
        Public Trust   += 8%                [High community appreciation]
        Net-Zero Meter += Grant.NetZeroBoost (e.g., +8% to +12%)
    ELSE:                           // Wasted Subsidy
        City Budget    -= Grant.Cost
        Public Trust   -= 4%                [Accusations of favoritism/mismanagement]

```

---

## 4. Real-World Solution Grants & Exemption Mechanics

The player can issue one of four specialized **Municipal Climate Grants** instead of a standard tax approval or fine when inspecting eligible households:

```
+---------------------------------------------------------------------------------------------------+
| GRANT TYPE            | ELIGIBLE HOUSEHOLD DEFECT           | COST  | NET-ZERO | FUTURE IMPACT    |
|-----------------------+-------------------------------------+-------+----------+------------------|
| Heat Pump Subsidy     | High Natural Gas heating (>100 m³)  | $400  | +10%     | -75% Heating CO2 |
| Municipal Compost Kit | High Landfill Waste (>30 kg)        | $150  | +8%      | -90% Methane CO2e|
| EV Transit Voucher    | High Gasoline Mobility (>300 km)    | $200  | +7%      | Zeroes Commute   |
| Cool/Green Roof Permit| High Summer AC kWh + Asphalt Roof   | $300  | +9%      | -40% Cooling kWh |
+---------------------------------------------------------------------------------------------------+

```

---

## 5. Technical Architecture & Data Schemas

### 5.1 System Architecture Diagram

```
+---------------------------------------------------------------------------+
|                              INDEX.HTML                                   |
|  +---------------------------------------------------------------------+  |
|  | #top-bar (Meters: Net-Zero, Budget, Trust, Timer)                   |  |
|  +---------------------------------------------------------------------+  |
|  | #workspace (CSS Grid 3-Column Layout)                               |  |
|  |  +------------------+  +-------------------+  +------------------+  |  |
|  |  | #rulebook-panel  |  | #dossier-panel    |  | #action-panel    |  |  |
|  |  | (Reference Rates)|  | (Receipts & Notes)|  | (Calculator &    |  |  |
|  |  |                  |  |                   |  |  Stamps)         |  |  |
|  |  +------------------+  +-------------------+  +------------------+  |  |
|  +---------------------------------------------------------------------+  |
|  | #summary-modal (Hidden by default; triggers on shift end)           |  |
|  +---------------------------------------------------------------------+  |
+---------------------------------------------------------------------------+
                                     │
                                     ▼
                      +-----------------------------+
                      |          APP.JS             |
                      |  - GameState Controller     |
                      |  - Calculator Logic Engine  |
                      |  - UI Renderer & DOM Event  |
                      |  - Web Audio Synthesizer    |
                      +-----------------------------+
                                     │
                                     ▼
                      +-----------------------------+
                      |        DATA/CASES.JS        |
                      |  - JSON Citizen Database    |
                      |  - Day Definitions          |
                      +-----------------------------+

```

### 5.2 JSON Data Schema

#### 5.2.1 Citizen Case Schema (`data/cases.js`)

```javascript
const CITIZEN_CASES = [
  {
    id: "CIT-101",
    day: 1,
    name: "Ayla Yılmaz",
    district: "Muratpaşa, Antalya",
    note: "My gas bill was extreme this winter because our landlord won't insulate the walls. I tried my best to cut down on meat to compensate!",
    declaredCO2: 120.0,
    hasFraud: false,
    fraudType: null, // Options: null, "UNVERIFIED_OFFSET", "HIDDEN_RECEIPT", "UNDERDECLARED_KWH"
    receipts: [
      {
        type: "ENERGY",
        title: "TEDAŞ Smart Meter Log",
        items: [
          { label: "Grid Electricity", qty: 150, unit: "kWh", rateKey: "GRID_ELEC" },
          { label: "Natural Gas", qty: 80, unit: "m³", rateKey: "GAS_HEAT" }
        ]
      },
      {
        type: "GROCERY",
        title: "Migros Supermarket Receipt",
        items: [
          { label: "Local Veg Pack", qty: 4, unit: "pack", rateKey: "LOCAL_FOOD" },
          { label: "Beef Sirloin", qty: 1, unit: "pack", rateKey: "BEEF" }
        ]
      }
    ],
    eligibleGrant: "HEAT_PUMP", // Options: null, "HEAT_PUMP", "COMPOST_KIT", "TRANSIT_PASS", "COOL_ROOF"
    grantExplanation: "High gas heating usage due to old boiler."
  },
  {
    id: "CIT-102",
    day: 1,
    name: "Barış Demir",
    district: "Kepez, Antalya",
    note: "I purchased 100 kg of 'Clean Carbon Offsets' from a private online startup, so my flight to Istanbul should count as zero emissions!",
    declaredCO2: 45.0, // Fraudulent: Ignored 150kg flight cost using invalid offset
    hasFraud: true,
    fraudType: "UNVERIFIED_OFFSET",
    receipts: [
      {
        type: "TRAVEL",
        title: "THY Flight Manifest",
        items: [
          { label: "Domestic Flight (AYT-IST)", qty: 1, unit: "ticket", rateKey: "FLIGHT" }
        ]
      },
      {
        type: "ENERGY",
        title: "TEDAŞ Smart Meter Log",
        items: [
          { label: "Grid Electricity", qty: 90, unit: "kWh", rateKey: "GRID_ELEC" }
        ]
      }
    ],
    eligibleGrant: null,
    grantExplanation: ""
  }
];

```

#### 5.2.2 Global Game State Schema (`app.js`)

```javascript
const gameState = {
  currentDay: 1,
  timeRemaining: 120, // seconds
  timerInterval: null,
  currentCaseIndex: 0,
  dailyCases: [],
  metrics: {
    netZero: 30,    // percentage 0 - 100
    budget: 5000,   // USD $
    trust: 70       // percentage 0 - 100
  },
  shiftStats: {
    processedCount: 0,
    correctActions: 0,
    finesIssued: 0,
    grantsIssued: 0,
    co2ReducedKg: 0
  }
};

```

---

## 6. Visual & UI/UX Specification

### 6.1 Layout Blueprint (CSS Grid)

The application uses a fixed viewport (`100vh`, `100vw`) styled in a retro-futuristic municipal desktop aesthetic.

```
+------------------------------------------------------------------------------------+
| HEADER: Municipal Carbon Assessment Terminal v3.1 | COP31 Antalya Protocol Agenda  |
| [Net-Zero: ▓▓▓▓▓░░░ 30%]  [Budget: $5,000]  [Trust: ▓▓▓▓▓▓▓░ 70%]  [Shift Time: 01:45] |
+------------------------------------------------------------------------------------+
| LEFT: Rulebook Panel    | CENTER: Citizen Dossier        | RIGHT: Audit & Action   |
|                         |                                |                         |
| ■ Benchmark Rates       | ■ Citizen ID & District        | ■ Scratchpad Calc       |
|   - Grid: 0.5kg/kWh     | ■ Personal Note / Plea         |   [ Input ] [ Clear ]   |
|   - Gas: 2.0kg/m³       | ■ Receipt Card 1 (Energy)      |                         |
|   - Beef: 15.0kg/pack   | ■ Receipt Card 2 (Grocery)     | ■ Assessment Summary    |
|   - Flight: 150kg/tkt   | ■ Receipt Card 3 (Travel)      |   Calculated: ___ kg    |
|                         |                                |   Declared:   ___ kg    |
| ■ Policy Directives     |                                |                         |
|   - Offsets without     |                                | ■ STAMP ACTION DOCK     |
|     COP31 Seal = FINE   |                                |   [ APPROVE TAX ]       |
|                         |                                |   [ ISSUE FINE ]        |
|                         |                                |   [ ISSUE GRANT ▼ ]     |
+------------------------------------------------------------------------------------+

```

### 6.2 Color Palette

```css
:root {
  /* Surface & Background Colors */
  --bg-app: #0f172a;           /* Dark Slate Slate-900 */
  --surface-panel: #1e293b;     /* Slate-800 */
  --surface-card: #334155;      /* Slate-700 */
  --paper-dossier: #f8fafc;     /* Clean Off-White */
  --paper-text: #0f172a;        /* Deep Slate Text */

  /* Primary Theme Accents */
  --accent-cyan: #06b6d4;       /* Terminal Blue */
  --accent-gold: #f59e0b;       /* COP31 Gold Accent */

  /* Interactive Action Colors */
  --stamp-approve-bg: #10b981;  /* Emerald Green */
  --stamp-approve-hover: #059669;
  --stamp-fine-bg: #ef4444;     /* Crimson Red */
  --stamp-fine-hover: #dc2626;
  --stamp-grant-bg: #0284c7;    /* Solution Blue */
  --stamp-grant-hover: #0369a1;

  /* Typography Fonts */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-sans: 'Inter', system-ui, sans-serif;
}

```

---

## 7. Sound Design Specification (Web Audio API)

No external audio files required. All sound effects are generated programmatically via synthesized Web Audio API nodes:

```javascript
// Web Audio API Procedural SFX Generator Engine
const AudioEngine = {
  ctx: null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  
  // Stamp Sound: Deep low-pass mechanical thud
  playStamp() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  },

  // Correct Action: Bright rising duo-tone chime
  playSuccess() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  },

  // Penalty/Error Sound: Harsh low saw buzz
  playError() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(110, now + 0.1);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.3);
  }
};

```

---

## 8. Level Design & Campaign Progression

The MVP consists of a **3-Day Campaign** (representing the ramp-up to the COP31 summit).

```
+----------------------------------------------------------------------------------------------------+
| DAY | SHIFT DURATION | CASE COUNT | INTRODUCED MECHANICS & COMPLEXITY                              |
|-----+----------------+------------+----------------------------------------------------------------|
| Day 1 | 120 Seconds  | 5 Cases    | Basic Audits: Simple receipt math, matching declared vs actual.|
|       |                |            | Grants introduced: Heat Pump & Compost Kit.                    |
|-------+----------------+------------+----------------------------------------------------------------|
| Day 2 | 100 Seconds  | 6 Cases    | Greenwashing Fraud Introduced: Unverified offsets & flight logs.|
|       |                |            | Grants expanded: EV Transit Voucher & Cool Roof Permit.        |
|-------+----------------+------------+----------------------------------------------------------------|
| Day 3 | 90 Seconds   | 7 Cases    | High-Density Shift: Multi-receipt cases, subtle rounding       |
|       |                |            | errors, conflicting personal notes vs actual receipt evidence.|
+----------------------------------------------------------------------------------------------------+

```

---

## 9. File Structure & AI Agent Implementation Roadmap

To allow AI coding agents (Antigravity & OpenCode) to execute without codebase drift, the project structure must strictly adhere to this layout:

```
municipal-carbon-assessor/
├── index.html          # Shell layout, CSS/JS links, DOM structure
├── css/
│   └── styles.css      # Single stylesheet (CSS Variables, Flexbox/Grid, Retro UI)
├── js/
│   ├── data.js         # Rulebook benchmark rates & Citizen JSON cases database
│   ├── audio.js        # Web Audio API Synthesizer module
│   └── app.js          # State controller, DOM event listeners, game loop
└── README.md           # Jam submission info & COP31 attribution notes

```

---

## 10. QA Acceptance Checklist for AI Agents

Prior to declaring the MVP complete, the AI agents must verify that all automated functionality meets these acceptance tests:

* [ ] **Zero Console Errors:** Page loads cleanly without missing resource or script exceptions.
* [ ] **Independent Math Verification:** The calculation engine evaluates receipt totals using exact Rulebook rates before checking player action validity.
* [ ] **Metric Floor/Ceiling Guardrails:**
* `Net-Zero Progress` is clamped between `0%` and `100%`.
* `City Budget` bankruptcy ($0) immediately triggers the **Game Over Modal**.
* `Public Trust` reaching 0% immediately triggers the **Game Over Modal**.


* [ ] **Interactive On-Screen Calculator:** Clicking receipt items automatically populates or adds values to the auditor's scratchpad tool.
* [ ] **Audio Fallback:** Audio triggers handle browser autoplay policies gracefully (initializing AudioContext on first user click).
* [ ] **Shift Summary & Replayability:** Ending a shift displays accurate stats (CO2 saved, correct vs incorrect decisions, budget change) and provides a "Next Day / Restart" option.
* [ ] **Third-Party Attribution File:** Contains an `ATTRIBUTION.md` or README section explicitly detailing open-source licenses and free-agent workflow compliance for jam submission.