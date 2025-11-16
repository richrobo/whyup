@echo off
echo Django 백엔드 서버를 시작합니다...

REM 가상환경 활성화 (필요한 경우)
REM call venv\Scripts\activate

REM Django 서버 실행
python manage.py runserver 0.0.0.0:8000

pause
