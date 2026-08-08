@echo off
title Lanzador Comercializadora Dealer

echo [1/3] Iniciando Backend en segundo plano...
wscript run_hidden.vbs "lanzar_backend.bat"

echo [2/3] Iniciando Frontend en segundo plano...
wscript run_hidden.vbs "lanzar_frontend.bat"

echo [3/3] Aguardando inicio de servicios...
timeout /t 4 /nobreak >nul

echo Abriendo aplicación en el navegador...
start http://localhost:5173

exit