# Design System Components

Shared UI primitives used across features.

## Responsibility
Reusable, theme-aware building blocks: text, buttons, cards, and text inputs.

## Public interfaces
- `Typography` — text with size/weight/color/align via theme tokens.
- `Button` — primary/secondary/ghost variants, disabled and loading states.
- `Card` — rounded surface container with optional padding.
- `TextField` — themed input with character counter and error message.
- `AttentionDot` — red indicator dot with a jiggle loop; fades out ("wiped")
  when `active` flips to false. Anchored by the caller's absolute style.
- `AppTitle` — glowing app-name header (`glow` token + `primary` color);
  36dp RTL in **Lalezar** (bundled at
  `android/app/src/main/assets/fonts/Lalezar.ttf`, OFL) for Persian,
  semibold 32dp tracked in the theme font for English, driven by the active
  language via `useTranslation()`.

## Data flow
Pure presentational components. They receive callbacks and values as props;
no business logic, no global state. `AppTitle` reads its copy and language
from the settings provider rather than taking them as props.

## Dependencies
- `ThemeProvider`/`useTheme` (`src/app/providers`).

## Test strategy
Covered indirectly by the App render test. Dedicated component tests can be
added when behavior (validation, states) grows beyond trivial rendering.

## Known limitations
- Buttons use an emoji glyph on the message card as a visual affordance;
  custom vector icons are deferred.
- Android loads a bundled asset font only for the exact file name
  `<family>.ttf` and a style it has a variant for (`_bold`, `_italic`); any
  other name or an unmet `fontWeight >= 700` silently falls back to the
  system font. Keep `AppTitle` weights below 700 until a bold variant ships.