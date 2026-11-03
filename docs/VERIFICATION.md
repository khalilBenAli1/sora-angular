# Release verification

Verified 2026-11-03 against the production build.

- 48 unit/service/form tests pass, including independent invalid-field checks on complete stored records.
- 30 browser journeys pass across desktop Chromium, mobile Chromium and WebKit.
- Complete create → edit → reload → cancel flow verifies that cancellation releases seating capacity.
- Menu rail, dish modal, mobile navigation and cancellation support keyboard use and focus restoration, including rapid Escape/reopen.
- Closed Mondays, fully booked dates, loading, connection failure and retry work through the real fixture adapter.
- Native date entry rejects past and out-of-horizon dates without crashing; calendar month boundaries are exercised.
- 100-character valid names and long valid email addresses wrap in review and confirmation without page overflow.
- Reflow uses `documentElement.clientWidth` as the reference at 390,768 and1440 pixels, avoiding mobile visual-viewport expansion false passes.
- Critical menu names/prices, calendar text and reservation controls were manually stressed at 200% font size at 390px; no page overflow was observed. This is a focused text stress check, not a blanket accessibility certification.
- Automated WCAG A/AA scans on home, reservations, desk, story and visit routes report no findings; no page runtime errors were recorded.
- Lint, formatting, strict TypeScript, production build and a real clean `npm ci` pass. Dependency audit: 0 findings at verification time.

Actual desktop/mobile screenshots are in `docs/screenshots`. Each was captured in a fresh browser context after the route-specific heading, fonts, imagery and availability were ready. Build payload measurements are in `BUILD_EVIDENCE.json`.

Public GitHub Pages deployment verified: https://khalilbenali1.github.io/sora-angular/ . Anonymous HTTP200, direct routes and the deployed create/edit/reload/cancel journey passed, alongside deployed route accessibility/runtime checks. Release CI and deployment: https://github.com/khalilBenAli1/sora-angular/actions/runs/41570751917 . No performance score or accessibility certification is claimed.

## Supported email punctuation correction

Negative regressions first reproduced `alex<smith>@example.com` and `alex,smith@example.com` passing the pure predicate and advancing the reactive contact form. A supported unquoted character guard now rejects them while preserving trim behavior, raw length limits, international names and simulation acknowledgement. Valid plus/dot and apostrophe addresses remain accepted. No DNS, deliverability or full-RFC claim is made.

All 48 unit/service/form tests and all 30 existing browser journeys passed locally, along with lint, formatting, strict TypeScript and the production build. The change is limited to contact validation and its tests; UI, styling, fields, stores, pricing, assets, dependencies and workflow configuration are unchanged.
