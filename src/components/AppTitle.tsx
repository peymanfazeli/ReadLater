import React from 'react';
import {StyleSheet} from 'react-native';
import {Typography} from './Typography';
import {useTheme, useTranslation} from '../app/providers/SettingsProvider';

// Home-screen app title: warm accent (light) / champagne (dark) glow, with a
// larger RTL treatment in Lalezar (bundled at
// android/app/src/main/assets/fonts/Lalezar.ttf, OFL) for Persian and a
// tracked semibold one in the theme font for English.
export function AppTitle() {
  const theme = useTheme();
  const {language, t} = useTranslation();
  const isFa = language === 'fa';

  return (
    <Typography
      accessibilityRole="header"
      size="xxxl"
      // Weight must stay <700: ReactFontManager resolves bold as
      // `fonts/Lalezar_bold.ttf` and silently falls back to the system font
      // when only `fonts/Lalezar.ttf` exists.
      weight="semibold"
      color={theme.colors.primary}
      style={[
        styles.base,
        isFa ? styles.fa : styles.en,
        {textShadowColor: theme.colors.glow},
      ]}>
      {t('appName')}
    </Typography>
  );
}

const styles = StyleSheet.create({
  base: {
    textAlign: 'center',
    paddingVertical: 12,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
  },
  fa: {
    fontFamily: 'Lalezar',
    writingDirection: 'rtl',
  },
  en: {
    fontSize: 32,
    letterSpacing: 1.2,
  },
});
