import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {useTheme} from '../app/providers/ThemeProvider';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
};

export function Card({children, style, padding = true}: Props) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.base,
        padding && {padding: theme.spacing.lg},
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.xl,
          borderColor: theme.colors.border,
        },
        theme.shadows.sm,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});
