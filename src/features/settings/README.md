# Settings Feature

## Responsibility
User-facing app preferences. Currently only notification permission state: a
single card that shows whether unlock reminders are enabled and lets the user
enable them (or jump to the OS settings screen).

## Public interfaces
- `SettingsScreen` (`screens/SettingsScreen.tsx`), registered in the root
  stack as `Settings` (title «تنظیمات»). Reached from the drawer's bottom
  «تنظیمات» button.

## Data flow
- Reads notification authorization via `permissionAuthorized()` on every
  focus. When disabled, «فعال کردن اعلان‌ها» calls `requestPermission()` and,
  on denial, `openNotificationSettings()`, then refreshes the shared
  `NotificationAttentionProvider` state so the drawer/home red dots update.
  When enabled, the button is shown disabled («اعلان‌ها فعال است») — turning
  notifications off is intentionally not offered in-app; the OS owns that
  action (Android cannot programmatically revoke `POST_NOTIFICATIONS`).

## Dependencies
- `src/services/notifications/NotificationService` for permission helpers.
- Shared components (`Typography`, `Button`, `Card`), theme tokens, and
  navigation types from `src/app/navigation`.

## Test strategy
- Follows the same focus-driven permission read as `HomeScreen`; covered by
  the app-level render test. No domain logic lives here.

## Known limitations
- No in-app "disable notifications" path by design (OS-only).
- A single permission card; future settings (language, theme, data export)
  will extend this screen.