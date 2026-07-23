Set-Location "$PSScriptRoot\.."

Write-Output "Removing frontend build/deps caches..."
Remove-Item -Recurse -Force frontend\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend\node_modules -ErrorAction SilentlyContinue

Write-Output "Removing backend caches..."
Get-ChildItem -Path backend -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force
Remove-Item -Recurse -Force backend\.pytest_cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force backend\.venv -ErrorAction SilentlyContinue

Write-Output "Removing ai caches..."
Get-ChildItem -Path ai -Recurse -Directory -Filter "__pycache__" -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force
Remove-Item -Recurse -Force ai\.venv -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ai\.chroma -ErrorAction SilentlyContinue

Write-Output "Done."
