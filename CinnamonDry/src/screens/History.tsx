import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator
} from "react-native";
import { getLogs } from "../services/api";
import { LogEntry } from "../types/react-navigation";

const C = {
  bg:      "#020817", surface: "#0f172a", border: "#1e293b",
  muted:   "#64748b", text:    "#94a3b8", white:  "#ffffff",
  amber:   "#f59e0b", green:   "#22c55e", red:    "#ef4444", blue: "#38bdf8",
};

const LEVEL_COLORS: Record<LogEntry["level"], string> = {
  INFO:    C.text,
  WARNING: C.amber,
  ERROR:   C.red,
  SUCCESS: C.green,
};

function LogRow({ entry }: { entry: LogEntry }) {
  const color = LEVEL_COLORS[entry.level];
  return (
    <View style={[styles.logRow, { borderLeftColor: color }]}>
      <Text style={[styles.logText, { color }]}>{entry.raw}</Text>
    </View>
  );
}

export default function History() {
  const [logs, setLogs]             = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [connected, setConnected]   = useState(false);

  const fetchLogs = useCallback(async () => {
    const result = await getLogs();
    setLogs(result.logs.reverse()); // newest first
    setConnected(result.connected);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const errorCount   = logs.filter(l => l.level === "ERROR").length;
  const successCount = logs.filter(l => l.level === "SUCCESS").length;
  const warnCount    = logs.filter(l => l.level === "WARNING").length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.amber} size="large" />
        <Text style={styles.loadingText}>Loading logs from Pi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryVal, { color: C.text }]}>{logs.length}</Text>
          <Text style={styles.summaryLbl}>Total</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryVal, { color: C.green }]}>{successCount}</Text>
          <Text style={styles.summaryLbl}>Success</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryVal, { color: C.amber }]}>{warnCount}</Text>
          <Text style={styles.summaryLbl}>Warnings</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={[styles.summaryVal, { color: C.red }]}>{errorCount}</Text>
          <Text style={styles.summaryLbl}>Errors</Text>
        </View>
        <View style={styles.summaryBox}>
          <View style={[styles.dot, {
            backgroundColor: connected ? C.green : C.red,
            shadowColor: connected ? C.green : C.red
          }]} />
          <Text style={styles.summaryLbl}>{connected ? "LIVE" : "OFF"}</Text>
        </View>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchLogs(); }} tintColor={C.amber} />}
        renderItem={({ item }) => <LogRow entry={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {connected ? "No logs yet" : "Pi not reachable"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: C.bg },
  center:      { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" },
  loadingText: { color: C.muted, marginTop: 12, fontFamily: "monospace" },
  summaryBar:  { flexDirection: "row", backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, padding: 14, justifyContent: "space-around", alignItems: "center" },
  summaryBox:  { alignItems: "center" },
  summaryVal:  { fontSize: 18, fontWeight: "700", fontFamily: "monospace" },
  summaryLbl:  { color: C.muted, fontSize: 9, letterSpacing: 1, marginTop: 2, fontFamily: "monospace" },
  dot:         { width: 8, height: 8, borderRadius: 4, shadowOpacity: 0.8, shadowRadius: 4, elevation: 4 },
  logRow:      { borderLeftWidth: 3, paddingLeft: 10, paddingVertical: 6, marginBottom: 4, backgroundColor: C.surface, borderRadius: 4 },
  logText:     { fontSize: 11, fontFamily: "monospace", lineHeight: 16 },
  empty:       { alignItems: "center", marginTop: 80 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { color: C.text, fontSize: 16, fontFamily: "monospace" },
});
