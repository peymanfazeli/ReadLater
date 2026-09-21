import {MessageRepository} from '../src/features/messages/data/MessageRepository';
import type {StoredMessage} from '../src/features/messages/domain/types';
import type {MessageStorage} from '../src/services/storage/types';

const NOW = '2026-06-01T12:00:00.000Z';
const FUTURE = '2026-09-01T12:00:00.000Z';
const PAST = '2026-05-01T12:00:00.000Z';

class InMemoryStorage implements MessageStorage {
  value: string | null = null;
  read(): Promise<string | null> {
    return Promise.resolve(this.value);
  }
  write(value: string): Promise<void> {
    this.value = value;
    return Promise.resolve();
  }
}

function makeRepo(storage: MessageStorage = new InMemoryStorage()) {
  return new MessageRepository(storage, () => new Date(NOW));
}

function stored(overrides: Partial<StoredMessage> = {}): StoredMessage {
  return {
    id: 'm1',
    title: 'self note',
    body: 'self note',
    createdAt: PAST,
    unlockAt: FUTURE,
    ...overrides,
  };
}

describe('MessageRepository.create', () => {
  it('persists a validated message and returns a locked view', async () => {
    const repo = makeRepo();
    const result = await repo.create({title: 'یادداشت', body: '  سلام آینده  ', unlockAt: '2026-09-01T12:00:00.000Z'});
    expect(result.ok).toBe(true);
    if (!result.ok) {return;}
    expect(result.message.status).toBe('locked');
    expect(result.message.body).toBeNull();
    expect(result.message.createdAt).toBe(NOW);
    expect(result.message.title).toBe('یادداشت');

    const list = await repo.list();
    expect(list.messages).toHaveLength(1);
    expect(list.messages[0].body).toBeNull();
    expect(list.corrupt).toBe(false);
    expect(list.dropped).toBe(0);
  });

  it('rejects empty, over-long, and non-future unlock dates', async () => {
    const repo = makeRepo();
    await expect(
      repo.create({title: 't', body: '   ', unlockAt: FUTURE}),
    ).resolves.toEqual({ok: false, error: 'empty'});
    await expect(
      repo.create({title: 't', body: 'x'.repeat(5001), unlockAt: FUTURE}),
    ).resolves.toEqual({ok: false, error: 'tooLong'});
    await expect(
      repo.create({title: '  ', body: 'ok', unlockAt: FUTURE}),
    ).resolves.toEqual({ok: false, error: 'titleEmpty'});
    await expect(
      repo.create({title: 't', body: 'ok', unlockAt: PAST}),
    ).resolves.toEqual({ok: false, error: 'invalidUnlockAt'});
  });

  it('exposes the body only once the unlock time passes', async () => {
    const storage = new InMemoryStorage();
    const repo = makeRepo(storage);
    const created = await repo.create({title: 't', body: 'سیکریت', unlockAt: FUTURE});
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    expect(created.message.body).toBeNull();

    const afterUnlock = new MessageRepository(
      storage,
      () => new Date('2026-10-01T00:00:00.000Z'),
    );
    const got = await afterUnlock.get(created.message.id);
    expect(got?.status).toBe('unlocked');
    expect(got?.body).toBe('سیکریت');
  });

  it('exposes the body of a pre-seeded already-unlocked record', async () => {
    const storage = new InMemoryStorage();
    storage.value = JSON.stringify([stored({unlockAt: PAST})]);
    const repo = makeRepo(storage);
    const got = await repo.get('m1');
    expect(got?.status).toBe('unlocked');
    expect(got?.body).toBe('self note');
  });
});

describe('MessageRepository persistence', () => {
  it('survives an app restart (new repository, same storage)', async () => {
    const storage = new InMemoryStorage();
    await makeRepo(storage).create({title: 'first', body: 'first', unlockAt: FUTURE});
    await makeRepo(storage).create({title: 'second', body: 'second', unlockAt: FUTURE});

    const fresh = makeRepo(storage);
    const list = await fresh.list();
    expect(list.messages).toHaveLength(2);
    expect(list.messages.map(m => m.body)).toEqual([null, null]);
    expect(list.messages[0].body).toBeNull();
  });

  it('lists newest-first', async () => {
    const storage = new InMemoryStorage();
    const repo = makeRepo(storage);
    const older = await repo.create({title: 'older', body: 'older', unlockAt: FUTURE});
    if (!older.ok) {
      throw new Error('create failed');
    }
    const progress = new Date('2026-06-10T12:00:00.000Z');
    const laterRepo = new MessageRepository(storage, () => progress);
    const created = await laterRepo.create({
      title: 'newer',
      body: 'newer',
      unlockAt: '2026-10-01T12:00:00.000Z',
    });
    if (!created.ok) {
      throw new Error('create failed');
    }
    const list = await laterRepo.list();
    expect(list.messages.map(m => m.id)).toEqual([
      created.message.id,
      older.message.id,
    ]);
  });
});

describe('MessageRepository.get and delete', () => {
  it('returns null for missing ids', async () => {
    const repo = makeRepo();
    await expect(repo.get('nope')).resolves.toBeNull();
  });

  it('deletes and reports when nothing was deleted', async () => {
    const repo = makeRepo();
    const created = await repo.create({title: 'hi', body: 'hi', unlockAt: FUTURE});
    if (!created.ok) {throw new Error('create failed');}
    expect(await repo.delete(created.message.id)).toBe(true);
    expect(await repo.get(created.message.id)).toBeNull();
    expect(await repo.delete(created.message.id)).toBe(false);
  });
});

describe('MessageRepository corrupt and invalid stores', () => {
  it('surfaces unreadable JSON without crashing', async () => {
    const storage = new InMemoryStorage();
    storage.value = '{not json!!';
    const result = await makeRepo(storage).list();
    expect(result.messages).toEqual([]);
    expect(result.corrupt).toBe(true);
    expect(result.dropped).toBe(0);
  });

  it('drops structurally-invalid and duplicate records with a count', async () => {
    const storage = new InMemoryStorage();
    storage.value = JSON.stringify([
      stored(),
      stored(), // duplicate id
      {id: 'm2', body: 'x', createdAt: 'not-a-date', unlockAt: FUTURE},
      {body: 'no-id'},
      {id: 'm3', body: '   ', createdAt: PAST, unlockAt: FUTURE},
      'a bare string',
      stored({id: 'm4', body: 'valid'}),
    ]);
    const result = await makeRepo(storage).list();
    expect(result.messages.map(m => m.id)).toEqual(['m1', 'm4']);
    expect(result.dropped).toBe(5);
    expect(result.corrupt).toBe(false);
  });

  it('treats a non-array payload as corrupt', async () => {
    const storage = new InMemoryStorage();
    storage.value = JSON.stringify({messages: []});
    const result = await makeRepo(storage).list();
    expect(result.corrupt).toBe(true);
    expect(result.messages).toEqual([]);
  });
});
