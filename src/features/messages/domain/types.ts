export type MessageStatus = 'locked' | 'unlocked';

// One checkbox entry of a todo-style message. Items carry message content and
// follow the same privacy rules as the body: they must never cross into
// list/reveal boundaries while the message is locked.
export type TodoItem = {
  text: string;
  done: boolean;
};

// Full, privacy-sensitive record as persisted in storage. The body is always
// present here; it must never cross into list/reveal boundaries while locked.
// `items` is present only for todo messages (and then always non-empty); its
// absence marks a plain text message, so legacy records need no migration.
export type StoredMessage = {
  id: string;
  title: string;
  body: string;
  items?: TodoItem[];
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
  // Todo entries, or null for plain text messages. Null while locked, so
  // item text never crosses the reveal boundary before `unlockAt`.
  items: TodoItem[] | null;
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
    items:
      status === 'unlocked' && stored.items != null && stored.items.length > 0
        ? stored.items
        : null,
    createdAt: stored.createdAt,
    unlockAt: stored.unlockAt,
    status,
    openedAt: typeof stored.openedAt === 'string' ? stored.openedAt : null,
  };
}
