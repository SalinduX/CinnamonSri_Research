import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, TouchableOpacity
} from "react-native";
import { getSensorData } from "../services/api";
import { SensorData } from "../types/react-navigation";

const C = {
  bg:      "#020817", surface: "#0f172a", border: "#1e293b",
  muted:   "#64748b", text:    "#94a3b8", white:  "#ffffff",
  amber:   "#f59e0b", green:   "#22c55e", red:    "#ef4444", blue: "#38bdf8",
};

function GaugeCard({ label, value, unit, color, max }: {
  label: string; value: number; unit: string; color: string; max: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={[styles.gaugeCard, { flex: 1 }]}>
      <Text style={[styles.gaugeValue, { color }]}>{value}</Text>
      <Text style={styles.gaugeUnit}>{unit}</Text>
      <View style={styles.gaugeMini}>
        <View style={[styles.gaugeFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.gaugeLabel}>{label}</Text>
    </View>
  );
}

function StatusRow({ label, value, isOn }: { label: string; value: string; isOn: boolean }) {
  const color = isOn ? C.green : C.red;
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <View style={styles.statusRight}>
        <View style={[styles.dot, { backgroundColor: color, shadowColor: color }]} />
        <Text style={[styles.statusValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

function ProgressBar({ elapsed, remaining, remainingStr }: {
  elapsed: number; remaining: number; remainingStr: string;
}) {
  const total = elapsed + remaining;
  const pct   = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>DRYING PROGRESS</Text>
        <Text style={styles.progressTime}>{remainingStr} left</Text>
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
  const [data, setData]             = useState<SensorData | null>(null);
  const [connected, setConnected]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const result = await getSensorData();
    if (result.data) {
      setData(result.data);
      setError(null);
    } else {
      setError("Cannot reach Pi. Check IP in api.ts");
    }
    setConnected(result.connected);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.amber} size="large" />
        <Text style={styles.loadingText}>Connecting to Raspberry Pi...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Pi Not Reachable</Text>
        <Text style={styles.errorSub}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); fetchData(); }}>
          <Text style={styles.retryText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isDry = data.ml_result === "dry";

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.amber} />}
    >
      {/* Connection + Last updated */}
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <View style={[styles.dot, {
            backgroundColor: connected ? C.green : C.red,
            shadowColor:     connected ? C.green : C.red,
          }]} />
          <Text style={styles.badgeText}>{connected ? "LIVE" : "OFFLINE"}</Text>
        </View>
        <Text style={styles.lastUpdated}>Updated {data.last_updated?.slice(11, 19)}</Text>
      </View>

      {/* Temp + Humidity Gauges */}
      <View style={styles.card}>
        <View style={styles.row}>
          <GaugeCard label="TEMPERATURE" value={data.temp}     unit="°C" color={C.red}  max={80}  />
          <View style={styles.divider} />
          <GaugeCard label="HUMIDITY"    value={data.humidity} unit="%"  color={C.blue} max={100} />
        </View>
      </View>

      {/* Drying Progress */}
      <View style={styles.card}>
        <ProgressBar
          elapsed={data.elapsed}
          remaining={data.remaining}
          remainingStr={data.remaining_str}
        />

        {/* ML Result */}
        <View style={[styles.mlBox, {
          borderColor:     isDry ? C.green : C.muted,
          backgroundColor: isDry ? "#052e16" : "#1c1917",
        }]}>
          <View>
            <Text style={styles.mlLabel}>ML ANALYSIS  •  {data.photo_count} photos taken</Text>
            <Text style={[styles.mlResult, { color: isDry ? C.green : C.amber }]}>
              {data.ml_result === "unknown" ? "WAITING FOR PHOTO..." :
               isDry ? "BARK IS DRY ✓" : "NOT DRY YET"}
            </Text>
          </View>
          {data.ml_result !== "unknown" && (
            <Text style={[styles.mlConf, { color: isDry ? C.green : C.amber }]}>
              {data.ml_confidence}%
            </Text>
          )}
        </View>
      </View>

      {/* Drying Status */}
      <View style={styles.card}>
        <View style={styles.statusBanner}>
          <Text style={styles.statusBannerLabel}>DRYING STATUS</Text>
          <Text style={[styles.statusBannerValue, {
            color: data.status === "COMPLETE" ? C.green : C.amber
          }]}>
            {data.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.startedText}>Started: {data.drying_start}</Text>
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
  scroll:              { flex: 1, backgroundColor: C.bg, padding: 16 },
  center:              { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText:         { color: C.muted, marginTop: 12, fontFamily: "monospace" },
  errorIcon:           { fontSize: 48, marginBottom: 12 },
  errorText:           { color: C.red, fontSize: 18, fontWeight: "700", fontFamily: "monospace" },
  errorSub:            { color: C.muted, fontSize: 11, marginTop: 6, textAlign: "center", fontFamily: "monospace" },
  retryBtn:            { marginTop: 20, backgroundColor: C.amber, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText:           { color: C.bg, fontWeight: "700", letterSpacing: 2, fontFamily: "monospace" },
  topRow:              { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  badge:               { flexDirection: "row", alignItems: "center", gap: 6 },
  badgeText:           { color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  lastUpdated:         { color: C.muted, fontSize: 10, fontFamily: "monospace" },
  card:                { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  row:                 { flexDirection: "row", alignItems: "center" },
  divider:             { width: 1, height: 60, backgroundColor: C.border, marginHorizontal: 8 },
  gaugeCard:           { alignItems: "center", paddingVertical: 8 },
  gaugeValue:          { fontSize: 36, fontWeight: "700", fontFamily: "monospace" },
  gaugeUnit:           { color: C.muted, fontSize: 12, fontFamily: "monospace" },
  gaugeMini:           { width: "80%", height: 4, backgroundColor: C.border, borderRadius: 99, marginTop: 6, overflow: "hidden" },
  gaugeFill:           { height: "100%", borderRadius: 99 },
  gaugeLabel:          { color: C.text, fontSize: 10, letterSpacing: 2, marginTop: 6, fontFamily: "monospace" },
  progressWrap:        { marginBottom: 16 },
  progressHeader:      { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel:       { color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  progressTime:        { color: C.amber, fontSize: 11, fontFamily: "monospace" },
  progressTrack:       { backgroundColor: C.border, borderRadius: 99, height: 8, overflow: "hidden" },
  progressFill:        { height: "100%", backgroundColor: C.amber, borderRadius: 99 },
  progressFooter:      { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  progressSub:         { color: C.muted, fontSize: 10, fontFamily: "monospace" },
  mlBox:               { borderWidth: 1, borderRadius: 10, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mlLabel:             { color: C.muted, fontSize: 10, letterSpacing: 1, fontFamily: "monospace" },
  mlResult:            { fontSize: 16, fontWeight: "700", marginTop: 2, fontFamily: "monospace" },
  mlConf:              { fontSize: 22, fontWeight: "700", fontFamily: "monospace" },
  statusBanner:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBannerLabel:   { color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  statusBannerValue:   { fontSize: 16, fontWeight: "700", fontFamily: "monospace" },
  startedText:         { color: C.muted, fontSize: 10, marginTop: 6, fontFamily: "monospace" },
  sectionTitle:        { color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 12, fontFamily: "monospace" },
  statusRow:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, marginBottom: 10 },
  statusLabel:         { color: C.text, fontSize: 13, fontFamily: "monospace" },
  statusRight:         { flexDirection: "row", alignItems: "center", gap: 8 },
  statusValue:         { fontSize: 13, fontWeight: "700", fontFamily: "monospace" },
  dot:                 { width: 8, height: 8, borderRadius: 4, shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 },
});
