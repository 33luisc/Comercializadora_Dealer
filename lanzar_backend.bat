@echo off
title Backend Server
cd /d "%~dp0backend"
set "PATH=%~dp0node_bin;%PATH%"
call npm run dev
pause