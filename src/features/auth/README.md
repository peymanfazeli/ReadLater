# Auth Feature

## Responsibility
Entry point for account features. MVP explicitly ships no accounts
(AGENTS.md), so this module is a single placeholder screen surfaced from the
drawer's top «ورود» button.

## Public interfaces
- `LoginScreen` (`screens/LoginScreen.tsx`), registered in the root stack as
  `Login` (title «ورود»).

## Data flow
- Placeholder only: renders a «به‌زودی» card and a back affordance. No
  credentials are collected or transmitted; there is no network code.

## Dependencies
- Shared components (`Typography`, `Button`, `Card`), theme tokens, and
  navigation types from `src/app/navigation`.

## Test strategy
- Covered by the app-level render test; no logic to unit test.

## Known limitations
- No real authentication. Implementing accounts later would require deciding
  the backend/privacy posture first (the product is offline-first and
  local-only by design).