# i18n

Persian/English catalogs and RTL handling.

## Responsibility
Centralize all user-facing strings and keep the layout direction (RTL for
`fa`, LTR for `en`) correct at launch, on language switch, and after restart.

## Public interfaces
- `translations` (`translations.ts`) — `fa` is the typed source of truth;
  `english` is `Record<TranslationKey, string>` so a missing English key is a
  compile error. Values support `{param}` interpolation (e.g.
  `{t('message.unlocksAt', {date})}`) and helper windows like quick unlock
  hours are rendered per-language via catalog strings.
- `translate(language, key, params?)` — resolves with fallback `language →
  fa → key` so a missing entry degrades gracefully, never crashes.
- `setupRTL()` — called at launch in `index.js`: enables RTL so the first
  frame (before persisted settings load) already matches Persian, the default
  language.
- `applyRTLSetting(language)` — calls `I18nManager.forceRTL/allowRTL` on
  language change so the native preference survives a restart and native
  chrome (drawer edge, status bar) matches.
- `isRTL()`, `directionOf(language)`, `languageIsRTL`, `DEFAULT_LANGUAGE`.

## Data flow
Screens/components never contain literal user-facing strings; they read
`t()` from `useTranslation()` (in `SettingsProvider`) and the persisted
language drives both the string catalog and the root `direction` style set in
`App.tsx`, which re-flows the tree live with no reload. Native stack headers
are hidden (`headerShown: false`) so all header copy and direction are
controlled here.

## Dependencies
React Native `I18nManager` only. No i18n library — the catalog is small and a
typed `Record` gives compile-time key safety without a dependency.

## Test strategy
No dedicated unit tests yet; every screen rendering exercises `t()` in the
App-level render test, and `formatDate`/Jalali formatting is covered in the
messages domain tests for both languages.

## Known limitations
- The notification channel name is fixed after first creation on Android, so
  it is deliberately not localized; the visible notification title/body are
  localized per language (see the notifications README).
- Months/weekdays in the Jalali picker and Persian-digit rendering are driven
  by this catalog's language, but the Gregorian calendar is only used for `en`
  via `formatDate`; there is no second (Gregorian) date picker.