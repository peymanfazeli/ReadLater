# CHANGELOG

## Unreleased

### Milestone 5 — release readiness
- Identity: `versionName` 1.0.0 / `versionCode` 1, `app.json` displayName and
  `android/res/values/strings.xml` app label set to «بعدابخون», `package.json`
  and lockfile bumped to 1.0.0.
- Offline hardening: `INTERNET` moved out of the release manifest; the
  debug-only manifest keeps it for Metro. `react-native-notify-kit` declares
  `INTERNET` + `ACCESS_NETWORK_STATE` in its merged manifest, so both are now
  removed at merge time (`tools:node="remove"`) — release APK has no network
  permission. Verified via `aapt dump badging` on the built APK.
- Launcher icons: white-envelope glyph on lavender (`#B9A2FF`) regenerated at
  all five densities plus adaptive-icon resources
  (`mipmap-anydpi-v26`, `drawable/ic_launcher_foreground`, `colors.xml`).
- Release signing: `android/app/build.gradle` reads
  `android/keystore.properties` (`storeFile` via `rootProject.file`) and
  falls back to debug signing when the properties or keystore are absent;
  `keystore.properties` is gitignored. A local keystore
  (`app/badabekhoon-release.keystore`, alias `badabekhoon`, RSA 2048,
  10000 days) and properties file were generated only to validate the
  pipeline — the real release key must be generated and secured per
  BUILD_RELEASE.md.
- Release build: `gradlew assembleRelease` signed with the release key;
  `apksigner verify` shows the Badabekhoon cert. Installed on the emulator
  and smoke-tested: app boots offline, Persian Home renders (empty state),
  no crash. APK 53.94 MB.
- Checks: `tsc` clean, `eslint` 0 problems, 53/53 jest tests, keystore
  password scan shows no leakage outside the gitignored `keystore.properties`.

### Milestone 4 — local unlock notifications
- Added `src/services/notifications` on `react-native-notify-kit` 10.7.1
  (pinned): schedule one reminder per locked message at its `unlockAt`,
  cancel on delete, and reconcile missing alarms on every Home focus
  (covers app restart, reboot, OEM-killed alarms via Room-persisted triggers
  + BOOT_COMPLETED re-arm + BOOT_COUNT cold-start self-heal).
- Notification content is fixed text; the payload carries only the message id
  (`data.messageId`) — never the body or unlock timestamp. Covered by tests.
- Permission: `POST_NOTIFICATIONS` added to the manifest; the library prompts
  on Android 13+; a Home banner offers to enable notifications (with a
  settings deep link on denial). Denial never blocks saving a message — it is
  unlocked by the clock, the notification is just the reminder.
- Press routing: cold start navigates from `getInitialMessageId()`; warm
  presses via `onUnlockPress` guarded by `navigationRef.isReady()` — both land
  on `RevealMessage`.
- Dependency record: `react-native-notify-kit` chosen over
  `@notifee/react-native` (archived Apr 2026, new-arch gaps) and a
  hand-rolled Kotlin AlarmManager module; it compiles against Kotlin 2.0.21
  and compileSdk 35.
- Checks: `tsc` clean, `eslint` 0 problems, 51/51 jest tests,
  `gradlew assembleDebug` BUILD SUCCESSFUL.
- Full time picker (M4 extension): minute stepper (±1/±5) plus smart
  enable/disable on today — passed hours and minutes are disabled while
  future ones stay pickable, today remains selectable (a day is disabled only
  once no future time remains on it), and picking today snaps to the next
  valid five-minute mark with a Persian hint when the chosen time is past.
  Storage format unchanged (ISO UTC via `jalaliToIso(jy,jm,jd,hour,minute)`),
  so no migration needed. Checks: `tsc` clean, `eslint` 0 problems, 53/53
  jest tests.

### Milestone 3 — Jalali unlock-date picker
- Added a custom RTL Jalali month-grid picker
  (`JalaliDatePicker.tsx`): 42-cell Saturday-start grid, prev/next
  navigation, non-future days disabled, reported as `onChange(jy, jm, jd)`.
- Added the Pure Jalali domain layer (`domain/jalali.ts`) on `jalaali-js`
  2.0.1 (pinned): conversion wrappers, month grids, strict-future checks,
  quick unlocks (tomorrow / week / 1 Jalali month / 1 Jalali year, clamped),
  and Persian date formatting with weekday and hour.
- `CreateMessageScreen` now saves an ISO `unlockAt` from the picked Jalali
  date + hour chip (۹ صبح / ۱۲ ظهر / ۱۷ عصر / ۲۱ شب); save stays disabled
  until body and date are valid.
- Fixed `jalaliMonthGrid` base-day bug (used day 1 instead of the month's
  real first Gregorian day) and corrected three test expectations that were
  one year / one day off; boundary tests green.
- Dependency record: `jalaali-js` chosen over `react-native-calendars`
  (no Jalali engine), web-DOM Persian pickers (unusable in RN), and
  `@react-native-community/datetimepicker` (expo-first, Kotlin risk);
  zero-dependency, no native code.
- Checks: `tsc` clean, `eslint` 0 problems, 42/42 jest tests,
  `gradlew assembleDebug` BUILD SUCCESSFUL.

### M2 fix — device save hang
- Root cause: Hermes 0.18 on RN 0.77.3 does not expose `globalThis.crypto`
  (verified on device), so `createId()` threw on every save; `handleSave` had
  no error handling, leaving the save spinner stuck.
- Fixed by importing `react-native-get-random-values` 1.11.0 (pinned) first in
  `index.js` (2.0.0 rejected: requires RN >= 0.81) and guarding `handleSave`
  with try/catch/finally so a failed save shows an error instead of hanging.
- Verified on emulator: create → save persists a conforming record
  (`@badabekhoon/messages/v1`) and the list refreshes on return to Home.

### Milestone 2 — message persistence
- Added `@react-native-async-storage/async-storage` 2.2.0 (pinned) behind a
  storage adapter (`src/services/storage`). 3.x rejected: requires Kotlin
  2.1.0, toolchain pins 2.0.21.
- Added `MessageRepository` (`list`/`get`/`create`/`delete`) with validation
  in the domain layer (`src/features/messages/domain/rules.ts`), RFC 4122 v4
  ids via `crypto.getRandomValues`, and locked-body isolation enforced at the
  repository boundary (`Message#body` is `null` while locked).
- Replaced the Home/Create/Reveal mock flow with real persistence: create →
  save → list refresh on focus; reveal loads by id with loading/error/missing
  states; delete with confirmation on the reveal screen.
- Corrupt storage and invalid/duplicate records are dropped safely and
  surfaced as a notice on Home instead of crashing the app.
- Added domain + repository unit tests (26 passing) and an in-memory
  AsyncStorage jest mock.
- Milestone 1: added execution documentation for the Android-first React
  Native CLI implementation.