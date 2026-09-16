import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {TextField} from '../../../components/TextField';
import {Card} from '../../../components/Card';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {validateBody, MAX_BODY_LENGTH, formatDate} from '../domain/rules';
import {messageRepository} from '../data';
import type {CreateMessageScreenProps} from '../../../app/navigation/types';

// Milestone 3 will replace this with a user-selected unlock date.
const PLACEHOLDER_LOCK_MS = 24 * 60 * 60 * 1000;

export function CreateMessageScreen({navigation}: CreateMessageScreenProps) {
  const theme = useTheme();
  const [body, setBody] = useState('');
  const [domainError, setDomainError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  const trimmed = body.trim();
  const bodyResult = validateBody(body);
  const bodyValid = bodyResult.ok;

  const placeholderUnlockAt = new Date(Date.now() + PLACEHOLDER_LOCK_MS);

  const domainErrorMessage =
    domainError === 'empty'
      ? 'لطفاً پیامی بنویسید'
      : domainError === 'tooLong'
        ? 'پیام خیلی طولانی است'
        : domainError === 'invalidUnlockAt'
          ? 'تاریخ باز شدن نامعتبر است'
          : null;

  async function handleSave() {
    if (!bodyValid) {
      setDomainError(bodyResult.ok ? null : bodyResult.error);
      return;
    }
    setDomainError(null);
    setPersistError(null);
    setSaving(true);
    try {
      const result = await messageRepository.create({
        body: trimmed,
        unlockAt: placeholderUnlockAt.toISOString(),
      });
      if (result.ok) {
        navigation.goBack();
        return;
      }
      setDomainError(result.error);
      setPersistError('ذخیره پیام با خطا مواجه شد');
    } catch {
      setPersistError('ذخیره پیام با خطا مواجه شد');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}
      edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Typography
          size="xl"
          weight="bold"
          color={theme.colors.primaryText}
          style={styles.title}>
          پیام تو
        </Typography>
        <Typography
          size="sm"
          color={theme.colors.secondaryText}
          style={styles.hint}>
          بنویس، بعداً برای خودت باز کن
        </Typography>

        <Card style={styles.card}>
          <TextField
            value={body}
            onChangeText={setBody}
            placeholder="اینجا بنویس..."
            multiline
            maxLength={MAX_BODY_LENGTH}
            error={domainErrorMessage ?? persistError ?? undefined}
          />
        </Card>

        <Typography
          size="xs"
          color={theme.colors.secondaryText}
          style={styles.info}>
          باز می‌شود: {formatDate(placeholderUnlockAt.toISOString())}
        </Typography>

        <View style={styles.footer}>
          {saving ? (
            <View style={styles.spinner}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <Button
              label="ذخیره پیام"
              onPress={handleSave}
              disabled={!bodyValid}
            />
          )}
          <Button
            label="انصراف"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={styles.cancel}
          />
        </View>
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
  title: {
    marginBottom: 4,
  },
  hint: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  info: {
    marginBottom: 20,
  },
  footer: {
    marginTop: 'auto',
  },
  spinner: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancel: {
    marginTop: 8,
  },
});
