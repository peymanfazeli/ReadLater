import notifee, {TriggerType} from 'react-native-notify-kit';
import {
  scheduleUnlock,
  cancelUnlock,
  reconcile,
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
