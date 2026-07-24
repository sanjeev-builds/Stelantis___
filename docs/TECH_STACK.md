# Stellantis Cloud Vehicle Health Platform — Technology Stack Guide

This document provides a comprehensive overview of the technology stack used in the **Stellantis Cloud-Based Vehicle Health & Predictive Maintenance Platform**. It explains **what** technologies are used, **where** they live in the project, **why** they were selected, and **how** they work together.

---

## 1. Summary Tech Stack Table

| Layer | Technology | Version / Tool | Where Used in Codebase | Purpose & Benefit |
|---|---|---|---|---|
| **Frontend Framework** | Next.js | 15.0+ (App Router) | `frontend/src/app/` | Single-page server & client routing, static optimization |
| **UI Library** | React | 18.3 | `frontend/src/components/` | Component-based state management & reactive UI |
| **Styling** | Tailwind CSS | 3.4 | `frontend/src/app/globals.css` | Dark glassmorphism design system, custom scrollbars, status badges |
| **Data Visualization** | Recharts | 2.12 | `frontend/src/components/TelemetryCharts.tsx` | Time-series graphs for voltage, temperature, CPU & CAN error trends |
| **UI Icons** | Lucide React | 0.446 | `frontend/src/components/` | Vector automotive icons (Battery, Shield, Activity, Sliders, Sparkles) |
| **HTTP Client** | Axios | 1.7 | `frontend/src/app/` | Client-side REST API calls to FastAPI backend |
| **Backend Framework** | FastAPI | 0.115 | `backend/app/main.py`, `endpoints.py` | High-performance Python REST API with automatic OpenAPI Swagger docs |
| **ASGI Web Server** | Uvicorn | 0.30 | `backend/app/main.py` | Asynchronous web server running the FastAPI app on port 8000 |
| **Data Validation** | Pydantic | 2.9 | `backend/app/schemas/schemas.py` | Strict type checking & JSON serialization for requests/responses |
| **Database ORM** | SQLAlchemy | 2.0 | `backend/app/db/database.py`, `models.py` | Type-safe Python database mapping for vehicles, telemetry, & alerts |
| **Database** | SQLite | SQLite 3 | `backend/app.db` | Zero-config, single-file relational database for fast local execution |
| **AI Layer** | Google Gemini API | `gemini-1.5-flash` | `backend/app/services/gemini_service.py` | Natural-language vehicle diagnostic rationale & AI advisor chat |
| **Automated Testing** | Pytest | 8.3 | `backend/tests/test_scoring.py` | Unit tests for 0–100 deterministic scoring math & normalizers |

---

## 2. Frontend Architecture & How Technologies Are Used

### 🟢 Next.js 15 (App Router)
- **Role**: Serves the user interface and handles page navigation.
- **How it is used**:
  - `/` → [Fleet Overview](file:///Users/satyaprakashpaikaray/Desktop/clod%20drive/Stelantis___/frontend/src/app/page.tsx): Fleet KPI cards, fleet health gauges, and vehicle directory.
  - `/vehicle/[id]` → [Vehicle Deep-Dive](file:///Users/satyaprakashpaikaray/Desktop/clod%20drive/Stelantis___/frontend/src/app/vehicle/[id]/page.tsx): Single-vehicle telemetry metrics, circular score gauges, and AI summary.
  - `/simulator` → [Custom Test Lab](file:///Users/satyaprakashpaikaray/Desktop/clod%20drive/Stelantis___/frontend/src/app/simulator/page.tsx): Live sensor telemetry input form for invigilators.
  - `/telemetry` → [Telemetry History](file:///Users/satyaprakashpaikaray/Desktop/clod%20drive/Stelantis___/frontend/src/app/telemetry/page.tsx): Historical signal analytics.
  - `/alerts` → [Risk Center](file:///Users/satyaprakashpaikaray/Desktop/clod%20drive/Stelantis___/frontend/src/app/alerts/page.tsx): Predictive maintenance alerts.
  - `/maintenance` → [Action Logs](file:///Users/satyaprakashpaikaray/Desktop/clod%20drive/Stelantis___/frontend/src/app/maintenance/page.tsx): Service recommendations.
  - `/ai-assistant` → [AI Advisor](file:///Users/satyaprakashpaikaray/Desktop/clod%20drive/Stelantis___/frontend/src/app/ai-assistant/page.tsx): Fullscreen AI Diagnostic Advisor dialogue.

### 🎨 Tailwind CSS (Dark Glassmorphism)
- **Role**: Visual presentation and UI styling.
- **How it is used**: Provides custom utility classes (`glass-panel`, `glass-card`, `badge-critical`, `badge-high`, `badge-low`) to create a sleek dark-theme dashboard tailored for automotive SDV cloud monitoring.

### 📈 Recharts
- **Role**: Time-series ECU telemetry data visualization.
- **How it is used**: Renders interactive dual-axis `AreaChart` and `LineChart` components tracking battery pack temperature, voltage degradation, ECU CPU usage, and CAN error counts over time.

---

## 3. Backend Architecture & How Technologies Are Used

### ⚡ FastAPI & Uvicorn
- **Role**: Core application server processing client requests.
- **How it is used**:
  - Exposes 12 REST API endpoints (`/api/vehicles`, `/api/telemetry`, `/api/health`, `/api/alerts`, `/api/analyze`, `/api/predict`, `/api/simulate`, `/api/chat`, `/api/summary`).
  - Automatically generates live interactive documentation at [http://localhost:8000/docs](http://localhost:8000/docs).

### 🧮 Deterministic Scoring Engine (`scoring_engine.py`)
- **Role**: Auditable, mathematical calculation of vehicle health (0–100).
- **How it is used**: Uses linear clamping formulas so judges can audit every score:
  - **HV Battery Health Score (30% weight)**: Charge %, voltage deviation from 380V, pack temperature (25°C baseline), cycle count, and mileage.
  - **Cybersecurity Audit (10% weight — UNECE R155 standard)**: Firmware currency, TLS gateway encryption (**0 pts if `DISABLED`**), and CAN error counts.
  - **ECU & Mechanical Sub-scores (50% weight)**: CPU %, RAM %, ECU hardware temp, coolant temp, oil pressure.
  - **Fault Code Penalty (10% weight)**: -15 pts per active Diagnostic Trouble Code (DTC).

### 📉 Predictive Maintenance Rule Engine (`rule_engine.py`)
- **Role**: Trend-based slope degradation analysis.
- **How it is used**: Evaluates telemetry history across cycles:
  - **Thermal Rise Rule**: Triggers a `HIGH` battery alert if battery temperature rises $> 0.5^\circ\text{C}$ per reading continuously.
  - **CAN Bus Error Escalation**: Triggers a `CRITICAL` cybersecurity alert if CAN errors escalate or encryption is disabled.
  - **DTC Fault Triage**: Automatically generates `Alert` and `MaintenanceLog` entries with estimated `predicted_days_to_service`.

---

## 4. Database & Storage Architecture

### 🗄️ SQLite (`app.db`) + SQLAlchemy 2.0
- **Role**: Persistent data storage.
- **Why SQLite**: Zero configuration, no Docker or external database service to debug during hackathons or live presentations.
- **How it is used**: SQLAlchemy maps 5 relational tables:
  1. `vehicles`: Vehicle metadata & specifications.
  2. `telemetry`: Time-series ECU sensor readings.
  3. `health_scores`: Historical calculated 0–100 score snapshots.
  4. `alerts`: Active & resolved predictive alerts.
  5. `maintenance_logs`: Diagnostic recommendations & service logs.

---

## 5. Artificial Intelligence & LLM Layer

### 🤖 Google Gemini API (`gemini-1.5-flash`)
- **Role**: Natural-language explanation and interactive diagnostic advice.
- **How it is used**:
  - `generate_vehicle_ai_summary()`: Combines real-time telemetry, calculated scores, and active alerts into a clear **3-sentence diagnostic rationale** for vehicle owners and service technicians.
  - `chat_with_vehicle_ai()`: Powers the **AI Diagnostic Advisor Chat Panel**, allowing technicians to ask questions with full vehicle telemetry context.
- **Offline Fallback Engine**: If no API key is set or internet is unavailable, `gemini_service.py` automatically uses a deterministic domain diagnostic generator, ensuring **100% platform uptime without crashes**.

---

## 6. Full Data Flow Architecture Diagram

```
[Simulated Vehicles / Custom Telemetry Form]
                     │
                     ▼
             [SQLite DB (app.db)]
                     │
                     ▼
         [FastAPI Backend Core (8000)]
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
 [Deterministic Math]    [Predictive Rules]
 (scoring_engine.py)     (rule_engine.py)
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
           [Google Gemini API]
           (gemini-1.5-flash)
                     │
                     ▼
       [Next.js 15 Frontend (3000)]
       (Tailwind + Recharts + React)
```
