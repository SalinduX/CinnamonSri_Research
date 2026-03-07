// ---- Navigation Types ----
export type RootTabParamList = {
  Dashboard: undefined;
  Controls:  undefined;
  Gallery:   undefined;
  History:   undefined;
  Insights:  undefined;
};

// ---- Sensor Data Types ----
export interface SensorData {
  temp:           number;
  humidity:       number;
  heater:         "ON" | "OFF";
  fan:            "ON" | "OFF";
  elapsed:        number;   // minutes
  remaining:      number;   // minutes
  status:         "In progress" | "COMPLETE";
  ml_result:      "dry" | "not_dry";
  ml_confidence:  number;   // 0-100
}

// ---- Log Entry Type ----
export interface LogEntry {
  timestamp: string;
  message:   string;
  level:     "INFO" | "WARNING" | "ERROR" | "SUCCESS";
}

// ---- Gallery Image Type ----
export interface CapturedImage {
  id:        string;
  uri:       string;
  timestamp: string;
  ml_result: "dry" | "not_dry";
  confidence: number;
}

// ---- Insights Type ----
export interface DryingSession {
  id:          string;
  startTime:   string;
  endTime:     string;
  avgTemp:     number;
  avgHumidity: number;
  result:      "dry" | "not_dry" | "incomplete";
  duration:    number; // minutes
}
