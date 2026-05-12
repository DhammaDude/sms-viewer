@echo off
if "%~1"=="" (
  echo Usage: drag your SMS backup XML onto this file
  echo   OR run: start.bat "C:\path\to\sms-backup.xml"
  pause
  exit /b 1
)
node "%~dp0server.js" "%~1"
