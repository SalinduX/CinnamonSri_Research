import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { getSensorData } from "../services/api";
import { SensorData } from "../types/react-navigation";

const C = {
  bg:      "#020817", surface: "#0f172a", border: "#1e293b",
  muted:   "#64748b", text:    "#94a3b8", white:  "#ffffff",
  amber:   "#f59e0b", green:   "#22c55e", red:    "#ef4444", blue: "#38bdf8",
};

function InsightCard({ title, value, desc, color }: {
  title: string; value: string; desc: string; color: string;
}) {
  return (
    <View style={[styles.insightCard, { borderLeftColor: color }]}>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={[styles.insightValue, { color }]}>{value}</Text>
      <Text style={styles.insightDesc}>{desc}</Text>
    </View>
  );
}

function MiniBar({ label, value, max, color, unit }: {
  label: string; value: number; max: number; color: string; unit: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={styles.miniBarRow}>
      <Text style={styles.miniBarLabel}>{label}</Text>
      <View style={styles.miniBarTrack}>
        <View style={[styles.miniBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.miniBarVal, { color }]}>{value}{unit}</Text>
    </View>
  );
}

export default function Insights() {
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.amber} size="large" />
        <Text style={styles.loadingText}>Loading insights...</Text>
      </View>
    );
  }

  // ---- Calculated from real data ----
  const dryingRate = data
    ? ((data.temp / 45) * (50 / Math.max(data.humidity, 1))).toFixed(2)
    : "0";

  const progressPct = data
    ? Math.round((data.elapsed / (data.elapsed + data.remaining)) * 100)
    : 0;

  const tempStatus = data
    ? data.temp < 40 ? "Too low - heater should be ON"
    : data.temp > 55 ? "Too high - heater OFF"
    : "Optimal range"
    : "--";

  const humStatus = data
    ? data.humidity > 70 ? "Very high - slow drying"
    : data.humidity > 55 ? "Normal"
    : "Low - fast drying"
    : "--";

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={C.amber} />}
    >
      {/* Current session stats */}
      {data && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>CURRENT SESSION</Text>
            <View style={styles.row}>
              <InsightCard
                title="Drying Rate"
                value={dryingRate + "x"}
                desc="Relative speed vs baseline (1.0x)"
                color={C.amber}
              />
              <InsightCard
                title="Progress"
                value={progressPct + "%"}
                desc={data.elapsed + " min of " + Math.round(data.elapsed + data.remaining) + " min"}
                color={C.blue}
              />
            </View>
            <View style={[styles.row, { marginTop: 0 }]}>
              <InsightCard
                title="Photos Taken"
                value={data.photo_count.toString()}
                desc="Every 15 min, ML checks dryness"
                color={C.green}
              />
              <InsightCard
                title="Last ML Result"
                value={data.ml_result === "unknown" ? "PENDING" : data.ml_result === "dry" ? "DRY ✓" : "NOT DRY"}
                desc={data.ml_result !== "unknown" ? data.ml_confidence + "% confidence" : "Waiting for next photo"}
                color={data.ml_result === "dry" ? C.green : C.amber}
              />
            </View>
          </View>

          {/* Condition gauges */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>CURRENT CONDITIONS</Text>
            <MiniBar label="Temp"     value={data.temp}     max={80}  color={C.red}  unit="°C" />
            <MiniBar label="Humidity" value={data.humidity} max={100} color={C.blue} unit="%"  />
            <MiniBar label="Progress" value={progressPct}   max={100} color={C.amber} unit="%" />

            <View style={styles.statusNote}>
              <Text style={styles.statusNoteLabel}>Temp status:</Text>
              <Text style={styles.statusNoteValue}>{tempStatus}</Text>
            </View>
            <View style={styles.statusNote}>
              <Text style={styles.statusNoteLabel}>Humidity status:</Text>
              <Text style={styles.statusNoteValue}>{humStatus}</Text>
            </View>
          </View>
        </>
      )}

      {/* Drying tips */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>DRYING TIPS</Text>
        {[
          { icon: "🌡️", tip: "Keep temperature between 40–55°C for optimal drying" },
          { icon: "💧", tip: "Humidity below 50% speeds up drying significantly"    },
          { icon: "💨", tip: "Good airflow from fan reduces drying time by ~30%"    },
          { icon: "📷", tip: "ML checks bark dryness every 15 minutes automatically" },
          { icon: "⚡", tip: "Heater cuts off at 55°C as a safety measure"           },
        ].map((item, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipIcon}>{item.icon}</Text>
            <Text style={styles.tipText}>{item.tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:           { flex: 1, backgroundColor: C.bg, padding: 16 },
  center:           { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" },
  loadingText:      { color: C.muted, marginTop: 12, fontFamily: "monospace" },
  card:             { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle:     { color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 14, fontFamily: "monospace" },
  row:              { flexDirection: "row", gap: 10, marginBottom: 10 },
  insightCard:      { flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderRadius: 10, padding: 12 },
  insightTitle:     { color: C.muted, fontSize: 9, letterSpacing: 2, fontFamily: "monospace" },
  insightValue:     { fontSize: 20, fontWeight: "700", marginVertical: 4, fontFamily: "monospace" },
  insightDesc:      { color: C.muted, fontSize: 9, fontFamily: "monospace" },
  miniBarRow:       { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  miniBarLabel:     { color: C.muted, fontSize: 10, width: 70, fontFamily: "monospace" },
  miniBarTrack:     { flex: 1, backgroundColor: C.border, borderRadius: 99, height: 6, overflow: "hidden" },
  miniBarFill:      { height: "100%", borderRadius: 99 },
  miniBarVal:       { fontSize: 11, fontWeight: "700", width: 40, textAlign: "right", fontFamily: "monospace" },
  statusNote:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: C.border },
  statusNoteLabel:  { color: C.muted, fontSize: 11, fontFamily: "monospace" },
  statusNoteValue:  { color: C.text, fontSize: 11, fontFamily: "monospace" },
  tipRow:           { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  tipIcon:          { fontSize: 16 },
  tipText:          { color: C.text, fontSize: 12, flex: 1, lineHeight: 18, fontFamily: "monospace" },
});
