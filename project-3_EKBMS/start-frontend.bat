@echo off
echo Starting EKBMS Frontend...
cd frontend
if not exist node_modules (
    echo Installing dependencies...
    npm install
)
echo Frontend running at http://localhost:5173
npm run dev
