@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║  CrowdCare - Dev Environment Starter                       ║
echo ║  React + Vite + Firebase                                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

if not exist "node_modules" (
    echo node_modules not found. Installing dependencies...
    call npm install
)

echo Starting Vite Local Server...
call npm run dev
pause
