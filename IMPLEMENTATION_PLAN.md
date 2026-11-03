# Sora delivery plan

Started 2026-11-03. An original fictional restaurant application based on the approved dark aubergine, copper and cream Sora presentation. The demo stores reservation choices locally; no real booking, email, payment or secure staff authentication occurs.

1. Foundation: supported Angular 22 / TypeScript 6 / Node 22 scaffold, semantic responsive shell, locally bundled photography/fonts, quality commands and plan. Verify build, commit and push new public repository.
2. Dining and reservation flow: category-filtered menu, dish details, local-date calendar, typed async availability states, reactive contact validation, review and simulated confirmation. Test pure rules and forms. Commit and push a working vertical slice.
3. Reservation desk: local list/calendar views, search/date/status filters, edit/cancel/reset actions, correct cover counts and slot capacity, versioned validated persistence. Verify create/edit/reload/cancel, commit and push.
4. Harden: browser journeys in Chromium/mobile/WebKit, accessibility scans and keyboard focus, reflow at 390/768/1440, visual comparison, actual screenshots, asset/license and architecture notes. Open a PR, verify CI and merge preserving milestone history.
5. Publish: GitHub Pages from passing CI; verify public direct routes, assets and a reservation journey. Report verified repository URL, public demo, commit and limitations to the parent agent for portfolio linking.

## Acceptance checks

- Menu categories filter correctly and every dish has a working detail view.
- Calendar handles past dates, Monday closure, month boundaries and a180-day booking horizon using date-only arithmetic. Test with an injected clock.
- Availability has deterministic loading, empty, failure/retry and success states. Confirmed covers consume capacity; cancellation frees it; editing excludes the current reservation.
- Typed reactive forms reject invalid party/date/contact data, move focus helpfully and prevent stale slots from confirming.
- Created reservations survive reload; malformed/blocked storage recovers safely; contact names/emails are not persisted.
- Desk counts reflect current confirmed/cancelled records and filtering. Date/time/party edits recompute availability; cancelled reservations cannot be edited.
- All main actions work on keyboard and mobile; dialogs support Escape and restore focus; no horizontal overflow.
- Lint, formatting, strict typecheck, domain/service/form tests, browser tests and production build pass locally and in CI before publication.
- Public demo is verified rather than inferred from a successful push.

## 2026-11-03 visual override

The user rejected the hotel-like split hero. Replace the layout with full-bleed atmospheric photography, a central oversized SORA wordmark, compact overlaid navigation, horizontal tasting-course discovery, a distinct restrained footer and centered restaurant booking folio. Newsreader + Public Sans are reserved for this project. Noma and SingleThread official websites are structural inspiration only; no third-party imagery or business claims are copied. Preserve verified reservation rules and all behavior while changing presentation.
