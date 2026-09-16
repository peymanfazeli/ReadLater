import {AsyncStorageMessageStore} from '../../../services/storage/AsyncStorageMessageStore';
import {MessageRepository} from './MessageRepository';

export type {
  CreateMessageError,
  CreateMessageInput,
  CreateMessageResult,
  MessageList,
} from './MessageRepository';

// App-wide singleton. Repositories are constructed with an injectable clock in
// tests; the default here is the real one.
export const messageRepository = new MessageRepository(
  new AsyncStorageMessageStore(),
);
