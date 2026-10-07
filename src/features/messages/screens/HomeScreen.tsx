import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {Typography} from '../../../components/Typography';
import {AppTitle} from '../../../components/AppTitle';
import {Button} from '../../../components/Button';
import {Card} from '../../../components/Card';
import {AttentionDot} from '../../../components/AttentionDot';
import {MessageCard} from '../components/MessageCard';
import {
  useTheme,
  useTranslation,
} from '../../../app/providers/SettingsProvider';
import {useMessageList} from '../hooks/useMessages';
import {useUnlockWatch} from '../hooks/useUnlockWatch';
import {useNotificationAttention} from '../../../app/providers/NotificationAttentionProvider';
import type {HomeScreenProps} from '../../../app/navigation/types';

export function HomeScreen({navigation}: HomeScreenProps) {
  const theme = useTheme();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {state, reload, refresh} = useMessageList();
  const {attention} = useNotificationAttention();

  // FAB press: sinks down while held, springs back up on release.
  const fabPress = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      {translateY: fabPress.value * 4},
      {scale: 1 - fabPress.value * 0.1},
    ],
  }));

  // Pen icon heartbeat: lub-dub double thump, then a beat of rest.
  const heartbeat = useSharedValue(1);
  const heartbeatStyle = useAnimatedStyle(() => ({
    transform: [{scale: heartbeat.value}],
  }));
  React.useEffect(() => {
    if (reduceMotion) {
      return;
    }
    heartbeat.value = withRepeat(
      withSequence(
        withTiming(1.14, {duration: 150, easing: Easing.out(Easing.quad)}),
        withTiming(0.96, {duration: 140, easing: Easing.inOut(Easing.quad)}),
        withTiming(1.08, {duration: 140, easing: Easing.out(Easing.quad)}),
        withTiming(1, {duration: 170, easing: Easing.inOut(Easing.quad)}),
        withDelay(750, withTiming(1, {duration: 1})),
      ),
      -1,
    );
    return () => {
      cancelAnimation(heartbeat);
      heartbeat.value = 1;
    };
  }, [reduceMotion, heartbeat]);

  // Unlocks while Home is open flip live (JS timers); unlocks outside the
  // app are notified by the native alarms this hook arms when backgrounding.
  useUnlockWatch(
    state.status === 'ready' ? state.data.messages : undefined,
    refresh,
  );

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}
      edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.menuWrap}>
              <Pressable
                style={({pressed}) => [
                  styles.menu,
                  {
                    backgroundColor: pressed
                      ? theme.colors.border
                      : theme.colors.surface,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={t('home.menuLabel')}
                onPress={() => navigation.openDrawer()}>
                <Typography
                  size="xl"
                  color={theme.colors.primaryDark}
                  style={styles.menuIcon}>
                  ☰
                </Typography>
              </Pressable>
              <AttentionDot active={attention} style={styles.menuDot} />
            </View>
          </View>
          <AppTitle />
          <Typography
            size="md"
            color={theme.colors.secondaryText}
            style={styles.subtitle}>
            {t('home.subtitle')}
          </Typography>
        </View>

        {state.status === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {state.status === 'error' && (
          <View style={styles.center}>
            <Card style={styles.centerCard}>
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
                style={styles.hint}>
                {t('home.listError')}
              </Typography>
              <Button label={t('actions.retry')} onPress={reload} style={styles.hint} />
            </Card>
          </View>
        )}

        {state.status === 'ready' && (
          <>
            {(state.data.corrupt || state.data.dropped > 0) && (
              <Card style={[styles.notice, {borderColor: theme.colors.error}]}>
                <Typography
                  size="xs"
                  color={theme.colors.secondaryText}
                  align="center">
                  {t('home.corruptNotice')}
                </Typography>
              </Card>
            )}

            {state.data.messages.length === 0 ? (
              <View style={styles.empty}>
                <Card style={styles.emptyCard}>
                  <Typography
                    size="lg"
                    weight="medium"
                    color={theme.colors.secondaryText}
                    align="center">
                    {t('home.emptyTitle')}
                  </Typography>
                  <Typography
                    size="sm"
                    color={theme.colors.secondaryText}
                    align="center"
                    style={styles.emptyHint}>
                    {t('home.emptyHint')}
                  </Typography>
                </Card>
              </View>
            ) : (
              <FlatList
                data={state.data.messages}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <MessageCard
                    message={item}
                    onPress={() =>
                      navigation.navigate('RevealMessage', {messageId: item.id})
                    }
                  />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={false}
                    onRefresh={reload}
                    colors={[theme.colors.primary]}
                  />
                }
              />
            )}
          </>
        )}

        <TouchableOpacity
          style={[styles.fab, {bottom: 20 + insets.bottom}]}
          onPress={() => navigation.navigate('CreateMessage')}
          onPressIn={() => {
            if (!reduceMotion) {
              fabPress.value = withTiming(1, {
                duration: 130,
                easing: Easing.out(Easing.quad),
              });
            }
          }}
          onPressOut={() => {
            if (!reduceMotion) {
              fabPress.value = withSpring(0, {
                damping: 13,
                stiffness: 240,
                mass: 0.6,
              });
            }
          }}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('home.newMessage')}>
          <Animated.View style={[styles.fabClip, fabStyle]}>
            <Image
              source={require('../../../assets/button-add.png')}
              style={styles.fabBackground}
              resizeMode="cover"
            />
            <Animated.Image
              source={require('../../../assets/pen-and-paper.png')}
              style={[styles.fabIcon, heartbeatStyle]}
              resizeMode="contain"
              importantForAccessibility="no"
            />
          </Animated.View>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  menuWrap: {
    alignItems: 'flex-start',
  },
  menu: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDot: {
    top: -3,
    right: -3,
  },
  menuIcon: {
    lineHeight: 30,
  },
  subtitle: {
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  centerCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHint: {
    marginTop: 8,
  },
  notice: {
    marginBottom: 12,
    paddingVertical: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  list: {
    paddingBottom: 112,
  },
  hint: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    width: 78,
    height: 78,
  },
  fabClip: {
    width: '100%',
    height: '100%',
    borderRadius: 39,
    overflow: 'hidden',
  },
  fabBackground: {
    width: '100%',
    height: '100%',
  },
  fabIcon: {
    position: 'absolute',
    top: 16,
    left: 21,
    width: 36,
    height: 36,
  },
});
