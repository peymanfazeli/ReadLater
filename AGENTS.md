# AGENTS.md

## Mission

Build «بعدابخون» (Badabekhoon): a small, polished, private, local-first Android app that lets users write messages for their future selves and unlock them at a selected date.

The MVP must prioritize:

- Privacy.
- Simplicity.
- Reliability.
- A calm and polished user experience.
- Persian-first usability with complete English support.
- Maintainable, feature-oriented architecture.

---

## Non-Negotiable Isolation Rules

1. Work only inside the `badabekhoon` project root.
2. Before every write, verify that the target path is inside the project root.
3. Do not inspect, edit, move, delete, rename, format, or reconfigure files outside the project root.
4. Never modify parent-level Gradle files, shared Gradle logic, shared scripts, global environment files, Android Studio settings, global Git configuration, or another project.
5. Do not reuse shared build files or symlink project files to locations outside the project root.
6. Keep Android signing files, local properties, credentials, and secrets out of Git.
7. Do not add a dependency without documenting its purpose, alternatives considered, compatibility, and impact.
8. Never claim a milestone is complete without running its defined checks.
9. Do not modify unrelated files or introduce broad refactors during feature work.
10. Do not execute destructive operations unless they are explicitly required, safe, and limited to the project root.

If a requirement requires an outside-root change, stop and report the blocker instead of performing the change.

---

## Working Method

- Read the relevant documentation before changing code.
- Treat `PLAN.md` as the authoritative source for milestone scope and exit checks.
- Read the complete relevant milestone section before starting implementation.
- Execute every applicable exit check before marking a milestone complete.
- Resolve failures where practical; document unresolved failures clearly.
- Make one small, coherent change at a time.
- Prefer the smallest implementation that satisfies the requirement.
- Preserve existing behavior unless the task explicitly changes it.
- Do not perform broad refactors during feature work.
- Reuse existing project patterns and dependencies when practical.
- Inspect the current project structure before introducing new files or directories.
- Keep implementation details consistent with `ARCHITECTURE.md` and `DESIGN.md`.
- Stop and report when a requirement is ambiguous, unsafe, impossible to verify, or requires an outside-root change.
- Do not repeatedly request permission for ordinary, safe implementation steps within the project root.
- Work autonomously through the planned milestones unless a real blocker, unsafe operation, missing access, missing credential, or essential product decision requires user input.

### Documentation Priority

When documents appear to conflict:

1. Apply non-negotiable safety, privacy, and project-isolation rules.
2. Follow the most specific applicable requirement.
3. Treat `PLAN.md` as the source of truth for milestone scope and exit checks.
4. Treat `ARCHITECTURE.md` as the source of truth for structural and technical boundaries.
5. Treat `DESIGN.md` as the source of truth for visual, interaction, language, and theme requirements.
6. Report unresolved conflicts rather than silently choosing a potentially unsafe interpretation.

---

## Product Constraints

- Android-first; no iOS implementation work in the MVP.
- The architecture must not unnecessarily block future iOS support.
- Persian RTL UI from the beginning.
- English LTR support from the beginning.
- Language selection must persist across app restarts.
- Light and dark themes must be supported.
- Theme selection must persist across app restarts.
- Theme switching must support the specified circular reveal or documented graceful fallback.
- Offline-first; user messages remain on-device.
- Text messages only in the MVP; attachments are deferred.
- Do not expose locked message content before `unlockAt`.
- Use local Android notifications.
- Notification payloads must not contain locked message bodies.
- Navigation triggered by notifications must use message IDs rather than sensitive message content.
- Do not claim tamper-proof scheduling because device clocks can be manipulated.

The MVP must not include:

- Login.
- User accounts.
- Authentication.
- Backend services.
- Cloud synchronization.
- Email delivery.
- Social feeds.
- Chat.
- Public profiles.
- AI-generated content.
- Advertising.
- Analytics.
- Gamification.
- Recurring schedules.
- Multi-device synchronization.
- Cloud backup.
- Attachments.

Do not introduce infrastructure for deferred features unless it is strictly required by the current MVP and the rationale is documented.

---

## Quality Rules

- Use TypeScript strictness where practical.
- Keep business rules outside screen components.
- Make domain rules testable without React Native UI.
- Isolate native integrations behind adapters.
- Validate all user-controlled input.
- Validate title and body independently.
- Trim leading and trailing whitespace according to documented domain rules.
- Enforce the defined title and body length limits.
- Handle past dates and invalid date/time input.
- Handle device time changes as a documented limitation.
- Handle app restarts and persisted data safely.
- Handle notification permission denial.
- Prevent duplicate notification scheduling.
- Handle missing, malformed, deleted, and inaccessible messages safely.
- Provide empty, loading, success, and error states.
- Avoid unnecessary global state.
- Avoid exposing private content through logs, errors, notifications, accessibility labels, previews, or fallback UI.
- Use accessible labels and sufficient color contrast.
- Support appropriate touch targets and readable text sizes.
- Support Persian RTL and English LTR layouts.
- Keep user-facing Persian copy natural, contemporary, and concise.
- Manage all user-facing strings through the i18n system.
- Use centralized theme tokens instead of hardcoded theme-dependent values.
- Preserve form state, navigation state, and user data during language or theme changes where applicable.

---

## Privacy and Locked Content

Locked message bodies are private until their unlock time.

Before accessing or displaying a message body:

- Revalidate the current lock state.
- Confirm that the current time is at or after `unlockAt`.
- Do not rely solely on stale persisted status.
- Do not expose the body through UI previews.
- Do not include the body in notification content.
- Do not include the body in logs or debugging output.
- Do not include the body in error messages.
- Do not include the body in navigation parameters.
- Do not expose the body through accessibility labels or hints.
- Do not expose the body through test fixtures or snapshots unless the test explicitly requires controlled content and does not represent a production exposure path.

Titles and metadata may be displayed for locked messages only when consistent with the documented privacy requirements.

---

## Dependency Policy

Before adding a package, document:

- Why it is needed.
- Which requirement it solves.
- Why platform APIs or existing dependencies are insufficient.
- Alternatives considered.
- Maintenance impact.
- Bundle-size impact.
- Android compatibility.
- React Native compatibility.
- Potential future iOS impact.
- Required native configuration or build changes.
- Whether the functionality can be implemented more simply without the dependency.

Avoid adding dependencies for functionality that can be implemented reliably using existing project dependencies or platform APIs.

Do not add dependencies solely for speculative future features.

---

## Project and Build Safety

All implementation changes must remain inside the project root.

Do not modify:

- Files outside the project root.
- Parent-level Gradle files.
- Shared Gradle configuration or build logic.
- Shared scripts.
- Global environment files.
- Android Studio settings.
- Global Gradle, Java, Node, Git, or shell configuration.
- Other projects.
- Shared configuration used by unrelated projects.
- Credentials, signing keys, or secrets.

Before writing any file:

1. Resolve and verify the project root.
2. Resolve and verify the target path.
3. Confirm that the target path is inside the project root.
4. Confirm that the change is within the requested scope.

Keep the following out of Git:

- `local.properties`.
- Keystores and signing files.
- Credentials.
- API keys.
- Environment secrets.
- Machine-specific configuration.
- Generated build artifacts when excluded by the project configuration.

Do not claim that a build or test passed unless it was actually executed and its result was checked.

---

## Module README Rule

Every completed feature or module directory must contain a local `README.md` explaining:

- Responsibility.
- Public interfaces.
- Data flow.
- Dependencies.
- Test strategy.
- Known limitations.
- Important implementation decisions where applicable.

Update the relevant module README when its responsibilities, interfaces, dependencies, data flow, or testing strategy change.

Do not create documentation that merely duplicates existing content without adding useful module-specific information.

---

## Testing and Verification

Run checks relevant to the changed scope.

Depending on the milestone, checks may include:

- TypeScript typecheck.
- Lint.
- Unit tests.
- Integration tests.
- UI tests.
- Android debug build.
- Android release build where applicable.
- Installation and launch verification.
- RTL and LTR verification.
- Light and dark theme verification.
- Persistence across app restart.
- Notification scheduling and cancellation verification.
- Locked-content privacy verification.

When a check cannot be run:

- State the reason.
- Identify the missing prerequisite or limitation.
- Do not describe the check as passed.
- Explain any remaining risk.

Tests must cover privacy-sensitive and business-critical behavior, including:

- Validation.
- Unlock-date rules.
- Locked/unlocked status derivation.
- Persistence.
- App restart behavior.
- Notification scheduling.
- Notification permission denial.
- Duplicate prevention.
- Language and layout direction.
- Theme persistence.
- Theme transition behavior where practical.

---

## Working With Milestones

Before starting a milestone:

1. Read the relevant section in `PLAN.md`.
2. Review applicable requirements in `ARCHITECTURE.md` and `DESIGN.md`.
3. Inspect the existing implementation.
4. Identify the smallest coherent implementation scope.
5. Check whether new dependencies are necessary.
6. Confirm that all planned changes remain inside the project root.

Before marking a milestone complete:

1. Execute every defined exit check in `PLAN.md`.
2. Run relevant typecheck, lint, and test commands.
3. Verify the affected UI states and layouts.
4. Verify RTL/LTR behavior where applicable.
5. Verify privacy requirements.
6. Verify persistence and restart behavior where applicable.
7. Confirm that no out-of-root files were changed.
8. Update applicable module documentation.
9. Document limitations and unresolved risks.
10. Provide a clear milestone report.

---

## Milestone Report Format

After each milestone, report:

### Summary

- What was implemented.
- Which requirements were addressed.

### Changed Files

- Added files.
- Modified files.
- Removed files, if any, with justification.

### Dependencies

- Added dependencies, if any.
- Rationale and alternatives considered.
- Compatibility and maintenance impact.

### Checks and Results

- Commands executed.
- Results.
- Failed or skipped checks and reasons.

### Privacy and Safety Review

- Relevant locked-content protections.
- Confirmation that changes remained inside the project root.
- Any remaining security or privacy limitations.

### Limitations and Risks

- Known limitations.
- Platform-specific behavior.
- Unresolved issues.

### Next Task

- The next planned milestone or required follow-up.

Do not report a milestone as complete if required checks have not passed or unresolved blockers remain undocumented.

---

## Definition of Done

A task is done only when:

- Implementation is limited to the requested scope.
- Relevant documentation has been read.
- The implementation follows the applicable architecture and design requirements.
- Typecheck, lint, and relevant tests pass, or failures are documented.
- Required build checks are executed where applicable.
- RTL and LTR behavior are considered where applicable.
- Light and dark themes are considered where applicable.
- Key empty, loading, success, and error states are considered.
- Locked message content remains private.
- User-controlled input is validated.
- No out-of-root files were changed.
- No global or shared configuration was modified.
- No unnecessary dependency was introduced.
- Module README is updated when applicable.
- Privacy, accessibility, and platform limitations are documented.
- The final report clearly lists changed files, checks, results, limitations, and the next task.