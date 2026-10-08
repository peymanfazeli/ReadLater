import {deriveStatus, type TodoItem} from './types';
import type {Language} from '../../../i18n';

export const MAX_BODY_LENGTH = 5000;
export const MAX_TITLE_LENGTH = 80;
export const MAX_TODO_ITEMS = 50;
export const MAX_TODO_ITEM_LENGTH = 200;

// Distinct error codes let the UI localize title vs body errors independently.
export type TitleValidationError = 'titleEmpty' | 'titleTooLong';
export type BodyValidationError = 'empty' | 'tooLong';
export type TodoValidationError = 'todoEmpty' | 'todoInvalid';

// Titles and bodies are validated independently so a long title does not mask
// a missing body (and vice versa). Both trim leading/trailing whitespace.
export function validateTitle(
  raw: string,
): {ok: true; value: string} | {ok: false; error: TitleValidationError} {
  const value = raw.trim();
  if (value.length === 0) {
    return {ok: false, error: 'titleEmpty'};
  }
  if (value.length > MAX_TITLE_LENGTH) {
    return {ok: false, error: 'titleTooLong'};
  }
  return {ok: true, value};
}

// Returns a trimmed, validated body or the first validation error.
export function validateBody(
  raw: string,
): {ok: true; value: string} | {ok: false; error: BodyValidationError} {
  const value = raw.trim();
  if (value.length === 0) {
    return {ok: false, error: 'empty'};
  }
  if (value.length > MAX_BODY_LENGTH) {
    return {ok: false, error: 'tooLong'};
  }
  return {ok: true, value};
}

// Todo messages validate their item list instead of a body: blank drafts are
// dropped, and the list must still hold at least one item within the caps.
export function validateTodoItems(
  raw: readonly {text: string; done?: boolean}[],
):
  | {ok: true; value: TodoItem[]}
  | {ok: false; error: TodoValidationError} {
  const items: TodoItem[] = [];
  for (const entry of raw) {
    const text = entry.text.trim();
    if (text.length === 0) {
      continue;
    }
    if (text.length > MAX_TODO_ITEM_LENGTH) {
      return {ok: false, error: 'todoInvalid'};
    }
    items.push({text, done: entry.done === true});
  }
  if (items.length === 0) {
    return {ok: false, error: 'todoEmpty'};
  }
  if (items.length > MAX_TODO_ITEMS) {
    return {ok: false, error: 'todoInvalid'};
  }
  return {ok: true, value: items};
}

// An unlock date is valid only when it parses as a real date in the future.
// Locked-state isolation relies on this: an invalid unlockAt must be rejected
// before persistence rather than drifting through deriveStatus.
export function validateUnlockAt(
  unlockAt: string,
  now: Date = new Date(),
): boolean {
  const time = new Date(unlockAt).getTime();
  return Number.isFinite(time) && time > now.getTime();
}

// Cheap structural sanity check applied to records read from storage.
// Returns a normalized record or null when the record must be dropped.
// Since the MVP is pre-release, records written before the required `title`
// field existed fail this check and are dropped (surfaced as a Home notice),
// exactly like other malformed records.
export function sanitizeStoredRecord(
  raw: Record<string, unknown>,
): {
  id: string;
  title: string;
  body: string;
  items?: TodoItem[];
  createdAt: string;
  unlockAt: string;
  locked: boolean;
  openedAt: string | null;
} | null {
  const {id, title, body, items, createdAt, unlockAt, locked, openedAt} =
    raw as Record<string, unknown>;
  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    typeof body !== 'string' ||
    typeof createdAt !== 'string' ||
    typeof unlockAt !== 'string'
  ) {
    return null;
  }
  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  if (
    trimmedTitle.length === 0 ||
    trimmedTitle.length > MAX_TITLE_LENGTH
  ) {
    return null;
  }
  // Todo messages store an empty body, so a record is valid with either a
  // non-empty body or a well-formed, non-empty item list. Anything else is
  // malformed and dropped like any other bad record.
  let cleanItems: TodoItem[] | null = null;
  if (items !== undefined) {
    cleanItems = sanitizeTodoItems(items);
    if (cleanItems === null) {
      return null;
    }
  }
  if (trimmedBody.length === 0 && cleanItems === null) {
    return null;
  }
  const createdAtTime = new Date(createdAt).getTime();
  const unlockAtTime = new Date(unlockAt).getTime();
  if (
    !Number.isFinite(createdAtTime) ||
    !Number.isFinite(unlockAtTime) ||
    unlockAtTime < createdAtTime
  ) {
    return null;
  }
  // `openedAt` is cosmetic metadata: a bad value is nulled instead of
  // dropping the whole record.
  let normalizedOpenedAt: string | null = null;
  if (
    typeof openedAt === 'string' &&
    Number.isFinite(new Date(openedAt).getTime())
  ) {
    normalizedOpenedAt = openedAt;
  }
  return {
    id,
    title: trimmedTitle,
    body: trimmedBody,
    items: cleanItems ?? undefined,
    createdAt,
    unlockAt,
    // Fail-secure: legacy records (flag absent) and non-boolean garbage are
    // treated as locked; only an explicit `false` leaves the body readable.
    locked: locked === false ? false : true,
    openedAt: normalizedOpenedAt,
  };
}

// Structural check for the optional item list. Returns null when the list is
// malformed, empty after trimming, or outside the documented caps, so bad
// todo records are dropped instead of rendered.
function sanitizeTodoItems(raw: unknown): TodoItem[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const drafts: {text: string; done?: boolean}[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) {
      return null;
    }
    const {text, done} = entry as Record<string, unknown>;
    if (typeof text !== 'string') {
      return null;
    }
    drafts.push({text, done: done === true});
  }
  const result = validateTodoItems(drafts);
  return result.ok ? result.value : null;
}

// Dates are formatted for the active language: Persian calendar for `fa`,
// Gregorian for `en`.
export function formatDate(iso: string, language: Language = 'fa'): string {
  if (language === 'fa') {
    return new Date(iso).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isUnlocked(unlockAt: string, now: Date = new Date()): boolean {
  return deriveStatus(unlockAt, now) === 'unlocked';
}
