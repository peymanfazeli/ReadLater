import React from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {Card} from '../../../components/Card';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useNotificationAttention} from '../../../app/providers/NotificationAttentionProvider';
import {
  permissionAuthorized,
  requestPermission,
  openNotificationSettings,
} from '../../../services/notifications/NotificationService';
import type {SettingsScreenProps} from '../../../app/navigation/types';

export function SettingsScreen({navigation}: SettingsScreenProps) {
  const theme = useTheme();
  const {refresh} = useNotificationAttention();
  const [state, setState] = React.useState<
    {status: 'loading'} | {status: 'ready'; enabled: boolean}
  >({status: 'loading'});
  const [busy, setBusy] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        const enabled = await permissionAuthorized();
        if (active) {setState({status: 'ready', enabled});}
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  async function enableNotifications() {
    setBusy(true);
    try {
      const granted = await requestPermission();
      if (!granted) {await openNotificationSettings();}
      setState({status: 'ready', enabled: await permissionAuthorized()});
      refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}
      edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <Typography size="md" color={theme.colors.secondaryText}>
          اعلان‌ها
        </Typography>

        <Card style={styles.card}>
          <Typography size="md" color={theme.colors.primaryText}>
            یادآوری باز شدن پیام‌ها
          </Typography>
          <Typography
            size="sm"
            color={theme.colors.secondaryText}
            style={styles.hint}>
            با فعال بودن اعلان، وقتی زمان باز شدن پیام فرا برسد در جریان
            قرار می‌گیری.
          </Typography>

          {state.status === 'loading' && (
            <ActivityIndicator color={theme.colors.primary} style={styles.hint} />
          )}

          {state.status === 'ready' &&
            (state.enabled ? (
              <Button
                label="اعلان‌ها فعال است"
                variant="secondary"
                disabled
                onPress={() => {}}
                style={styles.action}
              />
            ) : (
              <Button
                label="فعال کردن اعلان‌ها"
                onPress={enableNotifications}
                loading={busy}
                disabled={busy}
                style={styles.action}
              />
            ))}
        </Card>

        <Button
          label="بازگشت"
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.back}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginTop: 12,
  },
  hint: {
    marginTop: 8,
    lineHeight: 22,
  },
  action: {
    marginTop: 16,
  },
  back: {
    marginTop: 'auto',
  },
});
