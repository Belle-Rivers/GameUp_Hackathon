# Game Rules — Municipal Carbon Assessor: Antalya Protocol

**Project:** Municipal Carbon Assessor  
**Event:** COP31 Game Jam  
**Document purpose:** Define the authoritative gameplay rules, calculations, decisions, campaign progression, and win/loss conditions for the MVP.

---

# 1. Core Gameplay Concept

The player acts as a Municipal Carbon Auditor in a climate-resilient municipality preparing for COP31 in Antalya.

The player's responsibility is to inspect citizen household records, calculate their actual carbon footprint, compare it with their declared footprint, identify misdeclarations or greenwashing, and decide whether to:

- **APPROVE:** Accept an accurate declaration.
- **FINE:** Penalize an inaccurate declaration or an unverified environmental claim.
- **GRANT:** Award an eligible mitigation grant to help a household reduce its future emissions.

Every decision affects the municipality's:

- Net-Zero Progress
- Available Budget
- Public Trust

The campaign consists of three consecutive working days. The player must balance environmental progress, financial resources, and public confidence.

---

# 2. Core Gameplay Loop

Each citizen case follows this sequence:

1. Load the citizen's dossier.
2. Read the citizen's declaration and personal note.
3. Inspect available receipts, energy records, and travel logs.
4. Consult the municipal carbon rulebook.
5. Calculate the citizen's actual carbon footprint.
6. Compare actual emissions against declared emissions.
7. Identify discrepancies, fraud, or grant eligibility.
8. Choose one action: APPROVE, FINE, or GRANT.
9. Validate the selected action.
10. Apply the corresponding metric changes.
11. Display feedback explaining whether the decision was correct.
12. Load the next citizen.

At the end of each working day, display a shift summary.

After Day 3, evaluate the campaign's final outcome.

**MVP decision:** Each citizen can receive only one final action. APPROVE, FINE, and GRANT are mutually exclusive.

A grant is therefore an alternative to approving or fining the citizen, not an additional action after a fine.

---

# 3. Carbon Emission Rules

## 3.1 Emission Factors

The following values are the game's municipal benchmark rates.

| Category | Activity | Emission Rate | Unit |
|---|---|---:|---|
| Electricity | Grid electricity | 0.50 | kg CO₂/kWh |
| Heating | Natural gas | 2.00 | kg CO₂/m³ |
| Electricity | Rooftop solar offset | -0.40 | kg CO₂/kWh |
| Food | Beef / ruminant meat | 15.00 | kg CO₂/pack |
| Food | Imported out-of-season goods | 5.00 | kg CO₂/item |
| Food | Local organic / plant food | 0.50 | kg CO₂/pack |
| Transportation | Gasoline travel | 0.20 | kg CO₂/km |
| Transportation | Domestic air travel | 150.00 | kg CO₂/ticket |
| Transportation | Public electric transit | 0.00 | kg CO₂/km |
| Waste | Landfill waste | 3.00 | kg CO₂e/kg |
| Waste | Composted organic waste | 0.10 | kg CO₂e/kg |

These are **gameplay benchmark values**, not official government or COP31-certified emission factors.

The game should describe them as municipal assessment rates rather than authoritative scientific measurements.

## 3.2 Actual Carbon Footprint Calculation

Actual emissions are calculated by multiplying each recorded activity quantity by its corresponding emission rate.

Formula:

Actual CO₂ = Sum of (Quantity × Emission Rate)

For example:

- Grid electricity: 100 kWh × 0.50 = 50 kg CO₂
- Natural gas: 10 m³ × 2.00 = 20 kg CO₂
- Beef: 2 packs × 15.00 = 30 kg CO₂

Total actual emissions = 100 kg CO₂.

Negative emission values, such as rooftop solar offsets, must reduce the total.

**Recommended implementation rule:** The total actual footprint must never be displayed as a negative value. If the calculated total is below zero, clamp the displayed and assessed total to zero.

## 3.3 Receipt Breakdown

The calculation engine must return:

- Each receipt item's emission contribution.
- Each category's subtotal.
- Total actual emissions.

The frontend calculator must display these results without independently recalculating them.

## 3.4 Declared vs. Actual Emissions

The citizen provides a declared CO₂ value.

The game compares:

- Actual emissions calculated from the records.
- Declared emissions provided by the citizen.

Discrepancy:

Discrepancy = Actual Emissions - Declared Emissions

A positive discrepancy means the citizen declared fewer emissions than the records indicate.

A negative discrepancy means the citizen declared more emissions than the records indicate.

Discrepancy ratio:

Discrepancy Ratio = (Actual Emissions - Declared Emissions) / Actual Emissions

**Edge case:** If actual emissions equal zero, do not divide by zero. The implementation must handle this case separately and use the absolute discrepancy for the decision rules.

## 3.5 Declaration Tolerance

A difference of 2 kg CO₂ or less is considered acceptable.

A declaration is accurate when:

|Actual Emissions - Declared Emissions| ≤ 2 kg

A declaration is inaccurate when:

|Actual Emissions - Declared Emissions| > 2 kg

This tolerance is used when deciding whether an APPROVE action is valid.

---

# 4. Citizen Auditing and Action Rules

The player must select one action for each citizen.

The backend must determine whether that action is valid using the citizen's records, calculated emissions, declaration, and grant eligibility.

The frontend must not determine whether an action is correct.

## 4.1 APPROVE

Purpose: Accept a citizen's declaration when it is sufficiently accurate.

**Valid when:**
- The absolute difference between actual and declared emissions is 2 kg or less.
- No unverified greenwashing claim makes the case invalid.

**If valid:**

| Metric | Change |
|---|---:|
| Budget | + (Actual CO₂ × $0.50) |
| Public Trust | +3 percentage points |
| Net-Zero Progress | +1 percentage point |

**If invalid:**

| Metric | Change |
|---|---:|
| Budget | -$200 |
| Public Trust | -5 percentage points |
| Net-Zero Progress | -2 percentage points |

An invalid approval represents the auditor allowing an inaccurate or misleading declaration to pass.

## 4.2 FINE

Purpose: Penalize a citizen who underdeclares emissions or uses an unverified greenwashing offset.

**Valid when either condition is true:**
- Declared emissions are more than 2 kg below actual emissions.
- The citizen claims an offset that cannot be verified.

**If valid:**

Fine amount:

Fine = (Actual CO₂ - Declared CO₂) × $10

| Metric | Change |
|---|---:|
| Budget | + Fine Amount |
| Public Trust | -2 percentage points |
| Net-Zero Progress | +3 percentage points |

**If invalid:**

| Metric | Change |
|---|---:|
| Budget | -$300 |
| Public Trust | -12 percentage points |
| Net-Zero Progress | No change |

An invalid fine represents unfair enforcement against a citizen who has not committed the relevant violation.

**Implementation clarification required:** The original formula can produce a negative fine if the declared footprint is greater than the actual footprint, even when an unverified offset is the reason the fine is valid.

For the MVP, use:

Fine = max(0, Actual CO₂ - Declared CO₂) × $10

An unverified offset can still make the FINE action valid, but it does not create a negative fine or an automatic additional penalty.

## 4.3 GRANT

Purpose: Reward and support a household that has an identifiable opportunity to reduce future emissions.

**Valid when:**
- The citizen has an eligible mitigation opportunity.
- The player selects the matching grant.
- The grant conditions are satisfied.

**If valid:**

| Metric | Change |
|---|---:|
| Budget | - Grant Cost |
| Public Trust | +8 percentage points |
| Net-Zero Progress | + Grant's Net-Zero Boost |

**If invalid:**

| Metric | Change |
|---|---:|
| Budget | - Selected Grant Cost |
| Public Trust | -4 percentage points |
| Net-Zero Progress | No change |

An invalid grant represents allocating public money to an unsuitable or unsupported intervention.

**Recommended implementation rule:** A GRANT action requires selecting a specific grant. If the citizen has no eligible grant, or the selected grant does not match the citizen's records, the action is invalid.

---

# 5. Mitigation Grant Rules

The game contains four mitigation grants.

| Grant | Eligibility Condition | Cost | Net-Zero Boost |
|---|---|---:|---:|
| Heat Pump Subsidy | High natural gas heating consumption above 100 m³ | $400 | +10% |
| Municipal Compost Kit | Landfill waste above 30 kg | $150 | +8% |
| EV Transit Voucher | Gasoline mobility above 300 km | $200 | +7% |
| Cool/Green Roof Permit | High summer AC electricity consumption and an asphalt roof | $300 | +9% |

## 5.1 Heat Pump Subsidy

Eligibility:
- Natural gas heating consumption exceeds 100 m³.

Effects:
- Cost: $400.
- Net-Zero Progress: +10 percentage points.
- Future impact: 75% reduction in heating-related CO₂.

## 5.2 Municipal Compost Kit

Eligibility:
- Landfill waste exceeds 30 kg.

Effects:
- Cost: $150.
- Net-Zero Progress: +8 percentage points.
- Future impact: 90% reduction in methane-related CO₂e from the relevant organic waste.

## 5.3 EV Transit Voucher

Eligibility:
- Gasoline mobility exceeds 300 km.

Effects:
- Cost: $200.
- Net-Zero Progress: +7 percentage points.
- Future impact: Commute emissions become zero under the grant's intended electric mobility assumption.

## 5.4 Cool/Green Roof Permit

Eligibility:
- Summer air-conditioning electricity consumption exceeds 150 kWh.
- Asphalt roof.

Effects:
- Cost: $300.
- Net-Zero Progress: +9 percentage points.
- Future impact: 40% reduction in cooling-related electricity consumption.

**MVP scope decision:** Grant future impacts are explanatory gameplay feedback. They do not automatically modify later citizens' emissions or receipts.

The immediate Net-Zero boost represents the game's simplified municipal progress model.

---

# 6. City Metrics

The municipality has three main metrics.

## 6.1 Initial Values

| Metric | Initial Value |
|---|---:|
| Net-Zero Progress | 30% |
| Municipal Budget | $5,000 |
| Public Trust | 70% |

These values are initialized at the beginning of a new campaign.

## 6.2 Net-Zero Progress

Represents the municipality's progress toward its environmental target.

- Valid approval: +1 percentage point.
- Invalid approval: -2 percentage points.
- Valid fine: +3 percentage points.
- Invalid fine: No change.
- Valid grant: Grant-specific boost.
- Invalid grant: No change.

**Win target:** Reach 100% Net-Zero Progress by the end of Day 3.

## 6.3 Municipal Budget

Represents available public funding.

Budget changes according to the selected action.

- Valid approval: Increase by actual emissions × $0.50.
- Invalid approval: Decrease by $200.
- Valid fine: Increase by the calculated fine.
- Invalid fine: Decrease by $300.
- Grant: Decrease by the selected grant's cost, whether valid or invalid.

The campaign fails if the budget reaches zero or below.

## 6.4 Public Trust

Represents the citizens' confidence in the municipal audit system.

- Valid approval: +3 percentage points.
- Invalid approval: -5 percentage points.
- Valid fine: -2 percentage points.
- Invalid fine: -12 percentage points.
- Valid grant: +8 percentage points.
- Invalid grant: -4 percentage points.

The campaign fails if Public Trust reaches zero or below.

## 6.5 Metric Boundaries

**Recommended implementation rule:**

- Net-Zero Progress must remain between 0% and 100%.
- Public Trust must remain between 0% and 100%.
- Budget must not be clamped to zero before the bankruptcy condition is checked.

A metric update must:
1. Calculate the complete action result.
2. Apply the resulting changes.
3. Clamp percentage-based metrics.
4. Check bankruptcy and public trust failure.
5. Check whether the campaign can continue.

Budget may become negative as a result of an action. If it does, the campaign ends immediately.

---

# 7. Citizen Case Data Rules

Each citizen case should contain enough information for the game to calculate emissions, determine the correct action, and explain the result.

## 7.1 Required Case Information

Each case should contain:

- `id`: Unique case identifier.
- `day`: Campaign day associated with the case.
- `name`: Citizen name.
- `district`: Citizen's district.
- `note`: Personal statement or explanation from the citizen.
- `declaredCO2`: Declared carbon footprint.
- `receipts`: Collection of recorded household activities.
- `roofType`: Household roof type (`"ASPHALT"` or `"OTHER"`), used for Cool/Green Roof Permit eligibility.
- `eligibleGrant`: Eligible grant identifier, if applicable.
- `grantExplanation`: Explanation of why the citizen qualifies.

Additional case metadata may include:

- `hasFraud`: Expected fraud indicator for test and content-authoring purposes.
- `fraudType`: Type of fraud or misleading declaration.

## 7.2 Receipt Information

Each receipt item must contain:

- `label`: Human-readable activity description.
- `qty`: Recorded quantity.
- `unit`: Unit of measurement.
- `rateKey`: Reference to the corresponding emission factor in the rulebook.

The calculation engine must resolve `rateKey` against the emission rulebook.

Unknown rate keys must be treated as invalid case data rather than silently assigned an emission rate.

Summer air-conditioning electricity must be recorded in a receipt with `type: "COOLING"`, using `GRID_ELEC` items. P1-13 sums those quantities when checking Cool/Green Roof Permit eligibility.

## 7.3 Fraud Verification

The backend must determine the correct audit result using the actual receipt data, declared footprint, and applicable rules.

`hasFraud` is expected-answer metadata for test cases. It must not be used as the sole source of truth for the player's decision.

`fraudType` may be used to describe the case, but the backend must still verify the underlying violation.

This prevents the game from automatically revealing the correct action based on hidden case metadata.

---

# 8. Campaign Structure

The campaign consists of three working days.

Metrics carry over between days.

The player does not receive a fresh budget, trust value, or Net-Zero Progress value at the beginning of each day.

## 8.1 Day 1 — Introduction

| Setting | Value |
|---|---:|
| Time Limit | 120 seconds |
| Citizen Cases | 5 |

Gameplay focus:
- Basic receipt calculations.
- Simple declaration comparisons.
- Introduction to the municipal rulebook.
- Heat Pump Subsidy.
- Municipal Compost Kit.

Day 1 introduces the core mechanics without overwhelming the player.

## 8.2 Day 2 — Investigation

| Setting | Value |
|---|---:|
| Time Limit | 100 seconds |
| Citizen Cases | 6 |

Gameplay focus:
- Greenwashing and fraudulent environmental claims.
- Flight records.
- More complex household records.
- All four mitigation grants.

## 8.3 Day 3 — Final Audit

| Setting | Value |
|---|---:|
| Time Limit | 90 seconds |
| Citizen Cases | 7 |

Gameplay focus:
- Multiple receipts.
- More complex calculations.
- Subtle rounding differences.
- Conflicting citizen notes.
- More difficult audit decisions.

The final day tests whether the player can make accurate decisions under time pressure.

## 8.4 Case Progression

- Cases must be processed in their defined daily sequence.
- Each completed action advances to the next case.
- The daily timer starts when the player begins the shift.
- The timer must not reset between citizens within the same shift.
- A new day receives its own configured time limit.

## 8.5 Timer Expiration

**Recommended implementation rule:**

When the timer reaches zero:
- Stop accepting new actions.
- Do not automatically process the current citizen.
- Do not count the unfinished citizen as processed.
- Display the shift summary.
- Allow the campaign to continue to the next day if the campaign has not already failed.

The shift ends whether or not all cases were processed.

## 8.6 Day Transitions

At the end of Day 1 or Day 2:
- Display the shift summary.
- Preserve all city metrics.
- Load the next day's cases.
- Apply the next day's time limit.
- Display a short day introduction.

At the end of Day 3:
- Evaluate the campaign result.

**MVP decision:** The player must complete the three-day campaign before the final Net-Zero victory check. Reaching 100% early does not immediately end the campaign.

---

# 9. Shift Statistics

The game tracks the player's performance throughout each shift.

The initial shift statistics are:

- `processedCount`
- `correctActions`
- `finesIssued`
- `grantsIssued`
- `co2ReducedKg`

Statistics should be updated only when the corresponding event actually occurs.

Recommended definitions:

- `processedCount`: Number of citizen cases receiving a completed action.
- `correctActions`: Number of actions validated as correct by the backend.
- `finesIssued`: Number of valid fines issued.
- `grantsIssued`: Number of valid grants awarded.
- `co2ReducedKg`: Estimated CO₂ reduction credited by valid mitigation interventions.

**Implementation clarification:** The PRD does not define a numerical formula for `co2ReducedKg`. Do not invent a precise reduction calculation from the grant's future-impact percentages alone.

For the MVP, either:
- Track only a documented estimate when a case provides the required baseline data, or
- Display grant counts and Net-Zero Progress without claiming an exact CO₂ reduction total.

The second option is preferable if the case data does not support reliable reduction calculations.

---

# 10. Victory and Failure Conditions

## 10.1 Victory

The player wins the campaign when:

- Day 3 has ended.
- Net-Zero Progress is at least 100%.
- The municipality has not gone bankrupt.
- Public Trust has not reached zero or below.

Display a victory screen showing:
- Final Net-Zero Progress.
- Remaining Budget.
- Final Public Trust.
- Total citizens processed.
- Correct actions.
- Valid fines issued.
- Valid grants issued.

The victory message should recognize the player's contribution to the municipality's climate goals.

## 10.2 Failure

The campaign fails immediately if either condition occurs:

- Municipal Budget reaches zero or below.
- Public Trust reaches zero or below.

At the end of Day 3, the campaign also fails if Net-Zero Progress is below 100%.

Display a failure screen explaining the reason:
- Municipal bankruptcy.
- Loss of public trust.
- Failure to reach the Net-Zero target.

Show the final metrics and allow the player to restart the campaign.

## 10.3 Restart

Restarting must:
- Restore the initial metrics.
- Reset the campaign day to Day 1.
- Reset the timer.
- Reset the current case index.
- Reset shift statistics.
- Restore the original citizen case sequence.

No previous campaign state should affect a new run.

---

# 11. General System Rules

1. The backend is the authority for all gameplay calculations and decisions.
2. The frontend must not independently calculate emissions, validate fraud, determine grant eligibility, or apply metric changes.
3. Every action must be validated before its effects are applied.
4. Every completed action must return enough information for the frontend to display the result.
5. Invalid actions must still apply their specified penalties.
6. Percentage metrics must respect their defined boundaries.
7. A citizen must not be processed more than once.
8. A completed case must advance the case index exactly once.
9. The timer must not continue after the shift has ended or the campaign has failed.
10. The campaign must not continue after a terminal failure state.
11. All emission factors and grant values must be centralized in the backend data layer.
12. All citizen cases must use valid emission rate keys.
13. Hidden test metadata must not be used as a replacement for actual audit calculations.
14. The same input data and selected action must produce the same result.
15. The game must remain playable without a server, external API, account, or paid service.

---

# 12. Important Implementation Boundaries

The following responsibilities belong to the backend:

- Emission factor data.
- Grant data and eligibility.
- Citizen case data.
- Emission calculations.
- Receipt breakdowns.
- Declaration comparisons.
- Fraud and offset verification.
- Action validation.
- Action consequences.
- City metric updates.
- Shift statistics.
- Timer and case progression rules.
- Campaign transitions.
- Victory and failure evaluation.

The following responsibilities belong to the frontend:

- Displaying the citizen dossier.
- Displaying receipts and activity records.
- Displaying the rulebook.
- Providing the calculator interface.
- Collecting the player's selected action.
- Displaying grant options.
- Displaying city metrics and the timer.
- Showing action feedback.
- Showing shift summaries.
- Showing victory and failure screens.
- Playing interface sounds and animations.

The frontend requests actions and displays backend results. It must not become a second implementation of the game rules.

---

# 13. Approved MVP Decisions and Change Control

The following decisions are approved for the MVP and are authoritative for implementation.

| ID | Ambiguity | Approved MVP decision |
| --- | --- | --- |
| D-01 | Can a citizen receive a grant and also be fined or approved? | No. APPROVE, FINE, and GRANT are mutually exclusive; each citizen receives exactly one final action. Grants are alternatives to approvals and fines. |
| D-02 | Can Net-Zero reaching 100% before Day 3 end the campaign early? | No. The campaign always runs all three days. Victory is evaluated only after Day 3 and requires Net-Zero Progress at least 100%, a positive budget, and positive Public Trust. |
| D-03 | Do grant effects change later citizens' records? | No. Immediate metric effects apply when a grant is validated. Future impacts are descriptive only and do not modify later cases, receipts, or emissions. |
| D-04 | Are the emission rates official scientific or COP31 values? | No. They are fixed gameplay benchmark values described as municipal assessment rates, not official COP31, Antalya government, or scientific figures. |
| D-05 | What does clicking a receipt item add to the calculator? | The backend-calculated emission contribution in kg CO₂ for that item. The calculator may display quantity and rate for transparency, but must not multiply or total emissions independently. |
| D-06 | What happens to an unfinished case when the timer expires? | The shift stops accepting actions. The current case is not processed, receives no action penalty, and is not counted in processed statistics. The shift summary is shown, and the campaign continues if it has not failed. |
| D-07 | Does bankruptcy or zero trust end the day or the campaign? | Either condition ends the entire campaign immediately. At the end of Day 3, Net-Zero Progress below 100% also fails the campaign. |
| D-08 | How is the discrepancy ratio handled when actual emissions are zero? | Never divide by zero. Use the absolute discrepancy for decision rules when actual emissions are zero; the ratio is not used for those decisions. |
| D-09 | Can `hasFraud` or `fraudType` decide the audit outcome? | No. The backend must derive fraud from receipts, the declaration, and policy rules. `hasFraud` is expected-answer metadata for tests only; `fraudType` may categorize a case but does not replace verification. |
| D-10 | Does the ±2 kg tolerance apply to every action? | The tolerance applies to APPROVE accuracy and the FINE underdeclaration threshold. It does not apply to GRANT eligibility or validation. |
| D-11 | Can a fine be negative? | No. Fine = max(0, Actual CO₂ − Declared CO₂) × $10. An unverified offset can make FINE valid but cannot create a negative fine or an automatic additional penalty. |
| D-12 | How is CO₂ reduction for shift statistics calculated? | The MVP does not claim an exact reduction total. Display valid grant counts and Net-Zero Progress; do not populate `co2ReducedKg` from grant future-impact percentages. |
| D-13 | Which names identify emission rates in case data? | The 11 keys exported by `EMISSION_RULEBOOK` are canonical: `GRID_ELEC`, `GAS_HEAT`, `SOLAR_OFFSET`, `BEEF`, `IMPORTED_GOODS`, `LOCAL_FOOD`, `GASOLINE`, `FLIGHT`, `PUBLIC_TRANSIT`, `LANDFILL`, and `COMPOST`. All P1-03 case data must use these exact keys. Unknown keys are invalid case data and must not be assigned a rate. |
| D-14 | How is backend logic verified? | Vitest is the automated test runner (`npm test` for one run, `npm run test:watch` for watch mode). It is a development-only dependency; the game runtime remains dependency-free. Tests live in `tests/` and must accompany each implemented backend module. |
| D-15 | What summer AC consumption qualifies a household for the Cool/Green Roof Permit? | Summer air-conditioning electricity consumption must exceed 150 kWh. The comparison is strict (`> 150 kWh`), not `>= 150 kWh`. |
| D-16 | How do case records represent Cool/Green Roof eligibility? | Summer AC usage is recorded in receipts with `type: "COOLING"` using `GRID_ELEC` items. `CitizenCase.roofType` is required and must equal `"ASPHALT"` for eligibility. P1-13 must check both conditions. |

## 13.1 Cool/Green Roof Data Gap (Resolved)

The previously missing summer AC threshold is resolved by D-15 (`> 150 kWh`), and its case-data representation is resolved by D-16. No Cool/Green Roof data gap remains open.

Any change to these decisions or to any other gameplay rule requires explicit approval and must be reflected in this document before implementation.

Agents must not silently change gameplay rules to make implementation easier.

If a rule is ambiguous, contradictory, or impossible to implement using the available case data, the agent must report the issue and request clarification rather than inventing a new rule.

---

**Document status:** MVP gameplay rules — approved for implementation.