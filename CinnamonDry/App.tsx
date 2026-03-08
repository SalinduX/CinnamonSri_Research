import React from "react";
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "./src/types/index";
import { C } from "./src/components/theme";

import HomeScreen      from "./src/screens/HomeScreen";
import CinnDryNavigator from "./src/screens/CinnDry/index";
import CinnOracle      from "./src/screens/CinnOracle/index";
import CinnHarvest     from "./src/screens/CinnHarvest/index";
import CinnGuard       from "./src/screens/CinnGuard/index";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary:      C.spice,
            background:   C.bg,
            card:         C.surface,
            text:         C.cream,
            border:       C.border,
            notification: C.spice,
          },
          fonts: {
            regular: {
              fontFamily: "System",
              fontWeight: "400",
            },
            medium: {
              fontFamily: "System",
              fontWeight: "500",
            },
            heavy: {
              fontFamily: "System",
              fontWeight: "700",
            },
            bold: {
              fontFamily: "",
              fontWeight: "bold"
            }
          },
        }}
      >
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: C.surface,
            },
            headerTintColor:      C.spiceLight,
            headerTitleStyle: {
              color:      C.cream,
              fontFamily: "Georgia",
              fontWeight: "700",
            },
            headerBackTitleVisible: false,
            contentStyle: { backgroundColor: C.bg },
            animation: "slide_from_right",
          }}
        >
          {/* Home — hide header, it has its own header area */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          {/* CinnDry — has its own tab navigator with header */}
          <Stack.Screen
            name="CinnDry"
            component={CinnDryNavigator}
            options={{ headerShown: false }}
          />

          {/* CinnOracle */}
          <Stack.Screen
            name="CinnOracle"
            component={CinnOracle}
            options={{
              title: "CinnOracle",
              headerBackTitle: "Home",
            }}
          />

          {/* CinnHarvest */}
          <Stack.Screen
            name="CinnHarvest"
            component={CinnHarvest}
            options={{
              title: "CinnHarvest",
              headerBackTitle: "Home",
            }}
          />

          {/* CinnGuard */}
          <Stack.Screen
            name="CinnGuard"
            component={CinnGuard}
            options={{
              title: "CinnGuard",
              headerBackTitle: "Home",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
