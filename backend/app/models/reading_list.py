from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship


class ReadingListItem(SQLModel, table=True):
    """Model for reading list items (books)"""
    __tablename__ = "reading_list_items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    book_id: str = Field(index=True)  # ID from Open Library
    title: str = Field()
    author: str = Field()
    cover_id: Optional[int] = Field(default=None)  # Cover ID from Open Library
    year: Optional[int] = Field(default=None)
    added_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Foreign key
    user_id: int = Field(foreign_key="users.id")
    
    # Relationship
    user: "User" = Relationship(back_populates="reading_list_items")
    
    class Config:
        arbitrary_types_allowed = True


# To avoid circular import
from app.models.user import User 