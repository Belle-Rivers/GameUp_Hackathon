# Attribution

This file records third-party assets, names, data notes, and licensing status for Municipal Carbon Assessor: Antalya Protocol.

## Visual Assets (Antalya Climate Operations Office Suite)

The visual assets located in the `assets/` directory establish the retro-futuristic Mediterranean municipal operations setting:

- **Office Environment Background (`assets/Antalya_Office_background.jpg`):**
  - Subject: Modern Antalya Municipal Climate Operations Office with Mediterranean daylight and audit desk framing.
  - License: Custom project asset created for Municipal Carbon Assessor game jam submission; royalty-free and open for project redistribution.
- **Dossier & Document Textures:**
  - Manila Case Dossier (`assets/Dossier.png`)
  - Thermal Activity Receipts (`assets/Receipt.png`, `assets/LongReceipt.png`)
  - Municipal Utility Invoices (`assets/Electricity_Bill.png`, `assets/Gas_Bill.png`)
  - Ledger Records (`assets/Record_Paper_with_Tables.png`, `assets/Scribbled_Handwritten_Note.png`)
  - Desk Accessories (`assets/Paperclips_and_Note.png`, `assets/Official_Seal.png`)
  - License: Custom project asset suite created for Municipal Carbon Assessor.
- **Physical Action Stamps:**
  - Approved Stamp (`assets/Approved_Stamp.png`)
  - Fine Issued Stamp (`assets/FineIssued_Stamp.png`)
  - Grant Approved Stamp (`assets/GrantApproved_Stamp.png`)
  - License: Custom project assets.
- **Climate & Infrastructure Icons:**
  - Electric Meter (`assets/Electric_Meter.png`)
  - Natural Gas Heater (`assets/NaturalGas_Heater.png`)
  - Petrol Transportation (`assets/petrol.png`)
  - Aviation Transport (`assets/plane.png`)
  - Maritime Shipping (`assets/ship_1.png`, `assets/ship_2.png`)
  - Waste Management (`assets/garbage.png`)
  - Rooftop Solar PV (`assets/RooftopSolarEnergy.png`)
  - Cool / Green Roofs (`assets/GreenRoofs.png`)
  - Electrical Local Transportation (`assets/ElectricalLocalTransportation.png`)
  - Local Sustainable Agriculture (`assets/LocalFruits.png`)
  - License: Custom project icons created for the Antalya Protocol game jam submission.

## Runtime Dependencies

The game runtime uses no npm packages, frameworks, game engines, databases, APIs, or paid services. It is built with HTML5, CSS3, and Vanilla JavaScript (ES6 modules) and runs as static files in a browser.

## Development Dependencies

Automated tests use [Vitest](https://vitest.dev/), installed as a development-only npm dependency. Vitest is distributed under the MIT License and is not bundled with or loaded by the game.

## Fonts

No font files are bundled. The design references `JetBrains Mono` and `Inter` via Google Fonts, with system font fallbacks (`Fira Code`, `Courier New`, monospace, `-apple-system`, `Segoe UI`, `sans-serif`).

## Audio

No external audio samples or media files are bundled. All sound effects (stamp impacts, paper rustles, click sounds, success chimes, error buzzes) are programmatically synthesized at runtime using the standard browser Web Audio API in `js/frontend/audio.js`.

## Emission Factors and Case Data

Emission rates in `GAME_RULES.md` are fixed gameplay benchmark values for this game. They are described as municipal assessment rates and are not official COP31, United Nations, Antalya government, or scientific emission factors.

Citizen names, districts, notes, receipts, and cases are fictional game content. Any resemblance to real individuals or households is coincidental.

## Inspiration and Names

The game is mechanically inspired by *Papers, Please* by Lucas Pope. This project is not affiliated with, endorsed by, or derived from that game's code or assets.

References to COP31, the United Nations, Antalya, or related institutions are used descriptively for the game's setting. They do not imply endorsement, partnership, or official status.

## AI-Assisted Development

This project was developed for a game jam using AI coding agents, including OpenCode and Antigravity, as part of the project workflow. Development used a free static web stack and did not require proprietary services or licensed runtime assets.

## Licensing Status

This project and its assets are created for the game jam submission. Free to inspect, test, and run locally in standard modern web browsers.
