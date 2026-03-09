import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator
} from "react-native";
import { getSensorData } from "../../services/api";
import { SensorData } from "../../types/index";
import { C, FONTS } from "../../components/theme";
import { SpiceCard, SectionLabel, BarkProgress } from "../../components/ui";

function InsightCard({
  icon, title, value, desc, color
}: {
  icon: string; title: string; value: string; desc: string; color: string;
}) {
  return (
    <View style={[styles.insightCard, { borderTopColor: color }]}>
      <Text style={styles.insightIcon}>{icon}</Text>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={[styles.insightValue, { color }]}>{value}</Text>
      <Text style={styles.insightDesc}>{desc}</Text>
    </View>
  );
}

function Spiceometer({ value, label }: { value: number; label: string }) {
  const pct   = Math.min(value, 100);
  const color = pct > 75 ? C.green : pct > 40 ? C.honey : C.spiceLight;
  return (
    <View style={styles.spiceometerWrap}>
      <View style={styles.spiceometerBar}>
        <View style={[styles.spiceometerFill, { width: `${pct}%` as any, backgroundColor: color }]} />
        <View style={[styles.spiceometerKnob, { left: `${Math.max(pct - 2, 0)}%` as any, backgroundColor: color }]} />
      </View>
      <View style={styles.spiceometerFooter}>
        <Text style={styles.spiceometerLabel}>{label}</Text>
        <Text style={[styles.spiceometerVal, { color }]}>{pct}%</Text>
      </View>
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
    const iv = setInterval(fetchData, 3000);
    return () => clearInterval(iv);
  }, [fetchData]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={C.spice} size="large" />
      <Text style={styles.loadingText}>Calculating insights...</Text>
    </View>
  );

  const dryingRate  = data
    ? +((data.temp / 45) * (50 / Math.max(data.humidity, 1))).toFixed(2)
    : 0;
  const progressPct = data
    ? Math.round((data.elapsed / Math.max(data.elapsed + data.remaining, 1)) * 100)
    : 0;
  const tempScore   = data
    ? Math.max(0, Math.min(100, ((data.temp - 30) / 30) * 100))
    : 0;
  const humScore    = data
    ? Math.max(0, Math.min(100, ((80 - data.humidity) / 50) * 100))
    : 0;
  const overallScore = data ? Math.round((tempScore + humScore) / 2) : 0;

  return (
    <ScrollView
      style={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={C.spice}
        onRefresh={() => { setRefreshing(true); fetchData(); }} />}
    >
      {/* ── Key Metrics ── */}
      {data && (
        <SpiceCard>
          <SectionLabel text="Session Insights" />
          <View style={styles.insightGrid}>
            <InsightCard
              icon="⚡" title="DRYING RATE"
              value={dryingRate + "×"}
              desc="vs baseline speed"
              color={dryingRate >= 1 ? C.green : C.spiceLight}
            />
            <InsightCard
              icon="📊" title="PROGRESS"
              value={progressPct + "%"}
              desc={data.elapsed + " of ~" + Math.round(data.elapsed + data.remaining) + " min"}
              color={C.honey}
            />
            <InsightCard
              icon="📷" title="CAPTURES"
              value={data.photo_count.toString()}
              desc="ML checks done"
              color={C.spiceLight}
            />
            <InsightCard
              icon="🤖" title="LAST ML"
              value={data.ml_result === "unknown" ? "—" :
                     data.ml_result === "dry" ? "DRY ✓" : "WET"}
              desc={data.ml_result !== "unknown"
                ? data.ml_confidence + "% confidence"
                : "Awaiting photo"}
              color={data.ml_result === "dry" ? C.green : C.spiceLight}
            />
          </View>
        </SpiceCard>
      )}

      {/* ── Drying Conditions Score ── */}
      {data && (
        <SpiceCard>
          <SectionLabel text="Condition Scores" />
          <View style={styles.scoresSection}>
            <Spiceometer value={Math.round(tempScore)} label="Temperature Score" />
            <Spiceometer value={Math.round(humScore)}  label="Humidity Score" />
            <Spiceometer value={overallScore}           label="Overall Condition" />

            <View style={[styles.overallBadge, {
              backgroundColor: overallScore > 70 ? C.greenDim : overallScore > 40 ? C.spiceDim : C.redDim,
              borderColor:     overallScore > 70 ? C.green    : overallScore > 40 ? C.spice    : C.red,
            }]}>
              <Text style={[styles.overallText, {
                color: overallScore > 70 ? C.green : overallScore > 40 ? C.spiceLight : C.red
              }]}>
                {overallScore > 70 ? "✓  Excellent drying conditions"
                 : overallScore > 40 ? "◌  Moderate conditions — acceptable"
                 : "⚠  Poor conditions — check settings"}
              </Text>
            </View>
          </View>
        </SpiceCard>
      )}

      {/* ── Cinnamon Drying Tips ── */}
      <SpiceCard>
        <SectionLabel text="Cinnamon Drying Guide" />
        <View style={styles.tipsList}>
          {[
            { icon: "🌡️", tip: "Ideal temperature: 40–55°C ensures fast even drying"  },
            { icon: "💧", tip: "Keep humidity below 55% for optimal moisture removal"  },
            { icon: "💨", tip: "Consistent airflow from the fan reduces drying by 30%" },
            { icon: "📷", tip: "ML model checks bark condition every 15 minutes"       },
            { icon: "⚡", tip: "Higher temp + lower humidity = faster drying rate"      },
            { icon: "✅", tip: "Bark is ready when ML reports dry at >70% confidence"   },
          ].map((item, i) => (
            <View key={i} style={[styles.tipRow,
              i === 5 && { borderBottomWidth: 0 }
            ]}>
              <View style={styles.tipIconBox}>
                <Text style={styles.tipIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.tipText}>{item.tip}</Text>
            </View>
          ))}
        </View>
      </SpiceCard>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:              { flex: 1, backgroundColor: C.bg, padding: 16 },
  center:              { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" },
  loadingText:         { color: C.muted, marginTop: 12, fontFamily: FONTS.mono },
  insightGrid:         { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 16, paddingTop: 0 },
  insightCard:         { width: "47%", backgroundColor: C.surfaceHigh, borderRadius: 12, borderTopWidth: 3, padding: 14 },
  insightIcon:         { fontSize: 22, marginBottom: 6 },
  insightTitle:        { color: C.muted, fontSize: 9, letterSpacing: 2, fontFamily: FONTS.mono },
  insightValue:        { fontSize: 24, fontWeight: "700", fontFamily: FONTS.mono, marginVertical: 4 },
  insightDesc:         { color: C.muted, fontSize: 10, fontFamily: FONTS.mono },
  scoresSection:       { paddingHorizontal: 16, paddingBottom: 16 },
  spiceometerWrap:     { marginBottom: 18 },
  spiceometerBar:      { height: 10, backgroundColor: C.border, borderRadius: 99, overflow: "visible", position: "relative" },
  spiceometerFill:     { height: "100%", borderRadius: 99 },
  spiceometerKnob:     { position: "absolute", top: -4, width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.bg },
  spiceometerFooter:   { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  spiceometerLabel:    { color: C.muted, fontSize: 11, fontFamily: FONTS.mono },
  spiceometerVal:      { fontSize: 12, fontWeight: "700", fontFamily: FONTS.mono },
  overallBadge:        { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4 },
  overallText:         { fontSize: 13, fontFamily: FONTS.body, textAlign: "center" },
  tipsList:            { paddingHorizontal: 16, paddingBottom: 8 },
  tipRow:              { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  tipIconBox:          { width: 36, height: 36, borderRadius: 10, backgroundColor: C.spiceDim, justifyContent: "center", alignItems: "center" },
  tipIcon:             { fontSize: 18 },
  tipText:             { flex: 1, color: C.text, fontSize: 13, fontFamily: FONTS.body, lineHeight: 19 },
});
