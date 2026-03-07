import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, RefreshControl
} from "react-native";
import { getSessions } from "../services/api";
import { DryingSession } from "../types/react-navigation";

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

function SessionCard({ session }: { session: DryingSession }) {
  const resultColor =
    session.result === "dry"        ? C.green :
    session.result === "incomplete" ? C.amber : C.red;

  const resultLabel =
    session.result === "dry"        ? "DRIED" :
    session.result === "incomplete" ? "INCOMPLETE" : "FAILED";

  const hours = Math.floor(session.duration / 60);
  const mins  = session.duration % 60;

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <Text style={styles.sessionDate}>{session.startTime.split(" ")[0]}</Text>
        <View style={[styles.resultBadge, { borderColor: resultColor, backgroundColor: resultColor + "22" }]}>
          <Text style={[styles.resultText, { color: resultColor }]}>{resultLabel}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: C.red }]}>{session.avgTemp}°C</Text>
          <Text style={styles.statLbl}>Avg Temp</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: C.blue }]}>{session.avgHumidity}%</Text>
          <Text style={styles.statLbl}>Avg Humidity</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: C.amber }]}>{hours}h {mins}m</Text>
          <Text style={styles.statLbl}>Duration</Text>
        </View>
      </View>

      {/* Time range */}
      <Text style={styles.timeRange}>
        {session.startTime} → {session.endTime}
      </Text>
    </View>
  );
}

function SummaryBar({ sessions }: { sessions: DryingSession[] }) {
  const total      = sessions.length;
  const dried      = sessions.filter(s => s.result === "dry").length;
  const avgDuration = total > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / total)
    : 0;
  const avgTemp = total > 0
    ? (sessions.reduce((sum, s) => sum + s.avgTemp, 0) / total).toFixed(1)
    : "0";

  return (
    <View style={styles.summaryBar}>
      <View style={styles.summaryBox}>
        <Text style={[styles.summaryVal, { color: C.green }]}>{dried}</Text>
        <Text style={styles.summaryLbl}>Dried</Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={[styles.summaryVal, { color: C.amber }]}>{total}</Text>
        <Text style={styles.summaryLbl}>Total</Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={[styles.summaryVal, { color: C.red }]}>{avgTemp}°C</Text>
        <Text style={styles.summaryLbl}>Avg Temp</Text>
      </View>
      <View style={styles.summaryBox}>
        <Text style={[styles.summaryVal, { color: C.blue }]}>{avgDuration}m</Text>
        <Text style={styles.summaryLbl}>Avg Time</Text>
      </View>
    </View>
  );
}

export default function History() {
  const [sessions, setSessions]   = useState<DryingSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSessions = async () => {
    const result = await getSessions();
    setSessions(result);
    setRefreshing(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  return (
    <FlatList
      style={styles.list}
      data={sessions}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSessions(); }} tintColor={C.amber} />}
      ListHeaderComponent={<SummaryBar sessions={sessions} />}
      renderItem={({ item }) => <SessionCard session={item} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No sessions yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list:         { flex: 1, backgroundColor: C.bg },
  summaryBar:   { flexDirection: "row", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 16, justifyContent: "space-around" },
  summaryBox:   { alignItems: "center" },
  summaryVal:   { fontSize: 22, fontWeight: "700", fontFamily: "monospace" },
  summaryLbl:   { color: C.muted, fontSize: 10, letterSpacing: 1, marginTop: 2, fontFamily: "monospace" },
  card:         { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sessionDate:  { color: C.white, fontSize: 15, fontWeight: "700", fontFamily: "monospace" },
  resultBadge:  { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  resultText:   { fontSize: 10, fontWeight: "700", letterSpacing: 2, fontFamily: "monospace" },
  statsRow:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  statBox:      { alignItems: "center", flex: 1 },
  statVal:      { fontSize: 16, fontWeight: "700", fontFamily: "monospace" },
  statLbl:      { color: C.muted, fontSize: 9, letterSpacing: 1, marginTop: 2, fontFamily: "monospace" },
  timeRange:    { color: C.muted, fontSize: 10, fontFamily: "monospace" },
  empty:        { alignItems: "center", marginTop: 80 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { color: C.text, fontSize: 16, fontFamily: "monospace" },
});
