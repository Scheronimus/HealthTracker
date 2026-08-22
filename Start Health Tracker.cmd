@echo off
setlocal
title Health Tracker
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (echo Node.js and npm are required. Install them from https://nodejs.org/ & pause & exit /b 1)
if not exist "node_modules\" (echo Installing Health Tracker dependencies... & call npm ci & if errorlevel 1 (pause & exit /b 1))
echo Starting Health Tracker. Keep this window open; press Ctrl+C to stop.
call npm start
if errorlevel 1 pause
