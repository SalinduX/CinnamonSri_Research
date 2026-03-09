import React from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from './src/types/index';
import { C } from './src/components/theme';

import HomeScreen from  './src/screens/HomeScreen';
import CinnDryNavigator from './src/screens/CinnDry/index';
import CinnOracle from './src/screens/CinnOracle/index';
import CinnHarvest from './src/screens/CinnHarvest/index';
import CinnGuard from './src/screens/CinnGuard/index';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Extend default theme to support dark mode properly
const appNavigationTheme = {
  ...NavigationDefaultTheme,
  dark: true,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: C.spice,
    background: C.bg,
    card: C.surface,
    text: C.cream,
    border: C.border,
    notification: C.spice,
  },
};

export default function App() {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={C.bg}
        translucent={false}
      />

      <NavigationContainer theme={appNavigationTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: C.surface,
            },
            headerTintColor: C.spiceLight,
            headerTitleStyle: {
              color: C.cream,
              fontFamily: 'Georgia', // Note: fallback to system sans-serif on Android if not loaded
              fontWeight: '700',
            },
            headerBackTitleVisible: false,
            headerBackVisible: true, // ensures back arrow shows
            contentStyle: {
              backgroundColor: C.bg,
            },
            gestureEnabled: true,
            animation: 'slide_from_right',
            animationDuration: 320,
          }}
        >
          {/* Home — custom UI, no default header */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          {/* CinnDry — uses its own nested tab navigator with custom header logic */}
          <Stack.Screen
            name="CinnDry"
            component={CinnDryNavigator}
            options={{ headerShown: false }}
          />

          {/* Placeholder / Coming-soon screens */}
          <Stack.Screen
            name="CinnOracle"
            component={CinnOracle}
            options={{
              title: 'CinnOracle',
              headerBackTitle: 'Back',
              headerTitleAlign: 'center',
            }}
          />

          <Stack.Screen
            name="CinnHarvest"
            component={CinnHarvest}
            options={{
              title: 'CinnHarvest',
              headerBackTitle: 'Back',
              headerTitleAlign: 'center',
            }}
          />

          <Stack.Screen
            name="CinnGuard"
            component={CinnGuard}
            options={{
              title: 'CinnGuard',
              headerBackTitle: 'Back',
              headerTitleAlign: 'center',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}