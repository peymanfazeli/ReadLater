import React, {useEffect} from 'react';
import {TouchableOpacity, View, Image, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {Typography} from '../../../components/Typography';
import {Card} from '../../../components/Card';
import {useTheme, useTranslation} from '../../../app/providers/SettingsProvider';
import type {Message} from '../domain/types';
import {formatDate} from '../domain/rules';

const lockedIcon = require('../../../assets/icon-locked-msg.png');
const sealedIcon = require('../../../assets/icon-broken-sealed-msg.png');
const openedIcon = require('../../../assets/icon-opened-msg.png');

type Props = {
  message: Message;
  onPress: () => void;
};

export function MessageCard({message, onPress}: Props) {
  const theme = useTheme();
  const {t, language} = useTranslation();
  const isLocked = message.status === 'locked';
  // Unlocked but never read: the card asks for attention with an icon jitter
  // and a breathing golden halo.
  const needsAttention = !isLocked && !message.openedAt;

  const jitter = useSharedValue(0);
  const glow = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!needsAttention || reduceMotion) {
      return;
    }
    // Decaying side-to-side wobble, a beat of rest, then repeat — reads as
    // playful tugging rather than a constant buzz.
    jitter.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 110, easing: Easing.inOut(Easing.quad)}),
        withTiming(-0.8, {duration: 130, easing: Easing.inOut(Easing.quad)}),
        withTiming(0.55, {duration: 130, easing: Easing.inOut(Easing.quad)}),
        withTiming(-0.3, {duration: 120, easing: Easing.inOut(Easing.quad)}),
        withTiming(0.15, {duration: 110, easing: Easing.inOut(Easing.quad)}),
        withTiming(0, {duration: 130, easing: Easing.out(Easing.quad)}),
        withDelay(700, withTiming(0, {duration: 1})),
      ),
      -1,
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 850, easing: Easing.inOut(Easing.sin)}),
        withTiming(0, {duration: 850, easing: Easing.inOut(Easing.sin)}),
      ),
      -1,
    );
    return () => {
      cancelAnimation(jitter);
      cancelAnimation(glow);
      jitter.value = 0;
      glow.value = 0;
    };
  }, [needsAttention, reduceMotion, jitter, glow]);

  const iconStyle = useAnimatedStyle(() => {
    const v = jitter.value;
    return {
      transform: [
        {rotate: `${v * 9}deg`},
        {scale: 1 + Math.abs(v) * 0.07},
        {translateX: v * 2},
      ],
    };
  });

  // Two stacked shine strokes drawn exactly on the card's own rect and
  // radius: a tight border-weight line and a wider, fainter one for softness;
  // both breathe with the same phase.
  const shineTightStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.9,
  }));
  const shineSoftStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.35,
  }));

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardWrap}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.icon}>
              {isLocked ? (
                <Image
                  source={lockedIcon}
                  style={styles.iconImg}
                  resizeMode="contain"
                  accessibilityLabel={t('message.locked')}
                />
              ) : message.openedAt ? (
                <Image
                  source={openedIcon}
                  style={styles.iconImg}
                  resizeMode="contain"
                  accessibilityLabel={t('message.unlocked')}
                />
              ) : (
                <Animated.Image
                  source={sealedIcon}
                  style={[styles.iconImg, iconStyle]}
                  resizeMode="contain"
                  accessibilityLabel={t('message.unlocked')}
                />
              )}
            </View>
            <View style={styles.content}>
              <Typography size="sm" weight="semibold" color={theme.colors.primaryText}>
                {isLocked ? t('message.locked') : t('message.unlocked')}
              </Typography>
              <Typography
                size="md"
                weight="bold"
                color={theme.colors.primaryText}
                numberOfLines={2}
                style={styles.title}>
                {message.title}
              </Typography>
              <Typography
                size="xs"
                color={theme.colors.secondaryText}
                style={styles.date}>
                {isLocked
                  ? t('message.unlocksAt', {
                      date: formatDate(message.unlockAt, language),
                    })
                  : t('message.createdAt', {
                      date: formatDate(message.createdAt, language),
                    })}
              </Typography>
            </View>
            <Typography
              size="sm"
              color={isLocked ? theme.colors.primary : theme.colors.successText}>
              {isLocked ? t('message.statusWaiting') : t('message.statusOpen')}
            </Typography>
          </View>
        </Card>
        {needsAttention && !reduceMotion && (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shineSoft,
                {
                  borderColor: theme.colors.primary,
                  borderRadius: theme.radii.xl,
                },
                shineSoftStyle,
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shineTight,
                {
                  borderColor: theme.colors.primary,
                  borderRadius: theme.radii.xl,
                },
                shineTightStyle,
              ]}
            />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: 12,
  },
  shineSoft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 5,
  },
  shineTight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 1.5,
  },
  card: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImg: {
    width: 36,
    height: 36,
  },
  content: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    marginTop: 2,
  },
  date: {
    marginTop: 4,
  },
});
