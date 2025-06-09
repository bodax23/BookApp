from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.security import get_current_active_user
from app.db.database import get_session
from app.models.user import User
from app.models.reading_list import ReadingListItem
from app.schemas.reading_list import (
    ReadingListItemCreate,
    ReadingListItemResponse,
    ReadingListItemUpdate,
)

router = APIRouter()


@router.get("", response_model=List[ReadingListItemResponse])
def get_reading_list(
    *,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Get all items in the current user's reading list"""
    items = db.exec(
        select(ReadingListItem)
        .where(ReadingListItem.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    ).all()
    return items


@router.post("", response_model=ReadingListItemResponse)
def add_to_reading_list(
    *,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
    item_in: ReadingListItemCreate,
) -> Any:
    """Add a book to the reading list"""
    # Check if the book is already in the reading list
    existing_item = db.exec(
        select(ReadingListItem)
        .where(ReadingListItem.user_id == current_user.id)
        .where(ReadingListItem.book_id == item_in.book_id)
    ).first()
    
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book already in reading list",
        )
    
    # Create the reading list item
    item = ReadingListItem(
        **item_in.dict(),
        user_id=current_user.id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", response_model=dict)
def remove_from_reading_list(
    *,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
    item_id: int,
) -> Any:
    """Remove a book from the reading list"""
    # Get the reading list item
    item = db.exec(
        select(ReadingListItem)
        .where(ReadingListItem.id == item_id)
        .where(ReadingListItem.user_id == current_user.id)
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found in reading list",
        )
    
    # Delete the item
    db.delete(item)
    db.commit()
    return {"message": "Book removed from reading list"} 