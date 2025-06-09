from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.database import get_db
from ...models.models import User, ReadingListItem
from ...schemas.reading_list import ReadingListItemCreate, ReadingListItemResponse
from ...core.security import get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[ReadingListItemResponse])
def get_reading_list(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's reading list
    """
    reading_list = db.query(ReadingListItem).filter(ReadingListItem.user_id == current_user.id).all()
    return reading_list

@router.post("/", response_model=ReadingListItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_reading_list(
    item: ReadingListItemCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Add a book to the current user's reading list
    """
    # Check if book already in reading list
    existing_item = db.query(ReadingListItem).filter(
        ReadingListItem.user_id == current_user.id,
        ReadingListItem.book_id == item.book_id
    ).first()
    
    if existing_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book already in reading list"
        )
    
    # Create new reading list item
    db_item = ReadingListItem(
        **item.dict(),
        user_id=current_user.id
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return db_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_reading_list(
    item_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remove a book from the current user's reading list
    """
    # Get reading list item
    item = db.query(ReadingListItem).filter(
        ReadingListItem.id == item_id,
        ReadingListItem.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in reading list"
        )
    
    # Delete reading list item
    db.delete(item)
    db.commit()
    
    return None 