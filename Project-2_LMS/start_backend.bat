@echo off
echo ========================================
echo   Bibliotheca - Backend Server (FastAPI)
echo ========================================
cd /d "%~dp0backend"
"C:\Program Files\Python310\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
