# Sora

Independent original restaurant portfolio application. Preserve other repositories and collaborators' changes.

- Node 22.23.1 / npm 10.9.8; `npm ci` installs the lockfile.
- Angular 22, strict TypeScript, standalone components, reactive forms and signal state. Native CSS; no backend or external API keys.
- Commands: `npm run dev`, `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`, `npm run preview`.
- Domain rules and storage accept only validated date-only values and reservation records. Guest contact details stay in memory; only synthetic guest labels are persisted.
- Hash routing and `/sora-angular/` base support static GitHub Pages deep links.
- Keep reservation and management actions real within the local simulation. Never claim real authentication, booking, payment, or email delivery.
- Add focused tests for availability, form validation, storage and state transitions. Respect keyboard focus, reduced motion, contrast and responsive reflow.
- Commit and push verified milestones using intent-first Lore messages. Never force-push or invent dates/results.
