# Theme

Design tokens shared across screens and components.

## Responsibility
Single source of truth for the visual language defined in `DESIGN.md`,
including both light and dark palettes.

## Public interfaces
- `light` / `dark` (`palettes.ts`) — full `ColorToken` palettes (background,
  surface, border, text, primary, accent, status, and the `onPrimary` color
  for text on primary fills). Dark tokens were chosen for contrast on the
  same screen set.
- `colors` (`colors.ts`) — legacy alias to `palettes.light` for code that
  cannot use the theme hook.
- `spacing` — 4px-based spacing scale.
- `radii` — corner radius tokens (cards 20–24dp, controls 12–16dp).
- `typography` — font family, sizes, weights, line heights.
- `shadows` — platform-appropriate elevation/shadow presets.

## Data flow
The active palette comes from `SettingsProvider` via the `useTheme()` hook in
`src/app/providers/SettingsProvider.tsx`; nothing outside that provider picks
a palette directly. The provider exposes `beginThemeTransition(origin)` which
flips the scheme synchronously and mounts `ThemeWave`
(`src/app/components/ThemeWave.tsx`) — a reanimated disc in the old
background color that shrinks onto the toggle origin to reveal the new theme
(plain flip when reduced motion is enabled). All components and screens read
tokens through the hook; no hard-coded values outside this module.

## Dependencies
None beyond React Native and `react-native-reanimated` (used only by
`ThemeWave`).

## Test strategy
Tokens are static values; no unit tests needed. Visual correctness is
verified manually per screen in both light and dark schemes.

## Known limitations
- `fontFamily` is set to `Vazirmatn` but the font file is not yet bundled;
  Android falls back to the system font (Roboto), which renders Persian.
  Bundling the font is deferred to release polish.
- Dark palette values are hand-picked; they should be re-audited against
  `DESIGN.md` contrast guidance on device before release.