import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl
} from "react-native";
import { SensorData } from "../types/react-navigation";
import { getSensorData } from "../services/api";

// ---- Theme ----
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

function GaugeCard({ label, value, unit, color }: {
  label: string; value: number; color: string; unit: string;
}) {
  return (
    <View style={[styles.gaugeCard, { flex: 1 }]}>
      <Text style={[styles.gaugeValue, { color }]}>{value}</Text>
      <Text style={styles.gaugeUnit}>{unit}</Text>
      <Text style={styles.gaugeLabel}>{label}</Text>
    </View>
  );
}

function StatusRow({ label, value, isOn }: {
  label: string; value: string; isOn: boolean;
}) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={styles.statusRight}>
        <View style={[styles.dot, { backgroundColor: isOn ? C.green : C.red,
          shadowColor: isOn ? C.green : C.red }]} />
        <Text style={[styles.statusValue, { color: isOn ? C.green : C.red }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ProgressBar({ elapsed, remaining }: { elapsed: number; remaining: number }) {
  const total = elapsed + remaining;
  const pct   = total > 0 ? (elapsed / total) * 100 : 0;
  const hours = Math.floor(remaining / 60);
  const mins  = remaining % 60;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>DRYING PROGRESS</Text>
        <Text style={styles.progressRemaining}>{hours}h {mins}m left</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
      </View>
      <View style={styles.progressFooter}>
        <Text style={styles.progressSub}>{elapsed} min elapsed</Text>
        <Text style={styles.progressSub}>{Math.round(pct)}%</Text>
      </View>
    </View>
  );
}

export default function Dashboard() {
  const [data, setData]           = useState<SensorData | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const result = await getSensorData();
    setData(result.data);
    setConnected(result.connected);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.amber} size="large" />
        <Text style={styles.loadingText}>Connecting to Pi...</Text>
      </View>
    );
  }

  if (!data) return null;
  const isDry = data.ml_result === "dry";

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.amber} />}
    >
      {/* Connection Badge */}
      <View style={styles.badge}>
        <View style={[styles.dot, { backgroundColor: connected ? C.green : C.amber,
          shadowColor: connected ? C.green : C.amber }]} />
        <Text style={styles.badgeText}>{connected ? "LIVE" : "DEMO MODE"}</Text>
      </View>

      {/* Gauges */}
      <View style={styles.card}>
        <View style={styles.row}>
          <GaugeCard label="TEMPERATURE" value={data.temp}     unit="°C" color={C.red}  />
          <View style={styles.divider} />
          <GaugeCard label="HUMIDITY"    value={data.humidity} unit="%"  color={C.blue} />
        </View>
      </View>

      {/* Progress */}
      <View style={styles.card}>
        <ProgressBar elapsed={data.elapsed} remaining={data.remaining} />

        {/* ML Result */}
        <View style={[styles.mlBox, { borderColor: isDry ? C.green : C.muted,
          backgroundColor: isDry ? "#052e16" : "#1c1917" }]}>
          <View>
            <Text style={styles.mlLabel}>ML ANALYSIS</Text>
            <Text style={[styles.mlResult, { color: isDry ? C.green : C.amber }]}>
              {isDry ? "BARK IS DRY ✓" : "NOT DRY YET"}
            </Text>
          </View>
          <Text style={styles.mlConf}>{data.ml_confidence}%</Text>
        </View>
      </View>

      {/* Device Status */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>DEVICE STATUS</Text>
        <StatusRow label="Heater"       value={data.heater} isOn={data.heater === "ON"} />
        <StatusRow label="Fan"          value={data.fan}    isOn={data.fan    === "ON"} />
        <StatusRow label="Camera"       value="ACTIVE"      isOn={true} />
        <StatusRow label="DHT22 Sensor" value="READING"     isOn={true} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:             { flex: 1, backgroundColor: C.bg, padding: 16 },
  center:             { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" },
  loadingText:        { color: C.muted, marginTop: 12, fontFamily: "monospace" },
  badge:              { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 6 },
  badgeText:          { color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  card:               { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  row:                { flexDirection: "row", alignItems: "center" },
  divider:            { width: 1, height: 60, backgroundColor: C.border, marginHorizontal: 8 },
  gaugeCard:          { alignItems: "center", paddingVertical: 8 },
  gaugeValue:         { fontSize: 36, fontWeight: "700", fontFamily: "monospace" },
  gaugeUnit:          { color: C.muted, fontSize: 12, fontFamily: "monospace" },
  gaugeLabel:         { color: C.text, fontSize: 10, letterSpacing: 2, marginTop: 4, fontFamily: "monospace" },
  progressContainer:  { marginBottom: 16 },
  progressHeader:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel:      { color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  progressRemaining:  { color: C.amber, fontSize: 11, fontFamily: "monospace" },
  progressTrack:      { backgroundColor: C.border, borderRadius: 99, height: 8, overflow: "hidden" },
  progressFill:       { height: "100%", backgroundColor: C.amber, borderRadius: 99 },
  progressFooter:     { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  progressSub:        { color: C.muted, fontSize: 10, fontFamily: "monospace" },
  mlBox:              { borderWidth: 1, borderRadius: 10, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mlLabel:            { color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  mlResult:           { fontSize: 16, fontWeight: "700", marginTop: 2, fontFamily: "monospace" },
  mlConf:             { color: C.text, fontSize: 22, fontWeight: "700", fontFamily: "monospace" },
  sectionTitle:       { color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 12, fontFamily: "monospace" },
  statusRow:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, marginBottom: 10 },
  statusLabel:        { color: C.text, fontSize: 13, fontFamily: "monospace" },
  statusRight:        { flexDirection: "row", alignItems: "center", gap: 8 },
  statusValue:        { fontSize: 13, fontWeight: "700", fontFamily: "monospace" },
  dot:                { width: 8, height: 8, borderRadius: 4, shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 },
});
