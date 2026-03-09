import { SensorData, LogEntry, CapturedImage } from "../types/index";

export const API_BASE = "http://172.20.10.2:5000"; // ← Change to your Pi IP
const TIMEOUT = 5000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function getSensorData(): Promise<{ data: SensorData | null; connected: boolean }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/status`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return { data: await res.json() as SensorData, connected: true };
  } catch {
    return { data: null, connected: false };
  }
}

export async function getLogs(): Promise<{ logs: LogEntry[]; connected: boolean }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/logs`);
    if (!res.ok) throw new Error();
    const json = await res.json();
    return { logs: json.logs as LogEntry[], connected: true };
  } catch {
    return { logs: [], connected: false };
  }
}

export async function getGallery(): Promise<{ images: CapturedImage[]; connected: boolean }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/gallery`);
    if (!res.ok) throw new Error();
    const json = await res.json();
    return { images: json.images as CapturedImage[], connected: true };
  } catch {
    return { images: [], connected: false };
  }
}

export function getImageUrl(filename: string): string {
  return `${API_BASE}/image/${filename}`;
}
