@echo off
echo Django 마이그레이션을 실행합니다...

REM 가상환경 활성화 (필요한 경우)
REM call venv\Scripts\activate

REM 마이그레이션 파일 생성
python manage.py makemigrations

REM 마이그레이션 실행
python manage.py migrate

REM 슈퍼유저 생성 (선택사항)
echo.
echo 슈퍼유저를 생성하시겠습니까? (y/n)
set /p choice=
if /i "%choice%"=="y" (
    python manage.py createsuperuser
)

echo 마이그레이션이 완료되었습니다.
pause
