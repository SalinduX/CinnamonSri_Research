import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { format, formatDistanceToNow } from 'date-fns';
import { apiService, ImageItem } from '../services/api';
import { CheckCircle2, XCircle } from 'lucide-react-native';

export default function Gallery() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadImages = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
      setPage(1);
      setHasMore(true);
    } else if (!hasMore || loadingMore) {
      return;
    }

    if (!refresh) setLoadingMore(true);

    try {
      const limit = 12;
      const { data } = await apiService.getImages(limit);

      if (refresh) {
        setImages(data);
      } else {
        setImages((prev) => [...prev, ...data]);
      }

      if (data.length < limit) setHasMore(false);
      if (!refresh) setPage((p) => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadImages(true);
  }, []);

  const renderItem = ({ item }: { item: ImageItem }) => {
    const isOptimal = item.decision === 'yes';

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        className="mb-4 rounded-2xl overflow-hidden bg-gray-900"
        onPress={() => {
          // You could open a modal with full-screen image + metadata
          console.log('Tapped image:', item.id);
        }}
      >
        <Image
          source={{ uri: item.url }}
          style={{ width: '100%', height: 220 }}
          contentFit="cover"
          transition={200}
        />

        <View className="absolute top-3 right-3">
          {isOptimal ? (
            <CheckCircle2 size={36} color="#10B981" fill="#10B981" />
          ) : (
            <XCircle size={36} color="#F59E0B" fill="#F59E0B" />
          )}
        </View>

        <View className="p-4">
          <Text className="text-white font-medium">
            {format(new Date(item.timestamp), 'dd MMM yyyy • HH:mm')}
          </Text>
          <Text className="text-gray-400 text-sm mt-1">
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={images}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={1}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadImages(true)} />}
      onEndReached={() => loadImages()}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? (
          <View className="py-6 items-center">
            <Text className="text-gray-400">Loading more images...</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-400 text-lg">No images yet</Text>
        </View>
      }
    />
  );
}