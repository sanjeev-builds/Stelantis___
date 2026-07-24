"""Integration tests over the real HTTP surface, backed by a throwaway SQLite
file (see conftest.py) that gets seeded from the real datasets/mock/*.json on
first use - never touches backend/app.db.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_login_succeeds_with_demo_credentials(client):
    res = client.post("/api/auth/login", json={"email": "demo@hackathon.dev", "password": "hackathon"})
    assert res.status_code == 200
    body = res.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_rejects_wrong_password(client):
    res = client.post("/api/auth/login", json={"email": "demo@hackathon.dev", "password": "wrong"})
    assert res.status_code == 401


def test_login_rejects_unknown_email(client):
    res = client.post("/api/auth/login", json={"email": "nobody@nowhere.dev", "password": "hackathon"})
    assert res.status_code == 401


def test_list_vehicles_returns_seeded_fleet(client):
    res = client.get("/api/vehicles")
    assert res.status_code == 200
    vehicles = res.json()
    assert len(vehicles) == 8
    ids = {v["vehicle_id"] for v in vehicles}
    assert "STL-EV-0001" in ids


def test_get_single_vehicle(client):
    res = client.get("/api/vehicles/STL-EV-0001")
    assert res.status_code == 200
    assert res.json()["vehicle_id"] == "STL-EV-0001"


def test_get_unknown_vehicle_is_404(client):
    res = client.get("/api/vehicles/does-not-exist")
    assert res.status_code == 404


def test_telemetry_history_is_seeded(client):
    res = client.get("/api/telemetry/STL-EV-0001")
    assert res.status_code == 200
    readings = res.json()
    assert len(readings) > 0
    assert "battery_temp_c" in readings[0]


def test_health_scores_are_seeded(client):
    res = client.get("/api/health/STL-EV-0001")
    assert res.status_code == 200
    scores = res.json()
    assert len(scores) > 0
    for field in ("vehicle_health_score", "battery_health_score", "cybersecurity_score"):
        assert 0 <= scores[0][field] <= 100


def test_fleet_wide_alerts_have_no_duplicates_per_vehicle_category(client):
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    seen = set()
    for a in alerts:
        key = (a["vehicle_id"], a["category"])
        assert key not in seen, f"duplicate {key} alert - predict/seed likely ran twice"
        seen.add(key)


def test_maintenance_logs_exist_for_every_alerted_vehicle(client):
    alerts = client.get("/api/alerts").json()
    alerted_vehicle_ids = {a["vehicle_id"] for a in alerts}
    for vehicle_id in alerted_vehicle_ids:
        res = client.get(f"/api/maintenance/{vehicle_id}")
        assert res.status_code == 200
        assert len(res.json()) > 0, f"{vehicle_id} has active alerts but no maintenance_logs rows"


def test_reset_demo_data_requires_auth(client):
    res = client.post("/api/reset-demo-data")
    assert res.status_code == 401


def test_reset_demo_data_works_with_valid_token(client):
    login = client.post("/api/auth/login", json={"email": "demo@hackathon.dev", "password": "hackathon"})
    token = login.json()["access_token"]
    res = client.post("/api/reset-demo-data", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    # Fleet size and alert count must round-trip identically after a reset,
    # since the seed data is deterministic (same mock JSON files each time).
    vehicles = client.get("/api/vehicles").json()
    assert len(vehicles) == 8


def test_predict_does_not_duplicate_alerts_on_repeat_calls(client):
    """Regression test: clicking "Run Diagnostic Scoring Engine" twice on the
    same vehicle (POST /predict against the same trailing telemetry window)
    must not append a second identical alert + maintenance_log row - found
    live via the actual button during a manual test pass."""
    vehicle_id = "STL-EV-0006"  # has multiple real alerts in the seed data
    before = client.get(f"/api/alerts/{vehicle_id}").json()
    assert len(before) > 0

    for _ in range(3):
        res = client.post("/api/predict", json={"vehicle_id": vehicle_id})
        assert res.status_code == 200

    after = client.get(f"/api/alerts/{vehicle_id}").json()
    assert len(after) == len(before)

    maintenance = client.get(f"/api/maintenance/{vehicle_id}").json()
    seen = set()
    for m in maintenance:
        key = m["recommendation"]
        assert key not in seen, "duplicate maintenance_log row for the same recommendation"
        seen.add(key)
