@echo off
title Merka 4.0 CRM
color 0A
echo.
echo  ========================================
echo       MERKA 4.0 CRM - Iniciando...
echo  ========================================
echo.
echo  Este script iniciara el servidor del CRM.
echo  Por favor espera unos segundos...
echo.
echo  Cuando veas "Local: http://localhost:3000"
echo  Abre tu navegador en esa direccion.
echo.
echo  Para detener el servidor, presiona Ctrl+C
echo.
echo  ========================================
echo.

cd /d "%~dp0"

:: Verificar si .env existe, si no, crearlo
if not exist ".env" (
    echo  [!] Creando archivo de configuracion...
    echo DATABASE_URL="file:./db/custom.db" > .env
    echo.
)

:: Verificar si node_modules existe
if not exist "node_modules\" (
    echo  [!] Primera vez: Instalando dependencias...
    echo  Esto puede tardar unos minutos...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [ERROR] No se pudieron instalar las dependencias.
        echo  Asegurate de tener Node.js instalado.
        echo  Descargalo de: https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  [!] Configurando base de datos...
    call npx prisma db push
    echo.
)

echo  [*] Iniciando servidor...
echo.
call npm run dev

pause
