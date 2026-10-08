import React, {useMemo, useState} from 'react';
import {View, StyleSheet, ScrollView, Pressable, Switch} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {TextField} from '../../../components/TextField';
import {Card} from '../../../components/Card';
import {useTheme, useTranslation} from '../../../app/providers/SettingsProvider';
import {
  validateBody,
  validateTitle,
  MAX_BODY_LENGTH,
  MAX_TITLE_LENGTH,
  MAX_TODO_ITEM_LENGTH,
  MAX_TODO_ITEMS,
  type BodyValidationError,
} from '../domain/rules';
import type {TodoItem} from '../domain/types';
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

const HOURS: {hour: number; key: 'hours.9' | 'hours.12' | 'hours.17' | 'hours.21'}[] = [
  {hour: 9, key: 'hours.9'},
  {hour: 12, key: 'hours.12'},
  {hour: 17, key: 'hours.17'},
  {hour: 21, key: 'hours.21'},
];

type QuickKey = 'tomorrow' | 'week' | 'month' | 'year';
const QUICK_KEYS: {key: QuickKey; tkey: 'quick.tomorrow' | 'quick.week' | 'quick.month' | 'quick.year'}[] = [
  {key: 'tomorrow', tkey: 'quick.tomorrow'},
  {key: 'week', tkey: 'quick.week'},
  {key: 'month', tkey: 'quick.month'},
  {key: 'year', tkey: 'quick.year'},
];

type SaveError =
  | 'empty'
  | 'tooLong'
  | 'titleEmpty'
  | 'titleTooLong'
  | 'todoEmpty'
  | 'todoInvalid'
  | 'invalidUnlockAt';

export function CreateMessageScreen({navigation}: CreateMessageScreenProps) {
  const theme = useTheme();
  const {t, language} = useTranslation();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  // Todo mode replaces the text body with a checkable item list.
  const [isTodo, setIsTodo] = useState(false);
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [draftItem, setDraftItem] = useState('');
  const [domainError, setDomainError] = useState<SaveError | null>(null);
  const [saving, setSaving] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<{
    jy: number;
    jm: number;
    jd: number;
  } | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  // Locked by default (the historical behavior); switching it off lets the
  // user read the message before its date — the date then only schedules the
  // reminder notification.
  const [locked, setLocked] = useState(true);

  const trimmedTitle = title.trim();
  const titleResult = validateTitle(title);
  const titleValid = titleResult.ok;

  const trimmed = body.trim();
  const bodyResult = validateBody(body);

  // The text body and the todo list are two shapes of the same "message
  // content" slot: exactly one of them must hold something.
  const bodyError: BodyValidationError | null = bodyResult.ok ? null : bodyResult.error;
  const contentValid = isTodo ? todoItems.length > 0 : bodyResult.ok;
  const contentError: SaveError = isTodo ? 'todoEmpty' : bodyError ?? 'empty';

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
    () => (unlockISO ? formatJalaliDateTime(unlockISO, language) : null),
    [unlockISO, language],
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

  const addTodoItem = () => {
    const text = draftItem.trim();
    if (text.length === 0 || todoItems.length >= MAX_TODO_ITEMS) {
      return;
    }
    setTodoItems(prev => [...prev, {text, done: false}]);
    setDraftItem('');
    if (domainError === 'todoEmpty' || domainError === 'todoInvalid') {
      setDomainError(null);
    }
  };

  const toggleTodoItem = (index: number) =>
    setTodoItems(prev =>
      prev.map((item, i) => (i === index ? {...item, done: !item.done} : item)),
    );

  const removeTodoItem = (index: number) => {
    setTodoItems(prev => prev.filter((_, i) => i !== index));
    if (todoItems.length === 1 && domainError == null) {
      setDomainError('todoEmpty');
    }
  };

  const domainErrorMessage =
    domainError === 'titleEmpty'
      ? t('validation.titleRequired')
      : domainError === 'titleTooLong'
        ? t('validation.titleTooLong')
        : domainError === 'empty'
          ? t('validation.bodyRequired')
        : domainError === 'tooLong'
          ? t('validation.bodyTooLong')
          : domainError === 'todoEmpty'
            ? t('validation.todoRequired')
            : domainError === 'todoInvalid'
              ? t('validation.todoInvalid')
              : domainError === 'invalidUnlockAt'
                ? t('validation.invalidUnlockAt')
                : null;

  async function handleSave() {
    if (!titleValid || !contentValid || !unlockInFuture) {
      setDomainError(
        !titleValid
          ? titleResult.error
          : !contentValid
            ? contentError
            : 'invalidUnlockAt',
      );
      return;
    }
    setDomainError(null);
    setPersistError(null);
    setSaving(true);
    try {
      const result = await messageRepository.create({
        title: trimmedTitle,
        body: isTodo ? '' : trimmed,
        items: isTodo ? todoItems : undefined,
        unlockAt: unlockISO!,
        locked,
      });
      if (result.ok) {
        navigation.goBack();
        return;
      }
      setDomainError(result.error);
      setPersistError(t('create.saveFailed'));
    } catch {
      setPersistError(t('create.saveFailed'));
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
          {t('screenCreate')}
        </Typography>
        <Typography
          size="sm"
          color={theme.colors.secondaryText}
          style={styles.hint}>
          {t('create.subtitle')}
        </Typography>

        <Card style={styles.card}>
          <Typography
            size="sm"
            weight="semibold"
            color={theme.colors.primaryText}
            style={styles.sectionLabel}>
            {t('create.titleLabel')}
          </Typography>
          <TextField
            value={title}
            onChangeText={text => {
              setTitle(text);
              if (domainError === 'titleEmpty' || domainError === 'titleTooLong') {
                setDomainError(null);
              }
            }}
            placeholder={t('create.titlePlaceholder')}
            maxLength={MAX_TITLE_LENGTH}
            accessibilityLabel={t('create.titleLabel')}
            error={
              domainError === 'titleEmpty' || domainError === 'titleTooLong'
                ? domainErrorMessage ?? undefined
                : undefined
            }
          />

          <View style={styles.lockRow}>
            <View style={styles.lockText}>
              <Typography
                size="sm"
                weight="semibold"
                color={theme.colors.primaryText}>
                {t('create.todoLabel')}
              </Typography>
              <Typography
                size="xs"
                color={theme.colors.secondaryText}
                style={styles.lockHint}>
                {t('create.todoHint')}
              </Typography>
            </View>
            <Switch
              value={isTodo}
              onValueChange={value => {
                setIsTodo(value);
                if (
                  domainError === 'empty' ||
                  domainError === 'tooLong' ||
                  domainError === 'todoEmpty' ||
                  domainError === 'todoInvalid'
                ) {
                  setDomainError(null);
                }
              }}
              trackColor={{
                false: theme.colors.secondaryText,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
              accessibilityLabel={t('create.todoLabel')}
            />
          </View>

          {!isTodo ? (
            <>
              <Typography
                size="sm"
                weight="semibold"
                color={theme.colors.primaryText}
                style={styles.bodyLabel}>
                {t('create.bodyLabel')}
              </Typography>
              <TextField
                value={body}
                onChangeText={text => {
                  setBody(text);
                  if (domainError === 'empty' || domainError === 'tooLong') {
                    setDomainError(null);
                  }
                }}
                placeholder={t('create.bodyPlaceholder')}
                multiline
                maxLength={MAX_BODY_LENGTH}
                accessibilityLabel={t('create.bodyLabel')}
                error={
                  domainError === 'empty' || domainError === 'tooLong'
                    ? domainErrorMessage ?? undefined
                    : undefined
                }
              />
            </>
          ) : (
            <View style={styles.todoBlock}>
              <View style={styles.todoInputRow}>
                <TextField
                  style={styles.todoField}
                  value={draftItem}
                  onChangeText={setDraftItem}
                  placeholder={t('create.todoPlaceholder')}
                  maxLength={MAX_TODO_ITEM_LENGTH}
                  accessibilityLabel={t('create.todoPlaceholder')}
                />
                <Pressable
                  onPress={addTodoItem}
                  disabled={
                    draftItem.trim().length === 0 ||
                    todoItems.length >= MAX_TODO_ITEMS
                  }
                  style={[
                    styles.todoAdd,
                    {borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
                    (draftItem.trim().length === 0 ||
                      todoItems.length >= MAX_TODO_ITEMS) &&
                      styles.chipDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t('create.todoAdd')}>
                  <Typography size="xs" color={theme.colors.primaryText}>
                    {t('create.todoAdd')}
                  </Typography>
                </Pressable>
              </View>
              {(domainError === 'todoEmpty' || domainError === 'todoInvalid') &&
                domainErrorMessage != null && (
                  <Typography size="xs" color={theme.colors.error} style={styles.todoError}>
                    {domainErrorMessage}
                  </Typography>
                )}
              {todoItems.map((item, index) => (
                <View key={`${index}-${item.text}`} style={styles.todoRow}>
                  <Pressable
                    onPress={() => toggleTodoItem(index)}
                    accessibilityRole="checkbox"
                    accessibilityState={{checked: item.done}}
                    accessibilityLabel={item.text}
                    style={[
                      styles.todoCheckbox,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: item.done
                          ? theme.colors.primary
                          : theme.colors.surface,
                      },
                    ]}>
                    {item.done && (
                      <Typography size="xs" color={theme.colors.onPrimary}>
                        {'\u2713'}
                      </Typography>
                    )}
                  </Pressable>
                  <Typography
                    size="sm"
                    color={theme.colors.primaryText}
                    style={styles.todoText}>
                    {item.text}
                  </Typography>
                  <Pressable
                    onPress={() => removeTodoItem(index)}
                    accessibilityRole="button"
                    accessibilityLabel={t('create.todoRemove')}
                    hitSlop={8}
                    style={styles.todoRemove}>
                    <Typography size="sm" color={theme.colors.secondaryText}>
                      {'\u00D7'}
                    </Typography>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          {persistError != null && (
            <Typography
              size="xs"
              color={theme.colors.error}
              style={styles.persistError}>
              {persistError}
            </Typography>
          )}
        </Card>

        <Card style={styles.card}>
          <Typography
            size="sm"
            weight="semibold"
            color={theme.colors.primaryText}
            style={styles.sectionLabel}>
            {t('create.unlockSection')}
          </Typography>

          <View style={styles.lockRow}>
            <View style={styles.lockText}>
              <Typography
                size="sm"
                weight="semibold"
                color={theme.colors.primaryText}>
                {t('create.lockLabel')}
              </Typography>
              <Typography
                size="xs"
                color={theme.colors.secondaryText}
                style={styles.lockHint}>
                {t('create.lockHint')}
              </Typography>
            </View>
            <Switch
              value={locked}
              onValueChange={setLocked}
              trackColor={{
                false: theme.colors.secondaryText,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
              accessibilityLabel={t('create.lockLabel')}
            />
          </View>

          <View style={styles.chipRow}>
            {QUICK_KEYS.map(o => (
              <Pressable
                key={o.key}
                onPress={() => applyQuick(o.key)}
                style={[
                  styles.chip,
                  {borderColor: theme.colors.border, backgroundColor: theme.colors.surface},
                ]}
                accessibilityRole="button">
                <Typography size="xs" color={theme.colors.primaryText}>
                  {t(o.tkey)}
                </Typography>
              </Pressable>
            ))}
          </View>

          <JalaliDatePicker
            value={selectedDate}
            onChange={(jy, jm, jd) => handlePickDate(jy, jm, jd)}
          />

          <View style={styles.chipRow}>
            {HOURS.map(o => (
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
                  color={
                    selectedHour === o.hour
                      ? theme.colors.onPrimary
                      : theme.colors.primaryText
                  }>
                  {t(o.key)}
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
              accessibilityLabel={t('minutes.decreaseFive')}>
              <Typography size="sm" color={theme.colors.primaryText}>
                {toPersianDigits('−5')}
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
              accessibilityLabel={t('minutes.decreaseOne')}>
              <Typography size="sm" color={theme.colors.primaryText}>
                {toPersianDigits('−1')}
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
              accessibilityLabel={t('minutes.increaseOne')}>
              <Typography size="sm" color={theme.colors.primaryText}>
                {toPersianDigits('+1')}
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
              accessibilityLabel={t('minutes.increaseFive')}>
              <Typography size="sm" color={theme.colors.primaryText}>
                {toPersianDigits('+5')}
              </Typography>
            </Pressable>
          </View>

          {unlockPreview != null && unlockInFuture && (
            <Typography size="sm" color={theme.colors.secondaryText} style={styles.preview}>
              {t('create.unlocksPreview', {date: unlockPreview})}
            </Typography>
          )}
          {unlockISO != null && !unlockInFuture && (
            <Typography size="sm" color={theme.colors.error} style={styles.preview}>
              {t('create.pastWarning')}
            </Typography>
          )}
        </Card>

        <View style={styles.footer}>
          <Button
            label={t('create.save')}
            onPress={handleSave}
            disabled={!titleValid || !contentValid || !unlockInFuture || saving}
          />
          <Button
            label={t('actions.cancel')}
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
  sectionLabel: {marginBottom: 8},
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  lockText: {flex: 1},
  lockHint: {marginTop: 2},
  bodyLabel: {marginTop: 16, marginBottom: 8},
  todoBlock: {marginTop: 4},
  todoInputRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  todoField: {flex: 1},
  todoAdd: {borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12},
  todoError: {marginTop: 6},
  todoRow: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10},
  todoCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoText: {flex: 1, lineHeight: 20},
  todoRemove: {paddingHorizontal: 4},
  persistError: {marginTop: 8},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 8},
  chip: {borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8},
  chipDisabled: {opacity: 0.35},
  minuteRow: {
    flexDirection: 'row',
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
