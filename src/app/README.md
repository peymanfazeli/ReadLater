# App Shell

Application-level composition: providers and navigation.

## Responsibility
- `SettingsProvider` — owns the persisted language + scheme, the `t()`
  translation helper, theme tokens through `useTheme()`, and the circular
  theme-transition state (`beginThemeTransition`/`ThemeWave`).
- `NotificationAttentionProvider` — exposes whether the notification
  permission is missing (red-dot attention state) and a `refresh()`;
  re-checks on mount and when the app returns to foreground.
- `RootNavigator` — native stack navigator wiring screens together.
- Navigation types — typed routes shared by screens.

## Public interfaces
- `App` (`App.tsx`) wraps `SafeAreaProvider` → `SettingsProvider` →
  `NotificationAttentionProvider` → `NavigationContainer` → `RootNavigator`,
  applies the active layout `direction` on a root wrapper, and renders
  `ThemeWave` while a theme transition is in flight.
- `useNotificationAttention()` — `{attention, refresh}` hook.
- `useSettings()` / `useTheme()` / `useTranslation()` / `useDirection()` from
  `SettingsProvider`.
- `RootStackParamList` — `Home`, `CreateMessage`, `RevealMessage`.

## Data flow
App entry (`index.js`) calls `setupRTL()` and registers `App`. The provider
loads persisted settings from AsyncStorage (`@badabekhoon/settings/v1`),
applies the RTL preference, then screens translate via `t()` and read tokens
via `useTheme()`. A theme toggle calls `beginThemeTransition(origin)` which
flips the scheme synchronously, persists it, and animates the reveal (no
animation when reduced motion is enabled).

## Dependencies
- `@react-navigation/native` + `@react-navigation/native-stack`
- `react-native-screens` (native stack rendering)
- `react-native-safe-area-context`
- `react-native-reanimated` (theme transition wave)

## Test strategy
The snapshot test in `__tests__/App.test.tsx` renders the full tree with
`react-test-renderer`. Native modules are mocked in `jest.setup.js`.

## Known limitations
- `react-navigation` and `react-native-screens` pinned to versions
  compatible with RN 0.77 (`react-native-screens@4.9.x`); newer screens
  (≥4.10) fail RN 0.77 codegen and must be revisited when RN is upgraded.