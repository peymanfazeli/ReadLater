import React, {useState, useMemo, useCallback} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {Typography} from '../../../components/Typography';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {
  jalaliOf,
  JALALI_MONTH_NAMES,
  WEEKDAY_NAMES,
  toPersianDigits,
  jalaliMonthGrid,
  isJalaliDayAvailable,
} from '../domain/jalali';
import type {JalaliCell} from '../domain/jalali';

type Props = {
  value: {jy: number; jm: number; jd: number} | null;
  onChange: (jy: number, jm: number, jd: number) => void;
  disabled?: boolean;
};

export function JalaliDatePicker({value, onChange, disabled}: Props) {
  const theme = useTheme();
  const today = useMemo(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    [],
  );
  const todayJalali = useMemo(() => jalaliOf(today), [today]);
  const [month, setMonth] = useState<{jy: number; jm: number}>({
    jy: value?.jy ?? todayJalali.jy,
    jm: value?.jm ?? todayJalali.jm,
  });

  const grid = useMemo(() => jalaliMonthGrid(month.jy, month.jm), [month.jy, month.jm]);

  const addMonth = useCallback(
    (delta: number) => {
      const total = month.jy * 12 + (month.jm - 1) + delta;
      const jy = Math.floor(total / 12);
      const jm = (total % 12) + 1;
      setMonth({jy, jm});
    },
    [month.jy, month.jm],
  );

  const selectionKey = value ? `${value.jy}-${value.jm}-${value.jd}` : null;

  return (
    <View style={styles.container} accessibilityRole="adjustable">
      <View style={styles.header}>
        <Pressable
          onPress={() => addMonth(-1)}
          disabled={disabled}
          style={styles.nav}
          accessibilityRole="button"
          accessibilityLabel="ماه قبل">
          <Text style={[styles.navLabel, {color: theme.colors.primary}]}>{'‹'}</Text>
        </Pressable>
        <Typography size="md" weight="semibold" color={theme.colors.primaryText}>
          {toPersianDigits(JALALI_MONTH_NAMES[month.jm - 1])} {toPersianDigits(month.jy)}
        </Typography>
        <Pressable
          onPress={() => addMonth(1)}
          disabled={disabled}
          style={styles.nav}
          accessibilityRole="button"
          accessibilityLabel="ماه بعد">
          <Text style={[styles.navLabel, {color: theme.colors.primary}]}>{'›'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekrow}>
        {WEEKDAY_NAMES.map(d => (
          <View key={d} style={styles.weekcell}>
            <Typography size="xs" weight="medium" color={theme.colors.secondaryText}>
              {d}
            </Typography>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((cell, idx) => (
          <DayCell
            key={`${cell.jy}-${cell.jm}-${cell.jd}-${idx}`}
            cell={cell}
            isSelected={selectionKey === `${cell.jy}-${cell.jm}-${cell.jd}`}
            available={!disabled && isJalaliDayAvailable(cell.jy, cell.jm, cell.jd, today)}
            onPress={() => onChange(cell.jy, cell.jm, cell.jd)}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

function DayCell({
  cell,
  isSelected,
  available,
  onPress,
  theme,
}: {
  cell: JalaliCell;
  isSelected: boolean;
  available: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  if (!cell.inMonth) {
    return <View style={styles.cell} />;
  }
  const bg = isSelected ? theme.colors.primary : 'transparent';
  const text = isSelected ? theme.colors.white : available ? theme.colors.primaryText : theme.colors.secondaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={!available}
      style={[styles.cell, isSelected && {backgroundColor: bg}]}
      accessibilityRole="button"
      accessibilityLabel={`${cell.jd}`}>
      <Typography size="sm" color={text}>
        {toPersianDigits(cell.jd)}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  nav: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 20,
    fontWeight: '600',
  },
  weekrow: {
    flexDirection: 'row-reverse',
    marginBottom: 8,
  },
  weekcell: {
    flex: 1,
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    width: `${(1 / 7) * 100}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
});
