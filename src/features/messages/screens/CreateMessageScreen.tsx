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
  toPersianDigits,
  jalaliOf,
  jalaliToIso,
  quickUnlocks,
  isJalaliTimeAvailable,
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
  const [selectedMinute, setSelectedMinute] = useState<number>(0);

  const trimmed = body.trim();
  const bodyResult = validateBody(body);
  const bodyValid = bodyResult.ok;

  // Fresh `now` on every render keeps passed minutes rolling off the UI.
  const now = new Date();
  const nowJalali = jalaliOf(now);
  const isToday =
    selectedDate != null &&
    selectedDate.jy === nowJalali.jy &&
    selectedDate.jm === nowJalali.jm &&
    selectedDate.jd === nowJalali.jd;

  const minuteAvailable = (hour: number, minute: number) =>
    selectedDate != null &&
    isJalaliTimeAvailable(
      selectedDate.jy,
      selectedDate.jm,
      selectedDate.jd,
      hour,
      minute,
      now,
    );

  // An hour is usable while even its last minute is still in the future;
  // the minute row then prunes the already-passed minutes inside that hour.
  const hourAvailable = (hour: number) =>
    minuteAvailable(hour, 0) || minuteAvailable(hour, 59);
  const hourDisabled = (hour: number) => isToday && !hourAvailable(hour);

  const unlockISO = useMemo(
    () =>
      selectedDate
        ? jalaliToIso(
            selectedDate.jy,
            selectedDate.jm,
            selectedDate.jd,
            selectedHour,
            selectedMinute,
          )
        : null,
    [selectedDate, selectedHour, selectedMinute],
  );
  const unlockInFuture =
    unlockISO != null && new Date(unlockISO).getTime() > Date.now();

  const unlockPreview = useMemo(
    () => (unlockISO ? formatJalaliDateTime(unlockISO) : null),
    [unlockISO],
  );

  // When the picked day/time combo already passed, snap to the next valid
  // five-minute mark so selecting today always yields a usable default.
  function handlePickDate(jy: number, jm: number, jd: number) {
    let hour = selectedHour;
    let minute = selectedMinute;
    if (!isJalaliTimeAvailable(jy, jm, jd, hour, minute, new Date())) {
      const n = new Date();
      hour = Math.min(n.getHours(), 23);
      minute = Math.ceil((n.getMinutes() + 1) / 5) * 5;
      if (minute > 55) {
        hour = Math.min(hour + 1, 23);
        minute = 0;
      }
    }
    setSelectedHour(hour);
    setSelectedMinute(minute);
    setSelectedDate({jy, jm, jd});
  }

  const stepMinute = (delta: number) => {
    const next = selectedMinute + delta;
    if (next < 0 || next > 59) {
      return;
    }
    setSelectedMinute(next);
  };

  const decDisabled = (delta: number) =>
    selectedMinute - delta < 0 ||
    (isToday && !minuteAvailable(selectedHour, selectedMinute - delta));
  const incDisabled = (delta: number) =>
    selectedMinute + delta > 59 ||
    (isToday && !minuteAvailable(selectedHour, selectedMinute + delta));

  const applyQuick = (key: QuickKey) => {
    const iso = quickUnlocks(new Date(), selectedHour, selectedMinute)[key];
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
    if (!bodyValid || !unlockInFuture) {
      setDomainError(
        !unlockInFuture
          ? 'invalidUnlockAt'
          : bodyResult.ok
            ? null
            : bodyResult.error,
      );
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
            onChange={(jy, jm, jd) => handlePickDate(jy, jm, jd)}
          />

          <View style={styles.chipRow}>
            {HOUR_OPTIONS.map(o => (
              <Pressable
                key={o.hour}
                onPress={() => setSelectedHour(o.hour)}
                disabled={hourDisabled(o.hour)}
                style={[
                  styles.chip,
                  selectedHour === o.hour
                    ? {backgroundColor: theme.colors.primary}
                    : {borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
                  hourDisabled(o.hour) && styles.chipDisabled,
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

          <View style={styles.minuteRow}>
            <Pressable
              onPress={() => stepMinute(-5)}
              disabled={decDisabled(5)}
              style={[
                styles.minuteBtn,
                {borderColor: theme.colors.border},
                decDisabled(5) && styles.chipDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="کم کردن ۵ دقیقه">
              <Typography size="sm" color={theme.colors.primaryText}>
                {'−۵'}
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => stepMinute(-1)}
              disabled={decDisabled(1)}
              style={[
                styles.minuteBtn,
                {borderColor: theme.colors.border},
                decDisabled(1) && styles.chipDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="کم کردن ۱ دقیقه">
              <Typography size="sm" color={theme.colors.primaryText}>
                {'−۱'}
              </Typography>
            </Pressable>
            <View style={styles.minuteValue}>
              <Typography size="md" weight="semibold" color={theme.colors.primaryText}>
                {toPersianDigits(String(selectedMinute).padStart(2, '0'))}
              </Typography>
            </View>
            <Pressable
              onPress={() => stepMinute(1)}
              disabled={incDisabled(1)}
              style={[
                styles.minuteBtn,
                {borderColor: theme.colors.border},
                incDisabled(1) && styles.chipDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="افزودن ۱ دقیقه">
              <Typography size="sm" color={theme.colors.primaryText}>
                {'+۱'}
              </Typography>
            </Pressable>
            <Pressable
              onPress={() => stepMinute(5)}
              disabled={incDisabled(5)}
              style={[
                styles.minuteBtn,
                {borderColor: theme.colors.border},
                incDisabled(5) && styles.chipDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="افزودن ۵ دقیقه">
              <Typography size="sm" color={theme.colors.primaryText}>
                {'+۵'}
              </Typography>
            </Pressable>
          </View>

          {unlockPreview != null && unlockInFuture && (
            <Typography size="sm" color={theme.colors.secondaryText} style={styles.preview}>
              باز می‌شود: {unlockPreview}
            </Typography>
          )}
          {unlockISO != null && !unlockInFuture && (
            <Typography size="sm" color={theme.colors.error} style={styles.preview}>
              زمان باز شدن باید در آینده باشد
            </Typography>
          )}
        </Card>

        <View style={styles.footer}>
          <Button
            label="ذخیره پیام"
            onPress={handleSave}
            disabled={!bodyValid || !unlockInFuture || saving}
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
  chipDisabled: {opacity: 0.35},
  minuteRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  minuteBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  minuteValue: {
    minWidth: 48,
    alignItems: 'center',
  },
  preview: {marginTop: 8},
  footer: {marginTop: 'auto'},
  cancel: {marginTop: 8},
});
