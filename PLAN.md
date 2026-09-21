# PLAN.md

## Execution Protocol

Implement one milestone at a time.

Before starting each milestone:
- Read the complete relevant section of this file.
- Read the related architecture, design, and module documentation.
- Inspect the existing implementation before making changes.
- Preserve all previously completed functionality.

Do not begin the next milestone until the current milestone's exit checks have been executed, documented, and reviewed.

`PLAN.md` is the authoritative source for milestone scope and exit checks. If a requirement is ambiguous, choose the simplest maintainable implementation consistent with the existing architecture and document the decision.

---

## Milestone 0 — Safe Foundation

- Create React Native CLI Android-first project inside the selected root.
- Confirm Node, Java, Android SDK, Gradle, and package manager versions.
- Confirm the project builds without relying on outside-root files.
- Add baseline lint, typecheck, and test commands.
- Add `.gitignore` and secret protection.

### Exit Checks

- Clean debug build.
- App launches on emulator/device.
- No outside-root changes.

---

## Milestone 1 — Design System and Static Shell

- Add theme tokens, typography, spacing, radii, shadows, and RTL setup.
- Implement Home, Create Message, and Reveal Message static states.
- Add navigation and reusable primitives.
- Add module READMEs.
- Establish consistent visual hierarchy, spacing, and component styling.
- Support Persian text and RTL layout.

### Exit Checks

- Persian text and RTL layout render correctly.
- Screens work on small and large Android screens.
- Loading, empty, and error states exist.
- Design tokens are used consistently.
- Navigation works between the implemented screens.

---

## Milestone 2 — Message Persistence and Message Titles

- Add a local storage adapter.
- Implement create, list, read, and delete behavior as required.
- Add a required message title to the message model.
- Define title validation rules and character limits.
- Keep locked content inaccessible through UI and domain APIs.
- Add migration/version strategy if storage requires it.
- Replace hard-coded mock messages with persisted data.
- Display message titles in the relevant screens and components.

### Exit Checks

- Data survives app restart.
- Valid messages with titles can be created and persisted.
- Invalid messages and titles are rejected.
- Existing stored messages are handled safely when the data model changes.
- Tests cover CRUD, title validation, and locked/unlocked rules.
- Locked message bodies are not exposed through UI, logs, or error messages.
- Home screen uses the persistence layer instead of hard-coded mock data.

---

## Milestone 3 — Unlock Date Rules

- Implement date/time selection and validation.
- Store timestamps in a consistent format.
- Define behavior for timezone changes and device clock changes.
- Support predefined periods plus custom date/time if feasible within scope.
- Localize date and time presentation for supported languages.
- Preserve existing message title and body validation rules.

### Exit Checks

- Past timestamps are rejected.
- Boundary conditions are tested.
- Date formatting is localized for Persian and English UI.
- Timezone and device-clock limitations are documented.
- Valid unlock dates are persisted and restored correctly.

---

## Milestone 4 — Local Notifications

- Add Android local notification adapter.
- Request notification permission only when needed.
- Schedule, cancel, and reconcile notifications after restart.
- Opening a notification routes to the correct message.
- Ensure notification content does not expose private message bodies.
- Support localized notification titles and safe notification copy.

### Exit Checks

- Permission denial is handled.
- Scheduled notification survives restart where Android permits.
- Notification does not reveal sensitive message content.
- Duplicate scheduling is prevented.
- Notification deep links open the correct message.
- Notification behavior is tested on a supported Android environment.

---

## Milestone 5 — Bilingual UI and Internationalization

- Support Persian (`fa`) and English (`en`).
- Use the existing i18n system for all user-facing strings.
- Remove hard-coded user-facing text from screens and reusable components.
- Add language selection in the Drawer or settings area.
- Persist the selected language across app restarts.
- Support RTL for Persian and LTR for English.
- Ensure text alignment, spacing, icon placement, and navigation behavior adapt to the active language.
- Localize validation messages, empty states, loading states, error messages, buttons, labels, dates, and settings.
- Define fallback behavior for missing translations.
- Ensure message titles, message bodies, and user-entered content work correctly in both languages.
- Ensure layouts accommodate different text lengths and wrapping behavior.

### Exit Checks

- All user-facing strings are translated through the i18n system.
- Persian UI renders correctly in RTL.
- English UI renders correctly in LTR.
- Language selection persists after app restart.
- Switching language updates the active interface consistently.
- Text does not overflow or become clipped on supported screen sizes.
- Validation, loading, empty, and error states are localized.
- Tests cover translation fallback and language-dependent behavior where practical.

---

## Milestone 6 — Light and Dark Themes

- Implement light and dark themes using centralized theme tokens.
- Apply themes consistently across all screens and reusable components.
- Add theme selection to the Drawer.
- Display the current theme clearly.
- Persist the selected theme across app restarts.
- Ensure cards, inputs, buttons, text, icons, navigation, and backgrounds adapt to the active theme.
- Verify sufficient color contrast in both themes.
- Avoid hardcoded colors inside screens and reusable components.
- Preserve the existing brand identity across both themes.
- Keep the architecture extensible for a future system-theme option.

### Theme Transition Animation

- Implement an animated theme transition.
- The transition must originate from the exact screen coordinates of the pressed theme toggle control.
- Use a circular wave, circular reveal, or equivalent expanding overlay.
- Calculate the animation origin from the actual toggle position rather than using a fixed screen-center origin.
- Support both light-to-dark and dark-to-light transitions.
- Handle different screen sizes, safe areas, Drawer positions, and RTL/LTR layouts.
- Prevent flickering, layout jumps, and inconsistent intermediate states.
- Handle rapid repeated toggles safely.
- Respect reduced-motion preferences where supported.
- Provide a documented fallback if the preferred animation is not reliable on the target platform.

### Exit Checks

- Light and dark themes are applied consistently throughout the app.
- Theme selection persists after app restart.
- Theme toggle is accessible from the Drawer.
- Theme labels and accessibility descriptions are localized.
- Theme transition originates from the actual toggle location.
- The animation works in both directions.
- No visible flickering or major layout jumps occur.
- Both themes meet the documented contrast and accessibility requirements.
- Theme behavior is tested on an Android emulator or device.
- No unnecessary native dependency is introduced without documented rationale.

---

## Milestone 7 — Design Refinement and UX Consistency

- Review and refine the visual design of all existing screens.
- Ensure cards, sections, inputs, buttons, and spacing are visually harmonious.
- Improve Create Message screen hierarchy and usability.
- Ensure title and body fields have clear visual distinction.
- Ensure consistent component dimensions, corner radii, typography, and spacing.
- Review keyboard behavior and content scrolling.
- Refine empty, loading, error, success, and confirmation states.
- Verify consistent visual behavior across Persian RTL and English LTR.
- Verify consistent visual behavior across light and dark themes.
- Use subtle, purposeful motion where appropriate.
- Avoid unnecessary decoration, excessive animation, and visual clutter.
- Preserve accessibility and touch-target requirements.

### Exit Checks

- All primary screens follow the documented design system.
- Create Message screen has clear and consistent visual hierarchy.
- Cards and sections use consistent spacing and styling.
- Light and dark themes maintain visual consistency.
- Persian and English layouts remain usable and visually balanced.
- Small and large supported Android screens are tested.
- Keyboard and scrolling behavior are verified.
- Accessibility and contrast checks are completed.
- Existing functionality from previous milestones remains intact.

---

## Milestone 8 — Release Readiness

- App icon, label, versioning, and launcher behavior.
- Release build and signing documentation.
- Privacy copy and store listing draft.
- Test on representative Android versions and screen sizes.
- Verify no debug logging or secrets in release.
- Verify localized app copy and supported language behavior.
- Verify light and dark themes in release builds.
- Review permissions and privacy implications of all dependencies.

### Exit Checks

- Signed release artifact is produced locally.
- Installation and upgrade paths are tested.
- Bazaar/Myket submission checklist is complete.
- Release build contains no unintended debug logs or secrets.
- Persian and English UI are verified in the release build.
- Light and dark themes are verified in the release build.
- No outside-root changes were made.

---

## Explicitly Deferred

- Accounts and authentication.
- Backend and cloud synchronization.
- Email delivery.
- Social functionality.
- Attachments.
- AI features.
- Recurring messages.
- Analytics and advertisements.
- Multi-device synchronization.
- Cloud-based message backup.
- Automatic email delivery at scheduled time.
- System-theme support, unless implemented as a compatible extension of the theme architecture.
