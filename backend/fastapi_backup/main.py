from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, posts, auth
from app.database import engine, Base

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kimpga Clone API",
    description="kimpga.com 클론 사이트의 백엔드 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["인증"])
app.include_router(users.router, prefix="/api/users", tags=["사용자"])
app.include_router(posts.router, prefix="/api/posts", tags=["게시물"])

@app.get("/")
async def root():
    return {"message": "Kimpga Clone API에 오신 것을 환영합니다!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
