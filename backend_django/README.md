# WhyUp Django Backend

Django REST Framework를 사용한 WhyUp 사이트의 백엔드 API입니다.

## 주요 기능

- **JWT 인증**: 사용자 로그인/회원가입 및 토큰 기반 인증
- **사용자 관리**: 사용자 CRUD 작업
- **게시물 관리**: 게시물 CRUD 작업
- **API 문서**: Swagger UI를 통한 API 문서화
- **CORS 지원**: 프론트엔드와의 통신 지원

## 설치 및 실행

### 방법 1: 기존 Docker 컨테이너 사용 (권장)

#### 1. 기존 Docker 컨테이너 확인

기존에 실행 중인 PostgreSQL과 Redis 컨테이너를 사용합니다:
- PostgreSQL: `why-up-postgres-1` (포트 5432)
- Redis: `econo-redis` (포트 6379)

```bash
# 컨테이너 상태 확인
docker ps --filter "name=why-up-postgres-1" --filter "name=econo-redis"
```

또는 Windows에서:

```bash
docker-start.bat
```

#### 2. 의존성 설치 및 마이그레이션

```bash
# 가상환경 생성 및 활성화
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp env.example .env

# 마이그레이션 실행
python manage.py makemigrations
python manage.py migrate

# 슈퍼유저 생성 (선택사항)
python manage.py createsuperuser
```

#### 3. 서버 실행

```bash
python manage.py runserver 0.0.0.0:8000
```

### 방법 2: 로컬 설치

#### 1. 가상환경 생성 및 활성화

```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 가상환경 활성화 (Linux/Mac)
source venv/bin/activate
```

#### 2. 의존성 설치

```bash
pip install -r requirements.txt
```

#### 3. 환경 변수 설정

`env.example` 파일을 `.env`로 복사하고 필요한 값들을 설정하세요:

```bash
cp env.example .env
```

#### 4. 데이터베이스 설정

PostgreSQL과 Redis를 로컬에 설치하고 `.env` 파일에서 데이터베이스 정보를 설정하세요.

#### 5. 마이그레이션 실행

```bash
# 마이그레이션 파일 생성
python manage.py makemigrations

# 마이그레이션 실행
python manage.py migrate

# 슈퍼유저 생성 (선택사항)
python manage.py createsuperuser
```

#### 6. 서버 실행

```bash
python manage.py runserver 0.0.0.0:8000
```

또는 Windows에서:

```bash
start-django.bat
```

## API 엔드포인트

### 인증 관련
- `POST /api/auth/register/` - 회원가입
- `POST /api/auth/login/` - 로그인
- `POST /api/auth/token/refresh/` - 토큰 갱신
- `GET /api/auth/me/` - 현재 사용자 정보

### 사용자 관리
- `GET /api/users/` - 사용자 목록
- `GET /api/users/{id}/` - 사용자 상세 정보
- `PUT /api/users/{id}/` - 사용자 정보 수정
- `DELETE /api/users/{id}/` - 사용자 삭제 (비활성화)

### 게시물 관리
- `GET /api/posts/` - 게시물 목록
- `POST /api/posts/` - 게시물 생성
- `GET /api/posts/{id}/` - 게시물 상세 정보
- `PUT /api/posts/{id}/` - 게시물 수정
- `DELETE /api/posts/{id}/` - 게시물 삭제
- `GET /api/posts/user/{user_id}/` - 특정 사용자의 게시물 목록

## API 문서

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- Swagger UI: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/

## 인증 방법

API를 사용하려면 JWT 토큰이 필요합니다:

1. `/api/auth/login/` 엔드포인트로 로그인
2. 응답에서 `access_token`을 받음
3. API 요청 시 헤더에 `Authorization: Bearer {access_token}` 추가

## 데이터베이스 모델

### User 모델
- `email`: 이메일 (고유)
- `username`: 사용자명 (고유)
- `full_name`: 실명
- `is_active`: 활성 상태
- `is_verified`: 이메일 인증 여부
- `created_at`: 생성일
- `updated_at`: 수정일

### Post 모델
- `title`: 제목
- `content`: 내용
- `summary`: 요약
- `is_published`: 발행 여부
- `view_count`: 조회수
- `author`: 작성자 (User 모델과 연결)
- `created_at`: 생성일
- `updated_at`: 수정일

## 개발 도구

- **Django Admin**: http://localhost:8000/admin/
- **API 테스트**: Swagger UI 또는 Postman 사용
- **데이터베이스**: PostgreSQL (개발 시 SQLite도 가능)

## 주의사항

- 프로덕션 환경에서는 `SECRET_KEY`를 안전하게 관리하세요
- `DEBUG=False`로 설정하세요
- 데이터베이스 보안 설정을 확인하세요
- CORS 설정을 프로덕션 환경에 맞게 조정하세요
