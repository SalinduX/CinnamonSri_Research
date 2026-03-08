import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl, Animated
} from "react-native";
import { getSensorData } from "../../services/api";
import { SensorData } from "../../types/react-navigation";
import { C, FONTS, SHADOWS } from "../../components/theme";
import {
  SpiceCard, SectionLabel, StatusPill,
  MetricTile, BarkProgress, RetryButton
} from "../../components/ui";

// ─── Circular Ring Gauge ───────────────────────────────────────────
function RingGauge({
  value, max, color, label, unit
}: {
  value: number; max: number; color: string; label: string; unit: string;
}) {
  const size   = 110;
  const stroke = 10;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const pct    = Math.min(value / max, 1);
  const dash   = pct * circ;

  return (
    <View style={styles.ringWrap}>
      {/* SVG-style ring using View trick */}
      <View style={[styles.ringOuter, { width: size, height: size, borderColor: C.border }]}>
        <View style={[styles.ringInner, {
          borderColor: color,
          borderTopColor:  pct > 0.25 ? color : "transparent",
          borderRightColor: pct > 0.5  ? color : "transparent",
          borderBottomColor: pct > 0.75 ? color : "transparent",
          shadowColor: color, shadowOpacity: 0.7, shadowRadius: 8,
        }]} />
        <View style={styles.ringCenter}>
          <Text style={[styles.ringValue, { color }]}>{value}</Text>
          <Text style={[styles.ringUnit, { color }]}>{unit}</Text>
        </View>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

// ─── ML Result Banner ──────────────────────────────────────────────
function MLBanner({ data }: { data: SensorData }) {
  const isDry     = data.ml_result === "dry";
  const isPending = data.ml_result === "unknown";

  return (
    <View style={[styles.mlBanner, {
      backgroundColor: isPending ? C.bgMid
        : isDry ? C.greenDim : C.redDim,
      borderColor: isPending ? C.border
        : isDry ? C.green : C.red,
    }]}>
      <View>
        <Text style={styles.mlBannerEyebrow}>ML ANALYSIS  •  {data.photo_count} PHOTOS</Text>
        <Text style={[styles.mlBannerResult, {
          color: isPending ? C.muted : isDry ? C.green : C.spiceLight
        }]}>
          {isPending ? "⏳  Awaiting first photo..." :
           isDry     ? "✓  Bark is dry"              : "◌  Not dry yet"}
        </Text>
      </View>
      {!isPending && (
        <View style={[styles.mlConfBadge, { borderColor: isDry ? C.green : C.spice }]}>
          <Text style={[styles.mlConfText, { color: isDry ? C.green : C.spiceLight }]}>
            {data.ml_confidence}%
          </Text>
        </View>
      )}
    </View>
  );
}

export default function Dashboard() {
  const [data, setData]             = useState<SensorData | null>(null);
  const [connected, setConnected]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(false);
  const fadeAnim                    = React.useRef(new Animated.Value(0)).current;

  const fetchData = useCallback(async () => {
    const result = await getSensorData();
    if (result.data) {
      setData(result.data);
      setError(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    } else {
      setError(true);
    }
    setConnected(result.connected);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 3000);
    return () => clearInterval(iv);
  }, [fetchData]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={C.spice} size="large" />
      <Text style={styles.loadingText}>Connecting to dryer...</Text>
      <Text style={styles.loadingSub}>Reaching your Raspberry Pi</Text>
    </View>
  );

  if (error || !data) return (
    <View style={styles.center}>
      <Text style={styles.errorEmoji}>🌿</Text>
      <Text style={styles.errorTitle}>Cannot Reach Pi</Text>
      <Text style={styles.errorSub}>Check your IP in api.ts and ensure{"\n"}both devices are on the same WiFi</Text>
      <RetryButton onPress={() => { setLoading(true); fetchData(); }} />
    </View>
  );

  const progressPct = (data.elapsed / (data.elapsed + data.remaining + 0.01)) * 100;

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} tintColor={C.spice}
          onRefresh={() => { setRefreshing(true); fetchData(); }} />
      }
    >
      <Animated.View style={{ opacity: fadeAnim }}>

        {/* ── Header Status Row ── */}
        <View style={styles.headerRow}>
          <View style={styles.connBadge}>
            <View style={[styles.connDot, {
              backgroundColor: connected ? C.green : C.red,
              shadowColor: connected ? C.green : C.red,
              shadowOpacity: 0.9, shadowRadius: 6, elevation: 4
            }]} />
            <Text style={[styles.connText, { color: connected ? C.green : C.red }]}>
              {connected ? "LIVE" : "OFFLINE"}
            </Text>
          </View>
          <Text style={styles.updatedText}>
            {data.last_updated?.slice(11, 19)}
          </Text>
        </View>

        {/* ── Temperature & Humidity ── */}
        <SpiceCard>
          <SectionLabel text="Current Conditions" />
          <View style={styles.gaugeRow}>
            <RingGauge value={data.temp}     max={80}  color={C.spiceLight} label="TEMPERATURE" unit="°C" />
            <View style={styles.gaugeDivider} />
            <RingGauge value={data.humidity} max={100} color={C.honey}      label="HUMIDITY"    unit="%" />
          </View>
          <View style={[styles.conditionBadge, {
            backgroundColor: data.temp >= 40 && data.temp <= 55 ? C.greenDim : C.redDim,
            borderColor:     data.temp >= 40 && data.temp <= 55 ? C.green    : C.red,
          }]}>
            <Text style={[styles.conditionText, {
              color: data.temp >= 40 && data.temp <= 55 ? C.green : C.red
            }]}>
              {data.temp < 40  ? "🌡️  Temperature too low — heater activating"  :
               data.temp > 55  ? "🌡️  Temperature too high — heater OFF"        :
                                 "✓  Temperature in optimal range (40–55°C)"}
            </Text>
          </View>
        </SpiceCard>

        {/* ── Drying Progress ── */}
        <SpiceCard>
          <SectionLabel text="Drying Progress" />
          <View style={styles.progressSection}>
            <BarkProgress pct={progressPct} label={data.remaining_str + " remaining"} color={C.spice} />
            <View style={styles.timeRow}>
              <View style={styles.timeBox}>
                <Text style={styles.timeVal}>{data.elapsed}</Text>
                <Text style={styles.timeLbl}>min elapsed</Text>
              </View>
              <View style={[styles.statusBadge, {
                backgroundColor: data.status === "COMPLETE" ? C.greenDim : C.spiceDim,
                borderColor:     data.status === "COMPLETE" ? C.green    : C.spice,
              }]}>
                <Text style={[styles.statusBadgeText, {
                  color: data.status === "COMPLETE" ? C.green : C.spiceLight
                }]}>
                  {data.status === "COMPLETE" ? "✓ COMPLETE" : "● IN PROGRESS"}
                </Text>
              </View>
              <View style={styles.timeBox}>
                <Text style={styles.timeVal}>{Math.round(data.remaining)}</Text>
                <Text style={styles.timeLbl}>min left</Text>
              </View>
            </View>
            <Text style={styles.startedAt}>Started {data.drying_start}</Text>
          </View>

          {/* ML Banner */}
          <MLBanner data={data} />
        </SpiceCard>

        {/* ── Device Status ── */}
        <SpiceCard>
          <SectionLabel text="Device Status" />
          <View style={styles.deviceGrid}>
            <View style={styles.deviceRow}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceIcon}>🔥</Text>
                <Text style={styles.deviceName}>Heater</Text>
              </View>
              <StatusPill label={data.heater} isOn={data.heater === "ON"} />
            </View>
            <View style={styles.deviceRow}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceIcon}>💨</Text>
                <Text style={styles.deviceName}>Fan</Text>
              </View>
              <StatusPill label={data.fan} isOn={data.fan === "ON"} />
            </View>
            <View style={styles.deviceRow}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceIcon}>📷</Text>
                <Text style={styles.deviceName}>Camera</Text>
              </View>
              <StatusPill label="ACTIVE" isOn={true} />
            </View>
            <View style={[styles.deviceRow, { borderBottomWidth: 0 }]}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceIcon}>🌡️</Text>
                <Text style={styles.deviceName}>DHT22 Sensor</Text>
              </View>
              <StatusPill label="READING" isOn={true} />
            </View>
          </View>
        </SpiceCard>

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:          { flex: 1, backgroundColor: C.bg, padding: 16 },
  center:          { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", padding: 32 },
  loadingText:     { color: C.cream, fontSize: 18, fontFamily: FONTS.display, marginTop: 16 },
  loadingSub:      { color: C.muted, fontSize: 12, fontFamily: FONTS.mono, marginTop: 6 },
  errorEmoji:      { fontSize: 64, marginBottom: 16 },
  errorTitle:      { color: C.cream, fontSize: 22, fontFamily: FONTS.display, fontWeight: "700" },
  errorSub:        { color: C.muted, fontSize: 13, fontFamily: FONTS.mono, marginTop: 8, textAlign: "center", lineHeight: 20 },
  headerRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  connBadge:       { flexDirection: "row", alignItems: "center", gap: 6 },
  connDot:         { width: 8, height: 8, borderRadius: 4 },
  connText:        { fontSize: 11, fontWeight: "700", fontFamily: FONTS.mono, letterSpacing: 2 },
  updatedText:     { color: C.muted, fontSize: 11, fontFamily: FONTS.mono },
  gaugeRow:        { flexDirection: "row", justifyContent: "space-around", paddingBottom: 16, paddingHorizontal: 8 },
  gaugeDivider:    { width: 1, backgroundColor: C.border, marginVertical: 8 },
  ringWrap:        { alignItems: "center", gap: 8 },
  ringOuter:       { borderRadius: 999, borderWidth: 8, justifyContent: "center", alignItems: "center", position: "relative" },
  ringInner:       { position: "absolute", top: -8, left: -8, right: -8, bottom: -8, borderRadius: 999, borderWidth: 8 },
  ringCenter:      { alignItems: "center" },
  ringValue:       { fontSize: 26, fontWeight: "700", fontFamily: FONTS.mono },
  ringUnit:        { fontSize: 11, fontFamily: FONTS.mono, marginTop: -2 },
  ringLabel:       { color: C.muted, fontSize: 9, letterSpacing: 3, fontFamily: FONTS.mono },
  conditionBadge:  { borderWidth: 1, borderRadius: 8, padding: 10, marginHorizontal: 16, marginBottom: 16 },
  conditionText:   { fontSize: 12, fontFamily: FONTS.mono, textAlign: "center" },
  progressSection: { paddingHorizontal: 16, paddingBottom: 4 },
  timeRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 8 },
  timeBox:         { alignItems: "center" },
  timeVal:         { color: C.cream, fontSize: 22, fontWeight: "700", fontFamily: FONTS.mono },
  timeLbl:         { color: C.muted, fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1 },
  statusBadge:     { borderWidth: 1, borderRadius: 99, paddingVertical: 6, paddingHorizontal: 14 },
  statusBadgeText: { fontSize: 10, fontWeight: "700", fontFamily: FONTS.mono, letterSpacing: 1 },
  startedAt:       { color: C.muted, fontSize: 10, fontFamily: FONTS.mono, textAlign: "center", marginBottom: 16 },
  mlBanner:        { borderWidth: 1, borderRadius: 12, margin: 16, marginTop: 0, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mlBannerEyebrow: { color: C.muted, fontSize: 9, letterSpacing: 2, fontFamily: FONTS.mono },
  mlBannerResult:  { fontSize: 16, fontFamily: FONTS.display, fontWeight: "700", marginTop: 4 },
  mlConfBadge:     { borderWidth: 1, borderRadius: 10, padding: 10, alignItems: "center", justifyContent: "center" },
  mlConfText:      { fontSize: 18, fontWeight: "700", fontFamily: FONTS.mono },
  deviceGrid:      { paddingHorizontal: 16, paddingBottom: 8 },
  deviceRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  deviceInfo:      { flexDirection: "row", alignItems: "center", gap: 10 },
  deviceIcon:      { fontSize: 18 },
  deviceName:      { color: C.text, fontSize: 14, fontFamily: FONTS.body },
});
