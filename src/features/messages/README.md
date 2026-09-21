# Messages Feature

## Responsibility
The core user flow: write a message for the future self, lock it until an
unlock time, and reveal it after.

## Public interfaces
- `StoredMessage` / `Message` / `MessageStatus` / `deriveStatus` / `toView`
  (`domain/types.ts`) — persisted vs. public shapes and status derivation.
- `validateTitle` / `validateBody` / `validateUnlockAt` /
  `sanitizeStoredRecord` / `MAX_TITLE_LENGTH` (80) / `MAX_BODY_LENGTH` (5000)
  / `formatDate` (`domain/rules.ts`) — validation rules, kept independent of
  the UI so screens stay thin. Title and body validate independently with
  distinct error codes (`titleEmpty`/`titleTooLong` vs `empty`/`tooLong`) so
  the UI can localize each field's message separately.
- `createId` (`domain/id.ts`) — RFC 4122 v4 UUID source.
- `jalali.ts` (`domain/jalali.ts`) — Persian calendar math: Jalali↔Gregorian
  conversion, the 42-cell weekday grid, strict-future day/time checks in
  minutes, quick unlocks, and date formatting for both languages (Persian
  digits/names for `fa`, Gregorian + English names for `en`), all pure
  functions over `jalaali-js`.
- `MessageRepository` (`data/MessageRepository.ts`) — the only app-facing data
  API: `list`, `get`, `create`, `delete`. Constructed with an injectable
  storage adapter and clock for tests.
- `messageRepository` singleton (`data/index.ts`) — wired to AsyncStorage.
- `useMessageList` / `useMessage` (`hooks/useMessages.ts`) — screen state
  (loading/ready/error) with reload.
- `HomeScreen`, `CreateMessageScreen`, `RevealMessageScreen` — screens.
- `MessageCard` — list item for a message.
- `JalaliDatePicker` (`components/JalaliDatePicker.tsx`) — RTL month grid with
  prev/next navigation; a day is disabled only once no future time remains on
  it, so today stays selectable; reports `onChange(jy, jm, jd)`.
- `CreateMessageScreen` time controls — four hour presets plus a minute
  stepper (±1/±5). On today, passed hours and minutes are disabled and the
  selection snaps to the next valid five-minute mark; the save button and
  preview stay gated on a strictly-future `unlockAt`. The screen now collects
  a `title` (required, 1–80 chars) alongside the body and validates each
  independently.
- All screens and shared copy read from the i18n catalog via `useTranslation()`
  — no hard-coded user-facing strings. `RevealMessageScreen` shows the title,
  offers Copy for an unlocked body (`@react-native-clipboard/clipboard`), and
  localizes its dates.

## Data flow
- Screens render UI only and navigate by route name; they read state from the
  hooks and call `messageRepository`.
- `CreateMessageScreen` validates the trimmed title and body against
  `validateTitle`/`validateBody` (1–80 / 1–5000 chars) and an injected unlock
  time, then calls `create`.
- `MessageRepository` validates, generates id/createdAt, and persists the
  whole collection as one JSON array under `@badabekhoon/messages/v1`.
- Status is always derived at read time from `unlockAt`; `toView` nulls out
  the body of locked messages — nowhere else in the app receives the full
  record while it is locked. Privacy is enforced at the repository boundary,
  not in the UI.
- The Home list reloads on every screen focus, so created/deleted messages
  reflect immediately.
- Corrupt storage (unparsable JSON) and structurally-invalid/duplicate
  records are surfaced by getting dropped, without crushing existing data —
  `list` reports `corrupt`/`dropped` so the UI can warn.

## Dependencies
- `@react-native-async-storage/async-storage` (pinned 2.2.0) — the only
  storage dependency. Chosen over SQLite for a flat collection of small JSON
  records with no queries; SQLite becomes worth it if the document grows
  beyond a few thousand messages or needs cross-field queries. AsyncStorage
  3.x was rejected because it requires Kotlin 2.1.0, while the RN 0.77
  toolchain pins Kotlin 2.0.21 (same reason react-native-screens stays at
  4.9.2). "Documented dependency purpose" stored here.
- `react-native-get-random-values` (pinned 1.11.0) — provides
  `globalThis.crypto.getRandomValues` for `createId`. Hermes 0.18 on RN
  0.77.3 does not expose `crypto` on device (verified via runtime probe), and
  the generator deliberately refuses a weak entropy fallback (Math.random
  UUIDs), so the standard polyfill is imported first in `index.js`. Version
  2.0.0 was rejected: it requires `react-native >=0.81` and does not build
  against our pinned 0.77.3. "Documented dependency purpose" stored here.
- `jalaali-js` (pinned 2.0.1) — pure-JS Jalali↔Gregorian conversion used for
  unlock-date math. `react-native-calendars` has no Jalali engine (Gregorian
  XDate with locale labels only), npm "Persian pickers" are web-DOM and
  unusable in RN, and `@react-native-community/datetimepicker` is expo-first
  with Kotlin risk against the pinned 2.0.21 toolchain. `jalaali-js` has zero
  deps and no native code, so the date picker renders as a custom RTL grid.
  Package engines require Node >=20 at install time; all build/test tooling
  runs Node 18 without honoring `engine-strict`, so this is install-time only.
  "Documented dependency purpose" stored here.
- `@react-native-clipboard/clipboard` (1.16.3) — clips the revealed body to
  the clipboard for the Copy action. RN core removed its Clipboard API, so
  the community module is the standard minimal path; it is Android
  autolinked with no additional native config. No jest mocking beyond the
  JS-surface mock in `jest.setup.js`.
- Shared components (`Typography`, `Button`, `Card`, `TextField`).
- Theme tokens via `useTheme`; navigation types from `src/app/navigation`.
- `src/services/storage` — the storage adapter boundary (see its README).

## Test strategy
- `__tests__/messages.domain.test.ts` — validation boundaries (empty/trim/
  max/over-long for both title and body), unlock-date validation
  (past/now/invalid/future), record sanitization (including records written
  before the title field existed being dropped), status derivation at the
  `now` boundary, id format and uniqueness, date formatting for fa and en.
- `__tests__/messages.repository.test.ts` — create persistence, restart
  survival (new repository on the same storage), newest-first ordering,
  get/delete/missing-id, locked-body isolation (create locked, then advance
  the clock and confirm the body appears; pre-seeded unlocked record),
  corrupt JSON, and invalid/duplicate record filtering with counts.
- `__tests__/messages.jalali.test.ts` — conversion boundaries (Nowruz, leap
  Esfand years 1394/1403), ISO round-trips over a long day span and minute
  precision, grid alignment and 42 unique cells, quick-period arithmetic and
  clamping, strict future-day availability and strict future-minute
  availability on today, and Persian digit/date formatting.
- App-level render test exercises the screens against the in-memory
  AsyncStorage mock.

## Known limitations
- Unlock time is a Jalali day + absolute hour/minute chosen from four hour
  presets and a minute stepper; no free-form hour entry yet beyond the
  presets. Near midnight the snap-to-future fallback may land on an already
  passed minute at 23:xx, in which case the hint asks the user to pick a
  future hour.
- Grid renders 6 weeks (42 cells) always; months needing fewer rows show a
  trailing blank row.
- Whole-collection write on every create/delete is O(n); fine for personal
  scale, revisit at thousands of messages.
- Home shows a dismissible-free notice when storage was corrupt or records
  were dropped; no recovery of dropped records (unreadable data cannot be
  restored by definition). Records written before the required `title` field
  (pre-release builds only) are dropped and counted here.
- Reveal animation for an unlocked message is deferred.