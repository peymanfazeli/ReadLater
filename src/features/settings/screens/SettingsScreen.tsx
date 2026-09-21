import React from 'react';
import {View, StyleSheet, ActivityIndicator, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {Card} from '../../../components/Card';
import {
  useSettings,
  useTheme,
  useTranslation,
} from '../../../app/providers/SettingsProvider';
import {useNotificationAttention} from '../../../app/providers/NotificationAttentionProvider';
import {
  permissionAuthorized,
  requestPermission,
  openNotificationSettings,
} from '../../../services/notifications/NotificationService';
import type {SettingsScreenProps} from '../../../app/navigation/types';

export function SettingsScreen({navigation}: SettingsScreenProps) {
  const theme = useTheme();
  const {t, language, setLanguage} = useTranslation();
  const {scheme, setScheme} = useSettings();
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
        if (active) {
          setState({status: 'ready', enabled});
        }
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
      if (!granted) {
        await openNotificationSettings();
      }
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
        <Typography size="xl" weight="bold" color={theme.colors.primaryText}>
          {t('screenSettings')}
        </Typography>

        <Card style={styles.card}>
          <Typography
            size="sm"
            weight="semibold"
            color={theme.colors.primaryText}
            style={styles.sectionLabel}>
            {t('settings.languageSection')}
          </Typography>
          <View style={styles.optionRow}>
            <OptionChip
              label="فارسی"
              selected={language === 'fa'}
              onPress={() => setLanguage('fa')}
            />
            <OptionChip
              label="English"
              selected={language === 'en'}
              onPress={() => setLanguage('en')}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Typography
            size="sm"
            weight="semibold"
            color={theme.colors.primaryText}
            style={styles.sectionLabel}>
            {t('settings.themeSection')}
          </Typography>
          <View style={styles.optionRow}>
            <OptionChip
              label={t('theme.light')}
              selected={scheme === 'light'}
              onPress={() => setScheme('light')}
            />
            <OptionChip
              label={t('theme.dark')}
              selected={scheme === 'dark'}
              onPress={() => setScheme('dark')}
            />
          </View>
        </Card>

        <Card style={styles.card}>
          <Typography
            size="sm"
            weight="semibold"
            color={theme.colors.primaryText}
            style={styles.sectionLabel}>
            {t('settings.notifications')}
          </Typography>
          <Typography size="md" color={theme.colors.primaryText}>
            {t('settings.reminderTitle')}
          </Typography>
          <Typography
            size="sm"
            color={theme.colors.secondaryText}
            style={styles.hint}>
            {t('settings.reminderHint')}
          </Typography>

          {state.status === 'loading' && (
            <ActivityIndicator color={theme.colors.primary} style={styles.hint} />
          )}

          {state.status === 'ready' &&
            (state.enabled ? (
              <Button
                label={t('settings.enabled')}
                variant="secondary"
                disabled
                onPress={() => {}}
                style={styles.action}
              />
            ) : (
              <Button
                label={t('settings.enable')}
                onPress={enableNotifications}
                loading={busy}
                disabled={busy}
                style={styles.action}
              />
            ))}
        </Card>

        <Button
          label={t('actions.back')}
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.back}
        />
      </View>
    </SafeAreaView>
  );
}

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{selected}}
      style={[
        styles.optionChip,
        {
          borderColor: selected ? theme.colors.primaryDark : theme.colors.border,
          backgroundColor: selected ? theme.colors.successSurface : theme.colors.surface,
        },
      ]}>
      <Typography
        size="sm"
        weight={selected ? 'semibold' : 'regular'}
        color={selected ? theme.colors.successText : theme.colors.primaryText}>
        {label}
      </Typography>
    </Pressable>
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
    marginTop: 16,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionChip: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
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
