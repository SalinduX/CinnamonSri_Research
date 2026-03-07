import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import Dashboard from "./src/screens/Dashboard";
import Controls  from "./src/screens/Controls";
import Gallery   from "./src/screens/Gallery";
import History   from "./src/screens/History";
import Insights  from "./src/screens/Insights";
import { RootTabParamList } from "./src/types/react-navigation";

const Tab = createBottomTabNavigator<RootTabParamList>();

const C = {
  bg: "#020817", surface: "#0f172a", border: "#1e293b",
  muted: "#64748b", amber: "#f59e0b",
};

const ICONS: Record<string, string> = {
  Dashboard: "⬛",
  Controls:  "🎛️",
  Gallery:   "📷",
  History:   "📋",
  Insights:  "📊",
};

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>
              {ICONS[route.name]}
            </Text>
          ),
          tabBarActiveTintColor:   C.amber,
          tabBarInactiveTintColor: C.muted,
          tabBarStyle: {
            backgroundColor: C.surface,
            borderTopColor:  C.border,
            borderTopWidth:  1,
            height:          60,
            paddingBottom:   8,
          },
          tabBarLabelStyle:  { fontSize: 9, letterSpacing: 1, fontFamily: "monospace" },
          headerStyle:       { backgroundColor: C.surface, borderBottomColor: C.border, borderBottomWidth: 1 },
          headerTitleStyle:  { color: C.amber, fontFamily: "monospace", fontSize: 14, letterSpacing: 2 },
          headerTitle:       "CINNAMON DRY",
        })}
      >
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Controls"  component={Controls}  />
        <Tab.Screen name="Gallery"   component={Gallery}   />
        <Tab.Screen name="History"   component={History}   />
        <Tab.Screen name="Insights"  component={Insights}  />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
