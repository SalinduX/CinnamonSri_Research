import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { C, FONTS } from "../../components/theme";

const FEATURES = [
  { icon: "🌱", title: "Crop Tracking",       desc: "Track plantation growth stages & schedules"    },
  { icon: "📅", title: "Harvest Planner",      desc: "Optimal harvest timing recommendations"        },
  { icon: "🗺️", title: "Field Mapping",        desc: "GPS-based plantation zone management"          },
  { icon: "📦", title: "Yield Estimator",      desc: "Predict bark yield before harvest"             },
];

export default function CinnHarvest() {
  return (
    <ScrollView style={styles.scroll}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🌱</Text>
        <Text style={styles.heroTitle}>CinnHarvest</Text>
        <Text style={styles.heroSub}>Plantation & Harvest Manager</Text>
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>COMING SOON</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Planned Features</Text>
      {FEATURES.map((f, i) => (
        <View key={i} style={styles.featureCard}>
          <Text style={styles.featureIcon}>{f.icon}</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
          <View style={styles.featureBadge}>
            <Text style={styles.featureBadgeText}>Soon</Text>
          </View>
        </View>
      ))}

      <View style={styles.devNote}>
        <Text style={styles.devNoteTitle}>👨‍💻  For Developers</Text>
        <Text style={styles.devNoteText}>
          Add your screens inside:{"\n"}
          <Text style={styles.devNotePath}>src/screens/CinnHarvest/</Text>
          {"\n\n"}Then register them in this file or create a nested navigator.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:           { flex: 1, backgroundColor: C.bg },
  hero:             { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: C.border },
  heroIcon:         { fontSize: 64, marginBottom: 12 },
  heroTitle:        { color: C.cream, fontSize: 32, fontFamily: FONTS.display, fontWeight: "700" },
  heroSub:          { color: C.muted, fontSize: 13, fontFamily: FONTS.mono, letterSpacing: 2, marginTop: 4 },
  comingSoon:       { marginTop: 16, borderWidth: 1, borderColor: C.green, borderRadius: 99, paddingVertical: 6, paddingHorizontal: 20, backgroundColor: C.greenDim },
  comingSoonText:   { color: C.green, fontSize: 11, fontWeight: "700", fontFamily: FONTS.mono, letterSpacing: 3 },
  sectionTitle:     { color: C.spiceLight, fontSize: 10, letterSpacing: 3, fontFamily: FONTS.mono, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  featureCard:      { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 16, paddingHorizontal: 20 },
  featureIcon:      { fontSize: 28, width: 40, textAlign: "center" },
  featureInfo:      { flex: 1 },
  featureTitle:     { color: C.cream, fontSize: 15, fontFamily: FONTS.body, fontWeight: "600" },
  featureDesc:      { color: C.muted, fontSize: 11, fontFamily: FONTS.mono, marginTop: 3 },
  featureBadge:     { backgroundColor: C.spiceDim, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  featureBadgeText: { color: C.spiceLight, fontSize: 9, fontFamily: FONTS.mono, letterSpacing: 1 },
  devNote:          { margin: 20, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 18, backgroundColor: C.surface },
  devNoteTitle:     { color: C.honey, fontSize: 13, fontWeight: "700", fontFamily: FONTS.body, marginBottom: 10 },
  devNoteText:      { color: C.text, fontSize: 12, fontFamily: FONTS.mono, lineHeight: 22 },
  devNotePath:      { color: C.spiceLight, fontFamily: FONTS.mono },
});
