@echo off
title Frontend App
:: 1. Se ubica en la raíz del proyecto
cd /d "%~dp0"

:: 2. Añade node_bin de la raíz al PATH del sistema
set "PATH=%~dp0node_bin;%PATH%"

:: 3. Entra a la carpeta del frontend
cd frontend

:: 4. Ejecuta el servidor de desarrollo
call npm run dev
pause