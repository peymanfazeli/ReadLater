import React from 'react';
import {TextInput as RNTextInput, StyleSheet, View, Text, ViewStyle} from 'react-native';
import {useTheme} from '../app/providers/ThemeProvider';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  error?: string;
  style?: ViewStyle;
};

export function TextField({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  maxLength,
  error,
  style,
}: Props) {
  const theme = useTheme();

  return (
    <View style={style}>
      <RNTextInput
        style={[
          styles.base,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderRadius: theme.radii.md,
            color: theme.colors.primaryText,
            fontFamily: theme.typography.fontFamily,
          },
          multiline && styles.multiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.secondaryText}
        multiline={multiline}
        maxLength={maxLength}
        textAlign="right"
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {maxLength != null && (
        <Text
          style={[
            styles.counter,
            {color: theme.colors.secondaryText, fontFamily: theme.typography.fontFamily},
          ]}>
          {value.length}/{maxLength}
        </Text>
      )}
      {error && (
        <Text
          style={[
            styles.error,
            {color: theme.colors.error, fontFamily: theme.typography.fontFamily},
          ]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    writingDirection: 'rtl',
  },
  multiline: {
    minHeight: 160,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  counter: {
    fontSize: 12,
    textAlign: 'left',
    marginTop: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
