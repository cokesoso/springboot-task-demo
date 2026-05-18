# Deploy on Windows (Docker Desktop required)
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker not found. Install Docker Desktop first."
}

if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env from .env.example"
}

$envContent = Get-Content .env -Raw
if ($envContent -match "replace-with-a-long-random-secret") {
    $bytes = New-Object byte[] 48
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $secret = [Convert]::ToBase64String($bytes)
    (Get-Content .env) -replace "JWT_SECRET=.*", "JWT_SECRET=$secret" | Set-Content .env
    Write-Host "Generated random JWT_SECRET in .env"
}

docker compose -f docker-compose.prod.yml up -d --build

Write-Host ""
Write-Host "Deploy complete. Open http://localhost (port 80 via nginx)"
docker compose -f docker-compose.prod.yml ps
