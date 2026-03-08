import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { C, FONTS, SHADOWS } from "./theme";

// ─── Spice Card ────────────────────────────────────────────────────
export function SpiceCard({
  children, style
}: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[styles.card, SHADOWS.card, style]}>
      {/* Top decorative border */}
      <View style={styles.cardTopBorder} />
      {children}
    </View>
  );
}

// ─── Section Label ─────────────────────────────────────────────────
export function SectionLabel({ text }: { text: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <View style={styles.sectionLine} />
      <Text style={styles.sectionLabelText}>{text}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

// ─── Status Pill ───────────────────────────────────────────────────
export function StatusPill({
  label, isOn
}: { label: string; isOn: boolean }) {
  return (
    <View style={[
      styles.pill,
      { backgroundColor: isOn ? C.spiceDim : C.bgMid,
        borderColor:      isOn ? C.spice    : C.border }
    ]}>
      <View style={[
        styles.pillDot,
        { backgroundColor: isOn ? C.spiceLight : C.muted,
          shadowColor:      isOn ? C.spiceLight : "transparent",
          shadowOpacity:    isOn ? 0.9 : 0,
          shadowRadius:     isOn ? 6   : 0 }
      ]} />
      <Text style={[styles.pillText, { color: isOn ? C.spiceLight : C.muted }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Metric Tile ───────────────────────────────────────────────────
export function MetricTile({
  label, value, unit, color, sub
}: {
  label: string; value: string | number;
  unit?: string; color: string; sub?: string;
}) {
  return (
    <View style={styles.metricTile}>
      <View style={[styles.metricAccent, { backgroundColor: color }]} />
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
        {unit && <Text style={[styles.metricUnit, { color }]}>{unit}</Text>}
      </View>
      {sub && <Text style={styles.metricSub}>{sub}</Text>}
    </View>
  );
}

// ─── Bark Progress Bar ─────────────────────────────────────────────
export function BarkProgress({
  pct, label, color
}: { pct: number; label: string; color: string }) {
  return (
    <View style={styles.barkProgressWrap}>
      <View style={styles.barkProgressTrack}>
        {/* Bark texture segments */}
        {Array.from({ length: 20 }).map((_, i) => {
          const filled = (i / 20) * 100 < pct;
          return (
            <View key={i} style={[
              styles.barkSegment,
              { backgroundColor: filled ? color : C.border,
                opacity:          filled ? 1 : 0.3 }
            ]} />
          );
        })}
      </View>
      <View style={styles.barkProgressFooter}>
        <Text style={styles.barkProgressLabel}>{label}</Text>
        <Text style={[styles.barkProgressPct, { color }]}>{Math.round(pct)}%</Text>
      </View>
    </View>
  );
}

// ─── Retry Button ──────────────────────────────────────────────────
export function RetryButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.retryBtn} onPress={onPress}>
      <Text style={styles.retryText}>↺  RETRY CONNECTION</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     C.border,
    marginBottom:    16,
    overflow:        "hidden",
  },
  cardTopBorder: {
    height:          2,
    backgroundColor: C.spice,
    opacity:         0.6,
  },
  sectionLabelRow: {
    flexDirection:  "row",
    alignItems:     "center",
    marginBottom:   14,
    paddingHorizontal: 16,
    paddingTop:     16,
  },
  sectionLine: {
    flex:            1,
    height:          1,
    backgroundColor: C.border,
  },
  sectionLabelText: {
    color:         C.spiceLight,
    fontSize:      10,
    letterSpacing: 3,
    fontFamily:    FONTS.mono,
    marginHorizontal: 10,
    textTransform: "uppercase",
  },
  pill: {
    flexDirection:  "row",
    alignItems:     "center",
    borderWidth:    1,
    borderRadius:   99,
    paddingVertical:   6,
    paddingHorizontal: 12,
    gap:            6,
  },
  pillDot: {
    width:        7,
    height:       7,
    borderRadius: 99,
    elevation:    4,
  },
  pillText: {
    fontSize:      11,
    fontWeight:    "700",
    letterSpacing: 1,
    fontFamily:    FONTS.mono,
  },
  metricTile: {
    flex:            1,
    backgroundColor: C.surfaceHigh,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     C.border,
    padding:         14,
    overflow:        "hidden",
  },
  metricAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 2,
    opacity: 0.8,
  },
  metricLabel: {
    color:         C.muted,
    fontSize:      9,
    letterSpacing: 2,
    fontFamily:    FONTS.mono,
    textTransform: "uppercase",
    marginTop:     4,
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems:    "baseline",
    gap:           3,
    marginTop:     6,
  },
  metricValue: {
    fontSize:   26,
    fontWeight: "700",
    fontFamily: FONTS.mono,
  },
  metricUnit: {
    fontSize:   13,
    fontWeight: "600",
    fontFamily: FONTS.mono,
    marginBottom: 4,
  },
  metricSub: {
    color:         C.muted,
    fontSize:      9,
    fontFamily:    FONTS.mono,
    marginTop:     4,
  },
  barkProgressWrap: {
    marginBottom: 4,
  },
  barkProgressTrack: {
    flexDirection: "row",
    gap:           3,
    height:        12,
  },
  barkSegment: {
    flex:         1,
    borderRadius: 2,
  },
  barkProgressFooter: {
    flexDirection:  "row",
    justifyContent: "space-between",
    marginTop:      6,
  },
  barkProgressLabel: {
    color:         C.muted,
    fontSize:      10,
    fontFamily:    FONTS.mono,
    letterSpacing: 1,
  },
  barkProgressPct: {
    fontSize:   11,
    fontWeight: "700",
    fontFamily: FONTS.mono,
  },
  retryBtn: {
    marginTop:       24,
    backgroundColor: C.spiceDim,
    borderWidth:     1,
    borderColor:     C.spice,
    borderRadius:    10,
    paddingVertical:   12,
    paddingHorizontal: 28,
  },
  retryText: {
    color:         C.spiceLight,
    fontWeight:    "700",
    letterSpacing: 2,
    fontFamily:    FONTS.mono,
    fontSize:      12,
  },
});
