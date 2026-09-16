import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
  type InitialNotification,
  type Notification,
} from 'react-native-notify-kit';

const CHANNEL_ID = 'messages';
const MESSAGE_ID_KEY = 'messageId';

// Channel is created idempotently by Android; a call on every schedule is
// cheap and avoids module-level state.
async function ensureChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'باز شدن پیام‌ها',
    importance: AndroidImportance.HIGH,
  });
}

function messageIdOf(
  notification: Notification | undefined,
  initial?: InitialNotification | null,
): string | null {
  const target = initial ? (initial.notification ?? undefined) : notification;
  const id = target?.data?.[MESSAGE_ID_KEY];
  return typeof id === 'string' && id.length > 0 ? id : null;
}

// True when the user will actually see notifications (Android < 13 reports
// AUTHORIZED without prompting).
export async function permissionAuthorized(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
}

// Creates the channel and prompts for POST_NOTIFICATIONS (Android 13+).
export async function requestPermission(): Promise<boolean> {
  await ensureChannel();
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
}

// Schedules the unlock reminder. The notification carries only the message id
// in its data payload — never any part of the message body.
export async function scheduleUnlock(
  messageId: string,
  unlockAt: Date,
): Promise<void> {
  await ensureChannel();
  await notifee.createTriggerNotification(
    {
      id: messageId,
      title: 'بعدابخون',
      body: 'پیام تو آماده‌ی خواندن شده است',
      data: {[MESSAGE_ID_KEY]: messageId},
      android: {channelId: CHANNEL_ID},
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: unlockAt.getTime(),
      alarmManager: true,
    },
  );
}

export async function cancelUnlock(messageId: string): Promise<void> {
  await notifee.cancelTriggerNotification(messageId);
}

// Re-schedules any future unlock that has no pending alarm. Idempotent, so it
// is safe to run on every Home focus (covers app restart, reboot, and any
// lost alarms). NotifyKit persists its schedule across restarts, so a pending
// id references the same message and is skipped.
export async function reconcile(
  messages: ReadonlyArray<{id: string; unlockAt: string}>,
): Promise<void> {
  const now = Date.now();
  const pending = new Set(await notifee.getTriggerNotificationIds());
  await Promise.all(
    messages
      .filter(m => new Date(m.unlockAt).getTime() > now)
      .map(m =>
        pending.has(m.id)
          ? Promise.resolve()
          : scheduleUnlock(m.id, new Date(m.unlockAt)),
      ),
  );
}

// Message id carried by the notification that launched a cold start.
export async function getInitialMessageId(): Promise<string | null> {
  const initial = await notifee.getInitialNotification();
  return messageIdOf(undefined, initial);
}

// Subscribes to notification presses (app open in foreground or background).
// Returns an unsubscribe function. In the killed state the press also launches
// the main activity, so getInitialMessageId() above covers that path.
export function onUnlockPress(cb: (messageId: string) => void): () => void {
  const handle = (notification?: Notification) => {
    const id = messageIdOf(notification);
    if (id) {cb(id);}
  };
  notifee.onBackgroundEvent(async ({detail}) => {
    if (detail?.notification) {handle(detail.notification);}
  });
  return notifee.onForegroundEvent(({detail}) => {
    if (detail?.notification) {handle(detail.notification);}
  });
}

// Deep link into the OS notification settings screen.
export function openNotificationSettings(): Promise<void> {
  return notifee.openNotificationSettings();
}
