from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.database import get_db
from ...models.user import User
from ...schemas.user import UserResponse, UserWithReadingList
from ...core.security import get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get the current user's profile information
    """
    return current_user

@router.get("/me/reading-list", response_model=UserWithReadingList)
def get_current_user_with_reading_list(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's profile with reading list
    """
    user = db.query(User).filter(User.id == current_user.id).first()
    return user 