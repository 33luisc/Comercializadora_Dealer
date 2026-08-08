@echo off
title Restablecer Contrasena
cd /d "%~dp0"
node reset-password-interactive.js
pause