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

## Data flow
Pure presentational components. They receive callbacks and values as props;
no business logic, no global state.

## Dependencies
- `ThemeProvider`/`useTheme` (`src/app/providers`).

## Test strategy
Covered indirectly by the App render test. Dedicated component tests can be
added when behavior (validation, states) grows beyond trivial rendering.

## Known limitations
- Buttons use an emoji glyph on the message card as a visual affordance;
  custom vector icons are deferred.