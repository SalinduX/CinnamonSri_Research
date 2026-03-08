import { SensorData, LogEntry, CapturedImage } from "../types";

// ---- Change this to your Raspberry Pi IP ----
export const API_BASE = "http://172.20.10.2:5000";
const TIMEOUT = 5000;

// ---- Fetch with timeout helper ----
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

// ---- GET /status → real sensor + heater/fan + ML + drying time ----
export async function getSensorData(): Promise<{
  data: SensorData | null;
  connected: boolean;
  error?: string;
}> {
  try {
    const res  = await fetchWithTimeout(`${API_BASE}/status`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json() as SensorData;
    return { data: json, connected: true };
  } catch (e: any) {
    return { data: null, connected: false, error: e.message };
  }
}

// ---- GET /logs → last 60 lines from bark_dry_log.txt ----
export async function getLogs(): Promise<{
  logs: LogEntry[];
  connected: boolean;
}> {
  try {
    const res  = await fetchWithTimeout(`${API_BASE}/logs`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    return { logs: json.logs as LogEntry[], connected: true };
  } catch {
    return { logs: [], connected: false };
  }
}

// ---- GET /gallery → list of captured images + ML metadata ----
export async function getGallery(): Promise<{
  images: CapturedImage[];
  connected: boolean;
}> {
  try {
    const res  = await fetchWithTimeout(`${API_BASE}/gallery`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    return { images: json.images as CapturedImage[], connected: true };
  } catch {
    return { images: [], connected: false };
  }
}

// ---- Image URL helper ----
export function getImageUrl(filename: string): string {
  return `${API_BASE}/image/${filename}`;
}
