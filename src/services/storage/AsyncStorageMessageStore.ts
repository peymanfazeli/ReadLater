import AsyncStorage from '@react-native-async-storage/async-storage';
import type {MessageStorage} from './types';

// Versioned, namespaced key holding the entire collection as one JSON array of
// StoredMessage records. If the record shape ever changes, bump the version,
// migrate under the old key, then write v2. This is the migration escape hatch.
const STORAGE_KEY = '@badabekhoon/messages/v1';

export class AsyncStorageMessageStore implements MessageStorage {
  read(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEY);
  }

  write(value: string): Promise<void> {
    return AsyncStorage.setItem(STORAGE_KEY, value);
  }
}
