"""Trend-based predictive maintenance rules - slope-of-degradation, not a
single bad reading. See docs/Vehicle-Health-Dashboard-Plan.md Steps 4-7.

`history` is a list of dicts ordered oldest -> newest, one per telemetry
reading, each with: battery_temp_c, can_bus_error_count, coolant_temp_c,
oil_pressure_kpa, battery_health_score, vehicle_health_score. Callers build
this by zipping telemetry rows with their computed scores (see
app/db/seed.py and app/api/routes/alerts.py) so this module stays a pure
function with no DB/ORM dependency.
"""

from app.scoring.config import PREDICTIVE


def _slope_per_reading(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    diffs = [values[i + 1] - values[i] for i in range(len(values) - 1)]
    return sum(diffs) / len(diffs)


def evaluate_alerts(history: list[dict]) -> list[dict]:
    """Returns a list of {category, severity, message, predicted_days_to_service}."""
    alerts: list[dict] = []
    if not history:
        return alerts

    latest = history[-1]
    cfg = PREDICTIVE

    temp_window = cfg["battery_temp_trend_window"]
    if len(history) >= temp_window:
        recent = history[-temp_window:]
        slope = _slope_per_reading([r["battery_temp_c"] for r in recent])
        if (
            slope > cfg["battery_temp_slope_c_per_reading"]
            and latest["battery_health_score"] < cfg["battery_health_alert_threshold"]
        ):
            alerts.append(
                {
                    "category": "BATTERY",
                    "severity": "HIGH",
                    "message": (
                        f"Battery temperature rising ~{slope:.2f}C per reading over the last "
                        f"{temp_window} readings; battery health score is "
                        f"{latest['battery_health_score']:.0f}."
                    ),
                    "predicted_days_to_service": 10,
                }
            )

    can_window = cfg["can_error_trend_window"]
    if len(history) >= can_window + 1:
        errors = [r["can_bus_error_count"] for r in history[-(can_window + 1) :]]
        increased_each_step = all(errors[i + 1] > errors[i] for i in range(len(errors) - 1))
        if increased_each_step:
            alerts.append(
                {
                    "category": "CYBERSECURITY",
                    "severity": "MEDIUM",
                    "message": (
                        f"CAN bus error count increased for {can_window} consecutive readings "
                        f"(now {errors[-1]})."
                    ),
                    "predicted_days_to_service": 5,
                }
            )

    if (
        latest["coolant_temp_c"] > cfg["coolant_temp_critical_c"]
        or latest["oil_pressure_kpa"] < cfg["oil_pressure_critical_kpa"]
    ):
        alerts.append(
            {
                "category": "MECHANICAL",
                "severity": "CRITICAL",
                "message": (
                    f"Coolant temp {latest['coolant_temp_c']:.1f}C / oil pressure "
                    f"{latest['oil_pressure_kpa']:.1f}kPa outside safe range."
                ),
                "predicted_days_to_service": 1,
            }
        )

    drop_window = cfg["health_score_drop_window"]
    if len(history) >= drop_window:
        recent = history[-drop_window:]
        drop = recent[0]["vehicle_health_score"] - recent[-1]["vehicle_health_score"]
        if drop > cfg["health_score_drop_threshold"]:
            alerts.append(
                {
                    "category": "ECU",
                    "severity": "MEDIUM",
                    "message": (
                        f"Overall vehicle health score dropped {drop:.0f} points over the last "
                        f"{drop_window} readings."
                    ),
                    "predicted_days_to_service": 14,
                }
            )

    return alerts
