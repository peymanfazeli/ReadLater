import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {Card} from '../../../components/Card';
import {AttentionDot} from '../../../components/AttentionDot';
import {MessageCard} from '../components/MessageCard';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useMessageList} from '../hooks/useMessages';
import {useNotificationAttention} from '../../../app/providers/NotificationAttentionProvider';
import {
  reconcile,
} from '../../../services/notifications/NotificationService';
import type {HomeScreenProps} from '../../../app/navigation/types';

export function HomeScreen({navigation}: HomeScreenProps) {
  const theme = useTheme();
  const {state, reload} = useMessageList();
  const {attention} = useNotificationAttention();

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        if (state.status === 'ready') {
          await reconcile(state.data.messages);
        }
      })();
    }, [state]),
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
                accessibilityLabel="باز کردن منو"
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
          <Typography size="xxxl" weight="bold" color={theme.colors.primaryText}>
            بعدابخون
          </Typography>
          <Typography
            size="md"
            color={theme.colors.secondaryText}
            style={styles.subtitle}>
            پیامی برای خودت بنویس، آینده بازش کن
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
                خطایی پیش آمد
              </Typography>
              <Typography
                size="sm"
                color={theme.colors.secondaryText}
                align="center"
                style={styles.hint}>
                بارگیری پیام‌ها با مشکل مواجه شد
              </Typography>
              <Button label="تلاش دوباره" onPress={reload} style={styles.hint} />
            </Card>
          </View>
        )}

        {state.status === 'ready' && (
          <>
            {(state.data.corrupt || state.data.dropped > 0) && (
              <Card style={{...styles.notice, borderColor: theme.colors.error}}>
                <Typography
                  size="xs"
                  color={theme.colors.secondaryText}
                  align="center">
                  برخی پیام‌ها قابل خواندن نبودند و حذف شدند
                </Typography>
              </Card>
            )}

            {/* {!notifAuthorized && (
              <Card style={styles.notice}>
                <Typography
                  size="xs"
                  color={theme.colors.secondaryText}
                  align="center">
                  برای آگاه شدن از باز شدن پیام‌ها، اعلان‌ها را فعال کن
                </Typography>
                <Button
                  label="فعال کردن اعلان‌ها"
                  variant="secondary"
                  onPress={enableNotifications}
                  disabled={permissionBusy}
                  loading={permissionBusy}
                  style={styles.notifAction}
                />
              </Card>
            )} */}

            {state.data.messages.length === 0 ? (
              <View style={styles.empty}>
                <Card style={styles.emptyCard}>
                  <Typography
                    size="lg"
                    weight="medium"
                    color={theme.colors.secondaryText}
                    align="center">
                    هنوز پیامی نداری
                  </Typography>
                  <Typography
                    size="sm"
                    color={theme.colors.secondaryText}
                    align="center"
                    style={styles.emptyHint}>
                    اولین پیامت رو برای خودت بنویس
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

        <View style={styles.footer}>
          <Button
            label="پیام جدید بنویس"
            onPress={() => navigation.navigate('CreateMessage')}
          />
        </View>
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
  notifAction: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
  list: {
    paddingBottom: 16,
  },
  hint: {
    marginTop: 8,
  },
  footer: {
    paddingVertical: 16,
  },
});
