# Sora

An original fictional restaurant experience, built with Angular22, strict TypeScript, standalone components and native CSS. Started November2026.

This repository is being delivered in verified milestones. The seasonal menu, visual foundation and date/capacity/storage rules are implemented. The reservation journey and local demo desk are in progress; no public demo is claimed yet.

## Run locally

Use Node22.23.1 and npm10.9.8.

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
npm run preview
```

The production preview serves `http://127.0.0.1:4180/sora-angular/`. Hash-based application routes work under static GitHub Pages hosting.

All restaurant content and reservations are fictional. No email, payment or real reservation service is connected. Original code is MIT; photography and font provenance are in [ASSETS.md](ASSETS.md). The delivery acceptance checks are in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
