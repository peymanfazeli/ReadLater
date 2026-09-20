import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';
import {HomeDrawerNavigator} from './HomeDrawerNavigator';
import {CreateMessageScreen} from '../../features/messages/screens/CreateMessageScreen';
import {RevealMessageScreen} from '../../features/messages/screens/RevealMessageScreen';
import {LoginScreen} from '../../features/auth/screens/LoginScreen';
import {SettingsScreen} from '../../features/settings/screens/SettingsScreen';
import {useTheme} from '../providers/ThemeProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.background},
        headerTintColor: theme.colors.primaryText,
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.weights.semibold,
        },
        headerBackTitle: 'بازگشت',
        contentStyle: {backgroundColor: theme.colors.background},
      }}>
      <Stack.Screen
        name="Home"
        component={HomeDrawerNavigator}
        options={{title: 'بعدابخون', headerShown: false}}
      />
      <Stack.Screen
        name="CreateMessage"
        component={CreateMessageScreen}
        options={{title: 'پیام جدید'}}
      />
      <Stack.Screen
        name="RevealMessage"
        component={RevealMessageScreen}
        options={{title: 'پیام تو', headerShown: false}}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{title: 'ورود'}}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: 'تنظیمات'}}
      />
    </Stack.Navigator>
  );
}
