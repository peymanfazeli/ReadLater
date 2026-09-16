# PROMPT_BIG_PICKLE.md

You are building the full MVP of «بعدابخون» (Badabekhoon) — a small, polished, private, local-first Android app where a user writes a message for their future self and unlocks it at a chosen date.

## Workspace

- **Project root:** The directory containing this file. All work happens here. Nothing outside it.
- Resolve and confirm the absolute path before any write. Verify every target path is inside the root.
- Never modify parent directories, shared Gradle files, global configs, or other projects.
- Keep `android/local.properties`, keystores, and signing secrets out of version control.

## Reading order

Before writing any code, read these files in order — they are the source of truth:

1. `AGENTS.md` — isolation rules and quality standards
2. `PLAN.md` — milestone sequence and exit checks (follow strictly)
3. `ARCHITECTURE.md` — structure, domain model, rules, dependency policy
4. `DESIGN.md` — palette, UI rules, screens, copy style
5. `SETUP.md` — environment and safety checks
6. `BUILD_RELEASE.md` — release checklist and store requirements
7. `docs/decisions/README.md` — how to record decisions
8. `docs/testing/README.md` — minimum test coverage expectations
9. `src/features/messages/README.md` — messages feature scope

## Environment

- Node.js 18.x, npm (primary package manager)
- Java/JDK 17, Android SDK (platforms 28–36)
- Git 2.47
- React Native CLI 0.77.x (latest stable in the 0.77 line)
- Init the project **in-place** inside this directory using `npx @react-native-community/cli init` with the appropriate template. The existing documentation files must remain untouched.
- Do not install watchman. Metro works without it.
- Do not install CocoaPods or configure iOS — Android-only scope.

## Non-negotiable rules

1. **Privacy first.** Never expose message body in logs, notifications, UI state, or error messages before unlock. Never write message content to console, debug output, or crash reports.
2. **Locked means locked.** Derive message status from `unlockAt` at read time. Never trust persisted status. Never render body content for a locked message.
3. **No features outside scope.** Excluded: authentication, backend, cloud sync, social, chat, AI, ads, analytics, gamification, recurring messages, attachments, multi-device sync, dark mode (deferred).
4. **Document every dependency.** Before adding a package: state why it's needed, why platform APIs are insufficient, maintenance impact, and Android compatibility.
5. **RTL from the start.** Persian text, RTL layout, right-to-left navigation, localized date formatting.
6. **Module READMEs.** Every completed feature/module directory gets a README.md covering responsibility, public interfaces, data flow, dependencies, test strategy, known limitations.
7. **Small changes.** One coherent change at a time. No broad refactors during feature work.
8. **No claims without evidence.** Do not say a milestone is complete without running its exit checks and reporting results.

## Milestone sequence

Follow `PLAN.md` strictly. One milestone at a time. Do not begin the next until the current one's exit checks pass.

### Milestone 0 — Safe foundation
- Initialize React Native CLI project in-place (0.77.x, TypeScript template)
- Confirm Node, Java, SDK, Gradle versions
- Run default Android debug build — it must succeed
- Add lint, typecheck, test baseline commands to package.json
- Add `.gitignore`, protect secrets
- Record exact versions and commands in README.md
- **Do not add product features yet**

### Milestone 1 — Design system and static shell
- Theme tokens (palette from DESIGN.md), typography, spacing, radii, shadows
- RTL setup (I18nManager, RTL-aware components)
- Navigation (React Navigation or equivalent)
- Static screens: Home, Create Message, Reveal Message
- Reusable primitives (Button, Card, TextInput, etc.)
- Empty, loading, error states
- Module READMEs

### Milestone 2 — Message persistence
- Local storage adapter (SQLite via react-native-sqlite-storage, or AsyncStorage — choose simplest that works)
- CRUD operations following ARCHITECTURE.md domain model
- Validation: trim whitespace, reject empty, enforce 5000 char max, reject past `unlockAt`
- Locked content inaccessible through UI and domain APIs
- ID generation (use `expo-crypto` or `uuid` — smallest vetted solution)
- Timestamps stored as ISO-8601 UTC
- Persistence survives app restart
- Unit tests for validation and locked/unlocked rules

### Milestone 3 — Unlock date/time rules
- Date/time picker (native Android picker preferred over JS libs)
- Validation: `unlockAt` must be in the future
- Predefined periods (e.g., 1 month, 6 months, 1 year) plus custom selection
- Timezone handling: store UTC, display localized
- Edge cases: device clock changes, timezone changes
- Persian date formatting at presentation boundary

### Milestone 4 — Local notifications
- Android local notification adapter (react-native-push-notification or notifee)
- Request permission only when scheduling
- Schedule, cancel, reconcile on app restart
- Deep-link: notification opens correct message
- Permission denied state handled gracefully
- No message content in notification title/body
- Duplicate scheduling prevention

### Milestone 5 — Release readiness
- App icon, label (بعدابخون), versioning (semver)
- Release build configuration and signing setup
- Privacy copy (Persian)
- Store listing draft for Cafe Bazaar and Myket
- Test on representative Android versions (API 28+) and screen sizes
- Verify no debug logging or secrets in release
- Signed release artifact

## Core user flow

```
Home → Create Message → Select Unlock Date/Time → Confirm/Save →
Locked Message List → [Notification fires] → Reveal Message
```

## Reporting

After each milestone, report:
1. Summary of work done
2. Files changed (list)
3. Dependencies added and rationale
4. Commands/checks run
5. Pass/fail results
6. Known limitations and risks
7. Next smallest proposed task

## Blocking rules

Stop and ask a focused question only if:
- A blocker prevents safe progress (e.g., build failure you cannot diagnose)
- A requirement is ambiguous and two valid interpretations exist
- An operation would require changes outside the project root

Otherwise, proceed autonomously. Document assumptions and continue.

## First task

Read the files listed in reading order above. Then perform Milestone 0 only. Do not add features. Do not skip version checks. Report results before proceeding.
