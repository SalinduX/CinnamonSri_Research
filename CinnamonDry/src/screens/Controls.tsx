import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { apiService } from '../services/api';
import { Fan, Power } from 'lucide-react-native';

type Device = 'fan' | 'heater';

interface ControlState {
  fanOn: boolean;
  heaterOn: boolean;
  autoMode: boolean;
  loading: Record<Device | 'auto', boolean>;
}

export default function Controls() {
  const [state, setState] = useState<ControlState>({
    fanOn: false,
    heaterOn: false,
    autoMode: false,
    loading: { fan: false, heater: false, auto: false },
  });

  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = async () => {
    try {
      setRefreshing(true);
      const { data } = await apiService.getStatus();
      setState((prev) => ({
        ...prev,
        fanOn: data.fanOn,
        heaterOn: data.heaterOn,
        // autoMode would come from backend if you implement it there
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = async (device: Device) => {
    const current = device === 'fan' ? state.fanOn : state.heaterOn;
    const action = current ? 'off' : 'on';

    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, [device]: true },
    }));

    try {
      await apiService.controlDevice(device, action);
      setState((prev) => ({
        ...prev,
        [device + 'On']: !current,
      }));
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} ${device}`);
    } finally {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, [device]: false },
      }));
    }
  };

  const toggleAutoMode = () => {
    // This would usually talk to backend → here we simulate local toggle
    setState((prev) => ({
      ...prev,
      autoMode: !prev.autoMode,
      loading: { ...prev.loading, auto: true },
    }));

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, auto: false },
      }));
    }, 800);
  };

  const renderButton = (device: Device, icon: React.ReactNode, label: string) => {
    const isOn = device === 'fan' ? state.fanOn : state.heaterOn;
    const loading = state.loading[device];

    return (
      <View className={`flex-1 items-center justify-center p-8 rounded-3xl border-2 ${
        isOn ? 'bg-emerald-600 border-emerald-500' : 'bg-gray-800 border-gray-700'
      } ${state.autoMode ? 'opacity-50' : ''}`}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => !state.autoMode && toggleDevice(device)}
          disabled={loading || state.autoMode}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <>
              {icon}
              <Text className="text-white text-2xl font-bold mt-4">{label}</Text>
              <Text className="text-gray-300 mt-1">{isOn ? 'ON' : 'OFF'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-950 p-5">
      {/* Auto mode toggle */}
      <View className="bg-gray-900 rounded-2xl p-5 mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-white text-xl font-semibold">Automatic Mode</Text>
          <Text className="text-gray-400 mt-1">
            {state.autoMode ? 'AI controls fan & heater' : 'Manual control active'}
          </Text>
        </View>
        <Switch
          value={state.autoMode}
          onValueChange={toggleAutoMode}
          trackColor={{ false: '#4B5563', true: '#10B981' }}
          thumbColor={state.autoMode ? '#fff' : '#9CA3AF'}
          disabled={state.loading.auto}
        />
      </View>

      <View className="flex-row gap-4 mb-6">
        {renderButton('fan', <Fan color="#fff" size={64} />, 'Fan')}
        {renderButton('heater', <Power color="#fff" size={64} />, 'Heater')}
      </View>

      {state.autoMode && (
        <View className="bg-amber-950/60 border border-amber-700/40 rounded-2xl p-5">
          <Text className="text-amber-300 text-lg font-medium text-center">
            Automatic drying mode is active
          </Text>
          <Text className="text-amber-200/80 text-center mt-2">
            The system decides when to turn fan/heater on based on temperature, humidity and bark condition
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={fetchStatus}
        disabled={refreshing}
        className="mt-auto items-center py-4"
      >
        <Text className="text-gray-500">
          {refreshing ? 'Refreshing…' : 'Pull to refresh status'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}