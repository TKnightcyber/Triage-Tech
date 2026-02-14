@echo off
REM ============================================
REM  DeviceRevive - Startup
REM  Double-click this file to start the app.
REM ============================================

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "start.ps1"
pause
