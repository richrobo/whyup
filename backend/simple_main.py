from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
import asyncio

app = FastAPI(
    title="Why Up API",
    description="암호화폐 시장 분석과 커뮤니티 플랫폼의 백엔드 API",
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

@app.get("/")
async def root():
    return {"message": "Why Up API에 오신 것을 환영합니다!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/posts/")
async def get_posts():
    return [
        {
            "id": 1,
            "title": "첫 번째 게시물",
            "content": "이것은 첫 번째 게시물입니다.",
            "summary": "첫 번째 게시물 요약",
            "author": {"username": "admin"},
            "created_at": "2024-01-01T00:00:00",
            "view_count": 10
        },
        {
            "id": 2,
            "title": "두 번째 게시물",
            "content": "이것은 두 번째 게시물입니다.",
            "summary": "두 번째 게시물 요약",
            "author": {"username": "user1"},
            "created_at": "2024-01-02T00:00:00",
            "view_count": 5
        }
    ]

@app.post("/api/auth/register")
async def register():
    return {"message": "회원가입이 완료되었습니다"}

@app.post("/api/auth/login")
async def login():
    return {
        "access_token": "fake-token",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User"
        }
    }

@app.get("/api/auth/me")
async def get_me():
    return {
        "id": 1,
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "is_active": True,
        "is_verified": True,
        "created_at": "2024-01-01T00:00:00"
    }

@app.put("/api/users/{user_id}")
async def update_user(user_id: int, user_data: dict):
    """사용자 정보 업데이트"""
    # 실제 구현에서는 데이터베이스에 저장
    # 여기서는 성공 응답만 반환
    return {
        "id": user_id,
        "email": user_data.get("email", "test@example.com"),
        "username": user_data.get("username", "testuser"),
        "full_name": user_data.get("full_name", "Test User"),
        "is_active": True,
        "is_verified": True,
        "created_at": "2024-01-01T00:00:00"
    }

@app.get("/api/posts/user/{user_id}")
async def get_user_posts(user_id: int):
    """사용자의 게시물 목록 조회"""
    return [
        {
            "id": 1,
            "title": "내 첫 번째 게시물",
            "content": "이것은 내가 작성한 첫 번째 게시물입니다.",
            "summary": "첫 번째 게시물 요약",
            "author_id": user_id,
            "created_at": "2024-01-01T00:00:00",
            "view_count": 15
        },
        {
            "id": 2,
            "title": "암호화폐 투자 경험담",
            "content": "암호화폐 투자를 시작한 지 1년이 지났습니다. 많은 것을 배웠습니다.",
            "summary": "암호화폐 투자 경험담",
            "author_id": user_id,
            "created_at": "2024-01-02T00:00:00",
            "view_count": 23
        }
    ]

@app.get("/api/crypto/prices")
async def get_crypto_prices():
    """암호화폐 가격 정보 반환"""
    cryptos = [
        {
            "symbol": "BTC",
            "name": "Bitcoin",
            "price": round(43250.50 + random.uniform(-1000, 1000), 2),
            "change24h": round(random.uniform(-2000, 2000), 2),
            "changePercent24h": round(random.uniform(-5, 5), 2)
        },
        {
            "symbol": "ETH",
            "name": "Ethereum",
            "price": round(2650.75 + random.uniform(-200, 200), 2),
            "change24h": round(random.uniform(-100, 100), 2),
            "changePercent24h": round(random.uniform(-5, 5), 2)
        },
        {
            "symbol": "BNB",
            "name": "Binance Coin",
            "price": round(315.40 + random.uniform(-20, 20), 2),
            "change24h": round(random.uniform(-10, 10), 2),
            "changePercent24h": round(random.uniform(-5, 5), 2)
        },
        {
            "symbol": "ADA",
            "name": "Cardano",
            "price": round(0.485 + random.uniform(-0.05, 0.05), 4),
            "change24h": round(random.uniform(-0.02, 0.02), 4),
            "changePercent24h": round(random.uniform(-5, 5), 2)
        },
        {
            "symbol": "SOL",
            "name": "Solana",
            "price": round(98.25 + random.uniform(-10, 10), 2),
            "change24h": round(random.uniform(-5, 5), 2),
            "changePercent24h": round(random.uniform(-5, 5), 2)
        }
    ]
    return cryptos

@app.get("/api/news")
async def get_news():
    """암호화폐 뉴스 정보 반환"""
    news = [
        {
            "id": 1,
            "title": "비트코인 ETF 승인으로 기관 투자자 관심 급증",
            "summary": "미국 SEC의 비트코인 ETF 승인으로 기관 투자자들의 암호화폐 투자 관심이 크게 증가하고 있습니다.",
            "content": "비트코인 ETF가 승인되면서 기관 투자자들이 암호화폐 시장에 본격적으로 진입하고 있습니다...",
            "author": "김투자",
            "publishedAt": "2024-01-15T10:30:00Z",
            "category": "bitcoin",
            "source": "CoinDesk Korea",
            "url": "https://example.com/news/1"
        },
        {
            "id": 2,
            "title": "이더리움 2.0 업그레이드로 수수료 대폭 감소",
            "summary": "이더리움의 최신 업그레이드로 거래 수수료가 크게 줄어들어 사용자들이 혜택을 보고 있습니다.",
            "content": "이더리움 네트워크의 최신 업그레이드로 인해 거래 수수료가 평균 50% 이상 감소했습니다...",
            "author": "박블록체인",
            "publishedAt": "2024-01-15T09:15:00Z",
            "category": "ethereum",
            "source": "Ethereum News",
            "url": "https://example.com/news/2"
        },
        {
            "id": 3,
            "title": "DeFi 프로토콜 총 예치액 1000억 달러 돌파",
            "summary": "전체 DeFi 프로토콜의 총 예치액이 사상 최초로 1000억 달러를 돌파했습니다.",
            "content": "DeFi(탈중앙화 금융) 생태계가 새로운 이정표를 달성했습니다...",
            "author": "이디파이",
            "publishedAt": "2024-01-15T08:45:00Z",
            "category": "defi",
            "source": "DeFi Pulse",
            "url": "https://example.com/news/3"
        }
    ]
    return news

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
