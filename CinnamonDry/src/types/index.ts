import { NavigatorScreenParams } from "@react-navigation/native";

// ─── Root Stack (Home + each module) ──────────────────────────────
export type RootStackParamList = {
  Home: undefined;
  CinnDry: undefined;
  CinnOracle: undefined;
  CinnHarvest: undefined;
  CinnGuard: undefined;
};

// ─── CinnDry internal tabs ─────────────────────────────────────────
export type CinnDryTabParamList = {
  Dashboard: undefined;
  Controls:  undefined;
  Gallery:   undefined;
  History:   undefined;
  Insights:  undefined;
};

// ─── Sensor data from Pi ───────────────────────────────────────────
export interface SensorData {
  photo_count: any;
  ml_confidence: string;
  remaining: number;
  elapsed: number;
  temp: number;
  humidity: number;
  heater: string;
  ml_result: "dry" | "not_dry" | "pending";
}

export interface LogEntry {
  raw:   string;
  level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
}

export interface CapturedImage {
  id:         string;
  filename:   string;
  timestamp:  string;
  ml_result:  "dry" | "not_dry" | "unknown";
  confidence: number;
  temp?:      number;
  humidity?:  number;
}
