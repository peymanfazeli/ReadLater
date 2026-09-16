import React, {useMemo, useState} from 'react';
import {View, StyleSheet, ScrollView, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {TextField} from '../../../components/TextField';
import {Card} from '../../../components/Card';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {validateBody, MAX_BODY_LENGTH} from '../domain/rules';
import {messageRepository} from '../data';
import {
  jalaliOf,
  jalaliToIso,
  quickUnlocks,
  formatJalaliDateTime,
} from '../domain/jalali';
import {JalaliDatePicker} from '../components/JalaliDatePicker';
import type {CreateMessageScreenProps} from '../../../app/navigation/types';

const HOUR_OPTIONS = [
  {hour: 9, label: '۹:۰۰ صبح'},
  {hour: 12, label: '۱۲:۰۰ ظهر'},
  {hour: 17, label: '۱۷:۰۰ عصر'},
  {hour: 21, label: '۲۱:۰۰ شب'},
] as const;

type QuickKey = 'tomorrow' | 'week' | 'month' | 'year';
const QUICK_OPTIONS: {key: QuickKey; label: string}[] = [
  {key: 'tomorrow', label: 'فردا'},
  {key: 'week', label: '۱ هفته بعد'},
  {key: 'month', label: '۱ ماه بعد'},
  {key: 'year', label: '۱ سال بعد'},
];

export function CreateMessageScreen({navigation}: CreateMessageScreenProps) {
  const theme = useTheme();
  const [body, setBody] = useState('');
  const [domainError, setDomainError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<{
    jy: number;
    jm: number;
    jd: number;
  } | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(9);

  const trimmed = body.trim();
  const bodyResult = validateBody(body);
  const bodyValid = bodyResult.ok;

  const unlockISO = useMemo(
    () =>
      selectedDate
        ? jalaliToIso(selectedDate.jy, selectedDate.jm, selectedDate.jd, selectedHour)
        : null,
    [selectedDate, selectedHour],
  );

  const unlockPreview = useMemo(
    () => (unlockISO ? formatJalaliDateTime(unlockISO) : null),
    [unlockISO],
  );

  const applyQuick = (key: QuickKey) => {
    const iso = quickUnlocks(new Date(), selectedHour)[key];
    setSelectedDate(jalaliOf(iso));
  };

  const domainErrorMessage =
    domainError === 'empty'
      ? 'لطفاً پیامی بنویسید'
      : domainError === 'tooLong'
        ? 'پیام خیلی طولانی است'
        : domainError === 'invalidUnlockAt'
          ? 'تاریخ باز شدن نامعتبر است'
          : null;

  async function handleSave() {
    if (!bodyValid || !unlockISO) {
      setDomainError(unlockISO ? (bodyResult.ok ? null : bodyResult.error) : 'invalidUnlockAt');
      return;
    }
    setDomainError(null);
    setPersistError(null);
    setSaving(true);
    try {
      const result = await messageRepository.create({
        body: trimmed,
        unlockAt: unlockISO,
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

        <Card style={styles.card}>
          <Typography
            size="sm"
            weight="semibold"
            color={theme.colors.primaryText}
            style={styles.sectionLabel}>
            زمان باز شدن
          </Typography>

          <View style={styles.chipRow}>
            {QUICK_OPTIONS.map(o => (
              <Pressable
                key={o.key}
                onPress={() => applyQuick(o.key)}
                style={[
                  styles.chip,
                  {borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
                ]}
                accessibilityRole="button">
                <Typography size="xs" color={theme.colors.primaryText}>
                  {o.label}
                </Typography>
              </Pressable>
            ))}
          </View>

          <JalaliDatePicker
            value={selectedDate}
            onChange={(jy, jm, jd) => setSelectedDate({jy, jm, jd})}
          />

          <View style={styles.chipRow}>
            {HOUR_OPTIONS.map(o => (
              <Pressable
                key={o.hour}
                onPress={() => setSelectedHour(o.hour)}
                style={[
                  styles.chip,
                  selectedHour === o.hour
                    ? {backgroundColor: theme.colors.primary}
                    : {borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
                ]}
                accessibilityRole="button">
                <Typography
                  size="xs"
                  color={selectedHour === o.hour ? theme.colors.white : theme.colors.primaryText}>
                  {o.label}
                </Typography>
              </Pressable>
            ))}
          </View>

          {unlockPreview != null && (
            <Typography size="sm" color={theme.colors.secondaryText} style={styles.preview}>
              باز می‌شود: {unlockPreview}
            </Typography>
          )}
        </Card>

        <View style={styles.footer}>
          <Button
            label="ذخیره پیام"
            onPress={handleSave}
            disabled={!bodyValid || !unlockISO || saving}
          />
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
  safe: {flex: 1},
  scroll: {flex: 1},
  content: {padding: 20, flexGrow: 1},
  title: {marginBottom: 4},
  hint: {marginBottom: 16},
  card: {marginBottom: 12},
  sectionLabel: {marginBottom: 12},
  chipRow: {flexDirection: 'row-reverse', flexWrap: 'wrap', marginBottom: 12, gap: 8},
  chip: {borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8},
  preview: {marginTop: 8},
  footer: {marginTop: 'auto'},
  cancel: {marginTop: 8},
});
