import React, {useEffect} from 'react';
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  SettingsProvider,
  useDirection,
  useSettings,
  useTheme,
} from './src/app/providers/SettingsProvider';
import {NotificationAttentionProvider} from './src/app/providers/NotificationAttentionProvider';
import {RootNavigator} from './src/app/navigation/RootNavigator';
import {navigationRef} from './src/app/navigation/navigationRef';
import {ThemeWave} from './src/app/components/ThemeWave';
import {
  getInitialMessageId,
  onUnlockPress,
} from './src/services/notifications/NotificationService';

function navigateToUnlock(messageId: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('RevealMessage', {messageId});
  }
}

function AppShell() {
  const direction = useDirection();
  const {loaded} = useSettings();
  const {transition, endThemeTransition} = useSettings();
  const theme = useTheme();
  const {width, height} = useWindowDimensions();

  const radius =
    transition != null
      ? Math.hypot(
          Math.max(transition.origin.x, width - transition.origin.x),
          Math.max(transition.origin.y, height - transition.origin.y),
        ) + 80
      : 0;

  // Cold start: notification launched the app.
  useEffect(() => {
    getInitialMessageId().then(id => {
      if (id) {
        navigateToUnlock(id);
      }
    });
  }, []);

  // Warm/background presses while JS context is alive.
  useEffect(() => onUnlockPress(navigateToUnlock), []);

  if (!loaded) {
    return <View style={[styles.root, {backgroundColor: theme.colors.background}]} />;
  }

  return (
    <View style={[styles.root, {direction}]}>
      <SafeAreaProvider>
        <NotificationAttentionProvider>
          <NavigationContainer ref={navigationRef}>
            <RootNavigator />
          </NavigationContainer>
          {transition != null && (
            <ThemeWave
              origin={transition.origin}
              radius={radius}
              color={transition.fromColor}
              animationKey={transition.key}
              onDone={endThemeTransition}
            />
          )}
        </NotificationAttentionProvider>
      </SafeAreaProvider>
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SettingsProvider>
        <AppShell />
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
