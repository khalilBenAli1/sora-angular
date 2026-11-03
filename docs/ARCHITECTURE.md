# How the app fits together

Sora is an original fictional restaurant and a browser-local reservation simulation. Angular 22 standalone route components compose focused features; native CSS, Newsreader and Public Sans establish the visual identity. The client-only/static architecture deliberately needs no server, API key, account or paid service.

## State and boundaries

- `pages/` compose navigation, editorial content and feature surfaces. Menu selection/rail position, desk filters, view mode and open dialogs are temporary local UI state.
- `features/reservation/` contains seating, contact, review and confirmation components. `ReservationFlow` is scoped to the reservation route. Typed reactive forms, validation feedback, async availability and step transitions live there rather than in page markup. Contact details disappear on completion or when the route is destroyed.
- `state/ReservationStore` is the small shared source of reservation records. Signals expose source state; computed values derive confirmed tables, covers and cancellations. Booking and editing validate capacity against current records. Edits exclude their own reservation ID; cancelled records release places.
- `domain/` contains framework-independent date-only, availability, validation, filter and calendar-count rules. Date strings use UTC arithmetic for calendar operations; an injected clock supplies the local date. No domain function reads browser storage or the DOM.
- `adapters/reservation-storage` is the only persistence boundary. The version 1 schema validates complete records, identifiers, dates, times, party bounds, status and synthetic guest labels. Unknown versions, malformed/oversized data and denied storage recover safely. Writes allowlist fields. Real contact names, email addresses and payment data are never persisted.
- `services/AvailabilityService` is a typed deterministic asynchronous fixture adapter. Its short timer represents loading, not a remote request. The UI handles empty/error/retry states. The app sends no reservation, email or SMS requests.
- `features/desk/` separates list, calendar and editor responsibilities. The management route is explicitly demo access. Its guest labels are fictional fixtures or generated `Sora guest N` labels, not authentication or real customer records.

The confirmation is a snapshot of the completed choice. It does not derive from a mutable live form or from later desk edits/reset. Restart clears that snapshot and contact form so an old reference cannot reappear.

## Availability model

There are six independent illustrative seatings,18:00–20:30, with 12 places each. This is a capacity demonstration, not physical table assignment or a model of overlapping dining durations. Parties are 1–6 guests and the booking horizon is 180 days. Mondays are closed. The 17th of each month demonstrates a fully booked evening. The 13th demonstrates an initial connection failure; **Try again** returns the fixture result. These states are deterministic and documented for repeatable testing.

## Static routes and delivery

Angular Router uses hash location so direct links and refresh work under `/sora-angular/` on GitHub Pages without a rewrite server. Feature routes are lazy loaded. Unknown application routes have a deliberate404 screen; a standalone404 is also shipped. Original imagery is delivered in responsive WebP variants; Latin WOFF2 fonts are self-hosted with complete license notices.

The tracked `.npmrc` sets `legacy-peer-deps=false`. This makes local and CI resolution agree even when a user-level npm configuration enables legacy peer handling. The committed lock includes compatible 1.x and nested 2.x WebAssembly helpers, without forcing an incompatible global override. A narrow minimatch 11.0.1 development override incorporates the advisory-patched version while ESLint's dependency ranges catch up.

## Verification

Unit/service/form tests exercise date boundaries and DST, capacity, edits/cancellation, contacts, state snapshots, derived views, persistence recovery and individual invalid fields in otherwise valid records. Playwright verifies the complete reservation and desk journeys in desktop Chromium, mobile Chromium and WebKit, plus keyboard focus, async failures, direct routes, long contact values, reflow and automated WCAG A/AA scans. Automated scans are supporting evidence, not accessibility certification.

macOS WebKit uses Safari's Option-Tab convention for full keyboard navigation in the rail test; other environments use Tab. See Apple's [Safari keyboard reference](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac).
