from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Author(BaseModel):
    """Author schema from Open Library API"""
    key: Optional[str] = None
    name: Optional[str] = None


class BookItem(BaseModel):
    """Book search result item schema"""
    key: Optional[str] = None
    title: str
    author_name: Optional[List[str]] = None
    first_publish_year: Optional[int] = None
    cover_i: Optional[int] = None
    isbn: Optional[List[str]] = None
    id: str = Field(..., description="Book ID")


class BookSearchResponse(BaseModel):
    """Response schema for book search results"""
    docs: List[Dict[str, Any]] = Field(default_factory=list)
    numFound: int
    page: int = 1
    limit: int = 10


class BookDetailResponse(BaseModel):
    """Response schema for book details"""
    id: str
    title: str
    authors: Optional[List[Dict[str, Any]]] = None
    description: Optional[str] = None
    subjects: Optional[List[str]] = None
    created: Optional[str] = None
    last_modified: Optional[str] = None
    cover_id: Optional[int] = None 