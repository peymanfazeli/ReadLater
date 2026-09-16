import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {Card} from '../../../components/Card';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {formatDate} from '../domain/rules';
import {messageRepository} from '../data';
import {useMessage} from '../hooks/useMessages';
import type {RevealMessageScreenProps} from '../../../app/navigation/types';

export function RevealMessageScreen({
  route,
  navigation,
}: RevealMessageScreenProps) {
  const {messageId} = route.params;
  const theme = useTheme();
  const {state, reload} = useMessage(messageId);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    Alert.alert('حذف پیام', 'این پیام برای همیشه حذف می‌شود. مطمئنی؟', [
      {text: 'انصراف', style: 'cancel'},
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await messageRepository.delete(messageId);
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
            پیام تو
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
                خطایی پیش آمد
              </Typography>
              <Typography
                size="sm"
                color={theme.colors.secondaryText}
                align="center"
                style={styles.gap}>
                بارگیری پیام با مشکل مواجه شد
              </Typography>
              <Button label="تلاش دوباره" onPress={reload} />
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
                پیام پیدا نشد
              </Typography>
              <Button
                label="بازگشت به خانه"
                variant="ghost"
                onPress={() => navigation.popToTop()}
                style={styles.gap}
              />
            </Card>
          </View>
        )}

        {state.status === 'ready' && state.data !== null && (
          <>
            {state.data.status === 'locked' ? (
              <Card style={styles.card}>
                <View style={styles.lockedContainer}>
                  <Typography size="lg">🔒</Typography>
                  <Typography
                    size="md"
                    weight="medium"
                    color={theme.colors.primaryText}
                    style={styles.lockedLabel}>
                    این پیام هنوز قفل است
                  </Typography>
                  <Typography size="sm" color={theme.colors.secondaryText}>
                    باز می‌شود: {formatDate(state.data.unlockAt)}
                  </Typography>
                </View>
              </Card>
            ) : (
              <Card style={styles.card}>
                <Typography
                  size="md"
                  color={theme.colors.primaryText}>
                  {state.data.body}
                </Typography>
              </Card>
            )}

            <View style={styles.dates}>
              <Typography size="sm" color={theme.colors.secondaryText}>
                نوشته شده: {formatDate(state.data.createdAt)}
              </Typography>
              {state.data.status === 'unlocked' && (
                <Typography
                  size="sm"
                  color={theme.colors.successText}
                  style={styles.unlockDate}>
                  باز شده: {formatDate(state.data.unlockAt)}
                </Typography>
              )}
            </View>

            <View style={styles.footer}>
              <Button
                label="حذف پیام"
                variant="ghost"
                onPress={confirmDelete}
                disabled={deleting}
              />
              <Button
                label="بازگشت به خانه"
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
  dates: {
    marginBottom: 24,
  },
  unlockDate: {
    marginTop: 4,
  },
  lockedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  lockedLabel: {
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
  },
  home: {
    marginTop: 8,
  },
});
