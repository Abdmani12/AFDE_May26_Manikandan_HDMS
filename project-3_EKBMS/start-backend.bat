@echo off
echo Starting EKBMS Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt -q
echo Backend running at http://localhost:8000
echo API Docs: http://localhost:8000/docs
uvicorn main:app --reload --port 8000
