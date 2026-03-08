import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator
} from "react-native";
import { getGallery, getImageUrl } from "../../services/api";
import { CapturedImage } from "../../types/react-navigation";
import { C, FONTS } from "../../components/theme";
import { SpiceCard } from "../../components/ui";

const W          = Dimensions.get("window").width;
const CARD_SIZE  = (W - 48) / 2;
type Filter      = "all" | "dry" | "not_dry";

function ImageCard({ item }: { item: CapturedImage }) {
  const isDry     = item.ml_result === "dry";
  const isPending = item.ml_result === "unknown";
  const color     = isDry ? C.green : isPending ? C.muted : C.spiceLight;
  const label     = isDry ? "✓  DRY" : isPending ? "⏳  PENDING" : "◌  NOT DRY";

  return (
    <View style={[styles.imageCard, { width: CARD_SIZE }]}>
      {/* Photo */}
      <Image
        source={{ uri: getImageUrl(item.filename) }}
        style={styles.photo}
      />

      {/* Gradient overlay bottom */}
      <View style={styles.photoOverlay} />

      {/* Result badge */}
      <View style={[styles.resultBadge, {
        backgroundColor: isDry ? C.greenDim : isPending ? C.bgMid : C.spiceDim,
        borderColor:     color,
      }]}>
        <Text style={[styles.resultText, { color }]}>{label}</Text>
      </View>

      {/* Confidence */}
      {!isPending && (
        <Text style={[styles.confText, { color }]}>{item.confidence}%</Text>
      )}

      {/* Metadata */}
      <View style={styles.metaBox}>
        <Text style={styles.metaTime}>{item.timestamp?.slice(11, 19) || "--"}</Text>
        <Text style={styles.metaDate}>{item.timestamp?.slice(0, 10) || ""}</Text>
        {item.temp !== undefined && (
          <Text style={styles.metaConditions}>
            {item.temp}°C  •  {item.humidity}%
          </Text>
        )}
      </View>
    </View>
  );
}

export default function Gallery() {
  const [images, setImages]         = useState<CapturedImage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [connected, setConnected]   = useState(false);
  const [filter, setFilter]         = useState<Filter>("all");

  const fetchImages = useCallback(async () => {
    const result = await getGallery();
    setImages(result.images);
    setConnected(result.connected);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const filtered  = filter === "all" ? images : images.filter(i => i.ml_result === filter);
  const dryCount  = images.filter(i => i.ml_result === "dry").length;
  const wetCount  = images.filter(i => i.ml_result === "not_dry").length;

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color={C.spice} size="large" />
      <Text style={styles.loadingText}>Loading captures...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Stats Banner ── */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: C.cream }]}>{images.length}</Text>
          <Text style={styles.statLbl}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: C.green }]}>{dryCount}</Text>
          <Text style={styles.statLbl}>Dry</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: C.spiceLight }]}>{wetCount}</Text>
          <Text style={styles.statLbl}>Not Dry</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <View style={[styles.connDot, {
            backgroundColor: connected ? C.green : C.red,
            shadowColor: connected ? C.green : C.red,
            shadowOpacity: 0.9, shadowRadius: 4, elevation: 3
          }]} />
          <Text style={styles.statLbl}>{connected ? "Live" : "Off"}</Text>
        </View>
      </View>

      {/* ── Filter Tabs ── */}
      <View style={styles.filterRow}>
        {(["all", "dry", "not_dry"] as Filter[]).map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "not_dry" ? "Not Dry" : f === "all" ? "All" : "Dry"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        numColumns={2}
        keyExtractor={item => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={C.spice}
          onRefresh={() => { setRefreshing(true); fetchImages(); }} />}
        renderItem={({ item }) => <ImageCard item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📷</Text>
            <Text style={styles.emptyTitle}>
              {connected ? "No captures yet" : "Pi not reachable"}
            </Text>
            <Text style={styles.emptySub}>
              {connected ? "Photos are taken every 15 minutes" : "Check IP in api.ts"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: C.bg },
  center:           { flex: 1, backgroundColor: C.bg, justifyContent: "center", alignItems: "center" },
  loadingText:      { color: C.muted, marginTop: 12, fontFamily: FONTS.mono },
  statsBanner:      { flexDirection: "row", backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, padding: 14, justifyContent: "space-around", alignItems: "center" },
  statItem:         { alignItems: "center", gap: 4 },
  statVal:          { fontSize: 22, fontWeight: "700", fontFamily: FONTS.mono },
  statLbl:          { color: C.muted, fontSize: 9, letterSpacing: 1, fontFamily: FONTS.mono },
  statDivider:      { width: 1, height: 32, backgroundColor: C.border },
  connDot:          { width: 10, height: 10, borderRadius: 5 },
  filterRow:        { flexDirection: "row", padding: 12, gap: 8 },
  filterTab:        { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: C.border, alignItems: "center", backgroundColor: C.surface },
  filterTabActive:  { backgroundColor: C.spice, borderColor: C.spice },
  filterText:       { color: C.muted, fontSize: 12, fontFamily: FONTS.body },
  filterTextActive: { color: C.cream, fontWeight: "700" },
  row:              { justifyContent: "space-between", marginBottom: 12 },
  imageCard:        { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  photo:            { width: "100%", height: CARD_SIZE * 0.72, backgroundColor: C.surfaceHigh },
  photoOverlay:     { position: "absolute", top: 0, left: 0, right: 0, height: CARD_SIZE * 0.72, backgroundColor: "transparent" },
  resultBadge:      { borderWidth: 1, borderRadius: 6, margin: 8, marginBottom: 2, paddingVertical: 5, paddingHorizontal: 8, alignSelf: "flex-start" },
  resultText:       { fontSize: 10, fontWeight: "700", letterSpacing: 1, fontFamily: FONTS.mono },
  confText:         { fontSize: 12, fontWeight: "700", fontFamily: FONTS.mono, paddingHorizontal: 8, color: C.text },
  metaBox:          { padding: 8, paddingTop: 4 },
  metaTime:         { color: C.cream, fontSize: 12, fontFamily: FONTS.mono },
  metaDate:         { color: C.muted, fontSize: 9, fontFamily: FONTS.mono },
  metaConditions:   { color: C.muted, fontSize: 9, fontFamily: FONTS.mono, marginTop: 2 },
  emptyBox:         { alignItems: "center", marginTop: 80 },
  emptyEmoji:       { fontSize: 56, marginBottom: 14 },
  emptyTitle:       { color: C.cream, fontSize: 18, fontFamily: FONTS.display },
  emptySub:         { color: C.muted, fontSize: 12, fontFamily: FONTS.mono, marginTop: 6 },
});
