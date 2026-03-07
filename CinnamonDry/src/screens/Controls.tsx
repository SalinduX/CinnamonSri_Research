import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl
} from "react-native";
import { getSensorData } from "../services/api";
import { SensorData } from "../types/react-navigation";

const C = {
  bg:      "#020817",
  surface: "#0f172a",
  border:  "#1e293b",
  muted:   "#64748b",
  text:    "#94a3b8",
  white:   "#ffffff",
  amber:   "#f59e0b",
  green:   "#22c55e",
  red:     "#ef4444",
  blue:    "#38bdf8",
};

const THRESHOLDS = [
  { label: "Heater ON below",  value: "40°C",    desc: "Heater activates when temp drops below this" },
  { label: "Heater OFF above", value: "55°C",    desc: "Heater shuts off when temp exceeds this"     },
  { label: "Fan",              value: "Always",  desc: "Fan runs continuously at all times"           },
  { label: "Base drying time", value: "360 min", desc: "Expected duration under ideal conditions"     },
  { label: "ML threshold",     value: "70%",     desc: "Minimum confidence to declare bark dry"       },
  { label: "Photo interval",   value: "15 min",  desc: "Camera captures an image every 15 minutes"   },
];

function ThresholdRow({ label, value, desc }: {
  label: string; value: string; desc: string;
}) {
  return (
    <View style={styles.threshRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.threshLabel}>{label}</Text>
        <Text style={styles.threshDesc}>{desc}</Text>
      </View>
      <Text style={styles.threshValue}>{value}</Text>
    </View>
  );
}

export default function Controls() {
  const [data, setData]           = useState<SensorData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const result = await getSensorData();
    setData(result.data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.amber} />}
    >
      {/* Live Status */}
      {data && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>LIVE STATUS</Text>
          <View style={styles.liveRow}>
            <View style={styles.liveBox}>
              <Text style={[styles.liveVal, { color: C.red }]}>{data.temp}°C</Text>
              <Text style={styles.liveLbl}>Temperature</Text>
            </View>
            <View style={styles.liveBox}>
              <Text style={[styles.liveVal, { color: C.blue }]}>{data.humidity}%</Text>
              <Text style={styles.liveLbl}>Humidity</Text>
            </View>
            <View style={styles.liveBox}>
              <Text style={[styles.liveVal, {
                color: data.heater === "ON" ? C.amber : C.muted
              }]}>{data.heater}</Text>
              <Text style={styles.liveLbl}>Heater</Text>
            </View>
            <View style={styles.liveBox}>
              <Text style={[styles.liveVal, { color: C.green }]}>{data.fan}</Text>
              <Text style={styles.liveLbl}>Fan</Text>
            </View>
          </View>
        </View>
      )}

      {/* Control Thresholds */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>CONTROL THRESHOLDS</Text>
        {THRESHOLDS.map((t, i) => (
          <ThresholdRow key={i} label={t.label} value={t.value} desc={t.desc} />
        ))}
      </View>

      {/* Control Logic */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>CONTROL LOGIC</Text>
        <View style={styles.logicBox}>
          <Text style={styles.logicTitle}>🔥 Heater</Text>
          <Text style={styles.logicLine}>ON  → temp {"<"} 40°C</Text>
          <Text style={styles.logicLine}>OFF → temp {">"} 55°C</Text>
        </View>
        <View style={[styles.logicBox, { borderColor: C.blue }]}>
          <Text style={styles.logicTitle}>💨 Fan</Text>
          <Text style={styles.logicLine}>Always ON while system is running</Text>
          <Text style={styles.logicLine}>OFF only on system shutdown</Text>
        </View>
      </View>

      {/* Pi Connection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>PI CONNECTION</Text>
        <View style={styles.apiBox}>
          <Text style={styles.apiLabel}>API Endpoint</Text>
          <Text style={styles.apiUrl}>http://YOUR_PI_IP:5000</Text>
        </View>
        <Text style={styles.apiNote}>
          Update API_BASE in src/services/api.ts to your Raspberry Pi IP address.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: C.bg, padding: 16 },
  card:         { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 14, fontFamily: "monospace" },
  liveRow:      { flexDirection: "row", justifyContent: "space-between" },
  liveBox:      { alignItems: "center", flex: 1 },
  liveVal:      { fontSize: 18, fontWeight: "700", fontFamily: "monospace" },
  liveLbl:      { color: C.muted, fontSize: 9, letterSpacing: 1, marginTop: 4, fontFamily: "monospace" },
  threshRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  threshLabel:  { color: C.text, fontSize: 13, fontFamily: "monospace" },
  threshDesc:   { color: C.muted, fontSize: 10, marginTop: 2, fontFamily: "monospace" },
  threshValue:  { color: C.amber, fontSize: 13, fontWeight: "700", fontFamily: "monospace" },
  logicBox:     { borderWidth: 1, borderColor: C.amber, borderRadius: 10, padding: 14, marginBottom: 10 },
  logicTitle:   { color: C.white, fontSize: 13, fontWeight: "700", marginBottom: 8, fontFamily: "monospace" },
  logicLine:    { color: C.text, fontSize: 12, lineHeight: 22, fontFamily: "monospace" },
  apiBox:       { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, marginBottom: 10 },
  apiLabel:     { color: C.muted, fontSize: 10, letterSpacing: 1, marginBottom: 4, fontFamily: "monospace" },
  apiUrl:       { color: C.blue, fontSize: 13, fontFamily: "monospace" },
  apiNote:      { color: C.muted, fontSize: 11, lineHeight: 18, fontFamily: "monospace" },
});
