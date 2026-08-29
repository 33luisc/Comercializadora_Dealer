@echo off
title Frontend App
cd /d "%~dp0frontend"
"%~dp0node_bin\node.exe" "%~dp0node_bin\node_modules\npm\bin\npm-cli.js" run dev