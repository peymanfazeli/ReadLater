import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {Typography} from '../../../components/Typography';
import {Card} from '../../../components/Card';
import {useTheme, useTranslation} from '../../../app/providers/SettingsProvider';
import type {Message} from '../domain/types';
import {formatDate} from '../domain/rules';

type Props = {
  message: Message;
  onPress: () => void;
};

export function MessageCard({message, onPress}: Props) {
  const theme = useTheme();
  const {t, language} = useTranslation();
  const isLocked = message.status === 'locked';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <Typography size="lg">{isLocked ? '🔒' : '✉️'}</Typography>
          </View>
          <View style={styles.content}>
            <Typography size="sm" weight="semibold" color={theme.colors.primaryText}>
              {isLocked ? t('message.locked') : t('message.unlocked')}
            </Typography>
            <Typography
              size="md"
              weight="bold"
              color={theme.colors.primaryText}
              numberOfLines={2}
              style={styles.title}>
              {message.title}
            </Typography>
            <Typography
              size="xs"
              color={theme.colors.secondaryText}
              style={styles.date}>
              {isLocked
                ? t('message.unlocksAt', {
                    date: formatDate(message.unlockAt, language),
                  })
                : t('message.createdAt', {
                    date: formatDate(message.createdAt, language),
                  })}
            </Typography>
          </View>
          <Typography
            size="sm"
            color={isLocked ? theme.colors.primary : theme.colors.successText}>
            {isLocked ? t('message.statusWaiting') : t('message.statusOpen')}
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
  title: {
    marginTop: 2,
  },
  date: {
    marginTop: 4,
  },
});
