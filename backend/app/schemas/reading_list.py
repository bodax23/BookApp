from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


# Base Reading List Item Schema
class ReadingListItemBase(BaseModel):
    book_id: str
    title: str
    author: Optional[str] = None
    cover_id: Optional[str] = None


# Create Reading List Item Schema
class ReadingListItemCreate(ReadingListItemBase):
    pass


# Reading List Item Response Schema
class ReadingListItemResponse(ReadingListItemBase):
    id: int
    user_id: int
    added_at: datetime

    class Config:
        orm_mode = True 