import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {AppState} from 'react-native';
import {permissionAuthorized} from '../../services/notifications/NotificationService';

type NotificationAttention = {
  attention: boolean;
  refresh: () => void;
};

const Context = createContext<NotificationAttention>({
  attention: false,
  refresh: () => {},
});

export function useNotificationAttention(): NotificationAttention {
  return useContext(Context);
}

export function NotificationAttentionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [attention, setAttention] = React.useState(false);
  const mounted = useRef(true);

  const check = useCallback(async () => {
    const authorized = await permissionAuthorized();
    if (mounted.current) {setAttention(!authorized);}
  }, []);

  useEffect(() => {
    mounted.current = true;
    check();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {check();}
    });
    return () => {
      mounted.current = false;
      sub.remove();
    };
  }, [check]);

  const value = React.useMemo(
    () => ({attention, refresh: check}),
    [attention, check],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
