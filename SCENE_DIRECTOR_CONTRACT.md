# SceneDirector Interface & Integration Contract (Phase 5B)

This document establishes the architecture contract for **Phase 5B — Immersion, Transitions & Game-Feel Layer**.
It defines how the **SceneDirector** coordinates presentation, what events are emitted, how scenes are registered, and the exact ownership and integration boundaries between **Agent A** and **Agent B**.

---

## 1. Core Principles

1. **Backend Authority:** The backend remains 100% authoritative for all gameplay logic, campaign states, quotas, timers, emissions, and rules.
2. **Presentation Only:** `SceneDirector` is an orchestrator of visual transitions and animations. It is **not** a second gameplay state machine.
3. **No Deadlocks:** Animations must never permanently block user input. All transitions include safety timeout fallbacks (`setTimeout`) and immediate skip capabilities.
4. **Reduced Motion:** When `prefers-reduced-motion` is active, all transitions complete immediately without physical transforms or screen bounces.

---

## 2. Standard Scene Sequence

The campaign presentation follows this sequence:

```
MENU → DAY_BRIEF → SHIFT_START → CASE_INTAKE → CASE_REVIEW → CASE_RESOLVE → NEXT_CASE → DAY_SUMMARY → NEXT_DAY → VERDICT
```

| Scene Identifier | Description | Owner |
|---|---|---|
| `MENU` | Cinematic main menu and start interface | Agent B (P5B-02) |
| `DAY_BRIEF` | Full-screen operational day briefing | Agent B (P5B-03) |
| `SHIFT_START` | Shift initialization and desk readiness | Agent A / B integration |
| `CASE_INTAKE` | Physical citizen dossier arrival animation | Agent A (P5B-04) |
| `CASE_REVIEW` | Active auditor inspection and calculation | Existing / Ambient P5B-06 |
| `CASE_RESOLVE` | Physical case departure (APPROVE/FINE/GRANT) | Agent A (P5B-05) |
| `NEXT_CASE` | Reset and cleanup between cases | Agent A |
| `DAY_SUMMARY` | Full-screen shift report and performance seal | Agent B (P5B-09) |
| `NEXT_DAY` | Calendar day advance transition | Agent B |
| `VERDICT` | Campaign victory certificate or termination | Agent B (P5B-10) |

---

## 3. SceneDirector API

Import location:
```javascript
import { SceneDirector, SCENE_NAMES, createSceneDirector } from './scene-director.js';
```

### 3.1 Methods

#### `transitionTo(targetScene, data = {}, options = {}) => Promise<{ from, to, data }>`
Executes a coordinated transition to `targetScene`.
- `targetScene`: A member of `SCENE_NAMES` (e.g., `'DAY_BRIEF'`, `'CASE_INTAKE'`).
- `data`: Relevant payload (e.g., `{ citizenCase }`, `{ dayConfig }`, `{ result }`, `{ summaryData }`, `{ outcome }`).
- `options.force`: If `true`, cancels any active transition immediately and enters the target scene.
- **Returns:** Promise resolving once the transition is complete or skipped.

#### `registerScene(sceneName, handler)`
Registers lifecycle handlers for a scene:
```javascript
sceneDirector.registerScene(SCENE_NAMES.DAY_BRIEF, {
  enter(data, context) {
    // Show briefing card, start typewriter text, etc.
    // context: { from, to, data, reducedMotion, duration }
  },
  exit(data, context) {
    // Animate out briefing card
  },
  skip() {
    // Snap to completed visual state instantly
  },
  duration: 400 // Optional override in ms
});
```

#### `skipTransition()`
Immediately snaps the active transition to its final visual state and resolves the transition promise. Safe to call on user clicks or keypresses.

#### `getCurrentScene() => string`
Returns the active scene name (e.g. `'CASE_REVIEW'`).

#### `isTransitioning() => boolean`
Returns `true` while a transition is actively animating.

#### `setReducedMotion(enabled: boolean)` / `isReducedMotion() => boolean`
Sets or queries reduced-motion mode. When `true`, transition durations are set to `0`.

#### `on(event, callback) => unsubscribeFunction`
Subscribes to SceneDirector events.

---

## 4. Events Emitted by SceneDirector

| Event | Payload | When Emitted |
|---|---|---|
| `transitionStart` | `{ from, to, data, reducedMotion, duration }` | Transition begins |
| `transitionEnd` | `{ from, to, data, reducedMotion, duration }` | Transition finishes animation |
| `sceneChange` | `{ from, to, data, reducedMotion, duration }` | Active scene changed |
| `transitionSkipped`| `{ from, to, data }` | User or system skipped active transition |
| `reducedMotionChange` | `{ reducedMotion: boolean }` | Accessibility motion setting changed |

DOM reflection:
The root element receives an attribute `data-active-scene="SCENE_NAME"`. CSS rules can target `[data-active-scene="DAY_BRIEF"]` etc.

---

## 5. File Ownership & Integration Boundaries

### Agent A Ownership:
- `js/frontend/scene-director.js`: Core transition orchestrator.
- `SCENE_DIRECTOR_CONTRACT.md`: This shared contract document.
- `js/frontend/components/dossier-panel.js`: Dossier intake (P5B-04) & case resolution (P5B-05).
- `js/frontend/game-controller.js`: Orchestrating calls to `sceneDirector.transitionTo()`.
- `css/components.css`: Dossier animations, torn paper strip, enhanced stamps, verdict labels.
- `css/styles.css`: Terminal CRT mode styles (P5B-11).
- `css/responsive.css`: Reduced motion overrides & responsive scaling (P5B-13).

### Agent B Ownership:
- `js/frontend/screens/main-menu.js`: Cinematic Main Menu (P5B-02).
- `js/frontend/screens/day-intro-modal.js`: Day Briefing full-screen scene (P5B-03).
- `js/frontend/screens/summary-screen.js`: Day-End Shift Report scene (P5B-09).
- `js/frontend/screens/game-over-screen.js`: Victory & Game Over Cinematics (P5B-10).
- `js/frontend/screens/gameplay-screen.js`: Ambient Office lighting and dust motes (P5B-06).
- `js/frontend/components/top-bar.js`: Metric HUD bouncing counters and delta chips (P5B-07).
- `js/frontend/audio.js`: Audio transition cues (P5B-12).

---

## 6. How Agent B Hooks into SceneDirector

Agent B registers scene handlers during component initialization or binds to `sceneDirector.on('sceneChange', ...)`:

```javascript
// Example for Day Briefing (Agent B):
sceneDirector.registerScene(SCENE_NAMES.DAY_BRIEF, {
  enter(dayConfig, context) {
    if (context.reducedMotion) {
      dayIntroModal.showImmediately(dayConfig);
    } else {
      dayIntroModal.animateSlideIn(dayConfig);
    }
  },
  exit() {
    dayIntroModal.animateSlideOut();
  },
  skip() {
    dayIntroModal.snapToSettled();
  }
});
```

When the player clicks "Begin Shift", the event triggers:
```javascript
// GameController calls:
await sceneDirector.transitionTo(SCENE_NAMES.SHIFT_START);
await sceneDirector.transitionTo(SCENE_NAMES.CASE_INTAKE, { citizenCase });
```

This guarantees seamless coordination without file collision.

