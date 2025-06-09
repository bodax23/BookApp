from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

# User Registration Schema
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

# User Login Schema
class UserLogin(BaseModel):
    username: str
    password: str

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Token Data Schema
class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

# User Response Schema
class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

# User with Reading List
class UserWithReadingList(UserResponse):
    reading_list: List["ReadingListItemResponse"] = []
    
    class Config:
        orm_mode = True

# For resolving forward references
from .reading_list import ReadingListItemResponse
UserWithReadingList.update_forward_refs() 