@echo off
echo WebSocket 서버를 시작합니다...
echo 포트: 8001
echo.

cd /d "%~dp0"

REM 가상환경 활성화
call venv\Scripts\activate.bat

REM WebSocket 서버 실행
python ws_fastapi.py

pause

