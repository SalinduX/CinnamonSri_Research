import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { apiService, DeviceStatus } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle2, Clock, Thermometer, Droplets } from 'lucide-react-native';

export default function Insights() {
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const { data } = await apiService.getStatus();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 20000);
    return () => clearInterval(i);
  }, []);

  if (!status) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <Text className="text-gray-400">Loading insights...</Text>
      </View>
    );
  }

  const isOptimal = status.mlDecision === 'yes';

  // Very simple remaining time heuristic (you should improve this with real model/data)
  const getSuggestionAndTime = () => {
    if (isOptimal) {
      return {
        title: 'Optimal drying condition reached',
        message: 'Bark is ready. Recommend removing from dryer now.',
        color: 'emerald',
        icon: CheckCircle2,
        remaining: 'Done',
      };
    }

    if (status.humidity > 65) {
      return {
        title: 'High moisture detected',
        message: 'Strongly recommend running the fan longer.',
        color: 'amber',
        icon: AlertTriangle,
        remaining: '8–14 hours',
      };
    }

    if (status.temperature < 45) {
      return {
        title: 'Temperature too low',
        message: 'Heater should be activated to speed up drying safely.',
        color: 'rose',
        icon: Thermometer,
        remaining: '12–20 hours',
      };
    }

    return {
      title: 'Drying in progress',
      message: 'Conditions are acceptable — continue current settings.',
      color: 'blue',
      icon: Clock,
      remaining: '4–9 hours',
    };
  };

  const insight = getSuggestionAndTime();

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
      className="flex-1 bg-gray-950 p-5"
    >
      <View className={`rounded-3xl p-6 mb-6 bg-${insight.color}-950 border border-${insight.color}-800/40`}>
        <View className="flex-row items-center mb-4">
          <insight.icon size={32} color={insight.color === 'emerald' ? '#10B981' : '#F59E0B'} />
          <Text className={`text-2xl font-bold ml-3 text-${insight.color}-300`}>
            {insight.title}
          </Text>
        </View>

        <Text className="text-gray-200 text-lg leading-6">{insight.message}</Text>

        <View className="mt-6 bg-black/30 rounded-2xl p-5">
          <Text className="text-gray-300 text-base">Estimated remaining time:</Text>
          <Text className={`text-4xl font-bold mt-2 text-${insight.color}-400`}>
            {insight.remaining}
          </Text>
        </View>
      </View>

      {/* Current readings summary */}
      <View className="bg-gray-900 rounded-3xl p-6 mb-6">
        <Text className="text-xl font-semibold text-white mb-4">Current Conditions</Text>

        <View className="flex-row justify-between mb-4">
          <View className="items-center">
            <Thermometer size={28} color="#60A5FA" />
            <Text className="text-white text-2xl font-bold mt-2">{status.temperature.toFixed(1)}°C</Text>
            <Text className="text-gray-400">Temperature</Text>
          </View>
          <View className="items-center">
            <Droplets size={28} color="#38BDF8" />
            <Text className="text-white text-2xl font-bold mt-2">{status.humidity.toFixed(1)}%</Text>
            <Text className="text-gray-400">Humidity</Text>
          </View>
        </View>

        <Text className="text-gray-500 text-sm mt-2">
          Last update {formatDistanceToNow(new Date(status.timestamp), { addSuffix: true })}
        </Text>
      </View>

      {/* Add more insight cards if you collect history / trends */}
    </ScrollView>
  );
}