import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Typography} from '../../../components/Typography';
import {Button} from '../../../components/Button';
import {Card} from '../../../components/Card';
import {useTheme, useTranslation} from '../../../app/providers/SettingsProvider';
import type {LoginScreenProps} from '../../../app/navigation/types';

export function LoginScreen({navigation}: LoginScreenProps) {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: theme.colors.background}]}
      edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <Typography size="xl" weight="bold" color={theme.colors.primaryText}>
          {t('screenLogin')}
        </Typography>

        <View style={styles.center}>
          <Card style={styles.card}>
            <Typography
              size="md"
              color={theme.colors.secondaryText}
              style={styles.hint}>
              {t('login.comingSoon')}
            </Typography>
          </Card>
        </View>

        <Button
          label={t('actions.back')}
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.back}
        />
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
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  hint: {
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  back: {
    marginTop: 'auto',
  },
});
