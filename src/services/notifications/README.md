# Notifications Service

## Responsibility
Covers the Milestone 4 requirement "add Android local notification adapter":
schedule one reminder per locked message for its `unlockAt`, cancel on delete
or read, reschedule what is missing, and route a notification press to the
exact message — without ever exposing message content in the notification UI.

## Public interfaces
All functions are exported from `NotificationService.ts`; there is no class
or singleton, so tests exercise the same entry points the screens use.

- `permissionAuthorized(): Promise<boolean>` — true when
  `authorizationStatus >= AUTHORIZED` (Android < 13 reports AUTHORIZED
  without prompting).
- `requestPermission(): Promise<boolean>` — idempotently creates the
  `messages` channel, then prompts for `POST_NOTIFICATIONS` (Android 13+);
  returns the resulting authorized state.
- `scheduleUnlock(messageId, unlockAt: Date): Promise<void>` — schedules a
  `TIMESTAMP` trigger notification keyed by the message id.
- `cancelUnlock(messageId): Promise<void>` — cancels the pending trigger for
  one message.
- `reconcile(messages: {id, unlockAt}[]): Promise<void>` — schedules any
  future unlock that has no pending alarm; idempotent, safe to run on every
  Home focus.
- `getInitialMessageId(): Promise<string | null>` — the message id behind a
  cold-start notification press.
- `onUnlockPress(cb): () => void` — subscribes to foreground/background
  presses; returns an unsubscribe.
- `openNotificationSettings(): Promise<void>` — OS notification settings
  deep link.

## Data flow
- Create: `HomeScreen` focus runs `reconcile(state.data.messages)`; any future
  locked message without a pending alarm gets scheduled. This single path
  also heals restarts, reboots, and OEM-killed alarms — NotifyKit persists its
  pending schedule in a Room DB and re-arms it on `BOOT_COMPLETED` (with a
  `BOOT_COUNT` cold-start self-heal for OEMs that suppress the broadcast).
- Delete: `RevealMessageScreen` calls `cancelUnlock(id)` after the repository
  delete.
- Press: cold start reads `getInitialMessageId` in `App.tsx` and navigates
  to `RevealMessage` by id; a warm/background press is routed by
  `onUnlockPress` guarded by `navigationRef.isReady()`.

## Privacy
The notification shows a fixed title ("بعدابخون") and a fixed body
("پیام تو آماده‌ی خواندن شده است"). The only dynamic payload is
`data.messageId`; no part of the message body, and no unlock timestamp, ever
enters a notification. Locked-body isolation is unaffected: the reveal screen
still derives status from `unlockAt` and the repository still nulls the body.

## Dependencies
- `react-native-notify-kit` (pinned 10.7.1) — the notification engine.
  Chosen over `@notifee/react-native` (9.1.8, last release Dec 2024, archived
  by Invertase in April 2026, new-architecture issues unresolved) and over a
  hand-rolled Kotlin `AlarmManager` module. `react-native-notify-kit` is the
  officially recommended community fork: New Architecture TurboModules only
  (this app's RN 0.77 defaults new arch on), Android bridge in Kotlin,
  compiles against our Kotlin 2.0.21 toolchain and compileSdk 35, and keeps
  the bug-fixed NotifeeCore (AlarmManager default with exact-alarm fallback,
  Room-persisted triggers, reboot re-arm + BOOT_COUNT self-heal, tap-to-open
  defaulting). `expo-notifications` was rejected: not usable in a bare RN CLI
  app without the Expo module layer, and it is not Android-adapter focused.
  Impact: trigger notifications can fire inexact on Android 14+ when
  `SCHEDULE_EXACT_ALARM` is denied by default — an unlock reminder can arrive
  a few minutes late, which is acceptable because the message is unlocked by
  the clock, not by the notification.
- `android.permission.POST_NOTIFICATIONS` added to the app manifest
  (Android 13+ runtime permission).

## Test strategy
- `__tests__/notifications.service.test.ts` uses the library's official
  `jest-mock` (wired in `jest.setup.js`) and covers: trigger args
  (id + timestamp + alarmManager), no-body-leak (fixed body, data carries
  only `messageId`), reconcile schedules only missing future unlocks and
  skips pending/past, cancel by id, permission status mapping, channel
  creation on request, and initial-message-id extraction.

## Known limitations
- On Android 14+ without `SCHEDULE_EXACT_ALARM`, alarms may be inexact;
  re-check `getTriggerNotificationIds`/reconcile on Home focus heals drops.
- Press routing relies on `navigationRef.isReady()`; if a press arrives while
  the navigator has not mounted (extremely early cold start), it is ignored
  rather than queued. The reveal screen and Home both reload on every render,
  so the message is reachable from Home regardless.
- `reconcile` fires one check on every Home focus; fine for personal scale.