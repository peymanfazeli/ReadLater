# Messages Feature

## Responsibility
The core user flow: write a message for the future self, lock it until an
unlock time, and reveal it after.

## Public interfaces
- `StoredMessage` / `Message` / `MessageStatus` / `deriveStatus` / `toView`
  (`domain/types.ts`) — persisted vs. public shapes and status derivation.
- `validateBody` / `validateUnlockAt` / `sanitizeStoredRecord` /
  `MAX_BODY_LENGTH` / `formatDate` (`domain/rules.ts`) — validation rules,
  kept independent of the UI so screens stay thin.
- `createId` (`domain/id.ts`) — RFC 4122 v4 UUID source.
- `MessageRepository` (`data/MessageRepository.ts`) — the only app-facing data
  API: `list`, `get`, `create`, `delete`. Constructed with an injectable
  storage adapter and clock for tests.
- `messageRepository` singleton (`data/index.ts`) — wired to AsyncStorage.
- `useMessageList` / `useMessage` (`hooks/useMessages.ts`) — screen state
  (loading/ready/error) with reload.
- `HomeScreen`, `CreateMessageScreen`, `RevealMessageScreen` — screens.
- `MessageCard` — list item for a message.

## Data flow
- Screens render UI only and navigate by route name; they read state from the
  hooks and call `messageRepository`.
- `CreateMessageScreen` validates the trimmed body against `validateBody`
  (1–5000 chars) and an injected unlock time, then calls `create`.
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
- Shared components (`Typography`, `Button`, `Card`, `TextField`).
- Theme tokens via `useTheme`; navigation types from `src/app/navigation`.
- `src/services/storage` — the storage adapter boundary (see its README).

## Test strategy
- `__tests__/messages.domain.test.ts` — validation boundaries (empty/trim/
  max/over-long), unlock-date validation (past/now/invalid/future),
  record sanitization, status derivation at the `now` boundary, id format
  and uniqueness.
- `__tests__/messages.repository.test.ts` — create persistence, restart
  survival (new repository on the same storage), newest-first ordering,
  get/delete/missing-id, locked-body isolation (create locked, then advance
  the clock and confirm the body appears; pre-seeded unlocked record),
  corrupt JSON, and invalid/duplicate record filtering with counts.
- App-level render test exercises the screens against the in-memory
  AsyncStorage mock.

## Known limitations
- Unlock time is a fixed 24 h placeholder until the Milestone 3 date picker;
  the computed date is shown on the create screen and marked for replacement.
- Whole-collection write on every create/delete is O(n); fine for personal
  scale, revisit at thousands of messages.
- Home shows a dismissible-free notice when storage was corrupt; no recovery
  of dropped records (unreadable data cannot be restored by definition).
- Screens use hard-coded Persian copy; no string catalog yet.
- Copy-to-clipboard and reveal animation are deferred.