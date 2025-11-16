@echo off
echo Docker 컨테이너들을 중지합니다...

REM Docker Compose로 서비스 중지
docker-compose down

echo 모든 컨테이너가 중지되었습니다.
pause
