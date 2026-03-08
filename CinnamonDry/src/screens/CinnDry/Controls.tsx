import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator
} from "react-native";
import { getSensorData } from "../../services/api";
import { SensorData } from "../../types/react-navigation";
import { C, FONTS, SHADOWS } from "../../components/theme";
import { SpiceCard, SectionLabel, MetricTile } from "../../components/ui";

const THRESHOLDS = [
  { icon: "🔥", label: "Heater turns ON",  value: "Below 40°C",  desc: "Heater activates when temp drops" },
  { icon: "🔥", label: "Heater turns OFF", value: "Above 55°C",  desc: "Safety cutoff prevents overheating" },
  { icon: "💨", label: "Fan",               value: "Always ON",   desc: "Runs continuously for airflow" },
  { icon: "⏱️", label: "Base drying time", value: "360 minutes", desc: "Expected time under ideal conditions" },
  { icon: "📷", label: "Photo interval",   value: "15 minutes",  desc: "Camera captures bark condition" },
  { icon: "🤖", label: "ML threshold",     value: "70% conf.",   desc: "Min confidence to declare dry" },
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
    const iv = setInterval(fetchData, 3000);
    return () => clearInterval(iv);
  }, [fetchData]);

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={C.spice}
        onRefresh={() => { setRefreshing(true); fetchData(); }} />}
    >
      {/* ── Live Readings ── */}
      <SpiceCard>
        <SectionLabel text="Live Readings" />
        {loading || !data ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={C.spice} />
            <Text style={styles.loadingText}>Fetching from Pi...</Text>
          </View>
        ) : (
          <View style={styles.tileGrid}>
            <MetricTile label="TEMPERATURE" value={data.temp}     unit="°C" color={C.spiceLight} sub="DHT22 sensor" />
            <MetricTile label="HUMIDITY"    value={data.humidity} unit="%"  color={C.honey}      sub="Relative humidity" />
            <MetricTile
              label="HEATER" value={data.heater} color={data.heater === "ON" ? C.spiceLight : C.muted}
              sub={data.heater === "ON" ? "Heating bark" : "Standby"}
            />
            <MetricTile label="FAN" value={data.fan} color={C.green} sub="Always running" />
            <MetricTile label="PHOTOS" value={data.photo_count} color={C.honey} sub="Total captured" />
            <MetricTile
              label="STATUS" value={data.status === "COMPLETE" ? "DONE" : "ACTIVE"}
              color={data.status === "COMPLETE" ? C.green : C.spice} sub={data.status}
            />
          </View>
        )}
      </SpiceCard>

      {/* ── Control Thresholds ── */}
      <SpiceCard>
        <SectionLabel text="Control Thresholds" />
        <View style={styles.threshList}>
          {THRESHOLDS.map((t, i) => (
            <View key={i} style={[styles.threshRow,
              i === THRESHOLDS.length - 1 && { borderBottomWidth: 0 }
            ]}>
              <Text style={styles.threshIcon}>{t.icon}</Text>
              <View style={styles.threshInfo}>
                <Text style={styles.threshLabel}>{t.label}</Text>
                <Text style={styles.threshDesc}>{t.desc}</Text>
              </View>
              <View style={styles.threshValueBox}>
                <Text style={styles.threshValue}>{t.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </SpiceCard>

      {/* ── Logic Summary ── */}
      <SpiceCard>
        <SectionLabel text="Control Logic" />
        <View style={styles.logicList}>
          {[
            { color: C.spice,  icon: "🔥", title: "Heater",  lines: ["ON  when temp < 40°C", "OFF when temp > 55°C"] },
            { color: C.honey,  icon: "💨", title: "Fan",      lines: ["Always ON while running", "OFF only on shutdown"] },
            { color: C.green,  icon: "📷", title: "Camera",   lines: ["Captures every 15 min", "ML classifies each photo"] },
            { color: C.blue,   icon: "🤖", title: "ML Model", lines: ["Labels: dry / not_dry", "> 70% confidence = dry"] },
          ].map((item, i) => (
            <View key={i} style={[styles.logicCard, { borderLeftColor: item.color }]}>
              <Text style={styles.logicIcon}>{item.icon}</Text>
              <View>
                <Text style={[styles.logicTitle, { color: item.color }]}>{item.title}</Text>
                {item.lines.map((l, j) => (
                  <Text key={j} style={styles.logicLine}>{l}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </SpiceCard>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:        { flex: 1, backgroundColor: C.bg, padding: 16 },
  loadingBox:    { flexDirection: "row", gap: 10, alignItems: "center", padding: 16 },
  loadingText:   { color: C.muted, fontFamily: FONTS.mono, fontSize: 12 },
  tileGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 16, paddingTop: 0 },
  threshList:    { paddingHorizontal: 16, paddingBottom: 8 },
  threshRow:     { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  threshIcon:    { fontSize: 20, width: 28, textAlign: "center" },
  threshInfo:    { flex: 1 },
  threshLabel:   { color: C.cream, fontSize: 13, fontFamily: FONTS.body },
  threshDesc:    { color: C.muted, fontSize: 10, fontFamily: FONTS.mono, marginTop: 2 },
  threshValueBox:{ backgroundColor: C.spiceDim, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  threshValue:   { color: C.spiceLight, fontSize: 11, fontWeight: "700", fontFamily: FONTS.mono },
  logicList:     { padding: 16, paddingTop: 0, gap: 10 },
  logicCard:     { flexDirection: "row", gap: 14, backgroundColor: C.surfaceHigh, borderRadius: 10, borderLeftWidth: 3, padding: 14, alignItems: "flex-start" },
  logicIcon:     { fontSize: 20, marginTop: 2 },
  logicTitle:    { fontSize: 14, fontWeight: "700", fontFamily: FONTS.body, marginBottom: 4 },
  logicLine:     { color: C.text, fontSize: 12, fontFamily: FONTS.mono, lineHeight: 20 },
});
