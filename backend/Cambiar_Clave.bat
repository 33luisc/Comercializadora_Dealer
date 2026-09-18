@echo off
title Restablecer Contrasena
:: 1. Se ubica en la carpeta actual (backend)
cd /d "%~dp0"

:: 2. Añade node_bin (ubicada en la raíz del proyecto) al PATH
set "PATH=%~dp0..\node_bin;%PATH%"

:: 3. Ejecuta el script interactivo que está en esta misma carpeta
node reset-password-interactive.js
pause