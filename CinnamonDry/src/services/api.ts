import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE = Constants.expoConfig?.extra?.apiBase || 'http://YOUR_BACKEND_IP:3000/api'; // ← CHANGE THIS

export const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

export interface DeviceStatus {
  temperature: number;
  humidity: number;
  fanOn: boolean;
  heaterOn: boolean;
  mlDecision: 'yes' | 'no';
  lastImageUrl: string;
  timestamp: string;
}

export interface ImageItem {
  id: string;
  url: string;
  timestamp: string;
  decision: 'yes' | 'no';
}

export const apiService = {
  getStatus: () => api.get<DeviceStatus>('/device/status'),
  getImages: (limit = 20) => api.get<ImageItem[]>('/images', { params: { limit } }),
  getHistory: (hours = 24) => api.get('/history', { params: { hours } }),
  controlDevice: (device: 'fan' | 'heater', action: 'on' | 'off') =>
    api.post('/control', { device, action }),
};