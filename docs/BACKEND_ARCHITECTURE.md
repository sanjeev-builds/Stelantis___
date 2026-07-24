# Stellantis Cloud Vehicle Health Platform — Backend Architecture & Implementation Plan

This document explains the complete technical implementation, architecture, data flow, scoring mathematical formulas, and REST API specification of the **FastAPI Backend Core**.

---

## 1. Tech Stack & Architectural Overview

- **Framework:** FastAPI (Python 3.11+)
- **Server:** Uvicorn ASGI Server (`http://0.0.0.0:8000`)
- **Database Layer:** SQLite (`sqlite:///./app.db`) managed via **SQLAlchemy 2.0 ORM**
- **Data Validation & Schemas:** Pydantic v2
- **AI Intelligence Layer:** Google Gemini API (`gemini-1.5-flash`) via `google-generativeai` with an offline deterministic diagnostic engine fallback
- **Automated Testing:** `pytest` test suite (`backend/tests/`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FASTAPI APPLICATION LAYER                          │
│                                 (main.py)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      ▼                              ▼                              ▼
┌───────────┐                ┌───────────────┐              ┌───────────────┐
│ Database  │                │    Scoring    │              │  Predictive   │
│  Models   │                │    Engine     │              │  Rule Engine  │
│ (models)  │                │(scoring_engine│              │ (rule_engine) │
└─────┬─────┘                └───────┬───────┘              └───────┬───────┘
      │                              │                              │
      ▼                              ▼                              ▼
┌───────────┐                ┌───────────────┐              ┌───────────────┐
│ SQLite DB │                │ Auditable     │              │ Trend Slope   │
│ (app.db)  │                │ 0-100 Math    │              │ Alerts & Logs │
└───────────┘                └───────────────┘              └───────────────┘
                                     │
                                     ▼
                             ┌───────────────┐
                             │  Gemini AI    │
                             │ Explanation   │
                             │ (gemini_serv) │
                             └───────────────┘
```

---

## 2. Directory Structure & Module Breakdown

```
backend/
├── app/
│   ├── main.py              # Application entrypoint, CORS, startup auto-seeding
│   ├── api/
│   │   └── endpoints.py     # All REST API endpoints implementation
│   ├── core/
│   │   ├── scoring_config.py# Tunable scoring weights & parameter thresholds
│   │   ├── scoring_engine.py# Deterministic linear-clamp mathematical scoring formulas
│   │   └── rule_engine.py   # Trend degradation slope analysis & alert generator
│   ├── db/
│   │   ├── database.py      # SQLAlchemy SQLite engine & session factory
│   │   ├── models.py        # Database ORM models (Vehicle, Telemetry, HealthScore, Alert, MaintenanceLog)
│   │   └── seed.py          # Auto-seeder for vehicles, time-series telemetry & initial scores
│   ├── schemas/
│   │   └── schemas.py       # Pydantic v2 request/response validation schemas
│   └── services/
│       └── gemini_service.py# Google Gemini LLM service & offline diagnostic generator
├── tests/
│   └── test_scoring.py      # Pytest unit tests for deterministic scoring formulas
└── requirements.txt         # Dependency lockfile
```

---

## 3. Database Schema (`app.db`)

1. **`vehicles`**: Stores connected vehicle metadata (`vehicle_id`, `model`, `vehicle_type`, `manufacture_year`, `firmware_version`, `mileage_km`).
2. **`telemetry`**: Stores raw time-series ECU metrics (`timestamp`, `battery_pct`, `battery_voltage`, `battery_temp_c`, `ecu_temp_c`, `cpu_usage_pct`, `ram_usage_pct`, `speed_kmh`, `motor_rpm`, `coolant_temp_c`, `oil_pressure_kpa`, `fault_codes`, `encryption_status`, `can_bus_error_count`).
3. **`health_scores`**: Stores computed 0–100 score snapshots (`vehicle_health_score`, `battery_health_score`, `cybersecurity_score`, `ecu_score`, `mechanical_score`, `computed_at`).
4. **`alerts`**: Stores rule-triggered predictive warnings (`severity`, `category`, `message`, `predicted_days_to_service`, `resolved`).
5. **`maintenance_logs`**: Stores actionable repair recommendations and root-cause explanations (`recommendation`, `ai_explanation`, `urgency`, `source`).

---

## 4. Deterministic Scoring Mathematical Formulas

All sub-scores are 0–100, computed using a shared **linear-clamp normalizer**:

$$\text{normalize}(v, \text{good}, \text{bad}) = \text{clamp}\left( \frac{\text{bad} - v}{\text{bad} - \text{good}} \times 100, 0, 100 \right)$$

### 1. HV Battery Health Score (30% Weight)
- **State of Charge (20%):** $\text{charge\_score} = \text{clamp}(\text{battery\_pct})$
- **Voltage Deviation (25%):** $\text{voltage\_score} = \text{normalize}(|\text{voltage} - 380\text{V}|, \text{good}=0, \text{bad}=30)$
- **Pack Temperature (25%):** $\text{temp\_score} = \text{normalize}(\text{temp\_c}, \text{good}=25^\circ\text{C}, \text{bad}=60^\circ\text{C})$
- **Charge Cycles (15%):** $\text{cycle\_score} = \text{normalize}(\text{cycles}, \text{good}=0, \text{bad}=1500)$
- **Mileage (15%):** $\text{mileage\_score} = \text{normalize}(\text{mileage}, \text{good}=0, \text{bad}=200000)$

$$\text{Battery Score} = 0.20 \times \text{Charge} + 0.25 \times \text{Voltage} + 0.25 \times \text{Temp} + 0.15 \times \text{Cycle} + 0.15 \times \text{Mileage}$$

### 2. Cybersecurity Audit Score (10% Weight — UNECE R155 Standard)
- **Firmware Currency (25%):** 100 if latest (`v4.2.1-prod`), else 60
- **Gateway Encryption (30%):** 100 if `ENABLED`, **0 if `DISABLED`**
- **CAN Bus Errors (25%):** $\text{can\_score} = \text{normalize}(\text{errors}, \text{good}=0, \text{bad}=50)$
- **Unauthorized Auth Attempts (20%):** $\text{auth\_score} = \text{clamp}(100 - (\text{attempts} \times 15))$

$$\text{Cybersecurity Score} = 0.25 \times \text{Firmware} + 0.30 \times \text{Encryption} + 0.25 \times \text{CAN Errors} + 0.20 \times \text{Auth}$$

### 3. Overall Composite Vehicle Health Score
$$\text{Vehicle Health} = 0.30 \times \text{Battery} + 0.25 \times \text{ECU} + 0.25 \times \text{Mechanical} + 0.10 \times \text{Cybersecurity} + 0.10 \times \text{Fault Penalty}$$

Where **Fault Penalty** subtracts **15 points per active Diagnostic Trouble Code (DTC)**.

---

## 5. Predictive Slope & Rule Engine Mechanics

The rule engine (`rule_engine.py`) analyzes the last $N=5$ telemetry readings:

1. **Thermal Degradation Slope Rule:**
   $$\text{IF } \text{avg\_temp\_rise} \ge 0.5^\circ\text{C/reading} \text{ AND } \text{Battery Score} < 70 \implies \text{ALERT("BATTERY", HIGH, days=7)}$$
2. **CAN Error Escalation Rule:**
   $$\text{IF CAN errors increase in 3 consecutive readings OR encryption} = \text{"DISABLED"} \implies \text{ALERT("CYBERSECURITY", CRITICAL/MEDIUM, days=3)}$$
3. **Critical Thermal Threshold Rule:**
   $$\text{IF coolant\_temp} > 100^\circ\text{C} \text{ OR } \text{ecu\_temp} > 65^\circ\text{C} \implies \text{ALERT("ECU", CRITICAL, days=1)}$$

---

## 6. Complete REST API Specification

| Method | Endpoint | Description | Request Body / Query | Response |
|---|---|---|---|---|
| **GET** | `/api/vehicles` | List all fleet vehicles | None | `VehicleSchema[]` |
| **GET** | `/api/vehicles/{id}` | Get single vehicle details | None | `VehicleSchema` |
| **GET** | `/api/telemetry/{vehicle_id}` | Time-series telemetry readings | `limit` (default: 20) | `TelemetrySchema[]` |
| **GET** | `/api/health/{vehicle_id}` | Historical health score snapshots | `limit` (default: 10) | `HealthScoreSchema[]` |
| **GET** | `/api/alerts` | List all fleet-wide alerts | None | `AlertSchema[]` |
| **GET** | `/api/alerts/{vehicle_id}` | Alerts for specific vehicle | None | `AlertSchema[]` |
| **GET** | `/api/maintenance/{vehicle_id}` | Maintenance recommendations | None | `MaintenanceLogSchema[]` |
| **POST** | `/api/analyze/{vehicle_id}` | Trigger scoring engine calculation | None | `HealthScoreSchema` |
| **POST** | `/api/predict/{vehicle_id}` | Trigger predictive rule engine | None | `AlertSchema[]` |
| **POST** | `/api/simulate` | Test custom telemetry inputs on-the-fly | `SimulationRequest` | `SimulationResponse` |
| **POST** | `/api/chat` | AI Diagnostic Advisor Q&A dialogue | `ChatRequest` | `ChatResponse` |
| **GET** | `/api/summary/{vehicle_id}` | Get Gemini AI 3-sentence summary | None | `{ vehicle_id, summary }` |

---

## 7. How to Run & Verify Backend

### 1. Run Unit Tests
```bash
PYTHONPATH=backend python3 -m pytest backend/tests/
```

### 2. Seed Database
```bash
python3 datasets/generate_mock_data.py 20
PYTHONPATH=backend python3 -c "from app.db.seed import seed_database; seed_database()"
```

### 3. Start Server
```bash
PYTHONPATH=backend python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Interactive OpenAPI / Swagger Documentation available at: [http://localhost:8000/docs](http://localhost:8000/docs).
