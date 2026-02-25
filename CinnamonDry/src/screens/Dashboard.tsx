import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { apiService, DeviceStatus } from '../services/api';
import { Image } from 'expo-image';
import { format } from 'date-fns';

export default function Dashboard() {
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await apiService.getStatus();
      setStatus(data);
      if (data.mlDecision === 'yes' && status?.mlDecision !== 'yes') {
        // Trigger notification
        // (add expo-notifications scheduling here if you want push)
        alert('🎉 Cinnamon bark is optimally dry!');
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStatus(); const i = setInterval(fetchStatus, 10000); return () => clearInterval(i); }, []);

  if (!status) return <Text>Loading...</Text>;

  const isOptimal = status.mlDecision === 'yes';

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStatus} />} className="flex-1 bg-gray-950 p-4">
      <View className="bg-gray-900 rounded-3xl p-6 mb-6">
        <Text className="text-5xl font-bold text-white text-center">{status.temperature.toFixed(1)}°C</Text>
        <Text className="text-emerald-400 text-center text-xl">Temperature</Text>
      </View>

      <View className="bg-gray-900 rounded-3xl p-6 mb-6">
        <Text className="text-5xl font-bold text-white text-center">{status.humidity.toFixed(1)}%</Text>
        <Text className="text-sky-400 text-center text-xl">Humidity</Text>
      </View>

      <View className="bg-gray-900 rounded-3xl p-6">
        <Text className="text-2xl font-semibold text-white">ML Decision</Text>
        <Text className={`text-6xl font-bold mt-2 ${isOptimal ? 'text-emerald-500' : 'text-amber-500'}`}>
          {isOptimal ? '✅ OPTIMAL' : '⏳ DRYING'}
        </Text>
        <Text className="text-gray-400 mt-4">Last image: {format(new Date(status.timestamp), 'HH:mm')}</Text>
      </View>

      <Image source={{ uri: status.lastImageUrl }} style={{ height: 300, borderRadius: 20, marginTop: 20 }} contentFit="cover" />
    </ScrollView>
  );
}