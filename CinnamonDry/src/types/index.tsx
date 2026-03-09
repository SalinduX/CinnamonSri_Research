import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  CinnDry: NavigatorScreenParams<CinnDryTabParamList> | undefined;
  CinnOracle: undefined;
  CinnHarvest: undefined;
  CinnGuard: undefined;
};

export type CinnDryTabParamList = {
  Dashboard: undefined;
  Controls: undefined;
  Gallery: undefined;
  History: undefined;
  Insights: undefined;
};

export interface SensorData {
  temp: number;
  humidity: number;
  heater: 'ON' | 'OFF';
  fan: 'ON' | 'OFF';
  elapsed: number;
  remaining: number;
  remaining_str: string;
  status: 'In progress' | 'COMPLETE' | 'Starting';
  ml_result: 'dry' | 'not_dry' | 'unknown';
  ml_confidence: number;
  photo_count: number;
  last_updated: string;
  drying_start: string;
}

export interface LogEntry {
  raw: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
}

export interface CapturedImage {
  id: string;
  filename: string;
  timestamp: string;
  ml_result: 'dry' | 'not_dry' | 'unknown';
  confidence: number;
  temp?: number;
  humidity?: number;
}