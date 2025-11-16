@echo off
echo 기존 Docker 컨테이너 상태를 확인합니다...

REM 기존 컨테이너 상태 확인
docker ps --filter "name=why-up-postgres-1" --filter "name=econo-redis"

echo.
echo 기존 PostgreSQL과 Redis 컨테이너가 실행 중입니다.
echo PostgreSQL: why-up-postgres-1 (포트 5432)
echo Redis: econo-redis (포트 6379)
echo.
echo 데이터베이스 마이그레이션을 실행하시겠습니까? (y/n)
set /p choice=
if /i "%choice%"=="y" (
    echo 마이그레이션을 실행합니다...
    python manage.py makemigrations
    python manage.py migrate
    echo 마이그레이션이 완료되었습니다.
)

echo.
echo Django 서버를 시작하시겠습니까? (y/n)
set /p choice2=
if /i "%choice2%"=="y" (
    echo Django 서버를 시작합니다...
    python manage.py runserver 0.0.0.0:8000
)

pause
