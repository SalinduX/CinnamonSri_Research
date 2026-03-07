import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  Image, TouchableOpacity, RefreshControl, Dimensions
} from "react-native";
import { getGallery } from "../services/api";
import { CapturedImage } from "../types/react-navigation";

const C = {
  bg:      "#020817",
  surface: "#0f172a",
  border:  "#1e293b",
  muted:   "#64748b",
  text:    "#94a3b8",
  white:   "#ffffff",
  amber:   "#f59e0b",
  green:   "#22c55e",
  red:     "#ef4444",
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const ITEM_SIZE    = (SCREEN_WIDTH - 48) / 2;

function ImageCard({ item }: { item: CapturedImage }) {
  const isDry = item.ml_result === "dry";

  return (
    <View style={[styles.imageCard, { width: ITEM_SIZE }]}>
      {/* Placeholder when no real image */}
      {item.uri ? (
        <Image source={{ uri: item.uri }} style={styles.image} />
      ) : (
        <View style={[styles.imagePlaceholder]}>
          <Text style={styles.placeholderIcon}>📷</Text>
          <Text style={styles.placeholderText}>No preview</Text>
        </View>
      )}

      {/* ML Badge */}
      <View style={[styles.mlBadge, { backgroundColor: isDry ? "#052e16" : "#1c1917",
        borderColor: isDry ? C.green : C.amber }]}>
        <Text style={[styles.mlBadgeText, { color: isDry ? C.green : C.amber }]}>
          {isDry ? "DRY" : "NOT DRY"}
        </Text>
        <Text style={[styles.mlConf, { color: isDry ? C.green : C.amber }]}>
          {item.confidence}%
        </Text>
      </View>

      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );
}

export default function Gallery() {
  const [images, setImages]       = useState<CapturedImage[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]       = useState<"all" | "dry" | "not_dry">("all");

  const fetchImages = async () => {
    const result = await getGallery();
    setImages(result);
    setRefreshing(false);
  };

  useEffect(() => { fetchImages(); }, []);

  const filtered = filter === "all"
    ? images
    : images.filter(img => img.ml_result === filter);

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filters}>
        {(["all", "dry", "not_dry"] as const).map(f => (
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchImages(); }} tintColor={C.amber} />}
        renderItem={({ item }) => <ImageCard item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyText}>No images yet</Text>
            <Text style={styles.emptySubText}>Images are captured every 15 minutes</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: C.bg },
  filters:            { flexDirection: "row", padding: 16, paddingBottom: 0, gap: 8 },
  filterBtn:          { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: "center" },
  filterBtnActive:    { backgroundColor: C.amber, borderColor: C.amber },
  filterText:         { color: C.muted, fontSize: 10, letterSpacing: 2, fontFamily: "monospace" },
  filterTextActive:   { color: C.bg, fontWeight: "700" },
  row:                { justifyContent: "space-between", marginBottom: 12 },
  imageCard:          { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: "hidden" },
  image:              { width: "100%", height: ITEM_SIZE, resizeMode: "cover" },
  imagePlaceholder:   { width: "100%", height: ITEM_SIZE * 0.7, backgroundColor: C.border, justifyContent: "center", alignItems: "center" },
  placeholderIcon:    { fontSize: 28 },
  placeholderText:    { color: C.muted, fontSize: 10, marginTop: 4, fontFamily: "monospace" },
  mlBadge:            { flexDirection: "row", justifyContent: "space-between", borderWidth: 1, margin: 8, borderRadius: 6, padding: 6 },
  mlBadgeText:        { fontSize: 10, fontWeight: "700", letterSpacing: 1, fontFamily: "monospace" },
  mlConf:             { fontSize: 10, fontFamily: "monospace" },
  timestamp:          { color: C.muted, fontSize: 9, paddingHorizontal: 8, paddingBottom: 8, fontFamily: "monospace" },
  empty:              { alignItems: "center", marginTop: 80 },
  emptyIcon:          { fontSize: 48, marginBottom: 12 },
  emptyText:          { color: C.text, fontSize: 16, fontFamily: "monospace" },
  emptySubText:       { color: C.muted, fontSize: 11, marginTop: 6, fontFamily: "monospace" },
});
