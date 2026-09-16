# CHANGELOG

## Unreleased

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