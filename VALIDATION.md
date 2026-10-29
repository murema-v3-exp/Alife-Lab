# Validation

Verified locally on 28 October 2026:

- TypeScript type checking and Vite production build pass.
- Nine Vitest tests pass: objective marking, blanks/nonfinite numbers, decimal tolerance, exact multiple selection, matching order, review scheduling/JSON round trip, invalid imports, Game of Life stepping, tournament probability normalisation, source/ID/lecture coverage (some tests combine related assertions).
- Chromium browser smoke checks pass at desktop 1440×1100 and mobile 390×844: known routes render, no horizontal document overflow or uncaught page errors, lesson completion, quiz attempts and reload persistence, written rubric saving, timed answer navigation/review, four simulation tabs and stepping/sampling.
- Additional browser checks pass: numerical zero submitted with Enter, multiple select, matching, private-bank import and reload persistence, private-bank timed review.
- Desktop and mobile screenshots visually inspected; QA images are in /tmp and excluded from deployment.
- npm audit reports zero vulnerabilities with the installed lockfile.
- SHA-256 checks confirm all 21 original PDFs unchanged. Production output contains no PDFs.

The browser scripts require a running local Vite server and macOS Google Chrome. No deployment or GitHub changes were performed. Validation is not a claim of exhaustive academic coverage or an official assessment memo.

## GitHub Pages and mobile follow-up

The default Vite base is `/alife-lab/`. Production checks serve only real files under that prefix (no SPA fallback) and verify every screen after a full refresh at 320, 390, 768 and 1440 pixels. All manifest/icon requests resolve under the repository prefix. A touch-enabled browser verifies 44px controls and editable cells, 16px written input text, saved drafts after refresh, and actual JSON download/import into an independent browser context with matching localStorage state. The mobile quiz screenshot was visually inspected.

The Pages workflow is prepared inside `alife-lab/.github/workflows/` for publishing the application's contents as the repository root. Its type checks/unit tests/build were run locally; the hosted GitHub Actions execution has intentionally not been triggered. Native iOS/Android Add to Home Screen was not exercised on physical hardware; icons, manifest scope/start URL and Apple metadata were verified locally.
