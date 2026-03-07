import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { getSensorData } from "../services/api";
import { SensorData } from "../types/react-navigation";

const C = {
  bg:      "#020817", surface: "#0f172a", border: "#1e293b",
  muted:   "#64748b", text:    "#94a3b8", white:  "#ffffff",
  amber:   "#f59e0b", green:   "#22c55e", red:    "#ef4444", blue: "#38bdf8",
};

const THRESHOLDS = [
  { label: "Heater ON below",  value: "40°C",    desc: "Heater activates when temp drops below this" },
  { label: "Heater OFF above", value: "55°C",    desc: "Safety cutoff - heater shuts off"            },
  { label: "Fan",              value: "Always",  desc: "Fan runs continuously at all times"           },
  { label: "Base drying time", value: "360 min", desc: "Expected duration under ideal conditions"     },
  { label: "Photo interval",   value: "15 min",  desc: "Camera captures every 15 minutes"            },
  { label: "ML threshold",     value: "70%",     desc: "Min confidence to declare bark dry"           },
];

export default function Controls() {
  const [data, setData]             = useState<SensorData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);

  const fetchData = useCallback(async () => {
    const result = await getSensorData();
    if (result.data) setData(result.data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.amber} />}
    >
      {/* Live status from real Pi */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>LIVE READINGS FROM PI</Text>
        {loading || !data ? (
          <ActivityIndicator color={C.amber} />
        ) : (
          <View style={styles.liveGrid}>
            {[
              { label: "Temp",     value: data.temp + "°C",          color: C.red   },
              { label: "Humidity", value: data.humidity + "%",        color: C.blue  },
              { label: "Heater",   value: data.heater,                color: data.heater === "ON" ? C.amber : C.muted },
              { label: "Fan",      value: data.fan,                   color: C.green },
              { label: "Photos",   value: data.photo_count + " taken",color: C.text  },
              { label: "Status",   value: data.status,                color: data.status === "COMPLETE" ? C.green : C.amber },
            ].map((item, i) => (
              <View key={i} style={styles.liveBox}>
                <Text style={[styles.liveVal, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.liveLbl}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Thresholds */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>CONTROL THRESHOLDS</Text>
        {THRESHOLDS.map((t, i) => (
          <View key={i} style={styles.threshRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.threshLabel}>{t.label}</Text>
              <Text style={styles.threshDesc}>{t.desc}</Text>
            </View>
            <Text style={styles.threshValue}>{t.value}</Text>
          </View>
        ))}
      </View>

      {/* Control Logic */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>CONTROL LOGIC</Text>
        <View style={styles.logicBox}>
          <Text style={styles.logicTitle}>🔥  Heater Logic</Text>
          <Text style={styles.logicLine}>ON  →  temp {"<"} 40°C</Text>
          <Text style={styles.logicLine}>OFF →  temp {">"} 55°C</Text>
        </View>
        <View style={[styles.logicBox, { borderColor: C.blue }]}>
          <Text style={styles.logicTitle}>💨  Fan Logic</Text>
          <Text style={styles.logicLine}>Always ON while system is running</Text>
          <Text style={styles.logicLine}>OFF only on system shutdown</Text>
        </View>
        <View style={[styles.logicBox, { borderColor: C.green }]}>
          <Text style={styles.logicTitle}>📷  Camera Logic</Text>
          <Text style={styles.logicLine}>Photo taken every 15 minutes</Text>
          <Text style={styles.logicLine}>ML model classifies: dry / not_dry</Text>
          <Text style={styles.logicLine}>Confident dry at {">"} 70% confidence</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: C.bg, padding: 16 },
  card:         { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 14, fontFamily: "monospace" },
  liveGrid:     { flexDirection: "row", flexWrap: "wrap" },
  liveBox:      { width: "33%", alignItems: "center", paddingVertical: 10 },
  liveVal:      { fontSize: 16, fontWeight: "700", fontFamily: "monospace" },
  liveLbl:      { color: C.muted, fontSize: 9, letterSpacing: 1, marginTop: 4, fontFamily: "monospace" },
  threshRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  threshLabel:  { color: C.text, fontSize: 13, fontFamily: "monospace" },
  threshDesc:   { color: C.muted, fontSize: 10, marginTop: 2, fontFamily: "monospace" },
  threshValue:  { color: C.amber, fontSize: 13, fontWeight: "700", fontFamily: "monospace" },
  logicBox:     { borderWidth: 1, borderColor: C.amber, borderRadius: 10, padding: 14, marginBottom: 10 },
  logicTitle:   { color: C.white, fontSize: 13, fontWeight: "700", marginBottom: 8, fontFamily: "monospace" },
  logicLine:    { color: C.text, fontSize: 12, lineHeight: 22, fontFamily: "monospace" },
});
