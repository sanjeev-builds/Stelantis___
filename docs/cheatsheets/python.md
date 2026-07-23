# Python Cheat Sheet

## Virtual env (per service — backend/ and ai/ each have their own)
```bash
python -m venv .venv
.venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

## pandas quick reference
```python
import pandas as pd
df = pd.read_json("datasets/mock/vehicle_telemetry.json")
df.describe()
df.isnull().sum()
df[df["engine_temp"] > 105]                 # filter
df.groupby("risk_level").size()             # count by category
df.to_json("out.json", orient="records", indent=2)
```

## Common gotchas
- `datetime.now(timezone.utc)` not `datetime.utcnow()` (deprecated) — see `app/db/models.py` for the pattern used here.
- f-strings for formatting: `f"{value:.2f}"` for 2 decimal places.
- Type hints on function signatures are expected throughout this repo — match existing style (`def f(x: int) -> str:`).
- `pathlib.Path` over `os.path` for file paths (see `datasets/generate_mock_data.py`).
