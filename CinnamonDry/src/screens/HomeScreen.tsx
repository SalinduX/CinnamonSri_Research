import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, StatusBar, Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, SensorData } from "../types/index";
import { C, FONTS } from "../components/theme";
import { getSensorData } from "../services/api";

const { width: W } = Dimensions.get("window");

type NavProp = NativeStackNavigationProp<RootStackParamList, "Home">;

// ─── Module card data ──────────────────────────────────────────────
const MODULES = [
  {
    key:      "CinnDry" as const,
    icon:     "🌿",
    title:    "CinnDry",
    subtitle: "Bark Drying Monitor",
    desc:     "Real-time temperature, humidity, heater & fan control with ML-powered dryness detection.",
    color:    C.spice,
    colorDim: C.spiceDim,
    tag:      "LIVE",
    tagColor: C.green,
    tagBg:    C.greenDim,
  },
  {
    key:      "CinnOracle" as const,
    icon:     "🔮",
    title:    "CinnOracle",
    subtitle: "AI Market Intelligence",
    desc:     "Price prediction, weather analysis and market demand forecasting for cinnamon growers.",
    color:    C.honey,
    colorDim: C.honeyDim,
    tag:      "SOON",
    tagColor: C.honeyLight,
    tagBg:    C.honeyDim,
  },
  {
    key:      "CinnHarvest" as const,
    icon:     "🌱",
    title:    "CinnHarvest",
    subtitle: "Plantation & Harvest",
    desc:     "Crop tracking, harvest planning, field mapping and yield estimation for your plantation.",
    color:    C.green,
    colorDim: C.greenDim,
    tag:      "SOON",
    tagColor: C.green,
    tagBg:    C.greenDim,
  },
  {
    key:      "CinnGuard" as const,
    icon:     "🛡️",
    title:    "CinnGuard",
    subtitle: "Plantation Protection",
    desc:     "Pest detection, real-time alerts and AI-powered treatment recommendations for healthy crops.",
    color:    C.blue,
    colorDim: "#0D2A35",
    tag:      "SOON",
    tagColor: C.blue,
    tagBg:    "#0D2A35",
  },
];

// ─── Animated Module Card ──────────────────────────────────────────
function ModuleCard({
  mod, index, onPress
}: {
  mod: typeof MODULES[0];
  index: number;
  onPress: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0, duration: 500,
        delay: 300 + index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500,
        delay: 300 + index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{
      opacity:   fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
    }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.moduleCard, { borderLeftColor: mod.color }]}>
          {/* Top row */}
          <View style={styles.moduleTop}>
            <View style={[styles.moduleIconBox, { backgroundColor: mod.colorDim, borderColor: mod.color }]}>
              <Text style={styles.moduleIcon}>{mod.icon}</Text>
            </View>
            <View style={styles.moduleTitleGroup}>
              <Text style={[styles.moduleTitle, { color: mod.color }]}>{mod.title}</Text>
              <Text style={styles.moduleSubtitle}>{mod.subtitle}</Text>
            </View>
            <View style={[styles.moduleTag, { backgroundColor: mod.tagBg, borderColor: mod.tagColor }]}>
              <Text style={[styles.moduleTagText, { color: mod.tagColor }]}>{mod.tag}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.moduleDesc}>{mod.desc}</Text>

          {/* Footer arrow */}
          <View style={[styles.moduleFooter, { borderTopColor: mod.colorDim }]}>
            <Text style={[styles.moduleArrowText, { color: mod.color }]}>
              {mod.tag === "LIVE" ? "Open module" : "Coming soon"}
            </Text>
            <Text style={[styles.moduleArrow, { color: mod.color }]}>→</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Live status mini-bar ─────────────────────────────────────────
function LiveStatusBar({ data }: { data: SensorData | null }) {
  if (!data) return (
    <View style={styles.statusBar}>
      <View style={[styles.statusDot, { backgroundColor: C.muted }]} />
      <Text style={styles.statusText}>Pi not reachable — update IP in api.ts</Text>
    </View>
  );
  return (
    <View style={styles.statusBar}>
      <View style={[styles.statusDot, { backgroundColor: C.green, shadowColor: C.green, shadowOpacity: 0.9, shadowRadius: 4, elevation: 3 }]} />
      <Text style={styles.statusText}>
        Live · {data.temp}°C · {data.humidity}% · Heater {data.heater} · {data.ml_result === "dry" ? "✓ Dry" : data.ml_result === "not_dry" ? "◌ Drying" : "⏳ Pending"}
      </Text>
    </View>
  );
}

// ─── Main Home Screen ─────────────────────────────────────────────
export default function HomeScreen() {
  const navigation          = useNavigation<NavProp>();
  const [data, setData]     = useState<SensorData | null>(null);
  const headerFade          = useRef(new Animated.Value(0)).current;
  const headerSlide         = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(headerSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    getSensorData().then(r => { if (r.data) setData(r.data); });
    const iv = setInterval(() => {
      getSensorData().then(r => { if (r.data) setData(r.data); });
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Brand Header ── */}
        <Animated.View style={[styles.header, {
          opacity: headerFade,
          transform: [{ translateY: headerSlide }],
        }]}>
          {/* Decorative bark lines */}
          <View style={styles.barkLines}>
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} style={[styles.barkLine, {
                width:   `${55 + i * 9}%` as any,
                opacity: 0.06 + i * 0.025,
              }]} />
            ))}
          </View>

          <Text style={styles.brandEmoji}>🌿</Text>
          <Text style={styles.brandTitle}>CinnamonSri</Text>
          <Text style={styles.brandTagline}>Smart Cinnamon Management Platform</Text>

          {/* Decorative spice dots */}
          <View style={styles.spiceDots}>
            {[C.spice, C.honey, C.green, C.blue].map((col, i) => (
              <View key={i} style={[styles.spiceDot, { backgroundColor: col }]} />
            ))}
          </View>
        </Animated.View>

        {/* ── Live Status Bar ── */}
        <LiveStatusBar data={data} />

        {/* ── Section heading ── */}
        <View style={styles.sectionRow}>
          <View style={styles.sectionLine} />
          <Text style={styles.sectionLabel}>MODULES</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* ── Module Cards ── */}
        <View style={styles.moduleList}>
          {MODULES.map((mod, i) => (
            <ModuleCard
              key={mod.key}
              mod={mod}
              index={i}
              onPress={() => navigation.navigate(mod.key as any)}
            />
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CinnamonDry Platform · v1.0</Text>
          <Text style={styles.footerSub}>Powered by Raspberry Pi + Edge Impulse ML</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: C.bg },
  scroll:          { flex: 1 },

  // ── Header ──
  header:          { alignItems: "center", paddingTop: 48, paddingBottom: 36, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: C.border, overflow: "hidden", position: "relative" },
  barkLines:       { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "space-around", paddingVertical: 8 },
  barkLine:        { height: 1, backgroundColor: C.spice, borderRadius: 1 },
  brandEmoji:      { fontSize: 52, marginBottom: 10, zIndex: 1 },
  brandTitle:      { color: C.cream, fontSize: 34, fontFamily: FONTS.display, fontWeight: "700", letterSpacing: 1, zIndex: 1 },
  brandTagline:    { color: C.muted, fontSize: 12, fontFamily: FONTS.mono, letterSpacing: 2, marginTop: 6, textAlign: "center", zIndex: 1 },
  spiceDots:       { flexDirection: "row", gap: 8, marginTop: 20, zIndex: 1 },
  spiceDot:        { width: 8, height: 8, borderRadius: 4 },

  // ── Status bar ──
  statusBar:       { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface },
  statusDot:       { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  statusText:      { color: C.text, fontSize: 11, fontFamily: FONTS.mono, flex: 1 },

  // ── Section ──
  sectionRow:      { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginTop: 28, marginBottom: 16, gap: 10 },
  sectionLine:     { flex: 1, height: 1, backgroundColor: C.border },
  sectionLabel:    { color: C.spiceLight, fontSize: 10, letterSpacing: 3, fontFamily: FONTS.mono },

  // ── Module cards ──
  moduleList:      { paddingHorizontal: 16, gap: 12 },
  moduleCard:      { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, overflow: "hidden" },
  moduleTop:       { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, paddingBottom: 12 },
  moduleIconBox:   { width: 52, height: 52, borderRadius: 14, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  moduleIcon:      { fontSize: 26 },
  moduleTitleGroup:{ flex: 1 },
  moduleTitle:     { fontSize: 18, fontWeight: "700", fontFamily: FONTS.display },
  moduleSubtitle:  { color: C.muted, fontSize: 10, fontFamily: FONTS.mono, marginTop: 2, letterSpacing: 1 },
  moduleTag:       { borderWidth: 1, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  moduleTagText:   { fontSize: 9, fontWeight: "700", fontFamily: FONTS.mono, letterSpacing: 2 },
  moduleDesc:      { color: C.text, fontSize: 13, fontFamily: FONTS.body, lineHeight: 20, paddingHorizontal: 16, paddingBottom: 12 },
  moduleFooter:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1 },
  moduleArrowText: { fontSize: 11, fontFamily: FONTS.mono, letterSpacing: 1 },
  moduleArrow:     { fontSize: 16, fontWeight: "700" },

  // ── Footer ──
  footer:          { alignItems: "center", marginTop: 36, paddingBottom: 10 },
  footerText:      { color: C.muted, fontSize: 11, fontFamily: FONTS.mono, letterSpacing: 1 },
  footerSub:       { color: C.border, fontSize: 9, fontFamily: FONTS.mono, marginTop: 4, letterSpacing: 1 },
});
