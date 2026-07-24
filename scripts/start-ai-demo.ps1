Set-Location "$PSScriptRoot\..\ai"
if (-not (Test-Path ".venv")) {
    python -m venv .venv
}
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt -q
Set-Location src
python groq_client.py
