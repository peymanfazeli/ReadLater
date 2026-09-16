import {useCallback, useEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {messageRepository, type MessageList} from '../data';
import type {Message} from '../domain/types';

export type MessageListState =
  | {status: 'loading'}
  | {status: 'ready'; data: MessageList}
  | {status: 'error'};

// `load` is shared between the focus effect (refetch on navigation back) and
// the manual retry button, so the list never shows stale data. Invoked as an
// effect it returns the cancellation cleanup; invoked directly it is ignored.
export function useMessageList(): {state: MessageListState; reload: () => void} {
  const [state, setState] = useState<MessageListState>({status: 'loading'});

  const load = useCallback(() => {
    let cancelled = false;
    setState({status: 'loading'});
    messageRepository
      .list()
      .then(data => {
        if (!cancelled) {
          setState({status: 'ready', data});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({status: 'error'});
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(load);

  return {state, reload: load};
}

export type MessageDetailState =
  | {status: 'loading'}
  // null data = message does not exist (deleted or wrong id).
  | {status: 'ready'; data: Message | null}
  | {status: 'error'};

export function useMessage(
  id: string,
): {state: MessageDetailState; reload: () => void} {
  const [state, setState] = useState<MessageDetailState>({status: 'loading'});

  const load = useCallback(() => {
    let cancelled = false;
    setState({status: 'loading'});
    messageRepository
      .get(id)
      .then(data => {
        if (!cancelled) {
          setState({status: 'ready', data});
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({status: 'error'});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(load, [load]);

  return {state, reload: load};
}
