# CinnamonSri — Smart Cinnamon production enhancing and efficient System


# CinnamonDry — Smart Bark Dryer System

A Raspberry Pi powered cinnamon bark drying system with ML-based dryness detection
and a React Native mobile app for monitoring and control.

---

## Project Structure

```
CinnamonSri_Research/
│
├── frontend/                        ← React Native mobile app (TypeScript)
│   ├── member1_salindu/                ← Salindu's complete app (WORKING)
│   │   ├── App.tsx                  ← Navigation entry point
│   │   └── src/
│   │       ├── components/
│   │       │   ├── theme.ts         ← Cinnamon color palette & fonts
│   │       │   └── ui.tsx           ← Shared UI components
│   │       ├── screens/
│   │       │   ├── Dashboard.tsx    ← Live temp/humidity/status
│   │       │   ├── Controls.tsx     ← Thresholds & live readings
│   │       │   ├── Gallery.tsx      ← Captured bark photos
│   │       │   ├── History.tsx      ← System log viewer
│   │       │   └── Insights.tsx     ← Drying analytics & tips
│   │       ├── services/
│   │       │   └── api.ts           ← Pi API connection
│   │       └── types/
│   │           └── react-navigation.ts  ← TypeScript interfaces
│   │
│   ├── member2/                     ← Member 2 screens (add here)
│   ├── member3/                     ← Member 3 screens (add here)
│   └── member4/                     ← Member 4 screens (add here)
│
└── backend/                         ← Raspberry Pi Python code
    ├── member1_salindu/                ← Salindu's Pi code (WORKING)
    │   ├── bark_dry_control.py      ← Main controller (heater/fan/camera/ML)
    │   └── api.py                   ← Flask API server (port 5000)
    │
    ├── member2/                     ← Member 2 Pi code (add here)
    ├── member3/                     ← Member 3 Pi code (add here)
    └── member4/                     ← Member 4 Pi code (add here)
```

---

## Member 1 (Salindu) — Setup & Run

### Backend (Raspberry Pi)
```bash
# 1. Go to project folder
cd /home/sali/bark_dry_project

# 2. Activate virtual environment
source venv/bin/activate

# 3. Install API dependencies
pip install flask flask-cors

# 4. Copy files to Pi
cp backend/member1_sali/bark_dry_control.py .
cp backend/member1_sali/api.py .

# 5. Terminal 1 — run controller
python bark_dry_control.py

# 6. Terminal 2 — run API
python api.py
```

### Frontend (Your Computer / Phone)
```bash
# 1. Go to Sali's frontend folder
cd frontend/member1_sali

# 2. Update Pi IP in src/services/api.ts
#    Change: export const API_BASE = "http://YOUR_PI_IP:5000"
#    To:     export const API_BASE = "http://192.168.1.xxx:5000"

# 3. Find your Pi IP on the Pi:
#    hostname -I

# 4. Install dependencies
npm install

# 5. Run app
npx expo start
```

---

## API Endpoints (port 5000)

| Endpoint              | Returns                                      |
|-----------------------|----------------------------------------------|
| GET /status           | temp, humidity, heater, fan, ML result, time |
| GET /logs             | last 60 lines from bark_dry_log.txt          |
| GET /gallery          | list of captured photos + ML metadata        |
| GET /image/<filename> | serve actual photo file                      |

---

## Files Created by Backend

| File                        | Created by             | Used by        |
|-----------------------------|------------------------|----------------|
| state.json                  | bark_dry_control.py    | api.py /status |
| bark_dry_log.txt            | bark_dry_control.py    | api.py /logs   |
| captures/*.jpg              | bark_dry_control.py    | api.py /gallery|
| captures/*.json             | bark_dry_control.py    | api.py /gallery|

---

## How Other Members Add Their Code

### Frontend (member2 / member3 / member4)
1. Open your folder: `frontend/memberX/`
2. Create `src/screens/YourScreen.tsx`
3. Copy `theme.ts` and `api.ts` from `member1_sali` to reuse
4. Add your screens to your own `App.tsx`

### Backend (member2 / member3 / member4)
1. Open your folder: `backend/memberX/`
2. Add your `.py` scripts
3. Reference `member1_sali` code for GPIO / sensor / camera patterns

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Hardware  | Raspberry Pi, DHT22, OV5647 cam   |
| ML Model  | Edge Impulse (.eim)               |
| Backend   | Python, Flask, picamera2, GPIO    |
| Frontend  | React Native, TypeScript, Expo    |
| Theme     | Cinnamon warm palette             |
