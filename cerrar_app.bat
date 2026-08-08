@echo off
title Cerrar Aplicacion Comercializadora

echo Deteniendo procesos y cerrando ventanas...

:: Cierra las consolas por el título asignado en el lanzador
taskkill /FI "WINDOWTITLE eq Backend Server*" /F /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend App*" /F /T >nul 2>&1

:: Cierra cualquier proceso de Node.js remanente
taskkill /F /IM node.exe /T >nul 2>&1

echo Aplicacion cerrada correctamente.
timeout /t 2 >nul
exit