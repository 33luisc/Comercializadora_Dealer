@echo off
title Cerrar Aplicacion

echo Deteniendo los procesos de Node.js...
taskkill /F /IM node.exe /T >nul 2>&1

echo Aplicacion cerrada correctamente.
timeout /t 2 >nul