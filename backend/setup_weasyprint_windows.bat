@echo off
echo Setting up WeasyPrint for Windows...
echo.

REM Activate virtual environment
call .venv\Scripts\activate

echo Installing/Upgrading WeasyPrint and dependencies...
pip install --upgrade pip
pip install --upgrade weasyprint
pip install --upgrade Pillow
pip install --upgrade fonttools

echo.
echo Testing WeasyPrint installation...
python -c "from weasyprint import HTML; print('✅ WeasyPrint import successful')"

echo.
echo WeasyPrint setup completed!
echo.
echo If you still face font issues, try:
echo 1. Use Arial or system fonts instead of DejaVu Sans
echo 2. Install GTK3 runtime from: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer
echo.
pause