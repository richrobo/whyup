@echo off
echo Celery 워커를 시작합니다...

REM 가상환경 활성화 (필요한 경우)
REM call venv\Scripts\activate

REM Celery 워커 시작
celery -A whyup worker --loglevel=info

pause
