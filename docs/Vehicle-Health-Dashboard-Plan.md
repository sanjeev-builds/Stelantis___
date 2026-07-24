# Cloud-Based Vehicle Health Dashboard

Stellantis Hackathon — Architecture & Development Plan

Team of 5 · 4-hour build window · Draft for approval before implementation

## Step 1 — Problem, Users, Why

**Problem:** Connected vehicles generate constant ECU/telemetry data, but owners and fleet managers have no simple way to know "is my vehicle actually healthy right now, and what should I do about it before something breaks?" Dealers and OEMs only see a car when it has already failed or is due for scheduled service — reactive, not predictive.

**Who uses this:**
1. Vehicle owners — a health/battery/security snapshot instead of a dashboard warning light.
2. Fleet managers — a cross-vehicle view to schedule maintenance before downtime.
3. Stellantis service centers — early-warning triage data before the car arrives.

**Why it matters:** Unplanned breakdowns cost more than scheduled service, degrade brand trust, and are the single biggest lever in Stellantis's SDV / connected-vehicle strategy (recurring software-driven revenue, not just one-time car sales).

**Why Stellantis builds this:** It is a direct SDV monetization path — telemetry-as-a-service, predictive-maintenance subscriptions, and cybersecurity assurance (UNECE R155 relevance) are all areas OEMs are already investing in. This demo is a believable MVP slice of that roadmap.

**Note:** the existing repo scaffold (`docker-compose.yml`, `backend/requirements.txt`) was wired for PostgreSQL; this plan switches to SQLite — zero infra setup, one file, no Docker DB dependency to debug under time pressure. See [Folder Structure](#folder-structure-adapting-the-existing-scaffold) for the specific files that change.

## Step 2 — System Architecture

```
Simulated ECU/Vehicle (mock)
        |
        v
Telemetry Generator (Python script, 100+ records)
        |
        v
sample-data/telemetry.json  --seed-->  SQLite DB (single file)
                                              |
                                              v
                                          FastAPI
                              - REST endpoints
                              - Health Scoring Engine (deterministic, no AI)
                              - Predictive Rule Engine
                                              |
                                              v
                              Gemini 2.5 Flash (explanation layer only
                              -- never computes scores, receives already
                                 computed scores + raw telemetry)
                                              |
                                              v
                              Next.js 15 Dashboard (Recharts, Shadcn UI)
```

**Key architectural decision:** scoring is 100% deterministic math (judges weight "scoring correctness" at 30% — that has to be auditable, not an LLM guess). Gemini only ever receives already-computed scores + raw telemetry and produces the natural-language explanation / recommendation. This also makes the demo resilient — if the Gemini API hiccups, the dashboard and scores still work.

## Step 3 — Database Schema (SQLite)

```sql
-- vehicles: one row per simulated vehicle
CREATE TABLE vehicles (
    vehicle_id       TEXT PRIMARY KEY,       -- e.g. "STL-EV-0001"
    model            TEXT NOT NULL,          -- e.g. "Jeep Avenger EV"
    manufacture_year INTEGER,
    firmware_version TEXT,
    mileage_km       REAL,
    created_at       TEXT DEFAULT CURRENT_TIMESTAMP
);

-- telemetry: raw ECU readings, many rows per vehicle (time series)
CREATE TABLE telemetry (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id          TEXT REFERENCES vehicles(vehicle_id),
    timestamp           TEXT NOT NULL,
    battery_pct         REAL,
    battery_voltage     REAL,
    battery_temp_c      REAL,
    ecu_temp_c          REAL,
    cpu_usage_pct       REAL,
    ram_usage_pct       REAL,
    speed_kmh           REAL,
    motor_rpm           REAL,
    engine_load_pct     REAL,
    coolant_temp_c      REAL,
    oil_pressure_kpa    REAL,
    fault_codes         TEXT,              -- JSON array of DTC strings, e.g. ["P0A80"]
    encryption_status   TEXT,              -- "ENABLED" | "DISABLED"
    can_bus_error_count INTEGER,
    gps_lat             REAL,
    gps_lng             REAL
);

-- health_scores: computed snapshot per telemetry read (or per polling cycle)
CREATE TABLE health_scores (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id            TEXT REFERENCES vehicles(vehicle_id),
    telemetry_id          INTEGER REFERENCES telemetry(id),
    vehicle_health_score  REAL,
    battery_health_score  REAL,
    cybersecurity_score   REAL,
    computed_at           TEXT DEFAULT CURRENT_TIMESTAMP
);

-- alerts: predictive/rule-triggered warnings
CREATE TABLE alerts (
    id                         INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id                 TEXT REFERENCES vehicles(vehicle_id),
    severity                   TEXT,      -- "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    category                   TEXT,      -- "BATTERY" | "ECU" | "CYBERSECURITY" | "MECHANICAL"
    message                    TEXT,
    predicted_days_to_service  INTEGER,
    created_at                 TEXT DEFAULT CURRENT_TIMESTAMP,
    resolved                   INTEGER DEFAULT 0
);

-- maintenance_logs: AI + rule-generated recommendations, and (mock) service history
CREATE TABLE maintenance_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id      TEXT REFERENCES vehicles(vehicle_id),
    recommendation  TEXT,
    ai_explanation  TEXT,
    urgency         TEXT,       -- "ROUTINE" | "SOON" | "URGENT"
    source          TEXT,       -- "RULE_ENGINE" | "GEMINI"
    created_at      TEXT DEFAULT CURRENT_TIMESTAMP
);

-- users: demo auth (owner/fleet-manager roles)
CREATE TABLE users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    email           TEXT UNIQUE,
    hashed_password TEXT,
    role            TEXT,        -- "OWNER" | "FLEET_MANAGER" | "ADMIN"
    vehicle_id      TEXT REFERENCES vehicles(vehicle_id)
);
```

### APIs

| Method | Path | Purpose | Response |
|---|---|---|---|
| GET | `/vehicles` | List all vehicles | `Vehicle[]` |
| GET | `/vehicles/{id}` | Single vehicle detail | `Vehicle` |
| GET | `/telemetry/{vehicle_id}` | Time-series telemetry (query: `limit`, `since`) | `Telemetry[]` |
| GET | `/health/{vehicle_id}` | Latest + historical health/battery/cyber scores | `HealthScore[]` |
| GET | `/alerts/{vehicle_id}` | Active + resolved alerts | `Alert[]` |
| POST | `/analyze` | Run scoring engine on latest telemetry, persist to `health_scores` | `HealthScore` |
| POST | `/predict` | Run predictive rule engine, create `alerts` + `maintenance_logs` rows | `Alert[]` |
| POST | `/chat` | Freeform Q&A about a vehicle, backed by Gemini + vehicle data as context | `{ answer: string }` |

## Steps 4–7 — Health Scoring Logic (deterministic, no AI)

All sub-scores are 0–100, computed with a shared linear-clamp normalizer:

```python
normalize(value, good, bad) =
    clamp( (bad - value) / (bad - good) * 100, 0, 100 )   # if higher value = worse
# direction flips for metrics where higher = better, e.g. battery %
```

### Battery Health Score (0–100)

| Factor | Weight | Formula input |
|---|---|---|
| Charge % | 20% | `charge_pct` directly (0–100) |
| Voltage deviation | 25% | `normalize(abs(voltage - nominal_voltage), good=0, bad=2.0V)` |
| Battery temp | 25% | `normalize(temp_c, good=25, bad=60)` |
| Charge cycles (age proxy) | 15% | `normalize(cycle_count, good=0, bad=1500)` |
| Vehicle age/mileage | 15% | `normalize(mileage_km, good=0, bad=200000)` |

```python
battery_health_score = 0.20*charge_score + 0.25*voltage_score
                      + 0.25*temp_score + 0.15*cycle_score + 0.15*age_score
```

### Cybersecurity Score (0–100)

| Factor | Weight | Rule |
|---|---|---|
| Firmware currency | 25% | 100 if `firmware_version == latest`, else `100 - 20*versions_behind` (floor 0) |
| Encryption status | 30% | 100 if `ENABLED`, 0 if `DISABLED` |
| CAN bus errors | 25% | `normalize(can_error_count, good=0, bad=50)` |
| Auth / unauthorized access attempts | 20% | `100 minus 15 per unauthorized attempt` (floor 0) |

```python
cybersecurity_score = 0.25*firmware_score + 0.30*encryption_score
                     + 0.25*can_error_score + 0.20*auth_score
```

### Overall Vehicle Health Score (0–100)

Composite of everything above plus raw ECU/mechanical signals:

| Component | Weight |
|---|---|
| Battery Health Score | 30% |
| ECU performance (CPU %, RAM %, ECU temp — averaged sub-scores) | 25% |
| Mechanical (coolant temp, oil pressure, engine load — averaged sub-scores) | 25% |
| Cybersecurity Score | 10% |
| Fault code penalty (100 minus 15 pts per active DTC, floor 0) | 10% |

```python
vehicle_health_score = 0.30*battery_health_score + 0.25*ecu_score
                      + 0.25*mechanical_score + 0.10*cybersecurity_score
                      + 0.10*fault_code_score
```

Each weight/threshold above lives in one Python config dict (`scoring_config.py`) so it is tunable live during the demo without touching logic — worth doing given how much judging weight is on this piece.

### Predictive Maintenance (rule-based, fires the `alerts` table)

Trend-based, not just threshold — compare last N=5 readings:

```
IF battery_temp trending up > 0.5C/reading for 5 readings AND battery_health_score < 60:
    -> ALERT("BATTERY", severity=HIGH, predicted_days_to_service = 10)

IF can_bus_error_count increased in 3 consecutive readings:
    -> ALERT("CYBERSECURITY", severity=MEDIUM, predicted_days_to_service = 5)

IF coolant_temp > 105C OR oil_pressure < threshold:
    -> ALERT("MECHANICAL", severity=CRITICAL, predicted_days_to_service = 1)

IF vehicle_health_score dropped > 15 points over last 5 readings:
    -> ALERT("ECU", severity=MEDIUM, predicted_days_to_service = 14)
```

This is the "predict BEFORE failure" bonus point — it is slope-of-degradation, not a single bad reading.

## Dashboard Wireframe (Next.js pages)

| Page | Purpose | Key components |
|---|---|---|
| Dashboard | Fleet overview | Fleet-wide health/battery/cyber score cards, vehicle list table, alert count badge |
| Vehicle Detail | Single-vehicle deep dive | 3 score gauges (health/battery/cyber), live telemetry cards, mini charts |
| Telemetry | Raw time-series | Recharts line charts per metric, time range picker |
| Health | Score history + breakdown | Stacked bar of weighted sub-scores, trend line |
| Maintenance | Recommendations | Cards per recommendation, urgency badge, AI explanation text |
| Alerts | Active/resolved alerts | Table with severity color-coding, days-to-service countdown |
| AI Assistant | Chat with Gemini about a vehicle | Chat panel, prefilled quick-questions |
| Settings | Demo config | Vehicle selector, refresh interval, mock data regenerate button |

## Folder Structure (adapting the existing scaffold)

The repo already has this shape — reusable as-is:

```
backend/app/      -> FastAPI routes, scoring engine, models
backend/tests/
frontend/src/      -> Next.js app router, components, charts
ai/src/            -> Gemini prompt + chat logic (drop LangChain/ChromaDB - not needed for this scope)
datasets/mock/     -> existing generator, extend to the new telemetry field set above
docs/, presentation/, scripts/, sample-data/  -> already present or trivial to add
```

Changes needed vs. current scaffold:

- `backend/requirements.txt`: drop psycopg/Postgres driver, DB access becomes plain sqlite3/SQLAlchemy with `sqlite:///./app.db`
- `docker-compose.yml`: drop the `db` (Postgres) service entirely — not needed
- `ai/`: simplify away LangChain/ChromaDB — direct `google-generativeai` calls are enough for this scope and faster to get working

## Development Plan (4 hours, 5 devs)

| Time | Dev A (Backend/DB) | Dev B (Scoring Engine) | Dev C (AI/Gemini) | Dev D (Frontend core) | Dev E (Frontend charts/polish) |
|---|---|---|---|---|---|
| 0:00–0:45 | SQLite schema + seed script from mock data | Health/battery/cyber formulas as pure functions + unit tests | Gemini prompt template + `/chat`, `/analyze` wiring | Dashboard + Vehicle Detail page shells | Telemetry/Health/Alerts page shells |
| 0:45–1:30 | `/vehicles`, `/telemetry` endpoints | Wire scoring into `/analyze`, write to `health_scores` | `/predict` alert generation + `maintenance_logs` writes | Fetch + render vehicle list, score cards | Recharts wiring for telemetry history |
| 1:30–2:15 | `/alerts`, `/health` endpoints | Predictive trend rules (slope detection) | AI explanation text tuned against real scored output | Vehicle Detail gauges + live cards | Alerts table w/ severity colors |
| 2:15–3:00 | Integration pass w/ frontend | Edge-case tuning (fault codes, thresholds) | AI Assistant chat page wiring | Maintenance page + recommendation cards | Settings page + refresh control |
| 3:00–3:40 | Bug bash / demo data polish (all hands) | | | | |
| 3:40–4:00 | Rehearse demo script, prep judge Q&A | | | | |

---

This is the plan through the Step 16 checkpoint — architecture, database, APIs, health/scoring logic, dashboard wireframe, folder structure, and dev plan. **Confirm the SQLite-over-Postgres call above before implementation begins.**
