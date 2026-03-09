# 🌿 CinnamonSri

**Smart Cinnamon Increase Efficiency and Export Quality  Platform**

A full-stack IoT system that monitors and controls cinnamon bark drying using a Raspberry Pi, DHT22 sensor, relay-controlled heater/fan, OV5647 camera, and an Edge Impulse ML model — all viewable through a React Native mobile app built with Expo SDK 54.

---

## 📱 App Modules

| Module | Description | Status |
|--------|-------------|--------|
| 🌿 **CinnDry** | Real-time bark drying monitor — temperature, humidity, heater/fan control, ML dryness detection, photo gallery, system logs | ✅ Live |
| 🔮 **CinnOracle** | AI market intelligence — price prediction, weather analysis, demand forecasting | 🔜 Soon |
| 🌱 **CinnHarvest** | Plantation & harvest manager — crop tracking, harvest planning, field mapping | 🔜 Soon |
| 🛡️ **CinnGuard** | Plantation protection — pest detection, alerts, health reports, treatment advisor | 🔜 Soon |

---

## 🗂️ Project Structure

```
CinnamonDry/
│
├── App.tsx                              ← Root stack navigator
├── app.json                             ← Expo config (SDK 54)
├── package.json                         ← Dependencies
├── tsconfig.json                        ← TypeScript config
├── babel.config.js                      ← Babel config
│
└── src/
    ├── components/
    │   ├── theme.ts                     ← Cinnamon color palette, fonts, shadows
    │   └── ui.tsx                       ← Shared UI: SpiceCard, StatusPill, BarkProgress...
    │
    ├── services/
    │   └── api.ts                       ← All Pi API calls (or mock data for demo)
    │
    ├── types/
    │   └── index.ts                     ← TypeScript interfaces: SensorData, LogEntry, CapturedImage
    │
    └── screens/
        ├── HomeScreen.tsx               ← Landing page — navigates to all modules
        │
        ├── CinnDry/                     ← Sali's complete bark drying module
        │   ├── index.tsx                ← Bottom tab navigator for CinnDry
        │   ├── Dashboard.tsx            ← Live temp, humidity, heater/fan, ML result
        │   ├── Controls.tsx             ← Thresholds, live readings, control logic
        │   ├── Gallery.tsx              ← Captured bark photos with ML badges
        │   ├── History.tsx              ← System log viewer (color-coded)
        │   └── Insights.tsx             ← Drying rate, condition scores, tips
        │
        ├── CinnOracle/
        │   └── index.tsx                ← Placeholder (member 2 adds screens here)
        ├── CinnHarvest/
        │   └── index.tsx                ← Placeholder (member 3 adds screens here)
        └── CinnGuard/
            └── index.tsx                ← Placeholder (member 4 adds screens here)
```

---

## 🔧 Hardware Setup

### Components
- Raspberry Pi 3/4
- DHT22 temperature & humidity sensor
- OV5647 camera module (CSI port)
- 2× relay modules (heater + fan)
- 10kΩ resistor (for DHT22 data line)

### Wiring

| Component | Pi Pin | GPIO |
|-----------|--------|------|
| DHT22 VCC | Pin 1 (3.3V) | — |
| DHT22 DATA | Pin 7 | GPIO4 |
| DHT22 GND | Pin 6 | — |
| Heater Relay VCC | Pin 2 (5V) | — |
| Heater Relay IN | Pin 13 | GPIO27 |
| Heater Relay GND | Pin 9 | — |
| Fan Relay VCC | Pin 2 (5V) | — |
| Fan Relay IN | Pin 11 | GPIO17 |
| Fan Relay GND | Pin 14 | — |

> **Relay type:** Active LOW — `LOW signal = ON`, `HIGH signal = OFF`

---

## ⚙️ Control Logic

| Condition | Action |
|-----------|--------|
| `temp < 40°C` | Heater turns **ON** |
| `temp > 55°C` | Heater turns **OFF** |
| Always | Fan stays **ON** |
| Every 15 min | Camera captures photo |
| ML confidence > 70% | Bark declared **dry** |

**Drying rate formula:**
```
rate      = (temp / 45) × (50 / humidity)
total_time = 360 / rate   (minutes)
```

---

## 💾 Data Storage (Pi File System)

There is no traditional database. All data is stored as simple files on the Pi's SD card:

| File | Location | Written by | Read by |
|------|----------|-----------|---------|
| `state.json` | `/home/sali/bark_dry_project/` | `bark_dry_control.py` | `api.py /status` |
| `bark_dry_log.txt` | `/home/sali/bark_dry_project/` | `bark_dry_control.py` | `api.py /logs` |
| `captures/*.jpg` | `/home/sali/bark_dry_project/captures/` | `bark_dry_control.py` | `api.py /image/<filename>` |
| `captures/*.json` | `/home/sali/bark_dry_project/captures/` | `bark_dry_control.py` | `api.py /gallery` |

### state.json structure
```json
{
  "temp": 47.3,
  "humidity": 52.1,
  "heater": "ON",
  "fan": "ON",
  "elapsed": 142,
  "remaining": 218,
  "remaining_str": "3h 38m",
  "status": "In progress",
  "ml_result": "not_dry",
  "ml_confidence": 81.5,
  "photo_count": 9,
  "last_updated": "2026-03-08 14:32:10",
  "drying_start": "2026-03-08 12:10:00"
}
```

---

## 🌐 API Endpoints (Flask — port 5000)

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/status` | Current sensor data from `state.json` |
| GET | `/logs` | Last 60 lines from `bark_dry_log.txt` |
| GET | `/gallery` | List of captured images + ML metadata |
| GET | `/image/<filename>` | Serves the actual `.jpg` photo file |

---

## 🚀 Setup & Run

### 1. Backend — Raspberry Pi

**Install dependencies:**
```bash
sudo apt install -y python3-picamera2 portaudio19-dev python3-pyaudio libgpiod2

cd /home/sali/bark_dry_project
python3 -m venv venv --system-site-packages
source venv/bin/activate

pip install edge_impulse_linux six pyaudio numpy opencv-python \
            requests adafruit-circuitpython-dht flask flask-cors
```

**Copy backend files to Pi:**
```bash
cp bark_dry_control.py /home/sali/bark_dry_project/
cp api.py              /home/sali/bark_dry_project/
```

**Add your Edge Impulse model:**
```bash
# Download .eim from https://studio.edgeimpulse.com
# Deployment → Linux (AARCH64) → Build
chmod +x /home/sali/bark_dry_project/model_test.eim
```

**Run (two terminals):**
```bash
# Terminal 1 — controller
cd /home/sali/bark_dry_project && source venv/bin/activate
python bark_dry_control.py

# Terminal 2 — API server
cd /home/sali/bark_dry_project && source venv/bin/activate
python api.py
```

**Find your Pi IP:**
```bash
hostname -I
# e.g. 192.168.1.105
```

---

### 2. Frontend — React Native App

**Install dependencies:**
```bash
npm install
```

**Set your Pi IP in `src/services/api.ts`:**
```typescript
export const API_BASE = "http://192.168.1.105:5000";
//                              ↑ change this to your Pi's IP
```

**Run:**
```bash
npx expo start
```
Scan the QR code with **Expo Go (SDK 54)** on your phone.

> 📡 Your phone and Pi must be on the **same WiFi network**.

---

### 3. Demo Mode (No Pi needed)

The `CinnApp_Static` version uses mock data — no Pi, no IP setup needed:
```bash
# Just install and run — works immediately
npm install
npx expo start
```

---

## 👥 Team — How to Add Your Module

Each team member adds their screens inside their module folder:

### Frontend
```
src/screens/CinnOracle/    ← Member 2
src/screens/CinnHarvest/   ← Member 3
src/screens/CinnGuard/     ← Member 4
```

**Steps:**
1. Create your screen files inside your folder
2. Import shared theme: `import { C, FONTS } from "../../components/theme"`
3. Import API if needed: `import { getSensorData } from "../../services/api"`
4. Register your screens inside your `index.tsx` (replace placeholder content)

### Git Workflow
```bash
# Pull latest changes before starting work
git pull origin main

# Create your own branch
git checkout -b feature/cinndry-my-screen

# Push your work
git add .
git commit -m "feat(CinnOracle): add price prediction screen"
git push origin feature/cinndry-my-screen

# Open a Pull Request on GitHub
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Hardware | Raspberry Pi 3/4 |
| Sensor | DHT22 (temp + humidity) |
| Camera | OV5647 via CSI |
| Relays | Active LOW 5V relay modules |
| ML Model | Edge Impulse `.eim` (Linux AARCH64) |
| Backend language | Python 3 |
| Backend framework | Flask + Flask-CORS |
| Camera library | picamera2 |
| GPIO library | RPi.GPIO + adafruit-circuitpython-dht |
| Frontend framework | React Native + Expo SDK 54 |
| Frontend language | TypeScript |
| Navigation | React Navigation v7 |
| React Native version | 0.76.7 |
| React version | 18.3.1 |

---

## 🐛 Troubleshooting

**App cannot reach Pi:**
- Check `API_BASE` IP in `src/services/api.ts`
- Confirm phone and Pi are on same WiFi
- Run `hostname -I` on Pi to get correct IP
- Ensure `python api.py` is running on Pi

**DHT22 sensor fails to read:**
```bash
# Check wiring — 10kΩ pull-up resistor between VCC and DATA is required
# Retry — DHT22 occasionally misses readings, the controller auto-retries
```

**ML model not found:**
```bash
# Ensure model file exists and is executable
ls /home/sali/bark_dry_project/model_test.eim
chmod +x /home/sali/bark_dry_project/model_test.eim
```

**Expo SDK version mismatch:**
```bash
# This app requires Expo Go with SDK 54
# Check your Expo Go version in the app settings
npx expo start --clear
```

**npm install errors:**
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

---

## 📄 License

This project was developed as part of an academic/research project on smart agricultural IoT systems.

---

*CinnamonDry Platform · v1.0 · Powered by Raspberry Pi + Edge Impulse ML*
