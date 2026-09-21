import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';
import {HomeDrawerNavigator} from './HomeDrawerNavigator';
import {CreateMessageScreen} from '../../features/messages/screens/CreateMessageScreen';
import {RevealMessageScreen} from '../../features/messages/screens/RevealMessageScreen';
import {LoginScreen} from '../../features/auth/screens/LoginScreen';
import {SettingsScreen} from '../../features/settings/screens/SettingsScreen';
import {useTheme, useTranslation} from '../providers/SettingsProvider';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        // Native headers are hidden on every screen; each screen renders its
        // own header so layout direction follows the active language exactly.
        headerShown: false,
        contentStyle: {backgroundColor: theme.colors.background},
      }}>
      <Stack.Screen name="Home" component={HomeDrawerNavigator} />
      <Stack.Screen
        name="CreateMessage"
        component={CreateMessageScreen}
        options={{title: t('screenCreate')}}
      />
      <Stack.Screen
        name="RevealMessage"
        component={RevealMessageScreen}
        options={{title: t('screenReveal')}}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{title: t('screenLogin')}}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: t('screenSettings')}}
      />
    </Stack.Navigator>
  );
}
