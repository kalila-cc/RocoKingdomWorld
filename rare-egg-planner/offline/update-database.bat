@echo off
chcp 65001 >nul
set "UPDATER_DIR=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%UPDATER_DIR%tools\update-pet-database.ps1"
exit /b %ERRORLEVEL%
