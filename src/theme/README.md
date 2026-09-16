# Theme

Design tokens shared across screens and components.

## Responsibility
Single source of truth for the visual language defined in `DESIGN.md`.

## Public interfaces
- `colors` — palette tokens (background, surface, text, primary, accent, status).
- `spacing` — 4px-based spacing scale.
- `radii` — corner radius tokens (cards 20–24dp, controls 12–16dp).
- `typography` — font family, sizes, weights, line heights.
- `shadows` — platform-appropriate elevation/shadow presets.

## Data flow
Consumed by `ThemeProvider` (`src/app/providers/ThemeProvider.tsx`) via the
`useTheme()` hook. All components and screens read tokens through the hook;
no hard-coded values outside this module.

## Dependencies
None beyond React Native.

## Test strategy
Tokens are static values; no unit tests needed. Visual correctness is
verified manually per screen.

## Known limitations
- `fontFamily` is set to `Vazirmatn` but the font file is not yet bundled;
  Android falls back to the system font (Roboto), which renders Persian.
  Bundling the font is deferred to release polish.
- Dark mode tokens are defined but unused (dark mode is deferred).