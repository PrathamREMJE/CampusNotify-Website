@echo off
echo ========================================
echo Django Setup and Migration Script
echo ========================================

cd /d "%~dp0"

echo.
echo 🔄 Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo 🔄 Running database migrations...
python manage.py migrate

if %errorlevel% neq 0 (
    echo ❌ Migration failed! Please check the error above.
    pause
    exit /b 1
)

echo.
echo ✅ Migrations completed successfully!

echo.
echo 🔄 Collecting static files...
python manage.py collectstatic --noinput

echo.
echo ✅ Setup completed successfully!
echo.
echo 🚀 You can now start the server with:
echo    python manage.py runserver
echo.

set /p choice="Do you want to start the server now? (y/n): "
if /i "%choice%"=="y" (
    echo.
    echo 🚀 Starting Django development server...
    python manage.py runserver
) else (
    echo.
    echo 👍 Setup complete. Run 'python manage.py runserver' when ready.
)

pause