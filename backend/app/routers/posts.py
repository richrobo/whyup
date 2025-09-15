from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.post import Post, PostCreate, PostUpdate, PostWithAuthor
from app.models.post import Post as PostModel
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/")
async def read_posts(
    skip: int = 0, 
    limit: int = 100, 
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    """게시물 목록 조회"""
    query = db.query(PostModel)
    
    if published_only:
        query = query.filter(PostModel.is_published == True)
    
    posts = query.offset(skip).limit(limit).all()
    return posts

@router.get("/{post_id}")
async def read_post(
    post_id: int, 
    db: Session = Depends(get_db)
):
    """특정 게시물 조회"""
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="게시물을 찾을 수 없습니다")
    
    # 조회수 증가
    post.view_count += 1
    db.commit()
    db.refresh(post)
    
    return post

@router.post("/")
async def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """새 게시물 생성"""
    db_post = PostModel(
        title=post.title,
        content=post.content,
        summary=post.summary,
        is_published=post.is_published,
        author_id=current_user.id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.put("/{post_id}")
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """게시물 수정"""
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="게시물을 찾을 수 없습니다")
    
    # 작성자만 수정 가능
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인이 작성한 게시물만 수정할 수 있습니다"
        )
    
    # 업데이트할 필드만 수정
    update_data = post_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)
    
    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """게시물 삭제"""
    post = db.query(PostModel).filter(PostModel.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="게시물을 찾을 수 없습니다")
    
    # 작성자만 삭제 가능
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="본인이 작성한 게시물만 삭제할 수 있습니다"
        )
    
    db.delete(post)
    db.commit()
    
    return {"message": "게시물이 삭제되었습니다"}

@router.get("/user/{user_id}")
async def read_user_posts(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    """특정 사용자의 게시물 목록 조회"""
    query = db.query(PostModel).filter(PostModel.author_id == user_id)
    
    if published_only:
        query = query.filter(PostModel.is_published == True)
    
    posts = query.offset(skip).limit(limit).all()
    return posts