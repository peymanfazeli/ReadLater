# ARCHITECTURE.md

## Principles

- Small, explicit, feature-oriented structure.
- Local-first and privacy-first.
- Android-first, with an architecture that does not unnecessarily block future iOS support.
- Business rules are testable without React Native UI.
- Native integrations are isolated behind adapters.
- Support Persian (`fa`) and English (`en`) from the beginning.
- Support RTL and LTR without duplicating screen implementations.
- Support light and dark themes through centralized, token-based theme definitions.
- Avoid premature clean-architecture layers and generic abstractions.
- Prefer simple, maintainable solutions over speculative flexibility.
- Keep private message content protected throughout the application lifecycle.

---

## Suggested Structure

```text
src/

  app/
    navigation/
    providers/

  components/
    README.md

  features/
    messages/
      domain/
      data/
      screens/
      components/
      hooks/
      README.md

  services/
    notifications/
    storage/

  theme/
    README.md

  utils/

  i18n/
    README.md