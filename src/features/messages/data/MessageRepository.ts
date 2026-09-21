import {createId} from '../domain/id';
import {
  sanitizeStoredRecord,
  validateBody,
  validateTitle,
  validateUnlockAt,
} from '../domain/rules';
import {toView, type Message, type StoredMessage} from '../domain/types';
import type {MessageStorage} from '../../../services/storage/types';

export type CreateMessageInput = {
  title: string;
  body: string;
  unlockAt: string;
};

export type CreateMessageError =
  | 'titleEmpty'
  | 'titleTooLong'
  | 'empty'
  | 'tooLong'
  | 'invalidUnlockAt';

export type CreateMessageResult =
  | {ok: true; message: Message}
  | {ok: false; error: CreateMessageError};

export type MessageList = {
  messages: Message[];
  // True when the stored payload was unreadable JSON (corrupt storage).
  // Exposed so the UI can warn instead of silently showing an empty list.
  corrupt: boolean;
  // Count of records dropped on this load because they failed the structural
  // sanity check or were duplicate ids. Kept out of the messages array.
  dropped: number;
};

type LoadResult = {
  records: StoredMessage[];
  corrupt: boolean;
  dropped: number;
};

export class MessageRepository {
  constructor(
    private readonly storage: MessageStorage,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async list(): Promise<MessageList> {
    const {records, corrupt, dropped} = await this.readAll();
    const sorted = [...records].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return {messages: sorted.map(r => toView(r, this.now())), corrupt, dropped};
  }

  async get(id: string): Promise<Message | null> {
    const {records} = await this.readAll();
    const found = records.find(r => r.id === id);
    return found ? toView(found, this.now()) : null;
  }

  async create(
    input: CreateMessageInput,
  ): Promise<CreateMessageResult> {
    const title = validateTitle(input.title);
    if (!title.ok) {
      return {ok: false, error: title.error};
    }
    const body = validateBody(input.body);
    if (!body.ok) {
      return {ok: false, error: body.error};
    }
    const clock = this.now();
    if (!validateUnlockAt(input.unlockAt, clock)) {
      return {ok: false, error: 'invalidUnlockAt'};
    }
    const record: StoredMessage = {
      id: createId(),
      title: title.value,
      body: body.value,
      createdAt: clock.toISOString(),
      unlockAt: input.unlockAt,
    };
    const {records} = await this.readAll();
    await this.writeAll([...records, record]);
    return {ok: true, message: toView(record, clock)};
  }

  async delete(id: string): Promise<boolean> {
    const {records} = await this.readAll();
    const next = records.filter(r => r.id !== id);
    if (next.length === records.length) {
      return false;
    }
    await this.writeAll(next);
    return true;
  }

  private async readAll(): Promise<LoadResult> {
    const raw = await this.storage.read();
    if (raw === null || raw.trim().length === 0) {
      return {records: [], corrupt: false, dropped: 0};
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Corrupt data must not crash the app or wipe anything silently; we
      // surface it and let the next write replace it.
      return {records: [], corrupt: true, dropped: 0};
    }
    if (!Array.isArray(parsed)) {
      return {records: [], corrupt: true, dropped: 0};
    }
    const seen = new Set<string>();
    const records: StoredMessage[] = [];
    let dropped = 0;
    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) {
        dropped += 1;
        continue;
      }
      const clean = sanitizeStoredRecord(item as Record<string, unknown>);
      if (clean === null || seen.has(clean.id)) {
        dropped += 1;
        continue;
      }
      seen.add(clean.id);
      records.push(clean);
    }
    return {records, corrupt: false, dropped};
  }

  private async writeAll(records: StoredMessage[]): Promise<void> {
    await this.storage.write(JSON.stringify(records));
  }
}
