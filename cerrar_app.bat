@echo off
title Cerrar Aplicacion Comercializadora
cd /d "%~dp0"

echo Deteniendo procesos de Node.js...

:: 1. Cierra todos los procesos node.exe en ejecución (backend y frontend)
taskkill /F /IM node.exe /T >nul 2>&1

:: 2. Cierra instancias de CMD que hayan quedado abiertas
taskkill /FI "WINDOWTITLE eq Backend Server*" /F /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend App*" /F /T >nul 2>&1

echo Aplicacion cerrada correctamente.
timeout /t 2 >nul
exit