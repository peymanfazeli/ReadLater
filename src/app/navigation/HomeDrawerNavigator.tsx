import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useTheme} from '../providers/ThemeProvider';
import {HomeScreen} from '../../features/messages/screens/HomeScreen';
import {DrawerContent} from './DrawerContent';
import type {HomeDrawerParamList} from './types';

const Drawer = createDrawerNavigator<HomeDrawerParamList>();

export function HomeDrawerNavigator() {
  const theme = useTheme();

  return (
    <Drawer.Navigator
      id="HomeDrawer"
      screenOptions={{
        headerShown: false,
        // Persian RTL: the drawer slides in from the right edge.
        drawerPosition: 'right',
        drawerType: 'front',
        drawerActiveTintColor: theme.colors.primaryDark,
        drawerInactiveTintColor: theme.colors.primaryText,
        drawerLabelStyle: {
          fontFamily: theme.typography.fontFamily,
        },
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: '85%',
        },
        overlayColor: 'rgba(0, 0, 0, 0.4)',
      }}
      drawerContent={DrawerContent}>
      <Drawer.Screen name="HomeMain" component={HomeScreen} />
    </Drawer.Navigator>
  );
}
