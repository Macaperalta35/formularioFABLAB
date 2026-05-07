@echo off
REM Inicia el sistema completo de FAB LAB

echo.
echo ========================================
echo  FAB LAB INACAP - Sistema de Registros
echo ========================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no está instalado o no está en PATH
    echo Instala Python desde https://www.python.org/
    pause
    exit /b 1
)

echo [OK] Python instalado

REM Crear dos terminales: una para Flask y otra para serve
echo.
echo Iniciando servidores...
echo.

REM Terminal 1: Flask Backend
echo [1/2] Iniciando Flask Backend en http://127.0.0.1:5000
cd /d "%~dp0"
start "FAB LAB Backend - Flask" cmd /k "python fablab_app.py"

REM Esperar un momento para que Flask se inicie
timeout /t 3 /nobreak

REM Terminal 2: Servidor HTTP
echo [2/2] Iniciando Servidor HTTP en http://localhost:8000
cd /d "%~dp0"
start "FAB LAB Frontend - HTTP Server" cmd /k "python serve.py"
echo.
echo ========================================
echo  Servidores iniciados correctamente!
echo ========================================
echo.
echo URLs disponibles:
echo   - Formulario: http://localhost:8000/fablab-simple.html
echo   - Admin:      http://localhost:8000/admin-visitas.html
echo   - API:        http://127.0.0.1:5000/api/visitas
echo.
echo Presiona CTRL+C en las terminales para detener los servidores
echo.
pause
