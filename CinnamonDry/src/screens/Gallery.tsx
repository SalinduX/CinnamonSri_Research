import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator
} from "react-native";
import { getGallery, getImageUrl } from "../services/api";
import { CapturedImage } from "../types/react-navigation";

const C = {
  bg:      "#020817", surface: "#0f172a", border: "#1e293b",
  muted:   "#64748b", text:    "#94a3b8", white:  "#ffffff",
  amber:   "#f59e0b", green:   "#22c55e", red:    "#ef4444",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_SIZE    = (SCREEN_WIDTH - 48) / 2;

type Filter = "all" | "dry" | "not_dry";

function ImageCard({ item }: { item: CapturedImage }) {
  const isDry    = item.ml_result === "dry";
  const isUnknown = item.ml_result === "unknown";
  const color    = isDry ? C.green : isUnknown ? C.muted : C.amber;
  const label    = isDry ? "DRY ✓" : isUnknown ? "PENDING" : "NOT DRY";

  return (
    <View style={[styles.imageCard, { width: ITEM_SIZE }]}>
      <Image
        source={{ uri: getImageUrl(item.filename) }}
        style={styles.image}
        defaultSource={require("../../assets/icon.png")}
      />
      <View style={[styles.mlBadge, { borderColor: color, backgroundColor: color + "22" }]}>
        <Text style={[styles.mlBadgeText, { color }]}>{label}</Text>
        {!isUnknown && (
          <Text style={[styles.mlConf, { color }]}>{item.confidence}%</Text>
        )}
      </View>
      <Text style={styles.timestamp}>{item.timestamp.slice(11, 19)}</Text>
      <Text style={styles.dateText}>{item.timestamp.slice(0, 10)}</Text>
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

  const filtered = filter === "all"
    ? images
    : images.filter(img => img.ml_result === filter);

  const dryCount    = images.filter(i => i.ml_result === "dry").length;
  const notDryCount = images.filter(i => i.ml_result === "not_dry").length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.amber} size="large" />
        <Text style={styles.loadingText}>Loading captures from Pi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {images.length} photos  •  <Text style={{ color: C.green }}>{dryCount} dry</Text>  •  <Text style={{ color: C.amber }}>{notDryCount} not dry</Text>
        </Text>
        {!connected && <Text style={styles.offlineText}>OFFLINE</Text>}
      </View>

      {/* Filter tabs */}
      <View style={styles.filters}>
        {(["all", "dry", "not_dry"] as Filter[]).map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "not_dry" ? "NOT DRY" : f.toUpperCase()}
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
        refreshControl={<RefreshControl refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchImages(); }} tintColor={C.amber} />}
        renderItem={({ item }) => <ImageCard item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyText}>
              {connected ? "No captures yet" : "Pi not reachable"}
            </Text>
            <Text style={styles.emptySubText}>
              {connected
                ? "Photos are taken every 15 minutes"
                : "Check your Pi IP in api.ts"}
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
  loadingText:      { color: C.muted, marginTop: 12, fontFamily: "monospace" },
  statsRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 12 },
  statsText:        { color: C.muted, fontSize: 11, fontFamily: "monospace" },
  offlineText:      { color: C.red, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  filters:          { flexDirection: "row", padding: 16, paddingBottom: 0, gap: 8 },
  filterBtn:        { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: "center" },
  filterBtnActive:  { backgroundColor: C.amber, borderColor: C.amber },
  filterText:       { color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  filterTextActive: { color: C.bg, fontWeight: "700" },
  row:              { justifyContent: "space-between", marginBottom: 12 },
  imageCard:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: "hidden" },
  image:            { width: "100%", height: ITEM_SIZE * 0.75, resizeMode: "cover", backgroundColor: C.border },
  mlBadge:          { flexDirection: "row", justifyContent: "space-between", borderWidth: 1, margin: 8, borderRadius: 6, padding: 6 },
  mlBadgeText:      { fontSize: 10, fontWeight: "700", letterSpacing: 1, fontFamily: "monospace" },
  mlConf:           { fontSize: 10, fontFamily: "monospace" },
  timestamp:        { color: C.text, fontSize: 11, paddingHorizontal: 8, fontFamily: "monospace" },
  dateText:         { color: C.muted, fontSize: 9, paddingHorizontal: 8, paddingBottom: 8, fontFamily: "monospace" },
  empty:            { alignItems: "center", marginTop: 80 },
  emptyIcon:        { fontSize: 48, marginBottom: 12 },
  emptyText:        { color: C.text, fontSize: 16, fontFamily: "monospace" },
  emptySubText:     { color: C.muted, fontSize: 11, marginTop: 6, fontFamily: "monospace" },
});
