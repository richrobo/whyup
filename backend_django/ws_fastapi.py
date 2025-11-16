#!/usr/bin/env python3
"""
WebSocket 서버 (FastAPI)
실시간 채팅을 위한 WebSocket 서버
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import jwt
from pydantic import BaseModel

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="WebSocket Chat Server", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 연결된 클라이언트 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        
        # 중복 연결 방지 - 더 엄격한 체크
        if websocket not in self.active_connections:
            self.active_connections.append(websocket)
            if user_id:
                # 같은 사용자의 기존 연결이 있으면 제거
                if user_id in self.user_connections:
                    old_websocket = self.user_connections[user_id]
                    if old_websocket in self.active_connections:
                        self.active_connections.remove(old_websocket)
                        try:
                            await old_websocket.close()
                        except:
                            pass
                self.user_connections[user_id] = websocket
            logger.info(f"클라이언트 연결됨. 총 연결: {len(self.active_connections)}")
            
            # 동시접속자 수 브로드캐스트
            await self.broadcast_user_count()
        else:
            logger.warning("이미 연결된 클라이언트입니다.")

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket 연결 제거됨. 총 연결: {len(self.active_connections)}")
        
        if user_id and user_id in self.user_connections:
            if self.user_connections[user_id] == websocket:
                del self.user_connections[user_id]
                logger.info(f"사용자 {user_id} 연결 해제됨")
        
        logger.info(f"클라이언트 연결 해제됨. 총 연결: {len(self.active_connections)}")
        
        # 동시접속자 수 브로드캐스트는 WebSocket 핸들러에서 처리

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        # 중복 전송 방지를 위한 세트 사용
        sent_connections = set()
        for connection in self.active_connections:
            try:
                if connection not in sent_connections:
                    await connection.send_text(message)
                    sent_connections.add(connection)
            except:
                # 연결이 끊어진 경우 제거
                if connection in self.active_connections:
                    self.active_connections.remove(connection)

    async def broadcast_user_count(self):
        """동시접속자 수를 모든 클라이언트에게 브로드캐스트"""
        user_count = len(self.active_connections)
        count_message = {
            "type": "user_count",
            "count": user_count,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(json.dumps(count_message))

manager = ConnectionManager()

# JWT 토큰 검증
def verify_token(token: str) -> dict:
    """JWT 토큰을 검증하고 사용자 정보를 반환"""
    try:
        # Django의 SECRET_KEY 사용
        SECRET_KEY = "django-insecure-eg*x8n7i6f1zw9n_0f8(#$v65@&$0+5$9c0$*-ozlvzeq)95!^"
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        logger.info(f"토큰 검증 성공: {payload}")
        return payload
    except jwt.ExpiredSignatureError as e:
        logger.error(f"토큰 만료: {str(e)}")
        raise HTTPException(status_code=401, detail="토큰이 만료되었습니다")
    except jwt.InvalidTokenError as e:
        logger.error(f"유효하지 않은 토큰: {str(e)}")
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다")
    except Exception as e:
        logger.error(f"토큰 검증 오류: {str(e)}")
        raise HTTPException(status_code=401, detail="토큰 검증 중 오류가 발생했습니다")

# 메시지 모델
class ChatMessage(BaseModel):
    type: str
    message: str
    user: str
    timestamp: str

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    user_info = None
    
    # 연결 즉시 동시접속자 수 전송
    await manager.broadcast_user_count()
    
    try:
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # 인증 메시지 처리
            if message_data.get("type") == "auth":
                token = message_data.get("token")
                if token:
                    try:
                        user_info = verify_token(token)
                        logger.info(f"사용자 인증됨: {user_info.get('user_id')}")
                        
                        # 인증 성공 메시지 전송
                        auth_response = {
                            "type": "system",
                            "id": f"auth_{datetime.now().timestamp()}",
                            "message": "인증이 완료되었습니다.",
                            "timestamp": datetime.now().isoformat()
                        }
                        await manager.send_personal_message(
                            json.dumps(auth_response), websocket
                        )
                    except Exception as e:
                        logger.error(f"인증 실패: {str(e)}")
                        # 인증 실패해도 연결은 유지
                        error_response = {
                            "type": "system",
                            "id": f"error_{datetime.now().timestamp()}",
                            "message": "인증에 실패했지만 채팅은 가능합니다.",
                            "timestamp": datetime.now().isoformat()
                        }
                        await manager.send_personal_message(
                            json.dumps(error_response), websocket
                        )
                        # continue 제거 - 인증 실패해도 채팅 가능
            
            # 일반 메시지 처리
            elif message_data.get("type") == "message":
                # 인증 여부와 관계없이 메시지 처리
                logger.info(f"메시지 수신: {message_data.get('user')} - {message_data.get('message')}")
                
                # 메시지 브로드캐스트 (중복 방지)
                message_id = f"msg_{datetime.now().timestamp()}_{hash(message_data.get('message', ''))}"
                broadcast_message = {
                    "type": "message",
                    "id": message_id,
                    "user": message_data.get("user", "익명"),
                    "message": message_data.get("message", ""),
                    "timestamp": datetime.now().isoformat()
                }
                
                await manager.broadcast(json.dumps(broadcast_message))
                logger.info(f"메시지 브로드캐스트: {message_data.get('user')} - {message_data.get('message')}")
    
    except WebSocketDisconnect:
        user_id = None
        if user_info:
            user_id = user_info.get('user_id')
        manager.disconnect(websocket, user_id)
        logger.info("클라이언트 연결이 끊어짐")
        # 연결 해제 시 동시접속자 수 업데이트
        await manager.broadcast_user_count()
    except Exception as e:
        logger.error(f"WebSocket 오류: {str(e)}")
        user_id = None
        if user_info:
            user_id = user_info.get('user_id')
        manager.disconnect(websocket, user_id)
        # 오류 발생 시에도 동시접속자 수 업데이트
        await manager.broadcast_user_count()

@app.get("/")
async def root():
    return {"message": "WebSocket Chat Server is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "active_connections": len(manager.active_connections),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
