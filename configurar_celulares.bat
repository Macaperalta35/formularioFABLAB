@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo  CONFIGURAR CELULARES - FAB LAB
echo ========================================
echo.

REM Detectar IP local no loopback
set "LOCAL_IP="
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R /C:"IPv4 Address" /C:"Dirección IPv4" ^| findstr /V "169.254." ^| findstr /V "127.0.0.1"') do (
    set "LINE=%%A"
    set "LINE=!LINE: =!"
    if defined LINE if not defined LOCAL_IP set "LOCAL_IP=!LINE!"
)

if not defined LOCAL_IP (
    echo [ERROR] No se pudo detectar la IP local.
    echo Asegúrate de estar conectado a la red y vuelve a intentar.
    pause
    exit /b 1
)

echo IP local detectada: %LOCAL_IP%
echo.

echo Abriendo puertos 8000 y 5001 en el Firewall de Windows...
netsh advfirewall firewall delete rule name="FABLAB HTTP 8000" >nul 2>&1
netsh advfirewall firewall delete rule name="FABLAB API 5001" >nul 2>&1
netsh advfirewall firewall add rule name="FABLAB HTTP 8000" dir=in action=allow protocol=TCP localport=8000 profile=any enable=yes
netsh advfirewall firewall add rule name="FABLAB API 5001" dir=in action=allow protocol=TCP localport=5001 profile=any enable=yes

echo.
echo ========================================
echo  SERVICIO MÓVIL DISPONIBLE
echo ========================================
echo Frontend: http://%LOCAL_IP%:8000/fablab-mobile-fix.html
echo API:      http://%LOCAL_IP%:5001/api
echo.
echo Usa esta URL para generar el QR y prueba desde tu celular.
echo Si el servidor no está levantado, ejecuta primero "iniciar.bat".
echo.
pause
