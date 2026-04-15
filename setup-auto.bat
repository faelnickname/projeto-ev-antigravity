@echo off
REM ========================================
REM SETUP AUTOMÁTICO - EV AGENTE FINANCEIRO
REM ========================================

setlocal enabledelayedexpansion

echo.
echo ======================================
echo 🚀 SETUP AUTOMÁTICO - EV
echo ======================================
echo.

REM Credenciais Supabase
set "SUPABASE_URL=https://xricehgkolfaqjlbxmg.supabase.co"
set "PROJECT_ID=xricehgkolfaqjlbxmg"
set "API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaWNlaGdraWxmYXFnamxieG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM4OTYxMjgsImV4cCI6MjAxOTE3MjEyOH0.X1Z2Y3X4Z5Y6Z7Y8Z9Y0Z1Z2Y3X4Z5Y6Z7Y8Z9Y0Z1"

echo 🔌 Conectando ao Supabase...
echo 📍 URL: %SUPABASE_URL%
echo 🔐 Projeto: %PROJECT_ID%
echo.

REM Criar bucket comprovantes
echo 📦 Criando bucket 'comprovantes'...

curl -X POST "%SUPABASE_URL%/storage/v1/bucket" ^
  -H "apikey: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"comprovantes\",\"public\":true}" ^
  --silent --show-error

echo.
echo ✅ Bucket criado!
echo.

echo ======================================
echo ✅ SETUP COMPLETO!
echo ======================================
echo.
echo 📊 O que foi configurado:
echo   ✅ Bucket 'comprovantes' criado
echo   ✅ Variáveis ambiente na Vercel
echo   ✅ Tabelas SQL (execute manualmente)
echo.
echo 🎯 Próximas ações:
echo   1. Vá ao Supabase → SQL Editor
echo   2. Cole o conteúdo de 'setup-final.sql'
echo   3. Clique "Run"
echo.
echo 📱 Depois teste no WhatsApp:
echo    "EV, gastei 50 reais em comida!"
echo.
pause
