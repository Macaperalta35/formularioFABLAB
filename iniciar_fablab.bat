@echo off
REM Script para iniciar FAB LAB INACAP (Proyecto Independiente)

echo.
echo ========================================
echo  FAB LAB INACAP - Registro de Visitas
echo  (Proyecto Independiente)
echo ========================================
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no instalado
    pause
    exit /b 1
)

echo [OK] Python instalado
echo.

REM Terminal 1: Backend FAB LAB
echo [1/2] Iniciando servidor FAB LAB en http://127.0.0.1:5000
cd /d "%~dp0"
start "FAB LAB Backend" cmd /k "python fablab_app.py"

REM Esperar a que inicie
timeout /t 5 /nobreak

REM Terminal 2: Servidor HTTP
echo [2/2] Iniciando servidor HTTP en http://localhost:8000
start "FAB LAB Frontend - HTTP" cmd /k "python serve.py"

echo.
echo ========================================
echo  Servidores iniciados!
echo ========================================
echo.
echo URLs disponibles:
echo   - Formulario:  http://localhost:8000/fablab-simple.html
echo   - Admin:       http://localhost:8000/admin-visitas.html
echo   - API:         http://127.0.0.1:5000/api/visitas
echo.
echo Presiona CTRL+C para detener los servidores
echo.
pause
