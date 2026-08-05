@echo off
title Lanzador de Aplicacion Local

echo Iniciando el servicio Backend...
start "Backend Server" /min cmd /k "cd backend && npm run dev"

echo Iniciando el servicio Frontend...
start "Frontend App" /min cmd /k "cd frontend && npm run dev"

echo Esperando a que levanten los servidores...
timeout /t 4 /nobreak >nul

echo Abriendo la aplicacion...
start http://localhost:5173