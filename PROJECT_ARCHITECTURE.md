GameUP/
│
├── index.html
│
├── css/
│   ├── styles.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
│
├── js/
│   │
│   ├── backend/
│   │   ├── data/
│   │   │   ├── cases.js
│   │   │   ├── rulebook.js
│   │   │   └── grants.js
│   │   │
│   │   ├── calculations/
│   │   │   └── emissions.js
│   │   │
│   │   ├── systems/
│   │   │   ├── audit.js
│   │   │   ├── grant-system.js
│   │   │   ├── metrics.js
│   │   │   ├── game-state.js
│   │   │   └── campaign.js
│   │   │
│   │   └── index.js
│   │
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── top-bar.js
│   │   │   ├── rulebook-panel.js
│   │   │   ├── dossier-panel.js
│   │   │   ├── calculator-panel.js
│   │   │   └── action-panel.js
│   │   │
│   │   ├── screens/
│   │   │   ├── main-menu.js
│   │   │   ├── gameplay-screen.js
│   │   │   └── summary-screen.js
│   │   │
│   │   ├── events.js
│   │   ├── renderer.js
│   │   └── audio.js
│   │
│   └── app.js

│
├── assets/
│   └── icons/
│
├── tests/                    Automated backend tests (Vitest; mirrors js/backend modules)
│
├── package.json
├── package-lock.json
├── vitest.config.js
├── README.md
└── ATTRIBUTION.md

```

### What belongs where?

| Module            | Responsibility                                                |
| ----------------- | ------------------------------------------------------------- |
| `cases.js`        | Citizen profiles, receipts, declarations and case information |
| `rulebook.js`     | Emission rates and policy rules                               |
| `grants.js`       | Grant types, costs, eligibility and effects                   |
| `emissions.js`    | All emission calculations                                     |
| `audit.js`        | Determine whether an assessment is correct                    |
| `grant-system.js` | Validate and apply grants                                     |
| `metrics.js`      | Budget, trust and Net-Zero calculations                       |
| `game-state.js`   | Maintain current game state                                   |
| `campaign.js`     | Days, cases, progression and campaign outcomes                |
| `renderer.js`     | Display the current game state                                |
| `events.js`       | Handle player interactions                                    |
| `audio.js`        | Generate sound effects                                        |

Architecture rule: Backend modules must never manipulate HTML elements or access the DOM. Frontend modules must never independently calculate emissions, penalties or grant rewards.

This separation will make it much easier to test your game logic independently of its appearance.