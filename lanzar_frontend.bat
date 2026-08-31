@echo off
title Frontend App
cd /d "%~dp0frontend"
set "PATH=%~dp0node_bin;%PATH%"
call npm run dev
pause