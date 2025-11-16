from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import User, UserUpdate
from app.models.user import User as UserModel
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/")
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """사용자 목록 조회 (관리자용)"""
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}")
async def read_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """특정 사용자 정보 조회"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    return user

@router.put("/{user_id}")
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """사용자 정보 수정"""
    # 본인만 수정 가능
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인의 정보만 수정할 수 있습니다"
        )
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    # 업데이트할 필드만 수정
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """사용자 삭제 (비활성화)"""
    # 본인만 삭제 가능
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인의 계정만 삭제할 수 있습니다"
        )
    
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    # 실제 삭제 대신 비활성화
    user.is_active = False
    db.commit()
    
    return {"message": "계정이 비활성화되었습니다"}