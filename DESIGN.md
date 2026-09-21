
# DESIGN.md

## Brand Character

Friendly, slightly playful, hopeful, honest, and intimate—like a small letter from the present self to the future self.

The experience should feel personal, calm, and trustworthy without becoming childish or overly motivational.

Avoid:
- Childish or overly decorative visuals.
- Forced motivational language.
- Excessive animations.
- Visual clutter.
- Text embedded in icons.
- Inconsistent spacing, typography, or component styles.

---

## Supported Languages

The application must support two languages from the beginning:

- Persian (`fa`)
- English (`en`)

### Language Behavior

- Persian is the default language.
- Persian uses RTL layout.
- English uses LTR layout.
- All user-facing text must be translated through the i18n system.
- Do not hardcode user-facing strings directly inside screens or reusable components.
- Language selection must persist across application restarts.
- The interface must update consistently when the language changes.
- Layout direction, text alignment, icon positioning, and navigation behavior must respect the active language.
- Dates, numbers, and validation messages should be localized appropriately.
- Translation keys must be descriptive, consistent, and organized by feature or purpose.
- Provide a safe fallback language when a translation is missing.
- Language changes must not reset navigation state, form state, or user data.
- The implementation must avoid unnecessary duplication of screens or components for different languages.

### Bilingual Design Requirements

All screens, components, buttons, labels, validation messages, empty states, loading states, errors, and settings must support both languages.

The design must accommodate:

- Different text lengths between Persian and English.
- Text expansion and wrapping.
- RTL and LTR alignment.
- Appropriate font sizes and line heights for both languages.
- Accessibility and readability in both languages.
- Mixed-language content entered by users.
- Proper text direction for user-entered titles and message bodies.

---

## Theme System

The application must support two visual themes:

- Light theme
- Dark theme

The theme system must be token-based and consistently applied across the entire application.

### Theme Requirements

- All screens and reusable components must support both themes.
- Avoid hardcoded colors inside screens and components.
- Use centralized theme tokens for colors, typography, spacing, borders, shadows, and surfaces.
- Text must maintain sufficient contrast in both themes.
- Inputs, cards, buttons, navigation elements, dividers, icons, and overlays must adapt to the active theme.
- The selected theme must persist across application restarts.
- The implementation should support a future system-theme option without requiring a major architectural rewrite.
- Theme changes must not reset navigation state, form state, or user data.
- Avoid visual flickering during theme transitions.
- Theme-dependent values must be resolved through the active theme rather than duplicated throughout the codebase.
- Components must not assume that the light theme is always active.

### Light Theme Palette

- background: `#FAF6EF`
- surface: `#FFFFFF`
- primary text: `#25283A`
- secondary text: `#8D887F`
- primary: `#B9A2FF`
- primary dark: `#6550A4`
- success surface: `#D5EBDD`
- success text: `#477C5A`
- peach: `#F4D1C2`
- border: `#EAE4DB`

### Dark Theme Palette

- background: `#181A29`
- surface: `#25283A`
- primary text: use a light color with sufficient contrast
- secondary text: use a muted light color with sufficient contrast
- primary: use an accessible variation of the primary color when required
- primary dark: adjust for dark-theme contrast
- success surface: use a dark-compatible success surface
- success text: use a readable success color
- peach: use a dark-compatible accent variation
- border: use a subtle dark-theme border

The existing brand identity must remain recognizable in both themes.

Dark-theme colors must be selected and verified for readability rather than copied mechanically from the light palette.

---

## Theme Toggle and Drawer

The theme switcher must be placed inside the application Drawer.

### Drawer Requirements

- The Drawer must have a clean, organized, and consistent layout.
- Theme controls must be clearly labeled in the active language.
- The theme control must communicate the current theme.
- Use an accessible toggle or equivalent control.
- The control must be usable with touch and keyboard/accessibility navigation where applicable.
- The control must support both RTL and LTR layouts.
- Icons must be used consistently and must not replace essential text where clarity would suffer.
- The Drawer must use the active theme tokens.
- Drawer spacing, section hierarchy, and separators must remain visually consistent in both themes.
- The selected theme must have clear visual feedback.
- The toggle must expose an accessible state, such as `checked`, `selected`, or an equivalent semantic state.
- The theme control must not trigger unrelated navigation or state changes.

Possible theme labels:

- Persian: `حالت روشن` / `حالت تاریک`
- English: `Light mode` / `Dark mode`

The final wording must be managed through the i18n system.

---

## Theme Transition Animation

Changing the theme must use a purposeful animated transition rather than an immediate, visually abrupt color swap.

### Circular Wave / Reveal Requirement

When the user toggles the theme from the Drawer:

- A circular wave animation must originate from the exact screen coordinates of the pressed theme toggle control.
- The animation must expand outward from the interaction point.
- The wave must cover the relevant screen area before or during the theme transition.
- The origin must remain accurate regardless of screen size, orientation, safe areas, Drawer position, or RTL/LTR direction.
- The animation must not always originate from the screen center.
- The transition must avoid visible flickering, layout jumps, or sudden content repositioning.
- The animation must work consistently when switching from light to dark and from dark to light.
- The animation must remain short, smooth, and purposeful.
- The transition must not block the application indefinitely.
- Rapid repeated toggles must be handled safely.
- If the preferred animation approach is not supported reliably on a specific platform, implement a documented graceful fallback.
- The final theme state must remain correct even if the animation is interrupted or restarted.
- The animation must not expose message bodies or other private content during the transition.

### Animation Design Principles

- Use a circular reveal, radial wave, or equivalent expanding overlay.
- Capture the toggle's actual screen position at interaction time.
- Calculate the required animation radius based on screen dimensions and the origin point.
- Account for the Drawer position, safe-area insets, and the active layout direction.
- Keep animation duration and easing consistent with the overall design system.
- Avoid excessive motion or distracting visual effects.
- Respect reduced-motion preferences when supported by the platform or accessibility configuration.
- Keep animation logic separate from business logic and theme state management where practical.
- Avoid introducing a native dependency unless the existing React Native architecture cannot provide a reliable solution.
- Document platform limitations and fallback behavior.

The exact implementation approach must be selected based on the existing React Native architecture and platform compatibility. Do not introduce unnecessary native dependencies without documenting their rationale.

---

## Typography

- Use Vazirmatn if licensing and bundling are practical.
- Ensure Persian and English text render correctly.
- Define typography tokens centrally.
- Maintain consistent font sizes, weights, and line heights.
- Ensure sufficient readability in both light and dark themes.
- Support text wrapping without clipping or unexpected layout changes.
- Avoid relying on font weight values that are unavailable in the bundled font.
- Provide appropriate typography for headings, body text, metadata, labels, buttons, and validation messages.
- Ensure typography remains readable when the system font size is increased.
- Avoid using typography alone to communicate locked, unlocked, error, or success states.

---

## Spacing and Layout

- Use a consistent spacing scale through centralized design tokens.
- Maintain clear visual hierarchy.
- Use generous but purposeful spacing.
- Avoid crowded layouts and unnecessary decoration.
- Ensure layouts work on small and large screens.
- Account for safe areas and keyboard interaction.
- Support both RTL and LTR layouts without duplicating screen implementations.
- Avoid fixed widths that cause text clipping or overflow.
- Allow content to grow naturally when titles, labels, or messages wrap.
- Use consistent horizontal margins and vertical rhythm across screens.
- Ensure interactive elements remain usable on smaller screens.
- Avoid placing essential actions where they can be obscured by the keyboard or system UI.

---

## UI Rules

- RTL-first, while fully supporting LTR.
- Use theme tokens instead of hardcoded visual values.
- Rounded cards: approximately 20–24dp.
- Primary actions: approximately 52–56dp height.
- Use consistent corner radii across cards, inputs, buttons, and Drawer sections.
- Maintain clear hierarchy and predictable interaction patterns.
- Use envelope or paper-plane motifs sparingly.
- Avoid text embedded in icons.
- Ensure interactive elements have appropriate touch targets.
- Maintain accessible color contrast.
- Provide visible and understandable validation, loading, empty, error, and success states.
- Preserve the same component behavior across themes and languages.
- Use consistent disabled, pressed, focused, and loading states.
- Avoid excessive borders, shadows, gradients, and decorative elements.
- Ensure visual states are communicated through more than color alone.
- Avoid exposing private message content in previews, placeholders, logs, or fallback UI.

---

## Motion and Interaction

Motion should be short, purposeful, and consistent.

Preferred motion patterns:

- Fade transitions.
- Circular reveal for theme changes.
- Gentle message reveal.
- Subtle state transitions.
- Envelope close animation on successful save, if appropriate.
- Small feedback animations for completed actions.

Avoid:

- Excessive motion.
- Long blocking animations.
- Animations that interfere with form input.
- Animations that hide important feedback.
- Unnecessary animation on every screen interaction.
- Motion that causes content to jump or shift unexpectedly.

Animations must not compromise performance, accessibility, or usability.

All animations should:

- Have a clear purpose.
- Support interruption or cancellation where appropriate.
- Respect reduced-motion preferences when supported.
- Avoid delaying essential user actions.
- Provide a safe fallback if animation cannot run reliably.

---

## Message Model and Presentation

Each message must have:

- A title.
- A body.
- A creation date.
- An unlock date.
- A lock/unlock state derived from the unlock time where possible.

### Message Title

- Title is required unless explicitly changed by a documented product decision.
- Title must have a clear character limit defined by the domain rules.
- Title must be validated independently from the message body.
- Title must support Persian and English text.
- Title must be displayed consistently in message cards, lists, and the Reveal screen.
- Long titles must wrap or truncate gracefully according to the component design.
- Locked messages may display title metadata only if doing so does not violate the privacy requirements.
- The message body must never be exposed before its unlock time.
- Title validation and error messages must be localized.
- Leading and trailing whitespace must be handled consistently according to domain rules.
- The title must not be used to reveal private information through notifications or logs unless explicitly permitted by the privacy requirements.

### Message Cards

- Maintain consistent card dimensions, spacing, typography, and hierarchy.
- Display title prominently.
- Use clear visual differentiation between locked and unlocked messages.
- Do not display locked message bodies.
- Adapt card colors, borders, icons, and text to the active theme.
- Support Persian RTL and English LTR layouts.
- Preserve readable metadata and action placement in both directions.
- Prevent long titles and metadata from causing clipping or horizontal overflow.
- Keep locked and unlocked states understandable without relying only on color.
- Avoid displaying sensitive message content in collapsed previews.

---

## Screens

### Home

Required elements:

- Localized greeting.
- Nearest locked message.
- New-message CTA.
- Message list entry point.
- Settings/Drawer entry point.
- Empty state.
- Loading state.
- Error state.
- Multiple-message state.
- Theme-aware and language-aware layout.

The Home screen must:

- Use the real persistence layer instead of hard-coded mock data.
- Display message titles.
- Respect locked-content privacy.
- Adapt correctly to both themes and languages.
- Preserve visual consistency across different message lengths.
- Provide understandable empty, loading, and error states.
- Avoid exposing locked message bodies in previews, logs, or fallback content.
- Maintain usable layouts for both short and long message titles.

---

### Create Message

Required elements:

- Required message title field.
- Required message body field.
- Title validation.
- Body validation with a 1–5000 character limit.
- Date/time selection as a separate step.
- Optional friendly labels that can be removed.
- Clear confirmation before saving.
- Localized validation and error messages.
- Theme-aware inputs, cards, sections, and buttons.
- Consistent spacing and visual hierarchy.

Design requirements:

- Group related fields into coherent sections.
- Maintain consistent input heights, corner radii, labels, and spacing.
- Ensure the title and body fields are visually distinguishable but harmonious.
- Ensure the screen remains usable with the keyboard open.
- Support both RTL and LTR text input.
- Avoid excessive cards or nested containers.
- Use clear primary and secondary actions.
- Ensure all labels and helper text are translated through i18n.
- Preserve entered form data when theme or language changes.
- Clearly communicate validation errors without relying only on color.
- Prevent accidental loss of entered content during navigation or state updates.
- Ensure the selected unlock date and time are clearly summarized before saving.

---

### Reveal Message

Required elements:

- Message title.
- Unlocked message body.
- Created date.
- Unlock date.
- Copy action.
- Create-new action.
- Deleted/error state.
- Notification deep-link entry.

The Reveal screen must:

- Display the title and body with clear hierarchy.
- Adapt to both themes and languages.
- Respect locked-content access rules.
- Handle missing, deleted, malformed, and inaccessible messages safely.
- Avoid exposing locked content in errors, logs, or fallback UI.
- Provide clear feedback after copy actions.
- Format dates and metadata according to the active language and locale.
- Preserve readable text wrapping for long message bodies.
- Prevent access to the message body before the unlock time, including through deep links and navigation state.

---

## Drawer and Settings

The Drawer must provide a consistent place for application-level settings.

Potential settings:

- Language selection.
- Theme selection.
- About or privacy information, if implemented.

Requirements:

- Use localized labels.
- Support RTL and LTR.
- Use the active theme.
- Maintain consistent spacing and hierarchy.
- Provide clear visual feedback for the selected language and theme.
- Keep settings easy to discover without overwhelming the user.
- Preserve navigation state when settings change.
- Ensure language and theme controls are accessible.
- Avoid exposing private message content inside the Drawer.
- Ensure Drawer transitions and overlays behave correctly in both themes and layout directions.

---

## Accessibility

- Maintain sufficient color contrast in both themes.
- Use accessible labels for buttons, toggles, inputs, and icons.
- Ensure interactive controls have appropriate touch targets.
- Do not communicate information through color alone.
- Ensure focus order is logical in both RTL and LTR layouts.
- Support readable text sizes and text wrapping.
- Avoid animations that create usability problems.
- Respect reduced-motion preferences where supported.
- Provide meaningful accessibility states for toggles, buttons, loading states, and validation errors.
- Ensure controls remain usable when font scaling is enabled.
- Avoid truncated labels that remove essential meaning.
- Ensure screen-reader users can understand locked and unlocked states.
- Ensure error messages are associated with the relevant input where supported.
- Do not expose locked message bodies through accessibility labels, hints, or hidden elements.

---

## Copy Style

Use conversational, warm, and direct copy.

### Persian

- Use natural and contemporary conversational Persian.
- Be friendly but not childish.
- Avoid exaggerated promises.
- Avoid cliché motivational slogans.
- Prefer concise and clear wording.
- Maintain consistent terminology across screens.
- Use Persian punctuation and formatting where appropriate.

### English

- Use clear, natural, and concise language.
- Maintain the same emotional tone as the Persian version.
- Avoid literal translations that sound unnatural.
- Keep terminology consistent across the application.
- Prefer simple and understandable wording.

All user-facing copy must be managed through the i18n system.

Translations should communicate equivalent meaning and tone rather than necessarily following a word-for-word translation.

---

## Design Consistency Checklist

Before considering a design-related milestone complete, verify:

- Both Persian and English are supported.
- RTL and LTR layouts render correctly.
- All user-facing strings use i18n.
- Missing translations have a safe fallback.
- Language selection persists after app restart.
- Light and dark themes are applied consistently.
- Theme selection persists after app restart.
- Theme toggle is available in the Drawer.
- Theme toggle exposes an accessible state.
- Theme animation originates from the actual toggle position.
- Animation behaves correctly in both directions.
- Animation handles rapid repeated toggles safely.
- Reduced-motion behavior or fallback is implemented where applicable.
- Message titles are supported across the relevant screens.
- Title validation is independent from body validation.
- Existing message bodies remain private while locked.
- Locked content is not exposed through notifications, logs, errors, accessibility labels, or fallback UI.
- Cards, sections, inputs, buttons, and spacing are visually harmonious.
- Small and large screen layouts are usable.
- Keyboard interaction does not obscure essential controls.
- Loading, empty, error, and success states are designed.
- Accessibility and contrast requirements are satisfied.
- Text wrapping works for Persian, English, and mixed-language content.
- Theme and language changes do not reset form or navigation state.
- No unnecessary dependencies or broad architectural changes were introduced.
