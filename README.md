# ntspire

ntspire is a frontend-only, mock-data MVP for a visual design reference
library. The Next.js application is created in `frontend/`; `backend/` is
reserved for a future API and must not be modified during the phased frontend
build.

## Status

The repository follows the ordered implementation prompts in `docs/prompts/`.
Only the approved current phase may be implemented. The application remains
English and LTR through Phase 10; Arabic UI, the `ar` locale, and RTL rendering
are intentionally deferred to Phase 11.

## Planned local workflow

After Phase 01 establishes the frontend, run commands from `frontend/`:

```powershell
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

The project must work without external runtime assets or APIs. Mock assets are
local and deterministic.
