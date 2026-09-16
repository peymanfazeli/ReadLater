import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from './src/app/providers/ThemeProvider';
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
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
