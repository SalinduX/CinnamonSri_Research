// ---- Navigation Types ----
export type RootTabParamList = {
  Dashboard: undefined;
  Controls:  undefined;
  Gallery:   undefined;
  History:   undefined;
  Insights:  undefined;
};

// ---- Real sensor data from state.json via /status ----
export interface SensorData {
  temp:           number;
  humidity:       number;
  heater:         "ON" | "OFF";
  fan:            "ON" | "OFF";
  elapsed:        number;        // minutes since drying started
  remaining:      number;        // minutes remaining
  remaining_str:  string;        // e.g. "4h 23m"
  status:         "In progress" | "COMPLETE" | "Starting";
  ml_result:      "dry" | "not_dry" | "unknown";
  ml_confidence:  number;        // 0-100
  photo_count:    number;
  last_updated:   string;
  drying_start:   string;
}

// ---- Log entry from /logs ----
export interface LogEntry {
  raw:   string;
  level: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
}

// ---- Gallery image from /gallery ----
export interface CapturedImage {
  id:         string;
  filename:   string;
  timestamp:  string;
  ml_result:  "dry" | "not_dry" | "unknown";
  confidence: number;
}
