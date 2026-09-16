# PLAN.md

## Execution protocol
Implement one milestone at a time. Do not begin the next milestone until the current one is reviewed.

## Milestone 0 — Safe foundation
- Create React Native CLI Android-first project inside the selected root.
- Confirm Node, Java, Android SDK, Gradle, and package manager versions.
- Confirm the project builds without relying on outside-root files.
- Add baseline lint/typecheck/test commands.
- Add `.gitignore` and secret protection.

Exit checks:
- clean debug build
- app launches on emulator/device
- no outside-root changes

## Milestone 1 — Design system and static shell
- Add theme tokens, typography, spacing, radii, shadows, and RTL setup.
- Implement Home, Create Message, and Reveal Message static states.
- Add navigation and reusable primitives.
- Add module READMEs.

Exit checks:
- Persian text and RTL layout render correctly
- screens work on small and large Android screens
- loading, empty, and error states exist

## Milestone 2 — Message persistence
- Add local storage adapter.
- Implement create, list, read, and delete behavior as required.
- Keep locked content inaccessible through UI/domain APIs.
- Add migration/version strategy if storage requires it.

Exit checks:
- data survives app restart
- invalid messages are rejected
- tests cover CRUD and locked/unlocked rules

## Milestone 3 — Unlock date rules
- Implement date/time selection and validation.
- Store timestamps in a consistent format.
- Define behavior for timezone changes and device clock changes.
- Support predefined periods plus custom date/time if feasible within scope.

Exit checks:
- past timestamps are rejected
- boundary conditions are tested
- date formatting is localized for Persian UI

## Milestone 4 — Local notifications
- Add Android local notification adapter.
- Request notification permission only when needed.
- Schedule, cancel, and reconcile notifications after restart.
- Opening a notification routes to the correct message.

Exit checks:
- permission denied is handled
- scheduled notification survives restart where Android permits
- notification does not reveal sensitive message content
- duplicate scheduling is prevented

## Milestone 5 — Release readiness
- App icon, label, versioning, and launcher behavior.
- Release build and signing documentation.
- Privacy copy and store listing draft.
- Test on representative Android versions and screen sizes.
- Verify no debug logging or secrets in release.

Exit checks:
- signed release artifact is produced locally
- installation and upgrade paths are tested
- Bazaar/Myket submission checklist is complete

## Explicitly deferred
- accounts/authentication
- backend/cloud sync
- social functionality
- attachments
- AI features
- recurring messages
- analytics and ads
- multi-device synchronization
