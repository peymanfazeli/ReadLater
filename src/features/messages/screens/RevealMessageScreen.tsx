import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Clipboard from '@react-native-clipboard/clipboard';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {Card} from '../../../components/Card';
import {useTheme, useTranslation} from '../../../app/providers/SettingsProvider';
import {formatDate} from '../domain/rules';
import {messageRepository} from '../data';
import {useMessage} from '../hooks/useMessages';
import {useUnlockWatch} from '../hooks/useUnlockWatch';
import {cancelUnlock} from '../../../services/notifications/NotificationService';
import type {RevealMessageScreenProps} from '../../../app/navigation/types';

const lockedIcon = require('../../../assets/icon-locked-msg.png');

export function RevealMessageScreen({
  route,
  navigation,
}: RevealMessageScreenProps) {
  const {messageId} = route.params;
  const theme = useTheme();
  const {t, language} = useTranslation();
  const {state, reload, refresh} = useMessage(messageId);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Watching a single message: the locked → unlocked flip happens live while
  // this screen is open, and native alarms are armed/deferred when leaving.
  useUnlockWatch(
    state.status === 'ready' && state.data ? [state.data] : undefined,
    refresh,
  );

  const shakeRotate = useSharedValue(0);
  const shakePop = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  // Playful "it's still locked" feedback: decaying side-to-side wobble that
  // settles with a spring, plus a quick scale pop. Skipped under reduced
  // motion; a re-tap restarts the sequence from the top.
  function shakeLockedIcon() {
    if (reduceMotion) {
      return;
    }
    shakeRotate.value = withSequence(
      withTiming(-16, {duration: 90, easing: Easing.inOut(Easing.quad)}),
      withTiming(15, {duration: 110, easing: Easing.inOut(Easing.quad)}),
      withTiming(-11, {duration: 110, easing: Easing.inOut(Easing.quad)}),
      withTiming(10, {duration: 110, easing: Easing.inOut(Easing.quad)}),
      withTiming(-6, {duration: 100, easing: Easing.inOut(Easing.quad)}),
      withSpring(0, {damping: 9, stiffness: 200, mass: 0.6}),
    );
    shakePop.value = withSequence(
      withSpring(1.16, {damping: 7, stiffness: 300, mass: 0.5}),
      withSpring(1, {damping: 11, stiffness: 170, mass: 0.6}),
    );
  }

  const lockedIconStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${shakeRotate.value}deg`}, {scale: shakePop.value}],
  }));

  // Reading an unlocked message flags it as opened so the list can swap the
  // sealed icon for the read one. Never runs for locked messages, so a locked
  // body is never implied to be viewed.
  useEffect(() => {
    const message = state.status === 'ready' ? state.data : null;
    if (message && message.status === 'unlocked' && !message.openedAt) {
      messageRepository.markOpened(messageId).catch(() => {});
    }
  }, [state, messageId]);

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
                  <Pressable
                    onPress={shakeLockedIcon}
                    accessibilityRole="button"
                    accessibilityLabel={t('reveal.lockedLabel')}>
                    <Animated.Image
                      source={lockedIcon}
                      style={[styles.lockedIcon, lockedIconStyle]}
                      resizeMode="contain"
                      importantForAccessibility="no-hide-descendants"
                      accessibilityElementsHidden
                    />
                  </Pressable>
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
              {state.data.status === 'unlocked' &&
                (new Date(state.data.unlockAt).getTime() > Date.now() ? (
                  // Readable before its date (saved without a lock): the
                  // future unlockAt is a reminder, not an unlock moment.
                  <Typography
                    size="sm"
                    color={theme.colors.secondaryText}
                    style={styles.unlockDate}>
                    {t('reveal.dueOn', {
                      date: formatDate(state.data.unlockAt, language),
                    })}
                  </Typography>
                ) : (
                  <Typography
                    size="sm"
                    color={theme.colors.successText}
                    style={styles.unlockDate}>
                    {t('reveal.unlockedOn', {
                      date: formatDate(state.data.unlockAt, language),
                    })}
                  </Typography>
                ))}
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
  lockedIcon: {
    width: 64,
    height: 64,
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
