import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";

import Dashboard from "./src/screens/Dashboard";
import Controls  from "./src/screens/Controls";
import Gallery   from "./src/screens/Gallery";
import History   from "./src/screens/History";
import Insights  from "./src/screens/Insights";
import { RootTabParamList } from "./src/types/react-navigation";
import { C, FONTS } from "./src/components/theme";

const Tab = createBottomTabNavigator<RootTabParamList>();

type TabName = keyof RootTabParamList;

const TAB_ICONS: Record<TabName, { icon: string; label: string }> = {
  Dashboard: { icon: "🏠", label: "Home"     },
  Controls:  { icon: "🎛️", label: "Controls" },
  Gallery:   { icon: "📷", label: "Gallery"  },
  History:   { icon: "📋", label: "Logs"     },
  Insights:  { icon: "📊", label: "Insights" },
};

function TabIcon({ name, focused }: { name: TabName; focused: boolean }) {
  const tab = TAB_ICONS[name];
  return (
    <View style={[styles.tabIconWrap, focused && styles.tabIconActive]}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>{tab.icon}</Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

export default function App() {
  return (
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
          regular: { fontFamily: FONTS.mono, fontWeight: "400" },
          medium: { fontFamily: FONTS.mono, fontWeight: "500" },
          bold: { fontFamily: FONTS.mono, fontWeight: "700" },
          heavy: { fontFamily: FONTS.display, fontWeight: "900" },
        },
      }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name as TabName} focused={focused} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={[styles.tabLabel, { color: focused ? C.spiceLight : C.muted }]}>
              {TAB_ICONS[route.name as TabName].label}
            </Text>
          ),
          tabBarStyle: {
            backgroundColor:  C.surface,
            borderTopColor:   C.border,
            borderTopWidth:   1,
            height:           70,
            paddingBottom:    10,
            paddingTop:       6,
          },
          headerStyle: {
            backgroundColor:   C.surface,
            borderBottomColor: C.border,
            borderBottomWidth: 1,
            elevation:         0,
            shadowOpacity:     0,
          },
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Text style={styles.headerEmoji}>🌿</Text>
              <View>
                <Text style={styles.headerMain}>CinnamonDry</Text>
                <Text style={styles.headerSub}>Smart Bark Dryer</Text>
              </View>
            </View>
          ),
          headerRight: () => (
            <Text style={styles.headerRight}>v1.0</Text>
          ),
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

const styles = StyleSheet.create({
  tabIconWrap:   { alignItems: "center", justifyContent: "center", paddingTop: 4 },
  tabIconActive: { opacity: 1 },
  tabEmoji:      { fontSize: 20 },
  tabDot:        { width: 4, height: 4, borderRadius: 2, backgroundColor: C.spice, marginTop: 3 },
  tabLabel:      { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 0.5 },
  headerTitle:   { flexDirection: "row", alignItems: "center", gap: 10 },
  headerEmoji:   { fontSize: 26 },
  headerMain:    { color: C.cream, fontSize: 17, fontFamily: FONTS.display, fontWeight: "700" },
  headerSub:     { color: C.muted, fontSize: 10, fontFamily: FONTS.mono, letterSpacing: 1 },
  headerRight:   { color: C.muted, fontSize: 10, fontFamily: FONTS.mono, marginRight: 16 },
});
