

# CONTRIBUTING.md

## Change Discipline

- Keep each change focused on one clear purpose.
- Prefer small, additive, and local changes.
- Avoid unrelated formatting changes.
- Preserve existing behavior unless the change explicitly requires otherwise.
- Follow the project boundaries defined in `AGENTS.md`.
- Work only inside the project root.
- Read relevant documentation before implementing changes.
- Avoid broad refactors during feature development.
- Prefer existing project patterns and dependencies.
- Keep business logic outside UI components.
- Preserve locked-message privacy in all implementation and debugging work.
- Support Persian RTL and English LTR where applicable.
- Ensure light and dark themes are supported where applicable.
- Use descriptive commit messages.
- Update documentation when behavior, architecture, dependencies, or setup changes.
- Do not introduce deferred MVP features without an explicit product decision.

---

## Implementation Guidelines

- Use TypeScript and maintain strict typing where practical.
- Validate all user-controlled input.
- Keep domain rules testable independently of React Native UI.
- Isolate native integrations behind adapters.
- Avoid unnecessary global state and premature abstractions.
- Use centralized i18n resources for all user-facing strings.
- Use centralized theme tokens instead of hardcoded theme-dependent values.
- Avoid exposing locked message bodies through UI, notifications, logs, errors, accessibility labels, or navigation parameters.
- Preserve form state, navigation state, and user data during language and theme changes where applicable.
- Consider small screens, large screens, keyboard interaction, safe areas, and text wrapping.
- Handle loading, empty, success, and error states explicitly.

---

## Dependency Changes

Before adding a dependency:

- Document why it is needed.
- Explain why platform APIs or existing dependencies are insufficient.
- Consider simpler alternatives.
- Document maintenance and bundle-size impact.
- Verify Android and React Native compatibility.
- Consider potential future iOS compatibility.
- Document any native configuration or build changes.
- Confirm that the dependency does not require unsafe changes outside the project root.

Avoid dependencies that are not necessary for the current MVP.

---

## Documentation Requirements

Update relevant documentation when changing:

- Application behavior.
- Domain rules.
- Architecture.
- User-facing flows.
- Theme behavior.
- Language or layout direction.
- Dependencies.
- Build or setup instructions.
- Testing strategy.
- Known limitations.

Every completed feature or module directory must contain an appropriate local `README.md` covering:

- Responsibility.
- Public interfaces.
- Data flow.
- Dependencies.
- Test strategy.
- Known limitations.

Documentation should be concise, accurate, and specific to the affected area. Avoid duplicating information without a clear benefit.

---

## Review Checklist

### Scope and Safety

- [ ] Is the change inside the project root?
- [ ] Were all target paths verified before writing?
- [ ] Were no parent-level, shared, global, or unrelated project files modified?
- [ ] Is the change limited to the requested scope?
- [ ] Were no secrets, signing files, or local properties added to Git?
- [ ] Were no unnecessary dependencies introduced?

### Privacy and Data Protection

- [ ] Does the change preserve locked-message privacy?
- [ ] Is locked message content excluded from notifications?
- [ ] Is locked message content excluded from logs, errors, and debugging output?
- [ ] Is locked message content excluded from navigation parameters and accessibility labels?
- [ ] Are access checks performed before revealing message bodies?
- [ ] Are persisted data and malformed records handled safely?

### Localization and Layout

- [ ] Is Persian RTL handled correctly?
- [ ] Is English LTR handled correctly?
- [ ] Are all user-facing strings managed through i18n?
- [ ] Are translation keys descriptive and consistent?
- [ ] Are dates, numbers, and validation messages localized?
- [ ] Does the layout accommodate different text lengths and wrapping?
- [ ] Are theme and language changes handled without unintended state loss?

### Theme and Visual Design

- [ ] Are light and dark themes supported where applicable?
- [ ] Are centralized theme tokens used?
- [ ] Is sufficient contrast maintained in both themes?
- [ ] Are interactive, disabled, loading, and error states theme-aware?
- [ ] Is the Drawer theme control accessible and localized?
- [ ] Does the theme transition originate from the actual toggle position where applicable?
- [ ] Is reduced-motion behavior or a graceful fallback considered?

### UX and Accessibility

- [ ] Are empty states covered?
- [ ] Are loading states covered?
- [ ] Are error states covered?
- [ ] Are success and confirmation states covered where applicable?
- [ ] Are interactive controls accessible and appropriately sized?
- [ ] Are labels, hints, and accessibility states meaningful?
- [ ] Are keyboard interaction and safe areas considered?
- [ ] Does text remain readable with increased font scaling?
- [ ] Is information communicated through more than color alone?

### Testing

- [ ] Are tests appropriate for the scope of the change?
- [ ] Are domain rules tested independently where applicable?
- [ ] Are validation and boundary conditions covered?
- [ ] Are persistence and restart scenarios covered where applicable?
- [ ] Are notification permission and scheduling edge cases covered where applicable?
- [ ] Are RTL and LTR behaviors considered?
- [ ] Are light and dark themes considered?
- [ ] Were typecheck, lint, and relevant tests executed?
- [ ] Were build checks executed where applicable?
- [ ] Are failed or skipped checks documented?

### Documentation

- [ ] Is the relevant module README updated?
- [ ] Are architecture or design documents updated when required?
- [ ] Are dependency decisions documented?
- [ ] Are known limitations documented?
- [ ] Is the change clearly described in the final report?

---

## Commit Messages

Use descriptive commit messages that explain the purpose of the change.

Prefer:

- `feat: add local message persistence`
- `fix: prevent locked message body exposure`
- `test: cover unlock date validation`
- `refactor: isolate notification adapter`
- `docs: update theme architecture`

Avoid:

- `update`
- `changes`
- `fix stuff`
- `misc`
- Unrelated changes combined in one commit.

---

## Final Change Report

After completing a coherent change or milestone, report:

- Summary of the implementation.
- Changed files.
- Added or modified dependencies.
- Checks executed and their results.
- Privacy and safety considerations.
- Known limitations and remaining risks.
- Documentation updated.
- Suggested next task.