@echo off
title Backend Server
:: Fuerza al script a situarse en la carpeta raíz del proyecto
cd /d "%~dp0"

:: Agrega la carpeta node_bin (ubicada en la raíz) a las variables del sistema local
set "PATH=%~dp0node_bin;%PATH%"

:: Entra a la carpeta del backend
cd backend

:: Ejecuta el servidor
call npm run dev
pause