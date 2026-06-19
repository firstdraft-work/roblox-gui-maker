# CI and Browser Regression Design

## Goal

Make every pull request and push to `main` prove the editor still compiles and its critical workflow works in Chromium. Run the slower end-to-end workflow on a schedule and on demand.

## Current State

- Vitest covers the pure scene, persistence, RemoteEvent, Teleport, geometry, server generation, and action-field rendering logic.
- TypeScript and production builds are run manually.
- Browser verification has been performed through temporary Playwright CLI sessions, but no browser suite is stored in the repository.
- The repository has no GitHub Actions workflows.
- Live Roblox validation is blocked because this machine has no Roblox Studio/client, published test experience, Place ID, or Roblox automation tooling.

## Scope

### Included

- GitHub Actions for pull requests and pushes to `main`.
- A Chromium smoke suite for the critical editor path.
- A scheduled and manually triggered full Chromium suite.
- Playwright traces and screenshots retained on failure.
- Local npm scripts for both browser suites.
- A manual Roblox validation checklist that records the prerequisites and evidence needed to close the current live-runtime gap.

### Excluded

- Installing or authenticating Roblox Studio.
- Creating or publishing a Roblox experience.
- Managing Roblox credentials, API keys, or Place IDs in GitHub Actions.
- Cross-browser testing beyond Chromium.
- Deployment, Vercel configuration, branch-protection changes, or automatic rollback.
- `.rbxmx` export or Studio plugin work.

## Test Layers

### Quality Gate

The main CI workflow runs these commands in order:

1. `npm ci`
2. `npm test`
3. `npx tsc --noEmit`
4. `npm run build`
5. Install Playwright Chromium and its Linux dependencies.
6. `npm run test:e2e:smoke`

The workflow uses one Ubuntu job and Node.js 22. A single job keeps dependency installation and the production build reusable by the smoke suite. GitHub concurrency cancels superseded runs for the same branch or pull request.

### Smoke Suite

The smoke suite uses the production build through Playwright's `webServer` support. It verifies:

- `/editor` loads at a 1280px desktop viewport without console errors or horizontal overflow.
- The initial client Luau output is visible.
- A selected `TextButton` can be changed to a Teleport action.
- A valid Place ID appears in client and server Luau.
- An invalid draft remains visible while generated output keeps the last valid Place ID.
- Preview displays the non-live Teleport notice.

The smoke suite must avoid downloading files or mutating repository files.

### Full Suite

The full suite runs daily and through `workflow_dispatch`. It covers:

- Teleport valid and invalid drafts.
- Undo and redo.
- Preview without scene mutation.
- localStorage restoration after reload.
- JSON export, mutation, and re-import.
- Client and server Luau downloads and content assertions.
- A custom `TeleportRequest` RemoteEvent coexisting with the generated `RGM/TeleportRequest` channel.
- No console errors and no 1280px horizontal overflow.

Each test starts from cleared browser storage and owns its downloaded files through Playwright's temporary download directory.

## Playwright Configuration

`playwright.config.ts` defines:

- `testDir: "./e2e"`
- Chromium-only projects.
- A 1280x900 default viewport.
- `baseURL` pointing to `http://127.0.0.1:3199`.
- A production `npm run start` web server on port 3199.
- No local server reuse in CI; reuse is allowed locally.
- `trace: "retain-on-failure"`, `screenshot: "only-on-failure"`, and `video: "retain-on-failure"`.
- A line reporter locally and GitHub reporter in Actions.
- Test artifacts under `test-results/`, ignored by Git.

Tests are tagged `@smoke` or `@full`. The npm scripts filter by tag so shared helper code does not need duplicate configuration.

## GitHub Workflows

### `ci.yml`

Triggers:

- `pull_request`
- pushes to `main`
- `workflow_dispatch`

It runs the quality gate and smoke suite. Failure artifacts are uploaded from `test-results/` with a short retention period.

### `e2e-full.yml`

Triggers:

- one daily UTC schedule
- `workflow_dispatch`

It installs dependencies, builds the application, installs Chromium, and runs `npm run test:e2e:full`. Failure artifacts use the same retention policy.

## Failure Handling

- Unit, type, or build failure prevents browser setup and execution.
- Playwright starts and stops the production server; tests never assume an existing local process.
- Console errors fail the relevant browser test. The known third-party badge preload warning is not treated as an error.
- Failed browser tests retain trace, screenshot, and video artifacts in CI.
- Workflow permissions stay read-only; no secrets are required.

## Roblox Live Validation Checklist

Add `docs/roblox-live-validation.md` with an explicitly incomplete checklist:

- Install and authenticate Roblox Studio/client.
- Provide a published source experience and destination Place ID owned by the tester.
- Paste the generated client script into a `LocalScript` and server script into `ServerScriptService`.
- Verify a configured RemoteEvent reaches only its expected handler.
- Verify allowed Teleport requests move the player in the Roblox client.
- Verify unlisted Place IDs are rejected and failed Teleports produce server warnings.
- Record the experience IDs, test date, generated commit, and observed results without committing credentials.

The document must not claim live validation passed until evidence is recorded.

## Acceptance Criteria

1. `npm test`, `npx tsc --noEmit`, and `npm run build` still pass locally.
2. `npm run test:e2e:smoke` passes against a production server.
3. `npm run test:e2e:full` passes and validates downloaded content.
4. CI is triggered only for pull requests, pushes to `main`, and manual requests.
5. Full E2E is triggered daily and manually, not on every pull request.
6. Browser failures upload Playwright artifacts.
7. Workflow permissions are read-only and require no secrets.
8. Generated test artifacts do not appear in `git status`.
9. The Roblox checklist truthfully remains incomplete until a published-client test is performed.

