# App Shell

Application-level composition: providers and navigation.

## Responsibility
- `ThemeProvider` — provides design tokens to the component tree.
- `RootNavigator` — native stack navigator wiring screens together.
- Navigation types — typed routes shared by screens.

## Public interfaces
- `App` (`App.tsx`) wraps `SafeAreaProvider` → `ThemeProvider` →
  `NavigationContainer` → `RootNavigator`.
- `RootStackParamList` — `Home`, `CreateMessage`, `RevealMessage`.

## Data flow
App entry (`index.js`) enables RTL, registers `App`, and renders the
navigator. Screens navigate by route name; the reveal screen currently
receives `messageId` as a payload (real read flow arrives in Milestone 2).

## Dependencies
- `@react-navigation/native` + `@react-navigation/native-stack`
- `react-native-screens` (native stack rendering)
- `react-native-safe-area-context`

## Test strategy
The snapshot test in `__tests__/App.test.tsx` renders the full tree with
`react-test-renderer`. Native modules are mocked in `jest.setup.js`.

## Known limitations
- `react-navigation` and `react-native-screens` pinned to versions
  compatible with RN 0.77 (`react-native-screens@4.9.x`); newer screens
  (≥4.10) fail RN 0.77 codegen and must be revisited when RN is upgraded.