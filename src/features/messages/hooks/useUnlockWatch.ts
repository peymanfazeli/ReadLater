import {useEffect} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {
  cancelAllUnlocks,
  reconcile,
} from '../../../services/notifications/NotificationService';
import {useTranslation} from '../../../app/providers/SettingsProvider';
import type {Message} from '../domain/types';

// setTimeout overflows past 2^31-1 ms (~24.8 days); longer unlock waits are
// chunked — the refresh at the end of a chunk re-arms the next one.
const MAX_TIMEOUT_MS = 2147483647;

type WatchedMessage = Pick<Message, 'id' | 'status' | 'unlockAt'>;

// Owns the unlock moment for both app states:
// - Foreground (and 'inactive'): every pending native alarm is cancelled (no
//   heads-up while in app) and JS timers silently refetch at each unlockAt, so
//   the list and the reveal screen flip locked → unlocked live.
// - Background: timers are dropped and reconcile() re-arms the native alarms,
//   so the notification is what tells the user about the unlock.
// Message identity changes (create/delete/refresh) re-run the sync, which
// also picks up the new AppState on mount.
export function useUnlockWatch(
  messages: ReadonlyArray<WatchedMessage> | undefined,
  refresh: () => void,
): void {
  const {t} = useTranslation();

  useEffect(() => {
    if (!messages) {
      return;
    }
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const sync = (state: AppStateStatus) => {
      timers.forEach(clearTimeout);
      timers.length = 0;

      // Only a real backgrounding arms native alarms. 'inactive' (shade,
      // dialogs, app-switcher) keeps the in-app path so a transient state
      // can never swap our timers for a heads-up.
      if (state === 'background') {
        reconcile(messages, {
          title: t('notification.title'),
          body: t('notification.body'),
        }).catch(() => {});
        return;
      }

      // Foreground: disarm everything — including stray alarms from before
      // this policy or from a racing background reconcile — then arm timers.
      cancelAllUnlocks().catch(() => {});
      const now = Date.now();
      for (const m of messages) {
        if (m.status !== 'locked') {
          continue;
        }
        const delay = new Date(m.unlockAt).getTime() - now;
        if (delay <= 0) {
          refresh(); // already due — flip the stale locked status now
          continue;
        }
        timers.push(
          setTimeout(() => {
            if (alive) {
              refresh();
            }
          }, Math.min(delay, MAX_TIMEOUT_MS)),
        );
      }
    };

    sync(AppState.currentState ?? 'active');
    const subscription = AppState.addEventListener('change', sync);
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      subscription.remove();
    };
  }, [messages, refresh, t]);
}
