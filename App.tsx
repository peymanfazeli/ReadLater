import React, {useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from './src/app/providers/ThemeProvider';
import {NotificationAttentionProvider} from './src/app/providers/NotificationAttentionProvider';
import {RootNavigator} from './src/app/navigation/RootNavigator';
import {navigationRef} from './src/app/navigation/navigationRef';
import {
  getInitialMessageId,
  onUnlockPress,
} from './src/services/notifications/NotificationService';

function navigateToUnlock(messageId: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate('RevealMessage', {messageId});
  }
}

function App(): React.JSX.Element {
  // Cold start: notification launched the app.
  useEffect(() => {
    getInitialMessageId().then(id => {
      if (id) {navigateToUnlock(id);}
    });
  }, []);

  // Warm/background presses while JS context is alive.
  useEffect(() => onUnlockPress(navigateToUnlock), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NotificationAttentionProvider>
            <NavigationContainer ref={navigationRef}>
              <RootNavigator />
            </NavigationContainer>
          </NotificationAttentionProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
