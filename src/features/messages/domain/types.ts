export type MessageStatus = 'locked' | 'unlocked';

// Full, privacy-sensitive record as persisted in storage. The body is always
// present here; it must never cross into list/reveal boundaries while locked.
export type StoredMessage = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  unlockAt: string;
  // The user's lock choice at creation. Locked (default) hides the body until
  // `unlockAt`; unlocked messages are readable immediately and `unlockAt`
  // only drives the reminder. Sanitize normalizes a missing/invalid flag to
  // `true`, so legacy records stay locked (fail-secure).
  locked: boolean;
  // Set the first time the user views the message after it unlocked; absent
  // (pre-existing records) or null means "not read yet".
  openedAt?: string | null;
};

// Public view of a message. Locked messages never carry a body, but the title
// is safe metadata and may be displayed in lists and previews.
export type Message = {
  id: string;
  title: string;
  body: string | null;
  createdAt: string;
  unlockAt: string;
  status: MessageStatus;
  openedAt: string | null;
};

// Status is derived at read time and is never trusted from storage. A message
// the user did not lock is always 'unlocked'; `locked` defaults to true so an
// omitted flag falls back to time-based locking.
export function deriveStatus(
  unlockAt: string,
  now: Date = new Date(),
  locked: boolean = true,
): MessageStatus {
  if (!locked) {
    return 'unlocked';
  }
  return new Date(unlockAt).getTime() <= now.getTime() ? 'unlocked' : 'locked';
}

export function toView(
  stored: StoredMessage,
  now: Date = new Date(),
): Message {
  const status = deriveStatus(stored.unlockAt, now, stored.locked);
  return {
    id: stored.id,
    title: stored.title,
    body: status === 'unlocked' ? stored.body : null,
    createdAt: stored.createdAt,
    unlockAt: stored.unlockAt,
    status,
    openedAt: typeof stored.openedAt === 'string' ? stored.openedAt : null,
  };
}
