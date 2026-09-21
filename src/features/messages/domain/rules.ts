import {deriveStatus} from './types';
import type {Language} from '../../../i18n';

export const MAX_BODY_LENGTH = 5000;
export const MAX_TITLE_LENGTH = 80;

// Distinct error codes let the UI localize title vs body errors independently.
export type TitleValidationError = 'titleEmpty' | 'titleTooLong';
export type BodyValidationError = 'empty' | 'tooLong';

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
  createdAt: string;
  unlockAt: string;
} | null {
  const {id, title, body, createdAt, unlockAt} = raw as Record<string, unknown>;
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
    trimmedTitle.length > MAX_TITLE_LENGTH ||
    trimmedBody.length === 0
  ) {
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
  return {
    id,
    title: trimmedTitle,
    body: trimmedBody,
    createdAt,
    unlockAt,
  };
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
