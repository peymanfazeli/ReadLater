import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {Card} from '../../../components/Card';
import {useTheme, useTranslation} from '../../../app/providers/SettingsProvider';
import {formatDate} from '../domain/rules';
import {messageRepository} from '../data';
import {useMessage} from '../hooks/useMessages';
import {cancelUnlock} from '../../../services/notifications/NotificationService';
import type {RevealMessageScreenProps} from '../../../app/navigation/types';

export function RevealMessageScreen({
  route,
  navigation,
}: RevealMessageScreenProps) {
  const {messageId} = route.params;
  const theme = useTheme();
  const {t, language} = useTranslation();
  const {state, reload} = useMessage(messageId);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (state.status !== 'ready' || state.data === null || state.data.body === null) {
      return;
    }
    await Clipboard.setString(state.data.body);
    setCopied(true);
  }

  function confirmDelete() {
    Alert.alert(t('reveal.deleteConfirmTitle'), t('reveal.deleteConfirmBody'), [
      {text: t('actions.cancel'), style: 'cancel'},
      {
        text: t('actions.delete'),
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await messageRepository.delete(messageId);
            cancelUnlock(messageId).catch(() => {});
            navigation.popToTop();
          } catch {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}
      edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Typography size="xl" weight="bold" color={theme.colors.primaryText}>
            {t('screenReveal')}
          </Typography>
        </View>

        {state.status === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {state.status === 'error' && (
          <View style={styles.center}>
            <Card style={styles.card}>
              <Typography
                size="md"
                weight="medium"
                color={theme.colors.primaryText}
                align="center">
                {t('errors.generic')}
              </Typography>
              <Typography
                size="sm"
                color={theme.colors.secondaryText}
                align="center"
                style={styles.gap}>
                {t('reveal.loadError')}
              </Typography>
              <Button label={t('actions.retry')} onPress={reload} />
            </Card>
          </View>
        )}

        {state.status === 'ready' && state.data === null && (
          <View style={styles.center}>
            <Card style={styles.card}>
              <Typography
                size="md"
                weight="medium"
                color={theme.colors.secondaryText}
                align="center">
                {t('reveal.notFound')}
              </Typography>
              <Button
                label={t('actions.backHome')}
                variant="ghost"
                onPress={() => navigation.popToTop()}
                style={styles.gap}
              />
            </Card>
          </View>
        )}

        {state.status === 'ready' && state.data !== null && (
          <>
            <Card style={styles.card}>
              <Typography
                size="lg"
                weight="bold"
                color={theme.colors.primaryText}>
                {state.data.title}
              </Typography>
              {state.data.status === 'locked' ? (
                <View style={styles.lockedContainer}>
                  <Typography size="lg">🔒</Typography>
                  <Typography
                    size="md"
                    weight="medium"
                    color={theme.colors.primaryText}
                    style={styles.lockedLabel}>
                    {t('reveal.lockedLabel')}
                  </Typography>
                  <Typography size="sm" color={theme.colors.secondaryText}>
                    {t('reveal.unlocksAt', {
                      date: formatDate(state.data.unlockAt, language),
                    })}
                  </Typography>
                </View>
              ) : (
                <Typography size="md" color={theme.colors.primaryText} style={styles.body}>
                  {state.data.body}
                </Typography>
              )}
            </Card>

            {state.data.status === 'unlocked' && copied && (
              <Typography size="sm" color={theme.colors.successText} style={styles.copied}>
                {t('reveal.copied')}
              </Typography>
            )}
            {state.data.status === 'unlocked' && (
              <Button
                label={t('reveal.copy')}
                variant="secondary"
                onPress={handleCopy}
                style={styles.copy}
              />
            )}

            <View style={styles.dates}>
              <Typography size="sm" color={theme.colors.secondaryText}>
                {t('reveal.createdOn', {
                  date: formatDate(state.data.createdAt, language),
                })}
              </Typography>
              {state.data.status === 'unlocked' && (
                <Typography
                  size="sm"
                  color={theme.colors.successText}
                  style={styles.unlockDate}>
                  {t('reveal.unlockedOn', {
                    date: formatDate(state.data.unlockAt, language),
                  })}
                </Typography>
              )}
            </View>

            <View style={styles.footer}>
              <Button
                label={t('reveal.delete')}
                variant="ghost"
                onPress={confirmDelete}
                disabled={deleting}
              />
              <Button
                label={t('actions.backHome')}
                variant="ghost"
                onPress={() => navigation.popToTop()}
                style={styles.home}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
  },
  gap: {
    marginTop: 12,
  },
  body: {
    marginTop: 12,
    lineHeight: 26,
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  lockedLabel: {
    marginTop: 8,
  },
  copy: {
    marginTop: 0,
    marginBottom: 16,
  },
  copied: {
    marginBottom: 8,
  },
  dates: {
    marginBottom: 24,
    marginTop: 4,
  },
  unlockDate: {
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
  },
  home: {
    marginTop: 8,
  },
});
