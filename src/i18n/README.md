# i18n

Persian locale and RTL handling.

## Responsibility
Force right-to-left layout for the whole app and centralize locale helpers.

## Public interfaces
- `setupRTL()` — enables RTL on the app-level entry point.
- `isRTL()` — read the current layout direction.

## Data flow
`setupRTL()` is called in `index.js` before the app registers, so the
JavaScript layout engine is RTL from the first frame.

## Dependencies
React Native `I18nManager` only.

## Test strategy
RTL affects layout, verified manually on device/emulator. No unit tests.

## Known limitations
- `I18nManager.forceRTL` on Android takes effect for the current session
  when called before render; no app restart is required.
- Message copy is written directly in Persian in screen components; a
  formal string catalog is deferred until more copy exists.