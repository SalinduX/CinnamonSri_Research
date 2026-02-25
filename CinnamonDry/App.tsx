import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Dashboard from './src/screens/Dashboard';
import Controls from './src/screens/Controls';
import Gallery from './src/screens/Gallery';
import Insights from './src/screens/Insights';
import History from './src/screens/History';
import { Thermometer, Fan, Image, Brain, BarChart3 } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#1F2937' },
            headerTintColor: '#fff',
            tabBarStyle: { backgroundColor: '#1F2937', borderTopColor: '#374151' },
            tabBarActiveTintColor: '#22C55E',
            tabBarInactiveTintColor: '#9CA3AF',
          }}
        >
          <Tab.Screen name="Dashboard" component={Dashboard} options={{ tabBarIcon: ({ color }: { color: string }) => <Thermometer color={color} size={24} /> }} />
          <Tab.Screen name="Controls" component={Controls} options={{ tabBarIcon: ({ color }: { color: string }) => <Fan color={color} size={24} /> }} />
          <Tab.Screen name="Gallery" component={Gallery} options={{ tabBarIcon: ({ color }: { color: string }) => <Image color={color} size={24} /> }} />
          <Tab.Screen name="Insights" component={Insights} options={{ tabBarIcon: ({ color }: { color: string }) => <Brain color={color} size={24} /> }} />
          <Tab.Screen name="History" component={History} options={{ tabBarIcon: ({ color }: { color: string }) => <BarChart3 color={color} size={24} /> }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}