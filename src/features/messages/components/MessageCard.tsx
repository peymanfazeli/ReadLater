import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {Typography} from '../../../components/Typography';
import {Card} from '../../../components/Card';
import {useTheme} from '../../../app/providers/ThemeProvider';
import type {Message} from '../domain/types';
import {formatDate} from '../domain/rules';

type Props = {
  message: Message;
  onPress: () => void;
};

export function MessageCard({message, onPress}: Props) {
  const theme = useTheme();
  const isLocked = message.status === 'locked';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <Typography size="lg">{isLocked ? '🔒' : '✉️'}</Typography>
          </View>
          <View style={styles.content}>
            <Typography
              size="sm"
              weight="semibold"
              color={theme.colors.primaryText}>
              {isLocked ? 'پیام قفل شده' : 'پیام باز شده'}
            </Typography>
            <Typography
              size="xs"
              color={theme.colors.secondaryText}
              style={styles.date}>
              {isLocked
                ? `باز می‌شود: ${formatDate(message.unlockAt)}`
                : `ساخته شده: ${formatDate(message.createdAt)}`}
            </Typography>
          </View>
          <Typography
            size="sm"
            color={isLocked ? theme.colors.primary : theme.colors.successText}>
            {isLocked ? ' منتظر' : ' باز کن'}
          </Typography>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
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
  content: {
    flex: 1,
    marginHorizontal: 12,
  },
  date: {
    marginTop: 2,
  },
});
