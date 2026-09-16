import {deriveStatus} from './types';

export const MAX_BODY_LENGTH = 5000;

export type BodyValidationError = 'empty' | 'tooLong';

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
export function sanitizeStoredRecord(
  raw: Record<string, unknown>,
): {id: string; body: string; createdAt: string; unlockAt: string} | null {
  const {id, body, createdAt, unlockAt} = raw as Record<string, unknown>;
  if (
    typeof id !== 'string' ||
    typeof body !== 'string' ||
    typeof createdAt !== 'string' ||
    typeof unlockAt !== 'string'
  ) {
    return null;
  }
  const trimmedBody = body.trim();
  if (trimmedBody.length === 0) {
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
  return {id, body: trimmedBody, createdAt, unlockAt};
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isUnlocked(unlockAt: string, now: Date = new Date()): boolean {
  return deriveStatus(unlockAt, now) === 'unlocked';
}
