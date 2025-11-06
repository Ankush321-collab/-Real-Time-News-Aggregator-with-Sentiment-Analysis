@echo off
REM Continuous News Scraper - Runs every 24 hours
cd /d "%~dp0"
call .venv\Scripts\activate
python main.py --interval 1440
pause
