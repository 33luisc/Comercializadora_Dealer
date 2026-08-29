@echo off
title Backend Server
cd /d "%~dp0backend"
"%~dp0node_bin\node.exe" "%~dp0node_bin\node_modules\npm\bin\npm-cli.js" run dev