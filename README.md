# Stellantis Cloud-Based Vehicle Health & Predictive Maintenance Platform

> A full-stack Software-Defined Vehicle (SDV) cloud telemetry platform built for Stellantis connected vehicles (*Jeep, Fiat, Alfa Romeo, Peugeot, RAM, Maserati*).  
> Integrates real-time ECU telemetry processing, auditable 0–100 health scoring, predictive degradation slope analytics, UNECE R155 cybersecurity compliance, and Google Gemini LLM diagnostics.

---

## ⚡ Quick Start (Run Locally)

### Prerequisites
- **Node.js 18+** & npm
- **Python 3.11+**
- **Google Gemini API Key** (Optional — offline domain fallback available)

---

### 1. Launch FastAPI Backend (Port 8000)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file with your Gemini API key (optional)
echo "GEMINI_API_KEY=your_gemini_api_key" > .env

# Start FastAPI server
PYTHONPATH=. python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- 🌐 **Backend API Server**: `http://localhost:8000`
- 📚 **Interactive Swagger OpenAPI Docs**: `http://localhost:8000/docs`

---

### 2. Launch Next.js 15 Dark Glassmorphism Frontend (Port 3000)

```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start Next.js development server
npm run dev
```

- 🏎️ **Vehicle Health Dashboard**: `http://localhost:3000`
- 🎛️ **Custom Telemetry Test Lab**: `http://localhost:3000/simulator`

---

## 🌟 Key Features & Highlights

1. **📊 Fleet Overview Dashboard (`/`)**: Executive summary showing total fleet size, critical alerts count, high-risk predictions, average health score, and vehicle directory.
2. **🏎️ Vehicle Deep-Dive Inspection (`/vehicle/[id]`)**: Detailed view with 3 SVG circular score gauges (Vehicle Health, HV Battery Pack, Cybersecurity Audit), real-time ECU metrics, Recharts time-series graphs, and a 3-sentence Gemini AI diagnostic summary.
3. **🎛️ Custom Sensor Telemetry Test Lab (`/simulator`)**: Interactive form allowing invigilators to adjust Battery Charge %, Pack Voltage, Battery Temp, Coolant Temp, Oil Pressure, ECU Temp, Speed, RPM, CPU %, RAM %, CAN Bus Errors, Encryption Status, GPS coordinates, and DTC Fault Codes with real-time <50ms recalculated scores and predictive alerts.
4. **📈 Time-Series Telemetry Analytics (`/telemetry`)**: Deep historical signal graphs (Pack Voltage, Battery Temp, CPU Load, CAN error spikes).
5. **🔮 Predictive Maintenance Center (`/alerts`)**: Severity-coded alerts (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) with countdown days to service.
6. **🤖 Google Gemini AI Diagnostic Assistant (`/ai-assistant`)**: Natural-language Q&A assistant for drivers and service technicians.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 15 (React 18, TypeScript) | Server & Client components with App Router |
| **Styling** | Tailwind CSS 3.4 | Dark Glassmorphism design system (`glass-panel`, `glass-card`) |
| **Visualization** | Recharts 2.12 | Responsive dual-axis time-series area & line charts |
| **Icons** | Lucide React | Vector automotive iconography |
| **Backend** | FastAPI 0.115 (Python 3.12) | Asynchronous REST API framework with Uvicorn ASGI server |
| **Database** | SQLite + SQLAlchemy 2.0 ORM | Single-file zero-config database (`app.db`) |
| **Scoring Engine** | Pure Python Math (`scoring_engine.py`) | Auditable linear-clamp 0–100 health math |
| **Rule Engine** | Degradation Slopes (`rule_engine.py`) | Trend slope analysis ($>0.5^\circ\text{C}$ rise/reading, CAN error escalation) |
| **AI Intelligence** | Google Gemini API (`gemini-1.5-flash`) | Diagnostic text generator with offline fallback engine |

---

## 📄 Documentation Directory

Detailed documentation is available in the `docs/` folder:
- 📖 [docs/BACKEND_ARCHITECTURE.md](docs/BACKEND_ARCHITECTURE.md): Complete backend specification & data flow.
- 🎨 [docs/FRONTEND_ARCHITECTURE.md](docs/FRONTEND_ARCHITECTURE.md): Next.js component hierarchy & page breakdown.
- 🛠️ [docs/TECH_STACK.md](docs/TECH_STACK.md): Full technology stack reference guide.
- 💡 [docs/REAL_WORLD_IMPACT.md](docs/REAL_WORLD_IMPACT.md): Business value, ROI, and real-world automotive use cases.
- 📝 [docs/Stellantis_Tech_Stack_and_Architecture.docx](docs/Stellantis_Tech_Stack_and_Architecture.docx): Formatted Word document.

---

## 🛠️ REST API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles` | List all 20 connected fleet vehicles |
| `GET` | `/api/vehicles/{id}` | Get detailed specs & scores for a single vehicle |
| `GET` | `/api/telemetry/{id}` | Fetch time-series ECU sensor telemetry |
| `GET` | `/api/health/{id}` | Historical calculated health score snapshots |
| `GET` | `/api/alerts` | List all active fleet-wide predictive alerts |
| `GET` | `/api/maintenance/{id}` | Recommended repair actions & estimated hours |
| `POST` | `/api/analyze/{id}` | Trigger scoring engine calculation live |
| `POST` | `/api/predict/{id}` | Trigger predictive rule engine live |
| `POST` | `/api/simulate` | Submit custom telemetry inputs & receive recalculated scores |
| `POST` | `/api/chat` | Interactive Gemini AI diagnostic assistant chat |
| `GET` | `/api/summary/{id}` | Gemini 3-sentence diagnostic rationale |

---

## 📄 License

Built for the **Stellantis Tech Hackathon**. All rights reserved.
