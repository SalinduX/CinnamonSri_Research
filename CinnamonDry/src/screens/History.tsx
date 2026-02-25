import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { apiService } from '../services/api';
import { format, subHours } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

type HistoryPoint = {
  timestamp: string;
  temperature: number;
  humidity: number;
};

export default function History() {
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      setRefreshing(true);
      // Assuming backend supports ?hours=24
      const { data: points } = await apiService.getHistory(24);
      setData(points);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (data.length === 0) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <Text className="text-gray-400">No history data yet</Text>
      </View>
    );
  }

  const labels = data.map((p) =>
    format(new Date(p.timestamp), 'HH:mm')
  );

  const tempData = {
    labels,
    datasets: [
      {
        data: data.map((p) => p.temperature),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2.5,
      },
    ],
  };

  const humData = {
    labels,
    datasets: [
      {
        data: data.map((p) => p.humidity),
        color: (opacity = 1) => `rgba(56, 189, 248, ${opacity})`,
        strokeWidth: 2.5,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#1F2937',
    backgroundGradientTo: '#1F2937',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: () => '#9CA3AF',
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#111827' },
  };

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchHistory} />}
      className="flex-1 bg-gray-950"
    >
      <View className="p-5">
        <Text className="text-white text-2xl font-bold mb-6">Last 24 Hours</Text>

        <View className="bg-gray-900 rounded-3xl p-5 mb-6">
          <Text className="text-blue-400 text-xl font-semibold mb-4">Temperature (°C)</Text>
          <LineChart
            data={tempData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        <View className="bg-gray-900 rounded-3xl p-5">
          <Text className="text-sky-400 text-xl font-semibold mb-4">Relative Humidity (%)</Text>
          <LineChart
            data={humData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        <View className="mt-8 mb-6 items-center">
          <Text className="text-gray-500 text-sm">
            Data points: {data.length} • Updated {format(new Date(), 'HH:mm')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}