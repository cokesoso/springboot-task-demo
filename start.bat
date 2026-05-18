@echo off
cd /d "%~dp0"
echo Starting MongoDB...
docker compose up -d
if errorlevel 1 (
    echo Failed to start MongoDB. Is Docker Desktop running?
    pause
    exit /b 1
)
echo Starting application...
start "demo-app" cmd /c "mvnw.cmd spring-boot:run"
echo.
echo Done. Open http://localhost:8080 in your browser.
timeout /t 5
