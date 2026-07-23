# Wraps the branch convention documented in README.md:
#   <team-branch>/<yourname>-<short-feature>
# Usage: .\scripts\new-branch.ps1 frontend alex navbar-fix
param(
    [Parameter(Mandatory=$true)][ValidateSet("frontend","backend","ai","integration")]
    [string]$TeamBranch,
    [Parameter(Mandatory=$true)][string]$Name,
    [Parameter(Mandatory=$true)][string]$Feature
)

Set-Location "$PSScriptRoot\.."
git checkout $TeamBranch
git pull origin $TeamBranch
$branchName = "$TeamBranch/$Name-$Feature"
git checkout -b $branchName
Write-Output "Created and switched to $branchName"
