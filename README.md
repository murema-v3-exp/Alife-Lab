# ALIFE Lab

A static React + TypeScript + Vite + Tailwind study laboratory for UCT CSC4044Z, exam 5 November 2026. All source PDFs remain untouched outside this directory. Nothing has been pushed or deployed.

## Run locally

Node 22+ recommended.

```sh
cd alife-lab
npm ci
npm run dev
```

Open http://127.0.0.1:5173/Alife-Lab/ (or the address printed by Vite if the port is occupied).

```sh
npm run typecheck
npm test
npm run build
```

`dist/` is the complete static website. Runtime needs no backend, API key, account, external fonts or services. Hash navigation works on GitHub Pages without server rewrites.

## Functional features

- Responsive navy/cream/lime dashboard; actual progress, recommended next lesson, topic mastery and transparent review scheduling.
- 12 source-referenced lessons (1–11 plus bonus Lecture 12), active recall prompts and saved prediction drafts.
- 60 questions: multiple choice, multiple select, true/false, fill, matching, numerical and written responses. Hints, retries, confidence, marking feedback and source metadata.
- Dedicated Lecturer exam hint lesson and calculations, with selection intensity, diversity loss, normalised selected fitness variance and sampling assumptions.
- Written answers with original model answers, per-point self-assessment, typical mistakes and rubrics. No automatic prose grading.
- Timed practice with navigation, answer counts and review. Built-in mock-inspired paper or imported personal bank; choice of 30/60/120 minutes. Timer continues between app routes; refresh ends a timed session.
- Game of Life with editable cells, patterns, step and run; Schelling with similarity control; Boids steering sliders; selection probability and random parent sampling experiment. Each includes a prediction and mechanism explanation.
- localStorage progress, writing drafts, earned XP and activity badges. JSON export/import. Incorrect or low-confidence answers feed weak spots.
- In-app source audit plus [full audit](CONTENT_AUDIT.md), source inventory and question counts by topic.

## GitHub Pages

Vite defaults to `base: '/Alife-Lab/'`, matching the repository named **Alife-Lab**. The future address is `https://murema-v3-exp.github.io/Alife-Lab/`. Every app screen uses a hash URL such as `/Alife-Lab/#quiz`: navigation, bookmarks and refreshes request the same real `index.html`, so no server rewrites or custom 404 fallback are needed. Do not use pathname URLs such as `/Alife-Lab/quiz`.

The prepared workflow is [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It runs on pushes to `main` or a manual Actions run, installs locked dependencies with Node 22, checks types, runs unit tests, builds using the actual repository name for the Pages base, uploads only `dist/`, then deploys through the GitHub Pages environment. It follows the [GitHub Pages custom workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite deployment guidance](https://vite.dev/guide/static-deploy#github-pages).

When you choose to publish:

1. Use the **contents of this `alife-lab/` directory as the root** of a repository named `Alife-Lab`, including the hidden `.github/` directory. `package.json`, `package-lock.json` and `.github/` must be at the repository root. Keep the parent course/PDF directory outside the repository.
2. In repository **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. Push to `main` when ready. The prepared workflow will then build and deploy automatically. You can also run it manually in Actions.

No repository was created, no remote settings were changed, no workflow was run on GitHub, and nothing has been pushed or deployed. The workflow cannot run until you publish the files to GitHub.

To inspect the production build locally:

```sh
npm run build
npm run preview
```

Open http://127.0.0.1:4173/Alife-Lab/. `BASE_PATH` remains available for intentionally different hosting paths; for this repository, leave the default unchanged. Never publish the parent course directory or raw assessment material.

## Mobile and home screen

Mobile layouts include an accessible expandable study menu, 44px or larger standard controls, readable 16px answer fields (avoiding iOS input zoom), generous quiz option rows, multiline written inputs and safe-area padding. The Game of Life has a scrollable editor with 44px cells and an entire-grid overview toggle. Inputs support keyboard navigation and reduced-motion preferences remain respected.

The web manifest, SVG/PNG favicons, 180px Apple touch icon, 192px/512px app icons, maskable icon and Apple mobile metadata are included. Use your browser’s **Add to Home Screen** option on the hosted HTTPS site where supported. This supplies a standalone launch experience; offline caching is not implemented or claimed. PNG assets are committed build inputs, so the workflow does not need a browser to generate them. The optional `scripts/generate-icons.mjs` regenerates them from the vector brand mark.

Progress stays in localStorage on each browser/origin; it is not automatically synced. To move to another device or from localhost to Pages, export the JSON in **Study menu → Progress & imports**, transfer the file, and import it in the destination browser. This includes written drafts. Import replaces destination progress; personal bank files are transferred separately.

## Personal mock bank

Go to **Progress & imports**, download the schema example, replace it with your questions, then import the JSON array. Use stable IDs beginning `personal-`. Import replaces the existing personal bank and validates shape before storing. All personal data stays in this browser; clearing site data removes it. Imported questions appear in Practice/Written answers and are selectable in Exam studio. Raw assessment content must remain outside version control (use the ignored `private/` directory).

Fields: `id`, `lecture` (1–12), `topic`, `type`, `text`, `answer`, `explanation`, `source: {file,page}`, `category`, `marks`, `difficulty`, `options`, `hint`, `rubric`, `mistakes`. Use a number for numerical answers, arrays for matching/multiselect, and text for other types. Matching `options` are left-hand prompts; `answer` supplies right-hand targets in corresponding order. Written answers use a string model and an array of marking points. The timed paper accepts plain text: use `|` separators for matching/multiple-select answers.

Progress export includes attempts, confidence, review dates, completed lessons and drafts. Personal questions are separate: keep a copy of your imported bank JSON. Import progress replaces progress, never the bank.

## Marking and review rules

Objective answers compare exact option identities; fill-in trims whitespace and ignores case. Numeric tolerance is the larger of 0.001 absolute or 0.1% relative error. Decimal fractions are expected when asked for probabilities; percentages only when explicitly requested. Written rubrics use equally weighted marking points and self-assessed fractions, not claimed official grades.

Latest score ≥80% counts as demonstrated recall. Incorrect answers are due immediately; low/medium-confidence correct answers in one day; high-confidence successes in 1, 2, 4, 8 then 14 days based on previous successful attempts. No progress is pre-populated. XP is 10 × recorded score, including practice repeats; badges reflect actual activity. Lesson exploration is self-reported, separate from quiz mastery.

## Checks and architecture

`src/content.json` is the maintainable lesson/question bank. `src/engine.ts` contains marking, storage validation, review dates and pure simulation functions; `engine.test.ts` covers those behaviours. `main.tsx` owns screens/state, `simulations.tsx` implements experiments and `style.css` supplies Tailwind plus custom design. Browser smoke checks are in `scripts/browser-check.mjs`; they use local Google Chrome on macOS. Set its executable path for other machines before running `node scripts/browser-check.mjs`, with the dev server already running at `/Alife-Lab/`. `node scripts/pages-check.mjs` instead starts its own strict local static server over `dist/` and tests production subpath assets, hash refreshes, mobile controls and cross-browser-context JSON transfer. Screenshots are written to `/tmp/`, not the publishing artifact.

See CONTENT_AUDIT.md for source-specific flags and selective coverage limits. Exact mock text, source PDFs and extracted transcripts are not in dist or the application source.
