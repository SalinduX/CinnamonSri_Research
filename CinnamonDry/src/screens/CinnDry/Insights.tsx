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

// ─── Smart Recommendation Card ────────────────────────────────────
function RecommendationRow({
  icon, title, body, color, bg, border,
}: {
  icon: string; title: string; body: string;
  color: string; bg: string; border: string;
}) {
  return (
    <View style={[recStyles.row, { backgroundColor: bg, borderColor: border }]}>
      <View style={[recStyles.iconBox, { backgroundColor: border + "55" }]}>
        <Text style={recStyles.icon}>{icon}</Text>
      </View>
      <View style={recStyles.textBox}>
        <Text style={[recStyles.title, { color }]}>{title}</Text>
        <Text style={recStyles.body}>{body}</Text>
      </View>
    </View>
  );
}

function SmartRecommendations({ data }: { data: SensorData }) {
  // Build recommendations list based on live sensor state
  const recs: {
    icon: string; title: string; body: string;
    color: string; bg: string; border: string;
  }[] = [];

  // ── ML Result: Bark is DRY ──────────────────────────────────────
  if (data.ml_result === "dry") {
    recs.push({
      icon:   "✅",
      title:  "Bark is Ready — Remove Now",
      body:   "ML model confirmed dryness at " + data.ml_confidence + "% confidence. Remove bark from the drying box immediately and store in a cool, dry container to prevent re-absorption of moisture.",
      color:  C.green,
      bg:     C.greenDim,
      border: C.green,
    });
  }

  // ── ML Result: Still wet after long time ───────────────────────
  if (data.ml_result === "not_dry" && data.elapsed > 240) {
    recs.push({
      icon:   "⏳",
      title:  "Still Drying After " + data.elapsed + " Minutes",
      body:   "Bark has been drying for over 4 hours but ML model still detects moisture. Check that the heater relay is working and bark is spread evenly without overlapping pieces.",
      color:  C.spiceLight,
      bg:     C.spiceDim,
      border: C.spice,
    });
  }

  // ── Temperature too low ─────────────────────────────────────────
  if (data.temp < 40) {
    recs.push({
      icon:   "🌡️",
      title:  "Temperature Too Low — " + data.temp + "°C",
      body:   "Optimal drying requires 40–55°C. Current temperature is below threshold. Heater is activating — estimated time will reduce as temperature rises. Ensure the drying box is sealed to retain heat.",
      color:  C.honey,
      bg:     C.honeyDim,
      border: C.honey,
    });
  }

  // ── Temperature too high ────────────────────────────────────────
  if (data.temp > 55) {
    recs.push({
      icon:   "🔥",
      title:  "Temperature Too High — " + data.temp + "°C",
      body:   "Temperatures above 55°C can damage bark quality and cause uneven drying or burning. Heater has been switched OFF automatically. Allow temperature to drop naturally.",
      color:  C.red,
      bg:     C.redDim,
      border: C.red,
    });
  }

  // ── High humidity ───────────────────────────────────────────────
  if (data.humidity > 60) {
    recs.push({
      icon:   "💧",
      title:  "High Humidity — " + data.humidity + "%",
      body:   "Humidity above 60% significantly slows drying. Consider increasing ventilation around the drying box or pre-drying bark in open air for 30 minutes before placing in the box.",
      color:  C.blue,
      bg:     C.blue,
      border: C.blue,
    });
  }

  // ── Good conditions ─────────────────────────────────────────────
  if (data.temp >= 40 && data.temp <= 55 && data.humidity < 55 && data.ml_result !== "dry") {
    recs.push({
      icon:   "✓",
      title:  "Optimal Conditions — Keep Running",
      body:   "Temperature and humidity are both in the ideal range. Drying is progressing at " + ((data.temp / 45) * (50 / Math.max(data.humidity, 1))).toFixed(2) + "× base rate. Estimated completion: " + data.remaining_str + ".",
      color:  C.green,
      bg:     C.greenDim,
      border: C.green,
    });
  }

  // ── Alternative to sunlight note ───────────────────────────────
  if (data.ml_result !== "dry") {
    recs.push({
      icon:   "☀️",
      title:  "Why Box Drying Beats Sunlight",
      body:   "Traditional sunlight drying takes 5–7 days and depends on weather. This controlled drying box maintains a constant 40–55°C with forced airflow, reducing drying time to under 8 hours with consistent quality regardless of weather conditions.",
      color:  C.honey,
      bg:     C.honeyDim,
      border: C.honey,
    });
  }

  return (
    <SpiceCard>
      <SectionLabel text="Smart Recommendations" />
      <View style={recStyles.container}>
        {recs.map((r, i) => (
          <RecommendationRow key={i} {...r} />
        ))}
      </View>
    </SpiceCard>
  );
}

const recStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
  row:       { flexDirection: "row", gap: 12, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: "flex-start" },
  iconBox:   { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  icon:      { fontSize: 18 },
  textBox:   { flex: 1 },
  title:     { fontSize: 12, fontWeight: "700", fontFamily: FONTS.mono, marginBottom: 4 },
  body:      { fontSize: 11, color: C.text, fontFamily: FONTS.body, lineHeight: 17 },
});

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

      {/* ── Smart Recommendations ── */}
      {data && <SmartRecommendations data={data} />}

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
