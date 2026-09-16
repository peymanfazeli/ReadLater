import React from 'react';
import {Text as RNText, TextProps, StyleSheet} from 'react-native';
import {useTheme} from '../app/providers/ThemeProvider';
import type {TypographySize, TypographyWeight} from '../theme/typography';

type Props = TextProps & {
  size?: TypographySize;
  weight?: TypographyWeight;
  color?: string;
  align?: 'left' | 'right' | 'center';
};

export function Typography({
  size = 'md',
  weight = 'regular',
  color,
  align,
  style,
  children,
  ...rest
}: Props) {
  const theme = useTheme();

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize: theme.typography.sizes[size],
          fontWeight: theme.typography.weights[weight],
          color: color ?? theme.colors.primaryText,
          fontFamily: theme.typography.fontFamily,
          textAlign: align,
        },
        style,
      ]}
      {...rest}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    writingDirection: 'rtl',
  },
});
