Set-Location "$PSScriptRoot\..\backend"
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
& .\.venv\Scripts\Activate.ps1
# ai/ is imported as a library (see app/services/ai_client.py), so its deps
# need to be in this venv too for local (non-Docker) dev - Dockerfile does
# the same combined install.
pip install -r requirements.txt -r ..\ai\requirements.txt -q
uvicorn app.main:app --reload
