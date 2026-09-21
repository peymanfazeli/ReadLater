export type MessageStatus = 'locked' | 'unlocked';

// Full, privacy-sensitive record as persisted in storage. The body is always
// present here; it must never cross into list/reveal boundaries while locked.
export type StoredMessage = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  unlockAt: string;
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
};

// Status is derived at read time and is never trusted from storage.
export function deriveStatus(
  unlockAt: string,
  now: Date = new Date(),
): MessageStatus {
  return new Date(unlockAt).getTime() <= now.getTime() ? 'unlocked' : 'locked';
}

export function toView(
  stored: StoredMessage,
  now: Date = new Date(),
): Message {
  const status = deriveStatus(stored.unlockAt, now);
  return {
    id: stored.id,
    title: stored.title,
    body: status === 'unlocked' ? stored.body : null,
    createdAt: stored.createdAt,
    unlockAt: stored.unlockAt,
    status,
  };
}
