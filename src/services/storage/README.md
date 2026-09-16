# Storage Service

## Responsibility
The persistence boundary for app data. Keeps the media storage technology
(AsyncStorage today) behind a tiny surface so a future storage migration is
one adapter, not a sweep across features.

## Public interfaces
- `MessageStorage` (`types.ts`) — `read(): Promise<string | null>` and
  `write(value: string): Promise<void>`. Values are opaque strings; the
  repository owns layout, versioning, and serialization.
- `AsyncStorageMessageStore` (`AsyncStorageMessageStore.ts`) — reads/writes
  the whole messages collection under the single namespaced, versioned key
  `@badabekhoon/messages/v1`.

## Data flow
```
MessageRepository ⇄ MessageStorage (this module) ⇄ AsyncStorage native key
```
- The version in the key is the migration escape hatch: if the record shape
  changes, bump to v2 and transform under the old key before writing.
- Corrupt values are returned verbatim to the repository, which decides how
  to surface them; the store never drops or "fixes" data by itself.

## Dependencies
- `@react-native-async-storage/async-storage` 2.2.0 (pinned — see the
  messages feature README for why 3.x is avoided on this toolchain).

## Test strategy
- Exercised through `MessageRepository` tests using an in-memory `MessageStorage`
  double (JSON round-trip, corrupt values, restart survival). The AsyncStorage
  module itself is mocked in `jest.setup.js` with a Map-backed fake, matching
  the production npm module surface used here.

## Known limitations
- Single key for the whole collection; every mutation rewrites the array
  (repository-level concern, acceptable at personal scale).
- No on-device encryption of stored JSON in MVP. The store only isolates the
  technology; confidentiality of locked content comes from routing rules in
  `MessageRepository`, not from storage encryption.