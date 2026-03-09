import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList,
  RefreshControl, ActivityIndicator, Animated
} from "react-native";
import { getLogs } from "../../services/api";
import { LogEntry } from "../../types/index";
import { C, FONTS } from "../../components/theme";
import { SpiceCard } from "../../components/ui";

const LEVEL_STYLE: Record<LogEntry["level"], { color: string; bg: string; border: string; icon: string }> = {
  INFO:    { color: C.text,       bg: C.surface,  border: C.border,      icon: "·"  },
  WARNING: { color: C.honey,      bg: C.bgMid,    border: C.honeyDim,    icon: "⚠"  },
  ERROR:   { color: C.red,        bg: C.redDim,   border: C.red,         icon: "✕"  },
  SUCCESS: { color: C.green,      bg: C.greenDim, border: C.green,       icon: "✓"  },
};

function LogRow({ entry, index }: { entry: LogEntry; index: number }) {
  const style  = LEVEL_STYLE[entry.level];
  const fadeAn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAn, {
      toValue:        1,
      duration:       300,
      delay:          index * 20,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.logRow, {
      backgroundColor: style.bg,
      borderLeftColor: style.border,
      opacity: fadeAn,
    }]}>
      <Text style={[styles.logIcon, { color: style.color }]}>{style.icon}</Text>
      <Text style={[styles.logText, { color: style.color }]} numberOfLines={3}>
        {entry.raw}
      </Text>
    </Animated.View>
  );
}

export default function History() {
  const [logs, setLogs]             = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [connected, setConnected]   = useState(false);

  const fetchLogs = useCallback(async () => {
    const result = await getLogs();
    setLogs(result.logs.reverse());
    setConnected(result.connected);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchLogs();
    const iv = setInterval(fetchLogs, 5000);
    return () => clearInterval(iv);
  }, [fetchLogs]);

  const counts = {
    total:   logs.length,
    success: logs.filter(l => l.level === "SUCCESS").length,
    warn:    logs.filter(l => l.level === "WARNING").length,
    error:   logs.filter(l => l.level === "ERROR").length,
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={C.spice} size="large" />
      <Text style={styles.loadingText}>Loading system logs...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Summary bar ── */}
      <View style={styles.summaryBar}>
        {[
          { val: counts.total,   color: C.cream,      lbl: "Total"   },
          { val: counts.success, color: C.green,      lbl: "Success" },
          { val: counts.warn,    color: C.honey,      lbl: "Alerts"  },
          { val: counts.error,   color: C.red,        lbl: "Errors"  },
        ].map((item, i) => (
          <View key={i} style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: item.color }]}>{item.val}</Text>
            <Text style={styles.summaryLbl}>{item.lbl}</Text>
          </View>
        ))}
        <View style={[styles.liveBadge, {
          borderColor: connected ? C.green : C.red,
          backgroundColor: connected ? C.greenDim : C.redDim,
        }]}>
          <Text style={[styles.liveText, { color: connected ? C.green : C.red }]}>
            {connected ? "LIVE" : "OFF"}
          </Text>
        </View>
      </View>

      {/* ── Legend ── */}
      <View style={styles.legendRow}>
        {Object.entries(LEVEL_STYLE).map(([level, s]) => (
          <View key={level} style={styles.legendItem}>
            <Text style={[styles.legendIcon, { color: s.color }]}>{s.icon}</Text>
            <Text style={[styles.legendText, { color: s.color }]}>{level}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={logs}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={C.spice}
          onRefresh={() => { setRefreshing(true); fetchLogs(); }} />}
        renderItem={({ item, index }) => <LogRow entry={item} index={index} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>
              {connected ? "No logs yet" : "Pi not reachable"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  center:       { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" },
  loadingText:  { color: C.muted, marginTop: 12, fontFamily: FONTS.mono },
  summaryBar:   { flexDirection: "row", backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, padding: 12, justifyContent: "space-around", alignItems: "center" },
  summaryItem:  { alignItems: "center" },
  summaryVal:   { fontSize: 20, fontWeight: "700", fontFamily: FONTS.mono },
  summaryLbl:   { color: C.muted, fontSize: 9, letterSpacing: 1, fontFamily: FONTS.mono },
  liveBadge:    { borderWidth: 1, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  liveText:     { fontSize: 10, fontWeight: "700", fontFamily: FONTS.mono, letterSpacing: 2 },
  legendRow:    { flexDirection: "row", justifyContent: "space-around", paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  legendItem:   { flexDirection: "row", alignItems: "center", gap: 4 },
  legendIcon:   { fontSize: 12, fontWeight: "700" },
  legendText:   { fontSize: 9, letterSpacing: 1, fontFamily: FONTS.mono },
  logRow:       { borderLeftWidth: 3, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 6, flexDirection: "row", gap: 8, alignItems: "flex-start" },
  logIcon:      { fontSize: 12, fontWeight: "700", marginTop: 1, width: 12 },
  logText:      { flex: 1, fontSize: 11, fontFamily: FONTS.mono, lineHeight: 16 },
  emptyBox:     { alignItems: "center", marginTop: 80 },
  emptyEmoji:   { fontSize: 56, marginBottom: 14 },
  emptyTitle:   { color: C.cream, fontSize: 18, fontFamily: FONTS.display },
});
