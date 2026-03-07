import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { getSensorData, getSessions } from "../services/api";
import { SensorData, DryingSession } from "../types/react-navigation";

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

function MiniBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={styles.miniBarRow}>
      <Text style={styles.miniBarLabel}>{label}</Text>
      <View style={styles.miniBarTrack}>
        <View style={[styles.miniBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[styles.miniBarVal, { color }]}>{value}</Text>
    </View>
  );
}

export default function Insights() {
  const [data, setData]           = useState<SensorData | null>(null);
  const [sessions, setSessions]   = useState<DryingSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    const [sensorResult, sessionResult] = await Promise.all([
      getSensorData(),
      getSessions(),
    ]);
    setData(sensorResult.data);
    setSessions(sessionResult);
    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const total      = sessions.length;
  const dried      = sessions.filter(s => s.result === "dry").length;
  const successRate = total > 0 ? Math.round((dried / total) * 100) : 0;
  const avgTemp    = total > 0
    ? (sessions.reduce((s, x) => s + x.avgTemp, 0) / total).toFixed(1)
    : "--";
  const avgHum     = total > 0
    ? (sessions.reduce((s, x) => s + x.avgHumidity, 0) / total).toFixed(1)
    : "--";
  const avgDuration = total > 0
    ? Math.round(sessions.reduce((s, x) => s + x.duration, 0) / total)
    : 0;

  const dryingRate = data
    ? ((data.temp / 45) * (50 / Math.max(data.humidity, 1))).toFixed(2)
    : "--";

  const estimatedRemaining = data
    ? Math.max(0, Math.round(360 / parseFloat(dryingRate || "1") - (data.elapsed || 0)))
    : 0;

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor={C.amber} />}
    >
      {/* Current Session */}
      {data && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CURRENT SESSION</Text>
          <View style={styles.row}>
            <InsightCard title="Drying Rate"  value={dryingRate + "x"} desc="Relative speed vs baseline" color={C.amber} />
            <InsightCard title="Est. Remaining" value={estimatedRemaining + "m"} desc="Based on current conditions" color={C.blue} />
          </View>
        </View>
      )}

      {/* Historical Insights */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>HISTORICAL INSIGHTS</Text>
        <View style={styles.row}>
          <InsightCard title="Success Rate" value={successRate + "%"} desc="Sessions dried successfully" color={C.green} />
          <InsightCard title="Avg Duration" value={avgDuration + "m"}  desc="Average session duration"   color={C.amber} />
        </View>
        <View style={[styles.row, { marginTop: 0 }]}>
          <InsightCard title="Avg Temp"     value={avgTemp + "°C"} desc="Across all sessions" color={C.red}  />
          <InsightCard title="Avg Humidity" value={avgHum + "%"}   desc="Across all sessions" color={C.blue} />
        </View>
      </View>

      {/* Conditions Chart */}
      {sessions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>SESSION TEMPERATURES</Text>
          {sessions.map(s => (
            <MiniBar
              key={s.id}
              label={s.startTime.split(" ")[0]}
              value={Math.round(s.avgTemp)}
              max={80}
              color={s.result === "dry" ? C.green : C.amber}
            />
          ))}
        </View>
      )}

      {/* Tips */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>DRYING TIPS</Text>
        {[
          { icon: "🌡️", tip: "Keep temperature between 40–55°C for best results" },
          { icon: "💧", tip: "Humidity below 50% speeds up drying significantly" },
          { icon: "💨", tip: "Good airflow reduces drying time by up to 30%" },
          { icon: "📷", tip: "ML model checks bark condition every 15 minutes" },
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
  scroll:        { flex: 1, backgroundColor: C.bg, padding: 16 },
  card:          { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle:  { color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 14, fontFamily: "monospace" },
  row:           { flexDirection: "row", gap: 10, marginBottom: 10 },
  insightCard:   { flex: 1, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderRadius: 10, padding: 12 },
  insightTitle:  { color: C.muted, fontSize: 9, letterSpacing: 2, fontFamily: "monospace" },
  insightValue:  { fontSize: 22, fontWeight: "700", marginVertical: 4, fontFamily: "monospace" },
  insightDesc:   { color: C.muted, fontSize: 9, fontFamily: "monospace" },
  miniBarRow:    { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  miniBarLabel:  { color: C.muted, fontSize: 10, width: 80, fontFamily: "monospace" },
  miniBarTrack:  { flex: 1, backgroundColor: C.border, borderRadius: 99, height: 6, overflow: "hidden" },
  miniBarFill:   { height: "100%", borderRadius: 99 },
  miniBarVal:    { fontSize: 11, fontWeight: "700", width: 36, textAlign: "right", fontFamily: "monospace" },
  tipRow:        { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  tipIcon:       { fontSize: 16 },
  tipText:       { color: C.text, fontSize: 12, flex: 1, lineHeight: 18, fontFamily: "monospace" },
});
