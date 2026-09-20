import React from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {DrawerContentComponentProps} from '@react-navigation/drawer';
import {useTheme} from '../providers/ThemeProvider';
import {Typography} from '../../components/Typography';
import {AttentionDot} from '../../components/AttentionDot';
import {useNotificationAttention} from '../providers/NotificationAttentionProvider';

export function DrawerContent({navigation}: DrawerContentComponentProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {attention} = useNotificationAttention();

  // The drawer is nested inside the root stack, so its "Login"/"Settings"
  // destinations live one level up on the parent navigator.
  function go(screen: 'Login' | 'Settings') {
    navigation.closeDrawer();
    navigation.getParent()?.navigate(screen);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          paddingTop: insets.top + theme.spacing.xxl,
          paddingBottom: insets.bottom + theme.spacing.xxl,
        },
      ]}>
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ورود"
          style={({pressed}) => [
            styles.item,
            {backgroundColor: pressed ? theme.colors.border : theme.colors.successSurface},
          ]}
          onPress={() => go('Login')}>
          <Typography
            size="lg"
            weight="semibold"
            color={theme.colors.primaryDark}
            align="center">
            ورود
          </Typography>
        </Pressable>
      </View>

      <View style={styles.bottom}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="تنظیمات"
          style={({pressed}) => [
            styles.item,
            {backgroundColor: pressed ? theme.colors.border : theme.colors.successSurface},
          ]}
          onPress={() => go('Settings')}>
          <Typography
            size="lg"
            weight="semibold"
            color={theme.colors.primaryDark}
            align="center">
            تنظیمات
          </Typography>
          <AttentionDot active={attention} style={styles.menuDot} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  top: {
    alignSelf: 'stretch',
  },
  bottom: {
    alignSelf: 'stretch',
    marginTop: 'auto',
  },
  menuDot: {
    top: -3,
    right: -3,
  },
  item: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
