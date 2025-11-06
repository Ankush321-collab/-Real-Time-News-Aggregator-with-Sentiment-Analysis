@echo off
REM Daily News Scraper - Run Once
cd /d "%~dp0"
call .venv\Scripts\activate
python main.py --once
pause
