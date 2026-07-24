# Stellantis Cloud Vehicle Health Platform — Frontend Architecture & Guide

This document provides a comprehensive technical guide to the **Next.js 15 Dark Glassmorphism Frontend Application**, detailing its architecture, design system, component hierarchy, page routing, and state management.

---

## 1. Tech Stack & Architecture Overview

- **Framework:** Next.js 15 (React 18 + TypeScript)
- **Styling:** Tailwind CSS 3.4 (Custom Dark Glassmorphism Design System)
- **Data Visualization:** Recharts 2.12 (`ResponsiveContainer`, `AreaChart`, `LineChart`)
- **Iconography:** Lucide React 0.446
- **HTTP Communications:** Axios (`http://localhost:8000/api`)
- **Theme:** Dark slate theme with backdrop-blur glass panels (`bg-slate-950`, `glass-panel`, `glass-card`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEXT.JS 15 APP ROUTER                              │
│                           (src/app/layout.tsx)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
      ┌──────────────────────────────┼──────────────────────────────┐
      ▼                              ▼                              ▼
┌───────────┐                ┌───────────────┐              ┌───────────────┐
│ Component │                │ Recharts Data │              │ Axios Client  │
│  Library  │                │ Visualization │              │ API Data Fetch│
│(components│                │(TelemetryChart│              │(http://8000)  │
└─────┬─────┘                └───────┬───────┘              └───────┬───────┘
      │                              │                              │
      ▼                              ▼                              ▼
┌───────────┐                ┌───────────────┐              ┌───────────────┐
│ScoreGauge │                │  Time-Series  │              │ Live Backend  │
│MetricCard │                │ Voltage, Temp │              │ Vehicle Scores│
│AlertsTable│                │ CPU & CAN Err │              │ & Gemini AI   │
└───────────┘                └───────────────┘              └───────────────┘
```

---

## 2. Directory & File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css              # Custom Tailwind CSS utilities & glassmorphism theme
│   │   ├── layout.tsx               # Root layout wrapper with Navigation & Footer
│   │   ├── page.tsx                 # Fleet Overview Dashboard (Page 1)
│   │   ├── vehicle/[id]/page.tsx    # Single Vehicle Deep-Dive Page (Page 2)
│   │   ├── simulator/page.tsx       # Sensor Telemetry Form Test Lab (Page 3)
│   │   ├── telemetry/page.tsx       # Raw Telemetry & Time-Series Analytics (Page 4)
│   │   ├── alerts/page.tsx          # Predictive Risk & Maintenance Alerts (Page 5)
│   │   ├── maintenance/page.tsx     # Actionable Repair Recommendations (Page 6)
│   │   └── ai-assistant/page.tsx    # Gemini AI Diagnostic Advisor Chat (Page 7)
│   └── components/
│       ├── Navigation.tsx           # Sticky top navbar with active tab & API status
│       ├── ScoreGauge.tsx           # SVG circular score ring gauge (Green/Yellow/Red)
│       ├── MetricCard.tsx           # ECU telemetry metric card with status badges
│       ├── TelemetryCharts.tsx      # Dual-axis Recharts area & line graphs
│       ├── AlertsTable.tsx          # Filterable predictive alerts table
│       └── AIChatPanel.tsx          # Interactive Gemini AI chat dialogue box
├── package.json
└── tailwind.config.ts
```

---

## 3. Core Component Library Specification

### 1. `Navigation.tsx`
- **Purpose**: Sticky header navigation bar across all pages.
- **Key Features**:
  - Highlights active route with cyan glow (`bg-cyan-500/10 text-cyan-400`).
  - Contains branding logo and **API ONLINE** live connectivity badge.

### 2. `ScoreGauge.tsx`
- **Purpose**: Renders circular SVG arc gauges for 0–100 scores.
- **How it works**:
  - Calculates SVG `strokeDashoffset` dynamically: $\text{offset} = 2\pi r \times (1 - \frac{\text{score}}{100})$.
  - Color interpolation:
    - **$\ge 80$**: Emerald Green (`#10b981`)
    - **$60 - 79$**: Amber Yellow (`#f59e0b`)
    - **$< 60$**: Red (`#ef4444`) with radial glow background.

### 3. `MetricCard.tsx`
- **Purpose**: Renders telemetry metric tiles.
- **Key Features**: Displays value, unit, Lucide icon, and threshold badges (`WARN` or `ALERT`).

### 4. `TelemetryCharts.tsx`
- **Purpose**: Renders real-time time-series telemetry charts using Recharts.
- **Charts**:
  1. **HV Battery Chart**: `AreaChart` tracking Pack Voltage (V) and Battery Temperature (°C).
  2. **System Bus Chart**: `LineChart` tracking ECU CPU Usage (%) and CAN Bus Error Count.

### 5. `AlertsTable.tsx`
- **Purpose**: Displays predictive maintenance warnings.
- **Key Features**: Shows vehicle ID, severity badge (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), diagnostic category, fault message, and countdown days-to-service badge.

### 6. `AIChatPanel.tsx`
- **Purpose**: Interactive natural-language dialogue widget.
- **How it works**: Sends user prompts to `POST /api/chat`, streams Gemini responses, and includes quick pre-filled automotive diagnostic prompts.

---

## 4. Page Breakdown & How They Function

### 1. Fleet Overview (`src/app/page.tsx`)
- **Purpose**: High-level executive dashboard for fleet managers.
- **Functionality**:
  - Fetches vehicle list (`GET /api/vehicles`) and fleet alerts (`GET /api/alerts`).
  - Renders 4 KPI cards: Total Fleet Size, Critical Alerts, High Risk Predictions, and Average Fleet Health.
  - Interactive Connected Vehicles directory table with **Inspect** links.

### 2. Single Vehicle Deep-Dive (`src/app/vehicle/[id]/page.tsx`)
- **Purpose**: Diagnostic deep-dive into a specific vehicle (e.g. `STL-EV-0001`).
- **Functionality**:
  - Displays 3 Score Gauges (Vehicle Health, HV Battery Pack, Cybersecurity Audit).
  - Shows Gemini AI 3-sentence diagnostic summary box.
  - Renders real-time telemetry metrics and Recharts graphs.
  - Includes **"Run Diagnostic Scoring Engine"** button to re-trigger scoring calculations.

### 3. Custom Sensor Telemetry Test Lab (`src/app/simulator/page.tsx`)
- **Purpose**: Live simulation form for invigilators and judges to test custom inputs.
- **Left Form Inputs**:
  - **BATTERY & POWER**: Battery Charge %, Pack Voltage (V), Battery Temp (°C).
  - **ENGINE & DRIVING**: Coolant Temp, Oil Pressure, ECU Temp, Speed, RPM, Engine Load.
  - **ECU & COMPUTING**: CPU %, RAM %.
  - **CYBERSECURITY**: CAN Bus Error Count, Auth Violations, Encryption Status (`ENABLED`/`DISABLED`).
  - **LOCATION & DTC**: GPS Latitude, Longitude, and Active Fault Codes text input.
- **Preset Buttons**: 🟢 *Nominal*, 🟡 *Thermal Watch*, 🔴 *Cyber Breach*, 🔴 *Engine Failure*.
- **Right Panel**: Real-time calculated score gauges, Gemini AI diagnostic rationale, and active predictive alerts.

### 4. Telemetry History (`src/app/telemetry/page.tsx`)
- **Purpose**: Deep time-series telemetry analysis.
- **Functionality**: Dropdown vehicle selector, Recharts graphs, and raw telemetry data log table.

### 5. Risk Center (`src/app/alerts/page.tsx`)
- **Purpose**: Fleet-wide alert management.
- **Functionality**: Table of active predictive warnings with live refresh button.

### 6. Maintenance Action Logs (`src/app/maintenance/page.tsx`)
- **Purpose**: Actionable repair logs for Stellantis service technicians.
- **Functionality**: Urgency-coded cards with root-cause diagnostic rationales.

### 7. AI Diagnostic Advisor (`src/app/ai-assistant/page.tsx`)
- **Purpose**: Fullscreen Gemini AI automotive engineer chat panel.

---

## 5. Design System & CSS Utility Tokens

Defined in `src/app/globals.css`:

```css
.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-card {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.badge-critical { @apply bg-red-950/80 text-red-400 border border-red-800/50; }
.badge-high     { @apply bg-orange-950/80 text-orange-400 border border-orange-800/50; }
.badge-medium   { @apply bg-amber-950/80 text-amber-400 border border-amber-800/50; }
.badge-low      { @apply bg-emerald-950/80 text-emerald-400 border border-emerald-800/50; }
```
