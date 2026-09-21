import {deriveStatus, toView} from '../src/features/messages/domain/types';
import {
  MAX_BODY_LENGTH,
  MAX_TITLE_LENGTH,
  formatDate,
  sanitizeStoredRecord,
  validateBody,
  validateTitle,
  validateUnlockAt,
} from '../src/features/messages/domain/rules';
import {createId} from '../src/features/messages/domain/id';

const NOW = new Date('2026-06-01T12:00:00.000Z');

describe('validateBody', () => {
  it('rejects empty and whitespace-only bodies', () => {
    expect(validateBody('')).toEqual({ok: false, error: 'empty'});
    expect(validateBody('   \n\t ')).toEqual({ok: false, error: 'empty'});
  });

  it('trims and accepts a valid body', () => {
    expect(validateBody('  سلام به آینده  ')).toEqual({
      ok: true,
      value: 'سلام به آینده',
    });
  });

  it('enforces the max length boundary', () => {
    const atLimit = 'a'.repeat(MAX_BODY_LENGTH);
    const overLimit = 'a'.repeat(MAX_BODY_LENGTH + 1);
    expect(validateBody(atLimit).ok).toBe(true);
    expect(validateBody(overLimit)).toEqual({ok: false, error: 'tooLong'});
  });
});

describe('validateUnlockAt', () => {
  it('rejects past, exact-now, and unparsable dates', () => {
    expect(validateUnlockAt('2026-05-01T00:00:00.000Z', NOW)).toBe(false);
    expect(validateUnlockAt(NOW.toISOString(), NOW)).toBe(false);
    expect(validateUnlockAt('not-a-date', NOW)).toBe(false);
  });

  it('accepts a strictly-future date', () => {
    expect(validateUnlockAt('2026-07-01T00:00:00.000Z', NOW)).toBe(true);
  });
});

describe('sanitizeStoredRecord', () => {
  it('normalizes a valid record and trims the title and body', () => {
    expect(
      sanitizeStoredRecord({
        id: 'm1',
        title: '  self note  ',
        body: '  self note  ',
        createdAt: '2026-05-01T00:00:00.000Z',
        unlockAt: '2026-07-01T00:00:00.000Z',
      }),
    ).toEqual({
      id: 'm1',
      title: 'self note',
      body: 'self note',
      createdAt: '2026-05-01T00:00:00.000Z',
      unlockAt: '2026-07-01T00:00:00.000Z',
    });
  });

  it('drops records with missing/wrong-typed fields', () => {
    expect(sanitizeStoredRecord({body: 'x'})).toBeNull();
    expect(sanitizeStoredRecord({id: 1, body: 'x', createdAt: '', unlockAt: ''})).toBeNull();
    expect(
      sanitizeStoredRecord({
        id: 'm1',
        body: 42,
        createdAt: '2026-05-01T00:00:00.000Z',
        unlockAt: '2026-07-01T00:00:00.000Z',
      }),
    ).toBeNull();
  });

  it('drops records created before the title field existed', () => {
    expect(
      sanitizeStoredRecord({
        id: 'm1',
        body: 'x',
        createdAt: '2026-05-01T00:00:00.000Z',
        unlockAt: '2026-07-01T00:00:00.000Z',
      }),
    ).toBeNull();
  });

  it('drops empty titles and bodies and impossible timestamps', () => {
    expect(
      sanitizeStoredRecord({
        id: 'm1',
        title: 'x',
        body: '   ',
        createdAt: '2026-05-01T00:00:00.000Z',
        unlockAt: '2026-07-01T00:00:00.000Z',
      }),
    ).toBeNull();
    expect(
      sanitizeStoredRecord({
        id: 'm1',
        title: '   ',
        body: 'x',
        createdAt: '2026-05-01T00:00:00.000Z',
        unlockAt: '2026-07-01T00:00:00.000Z',
      }),
    ).toBeNull();
    expect(
      sanitizeStoredRecord({
        id: 'm1',
        title: 'x',
        body: 'x',
        createdAt: 'not-a-date',
        unlockAt: '2026-07-01T00:00:00.000Z',
      }),
    ).toBeNull();
    expect(
      sanitizeStoredRecord({
        id: 'm1',
        title: 'x',
        body: 'x',
        createdAt: '2026-08-01T00:00:00.000Z',
        unlockAt: '2026-07-01T00:00:00.000Z',
      }),
    ).toBeNull();
  });
});

describe('deriveStatus and toView', () => {
  it('treats unlockAt equal to now as unlocked', () => {
    expect(deriveStatus('2026-06-01T12:00:00.000Z', NOW)).toBe('unlocked');
    expect(deriveStatus('2026-07-01T12:00:00.000Z', NOW)).toBe('locked');
  });

  it('never exposes the body of a locked message', () => {
    const view = toView(
      {
        id: 'm1',
        title: 'secret title',
        body: 'secret',
        createdAt: NOW.toISOString(),
        unlockAt: '2026-07-01T12:00:00.000Z',
      },
      NOW,
    );
    expect(view.status).toBe('locked');
    expect(view.body).toBeNull();
    expect(view.title).toBe('secret title');
  });

  it('exposes the body only when unlocked', () => {
    const view = toView(
      {
        id: 'm1',
        title: 'secret title',
        body: 'secret',
        createdAt: NOW.toISOString(),
        unlockAt: '2026-05-01T12:00:00.000Z',
      },
      NOW,
    );
    expect(view.status).toBe('unlocked');
    expect(view.body).toBe('secret');
  });
});

describe('createId', () => {
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  it('generates RFC 4122 v4 UUIDs', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(createId()).toMatch(UUID_RE);
    }
  });

  it('generates unique ids', () => {
    const ids = new Set(Array.from({length: 50}, createId));
    expect(ids.size).toBe(50);
  });
});

describe('formatDate', () => {
  it('renders a Persian date for fa', () => {
    expect(formatDate('2026-06-01T12:00:00.000Z', 'fa')).toContain('۱۴۰۵');
  });

  it('renders an English date for en', () => {
    expect(formatDate('2026-06-01T12:00:00.000Z', 'en')).toContain('2026');
  });
});

describe('validateTitle', () => {
  it('rejects empty and whitespace-only titles', () => {
    expect(validateTitle('')).toEqual({ok: false, error: 'titleEmpty'});
    expect(validateTitle('   \n\t ')).toEqual({ok: false, error: 'titleEmpty'});
  });

  it('trims and accepts a valid title', () => {
    expect(validateTitle('  سلام به آینده  ')).toEqual({
      ok: true,
      value: 'سلام به آینده',
    });
  });

  it('enforces the max title length boundary', () => {
    const atLimit = 'a'.repeat(MAX_TITLE_LENGTH);
    const overLimit = 'a'.repeat(MAX_TITLE_LENGTH + 1);
    expect(validateTitle(atLimit).ok).toBe(true);
    expect(validateTitle(overLimit)).toEqual({ok: false, error: 'titleTooLong'});
  });
});
