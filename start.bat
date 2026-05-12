@echo off
setlocal

if not "%~1"=="" (
  set "XML=%~1"
  goto run
)

:: No file dragged — open a file picker
echo Opening file picker...
for /f "delims=" %%f in ('powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $d = New-Object System.Windows.Forms.OpenFileDialog; $d.Filter = 'XML files (*.xml)|*.xml|All files (*.*)|*.*'; $d.Title = 'Select your SMS backup XML'; if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $d.FileName }"') do set "XML=%%f"

if "%XML%"=="" (
  echo No file selected.
  pause
  exit /b 1
)

:run
node --max-old-space-size=6144 "%~dp0server.js" "%XML%"
