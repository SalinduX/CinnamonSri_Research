import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import { CinnDryTabParamList } from "../../types/index";
import { C, FONTS } from "../../components/theme";
import Dashboard from "./Dashboard";
import Controls  from "./Controls";
import Gallery   from "./Gallery";
import History   from "./History";
import Insights  from "./Insights";

const Tab = createBottomTabNavigator<CinnDryTabParamList>();

type TabName = keyof CinnDryTabParamList;

const TAB_META: Record<TabName, { icon: string; label: string }> = {
  Dashboard: { icon: "🏠", label: "Home"     },
  Controls:  { icon: "🎛️", label: "Controls" },
  Gallery:   { icon: "📷", label: "Gallery"  },
  History:   { icon: "📋", label: "Logs"     },
  Insights:  { icon: "📊", label: "Insights" },
};

function TabIcon({ name, focused }: { name: TabName; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconActive]}>
      <Text style={[styles.emoji, { opacity: focused ? 1 : 0.45 }]}>
        {TAB_META[name].icon}
      </Text>
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function CinnDryNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name as TabName} focused={focused} />
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.label, { color: focused ? C.spiceLight : C.muted }]}>
            {TAB_META[route.name as TabName].label}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor:  C.border,
          borderTopWidth:  1,
          height:          68,
          paddingBottom:   10,
          paddingTop:      6,
        },
        headerStyle: {
          backgroundColor:   C.surface,
          borderBottomColor: C.border,
          borderBottomWidth: 1,
          elevation: 0, shadowOpacity: 0,
        },
        headerTitle: () => (
          <View style={styles.headerTitle}>
            <Text style={styles.headerEmoji}>🌿</Text>
            <View>
              <Text style={styles.headerMain}>CinnDry</Text>
              <Text style={styles.headerSub}>Bark Drying Monitor</Text>
            </View>
          </View>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Controls"  component={Controls}  />
      <Tab.Screen name="Gallery"   component={Gallery}   />
      <Tab.Screen name="History"   component={History}   />
      <Tab.Screen name="Insights"  component={Insights}  />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap:    { alignItems: "center", justifyContent: "center", paddingTop: 4 },
  iconActive:  {},
  emoji:       { fontSize: 20 },
  dot:         { width: 4, height: 4, borderRadius: 2, backgroundColor: C.spice, marginTop: 3 },
  label:       { fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 0.5 },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerEmoji: { fontSize: 24 },
  headerMain:  { color: C.cream, fontSize: 16, fontFamily: FONTS.display, fontWeight: "700" },
  headerSub:   { color: C.muted, fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1 },
});
