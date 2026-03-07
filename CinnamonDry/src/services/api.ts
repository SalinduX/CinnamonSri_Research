import { SensorData, LogEntry, CapturedImage, DryingSession } from "../types/react-navigation";

// ---- Change this to your Raspberry Pi IP ----
const API_BASE = "http://YOUR_PI_IP:5000";
const TIMEOUT  = 5000; // 5 seconds

// ---- Mock Data (used when Pi is not reachable) ----
const mockSensorData: SensorData = {
  temp:          43.5,
  humidity:      58.2,
  heater:        "OFF",
  fan:           "ON",
  elapsed:       45,
  remaining:     287,
  status:        "In progress",
  ml_result:     "not_dry",
  ml_confidence: 82.3,
};

const mockLogs: LogEntry[] = [
  { timestamp: "2026-03-07 16:12:36", message: "BARK DRYER CONTROLLER START",           level: "INFO"    },
  { timestamp: "2026-03-07 16:12:38", message: "Temp: 43.5C  Humidity: 58.2%",          level: "INFO"    },
  { timestamp: "2026-03-07 16:12:38", message: "HEATER OFF -> temp above 40C",           level: "INFO"    },
  { timestamp: "2026-03-07 16:12:38", message: "DRYING STATUS: In progress",             level: "SUCCESS" },
  { timestamp: "2026-03-07 16:12:38", message: "Remaining time: 4 hr 47 min",            level: "INFO"    },
  { timestamp: "2026-03-07 16:27:38", message: "Photo captured!",                        level: "INFO"    },
  { timestamp: "2026-03-07 16:27:39", message: "ML decision: not_dry (82.3%)",           level: "INFO"    },
  { timestamp: "2026-03-07 16:27:39", message: "RESULT: NO - bark not dry yet",          level: "WARNING" },
];

const mockImages: CapturedImage[] = [
  { id: "1", uri: "", timestamp: "2026-03-07 16:27:38", ml_result: "not_dry", confidence: 82.3 },
  { id: "2", uri: "", timestamp: "2026-03-07 16:42:38", ml_result: "not_dry", confidence: 76.1 },
  { id: "3", uri: "", timestamp: "2026-03-07 16:57:38", ml_result: "dry",     confidence: 91.5 },
];

const mockSessions: DryingSession[] = [
  { id: "1", startTime: "2026-03-06 09:00", endTime: "2026-03-06 15:00", avgTemp: 45.2, avgHumidity: 55.1, result: "dry",        duration: 360 },
  { id: "2", startTime: "2026-03-05 08:30", endTime: "2026-03-05 14:00", avgTemp: 42.8, avgHumidity: 61.3, result: "dry",        duration: 330 },
  { id: "3", startTime: "2026-03-04 10:00", endTime: "2026-03-04 14:30", avgTemp: 38.5, avgHumidity: 68.4, result: "incomplete", duration: 270 },
];

// ---- Fetch helper with timeout ----
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ---- API Functions ----
export async function getSensorData(): Promise<{ data: SensorData; connected: boolean }> {
  try {
    const res  = await fetchWithTimeout(`${API_BASE}/status`);
    const json = await res.json();
    return { data: json as SensorData, connected: true };
  } catch {
    return { data: mockSensorData, connected: false };
  }
}

export async function getLogs(): Promise<LogEntry[]> {
  try {
    const res  = await fetchWithTimeout(`${API_BASE}/logs`);
    const json = await res.json();
    return json.logs as LogEntry[];
  } catch {
    return mockLogs;
  }
}

export async function getGallery(): Promise<CapturedImage[]> {
  try {
    const res  = await fetchWithTimeout(`${API_BASE}/gallery`);
    const json = await res.json();
    return json.images as CapturedImage[];
  } catch {
    return mockImages;
  }
}

export async function getSessions(): Promise<DryingSession[]> {
  try {
    const res  = await fetchWithTimeout(`${API_BASE}/sessions`);
    const json = await res.json();
    return json.sessions as DryingSession[];
  } catch {
    return mockSessions;
  }
}
