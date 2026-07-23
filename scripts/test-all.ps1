Set-Location "$PSScriptRoot\..\backend"
if (Test-Path ".venv") {
    & .\.venv\Scripts\Activate.ps1
}
Write-Output "Running backend tests..."
pytest

Set-Location "$PSScriptRoot\..\frontend"
if (Test-Path "node_modules") {
    Write-Output "Running frontend lint..."
    npm run lint
} else {
    Write-Output "Skipping frontend lint - run npm install first."
}
