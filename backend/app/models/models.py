from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext
from datetime import datetime

from ..db.database import Base

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationship
    reading_list = relationship("ReadingListItem", back_populates="user", cascade="all, delete-orphan")
    
    def verify_password(self, plain_password):
        return pwd_context.verify(plain_password, self.hashed_password)
    
    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password)

# Reading list model
class ReadingListItem(Base):
    __tablename__ = "reading_list_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(String(255), nullable=False)  # Open Library ID
    title = Column(String(255), nullable=False)
    author = Column(String(255))
    cover_id = Column(String(255))
    added_at = Column(DateTime, default=func.now())
    
    # Relationship
    user = relationship("User", back_populates="reading_list") 