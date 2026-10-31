# Municipal Carbon Assessor: Antalya Protocol

A single-page browser game built for the COP31 Game Jam. The player acts as a Municipal Carbon Auditor who inspects citizen household records, verifies declared carbon footprints against the municipal rulebook, identifies misdeclarations or unverified greenwashing claims, and issues approvals, fines, or mitigation grants.

> **Status:** Phase 0 foundation. The project structure, data contracts, approved game rules, and frontend/backend interface are in place. Gameplay implementation is in progress, so the game is not yet playable.

## Gameplay

Each citizen case presents a dossier with a personal note, declared emissions, and household receipts. The player:

1. Inspects receipts and activity records.
2. Uses the municipal rulebook to assess actual emissions.
3. Compares actual and declared emissions.
4. Determines whether the citizen should be approved, fined, or offered a grant.
5. Sees the resulting metric changes and feedback.

The campaign spans three working days with increasingly complex cases:

| Day | Time Limit | Cases |
| --- | ---: | ---: |
| Day 1 | 120 seconds | 5 |
| Day 2 | 100 seconds | 6 |
| Day 3 | 90 seconds | 7 |

The player must finish Day 3 with at least 100% Net-Zero Progress without going bankrupt or losing Public Trust.

## Planned Features

- Three audit actions: APPROVE, FINE, and GRANT.
- Four mitigation grants with eligibility and cost rules.
- Backend-authoritative emission calculations, audit validation, and metric changes.
- Interactive calculator showing backend-calculated receipt contributions.
- Three-day campaign with shift summaries, victory, failure, and restart flows.
- CSS/SVG visuals and Web Audio API sound effects, with no external asset packs.

## Tech Stack

- HTML5, CSS3, and Vanilla JavaScript (ES6 modules).
- No build step, runtime npm dependencies, server, database, or external services.
- Runs entirely in the browser from static files.
- Vitest is a development-only dependency used for automated backend tests.

## Running Locally

Serve the repository with any static file server. For example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

Opening `index.html` directly may work in some browsers, but a local server is recommended for ES module loading.

## Project Structure

```text
index.html                  Application entry point
css/                        Layout, components, responsive, and base styles
js/backend/                 Game logic, data, calculations, and state systems
js/frontend/                Screens, components, rendering, events, and audio
js/app.js                   Application composition root
assets/icons/               Project-owned icons and SVG assets
tests/                      Automated backend tests (Vitest)
package.json                Development scripts and test dependency
vitest.config.js            Vitest configuration
GAME_RULES.md               Authoritative gameplay rules
PROJECT_ARCHITECTURE.md     Folder structure and layer responsibilities
IMPLEMENTATION_ROADMAP.md   Phases, tasks, and completion status
ATTRIBUTION.md              Third-party assets, names, and licensing notes
```

## Intended Controls

- Click a receipt item to add its backend-calculated CO2 contribution to the calculator.
- Use the calculator to clear the current scratchpad selection.
- Choose APPROVE, FINE, or GRANT from the action dock; select a grant when required.
- Use the shift summary to continue to the next day or restart after the campaign ends.
- Audio controls are planned for the polish phase.

## Documentation

- [Game Rules](GAME_RULES.md) — gameplay rules, calculations, decisions, and win/loss conditions.
- [Project Architecture](PROJECT_ARCHITECTURE.md) — folder structure and backend/frontend boundaries.
- [Implementation Roadmap](IMPLEMENTATION_ROADMAP.md) — phases, task IDs, and status.
- [Attribution](ATTRIBUTION.md) — external assets, names, and licensing status.

## Testing

Backend modules are tested independently of the UI with [Vitest](https://vitest.dev/). Install the development dependency once, then run the suite:

```sh
npm install
npm test
```

Use `npm run test:watch` while developing. Tests live in `tests/` and import the ES modules directly. `tests/rulebook.test.js` covers the canonical rulebook keys and rates (D-13); future backend modules must add their tests as they are implemented. Vitest is development-only and is not shipped with the game.

## Licensing

No open-source license has been declared for this repository yet. See `ATTRIBUTION.md` for third-party and asset notes.
