# ARCHITECTURE.md

## Principles
- Small, explicit, feature-oriented structure.
- Local-first and privacy-first.
- Business rules are testable without React Native UI.
- Native integrations are isolated behind adapters.
- Avoid premature clean-architecture layers and generic abstractions.

## Suggested structure
```text
src/
  app/
    navigation/
    providers/
  components/
  features/
    messages/
      domain/
      data/
      screens/
      components/
      hooks/
      README.md
  services/
    notifications/
    storage/
  theme/
  utils/
  i18n/
```

## Domain model
```ts
type MessageStatus = 'locked' | 'unlocked';

type Message = {
  id: string;
  body: string;
  createdAt: string; // ISO-8601 UTC
  unlockAt: string;  // ISO-8601 UTC
  status: MessageStatus; // derived where possible
};
```

Prefer deriving status from `unlockAt` at read time instead of trusting stale persisted status.

## Rules
- Trim leading/trailing whitespace.
- Reject empty content.
- Suggested maximum body length: 5000 characters.
- `unlockAt` must be later than the current accepted time.
- Never display body content for a locked message.
- Generate IDs locally using a vetted, minimal solution.
- Store timestamps in UTC; format them for the Persian UI at presentation boundaries.
- Treat device clock manipulation as an edge case; do not claim tamper-proof scheduling.

## Data boundaries
- Screens coordinate UI only.
- Domain functions validate and transform data.
- Storage adapter persists serialized data.
- Notification adapter knows Android scheduling details but not UI.
- Navigation receives IDs, not sensitive message bodies, from notifications.

## Dependency policy
Before adding a package, document:
- why it is needed
- why platform APIs or existing dependencies are insufficient
- maintenance and bundle-size impact
- Android compatibility
