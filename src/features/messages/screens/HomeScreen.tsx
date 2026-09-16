import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {Card} from '../../../components/Card';
import {MessageCard} from '../components/MessageCard';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {useMessageList} from '../hooks/useMessages';
import type {HomeScreenProps} from '../../../app/navigation/types';

export function HomeScreen({navigation}: HomeScreenProps) {
  const theme = useTheme();
  const {state, reload} = useMessageList();

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}
      edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
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
