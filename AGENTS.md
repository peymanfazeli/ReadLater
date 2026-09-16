# AGENTS.md

## Mission
Build «بعدابخون»: a small, polished, private, local-first Android app that lets a user write a message for their future self and unlock it at a selected date.

## Non-negotiable isolation rules
1. Work only inside the `badabekhoon` project root.
2. Before every write, verify that the target path is inside the project root.
3. Do not inspect, edit, move, delete, rename, format, or reconfigure files outside the project root.
4. Never modify parent-level Gradle files, shared Gradle logic, shared scripts, global environment files, Android Studio settings, global Git configuration, or another project.
5. Do not reuse shared build files or symlink project files to locations outside the root.
6. Keep Android signing files, local properties, and secrets out of Git.
7. Do not add a dependency without documenting its purpose, alternatives considered, and impact.
8. Never claim a milestone is complete without running its defined checks.

## Working method
- Read the relevant documentation before changing code.
- Make one small, coherent change at a time.
- Prefer the smallest implementation that satisfies the requirement.
- Preserve existing behavior unless the task explicitly changes it.
- Do not perform broad refactors during feature work.
- Stop and report when a requirement is ambiguous, unsafe, or requires an outside-root change.
- After each milestone, report changed files, checks run, results, and remaining risks.

## Product constraints
- Android-first; no iOS implementation work in MVP.
- Persian RTL UI from the beginning.
- Offline-first; user messages remain on-device.
- No login, account, social feed, chat, public profile, AI-generated content, ads, analytics, gamification, recurring schedules, or cloud sync in MVP.
- Text messages only in MVP; attachments are deferred.
- Do not expose locked message content before `unlockAt`.

## Quality rules
- Use TypeScript strictness where practical.
- Keep business rules outside screen components.
- Validate all user-controlled input.
- Handle past dates, device time changes, app restarts, notification permission denial, and empty/error states.
- Avoid unnecessary global state.
- Use accessible labels and sufficient contrast.
- Keep user-facing Persian copy natural and concise.

## Module README rule
Every completed feature/module directory must contain a local `README.md` explaining:
- responsibility
- public interfaces
- data flow
- dependencies
- test strategy
- known limitations

## Definition of done
A task is done only when:
- implementation is limited to the requested scope
- typecheck/lint/tests relevant to the task pass, or failures are documented
- RTL and key empty/loading/error states are considered
- no out-of-root files were changed
- module README is updated when applicable
- the change is reported clearly
