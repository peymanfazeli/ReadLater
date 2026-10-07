import {AppState} from 'react-native';
import notifee, {EventType, TriggerType} from 'react-native-notify-kit';
import {
  scheduleUnlock,
  cancelUnlock,
  cancelAllUnlocks,
  reconcile,
  onUnlockPress,
  permissionAuthorized,
  requestPermission,
  getInitialMessageId,
} from '../src/services/notifications/NotificationService';

const FUTURE = new Date(Date.now() + 86400000 * 10).toISOString();
const PAST = new Date(Date.now() - 86400000).toISOString();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('scheduleUnlock', () => {
  test('schedules a trigger notification keyed by message id', async () => {
    const unlockAt = new Date('2099-01-01T09:00:00.000Z');
    await scheduleUnlock('msg-1', unlockAt);

    expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({id: 'msg-1'}),
      {
        type: TriggerType.TIMESTAMP,
        timestamp: unlockAt.getTime(),
        alarmManager: true,
      },
    );
  });

  test('never leaks message content: fixed body, only messageId in data', async () => {
    const unlockAt = new Date('2099-01-01T09:00:00.000Z');
    await scheduleUnlock('msg-secret', unlockAt);

    const [notification] = (
      notifee.createTriggerNotification as jest.Mock
    ).mock.calls[0];
    expect(notification.body).not.toContain('secret');
    expect(notification.data).toEqual({messageId: 'msg-secret'});
    expect(Object.keys(notification.data)).toHaveLength(1);
  });

  test('refuses to arm while the app is in the foreground', async () => {
    const original = AppState.currentState;
    AppState.currentState = 'active';
    try {
      await scheduleUnlock('msg-fg', new Date('2099-01-01T09:00:00.000Z'));
      expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
    } finally {
      AppState.currentState = original;
    }
  });
});

describe('reconcile', () => {
  test('schedules only future messages that are not already pending', async () => {
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
      'already-scheduled',
    ]);

    await reconcile([
      {id: 'already-scheduled', unlockAt: FUTURE},
      {id: 'needs-schedule', unlockAt: FUTURE},
      {id: 'already-unlocked', unlockAt: PAST},
    ]);

    const ids = (notifee.createTriggerNotification as jest.Mock).mock.calls.map(
      ([n]) => n.id,
    );
    expect(ids).toEqual(['needs-schedule']);
  });

  test('does not call anything when everything is already covered', async () => {
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
      'a',
      'b',
    ]);
    await reconcile([
      {id: 'a', unlockAt: FUTURE},
      {id: 'b', unlockAt: FUTURE},
    ]);
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
  });
});

describe('cancelUnlock', () => {
  test('cancels the trigger for the message id', async () => {
    await cancelUnlock('msg-1');
    expect(notifee.cancelTriggerNotification).toHaveBeenCalledWith('msg-1');
  });

  test('cancelAllUnlocks sweeps every pending trigger id', async () => {
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
      'a',
      'b',
    ]);
    await cancelAllUnlocks();
    expect(notifee.cancelTriggerNotification).toHaveBeenCalledWith('a');
    expect(notifee.cancelTriggerNotification).toHaveBeenCalledWith('b');
  });
});

describe('onUnlockPress', () => {
  test('navigates only on a real press, not on delivery/creation/dismiss', () => {
    const cb = jest.fn();
    onUnlockPress(cb);
    const foreground = (notifee.onForegroundEvent as jest.Mock).mock
      .calls[0][0];
    const notification = {id: 'n1', data: {messageId: 'msg-1'}};

    foreground({type: EventType.DELIVERED, detail: {notification}});
    foreground({type: EventType.TRIGGER_NOTIFICATION_CREATED, detail: {notification}});
    foreground({type: EventType.DISMISSED, detail: {notification}});
    expect(cb).not.toHaveBeenCalled();

    foreground({type: EventType.PRESS, detail: {notification}});
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('msg-1');
  });
});

describe('permission', () => {
  test('permissionAuthorized reflects the settings status', async () => {
    await expect(permissionAuthorized()).resolves.toBe(true);
  });

  test('requestPermission creates the channel and returns status', async () => {
    await expect(requestPermission()).resolves.toBe(true);
    expect(notifee.createChannel).toHaveBeenCalledWith(
      expect.objectContaining({id: 'messages'}),
    );
    expect(notifee.requestPermission).toHaveBeenCalled();
  });
});

describe('getInitialMessageId', () => {
  test('reads only the messageId data key from the launch notification', async () => {
    (notifee.getInitialNotification as jest.Mock).mockResolvedValue({
      notification: {id: 'n-1', data: {messageId: 'deep-linked-msg'}},
    });
    await expect(getInitialMessageId()).resolves.toBe('deep-linked-msg');
  });

  test('returns null when the launch notification has no message id', async () => {
    (notifee.getInitialNotification as jest.Mock).mockResolvedValue({
      notification: {id: 'n-1', data: {other: 'x'}},
    });
    await expect(getInitialMessageId()).resolves.toBeNull();
  });
});
