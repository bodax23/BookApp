import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ...db.database import get_db
from ...models.user import User
from ...schemas.user import UserCreate, UserResponse, Token
from ...core.security import create_access_token
from ...core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db), request: Request = None):
    """
    Register a new user and return JWT token
    """
    if request:
        logger.info(f"Registration request from {request.client.host} with headers: {request.headers}")
        
    logger.info(f"Registering user with email: {user_data.email} and username: {user_data.username}")
    
    # Check if email already exists
    db_user_email = db.query(User).filter(User.email == user_data.email).first()
    if db_user_email:
        logger.warning(f"Registration failed: Email {user_data.email} already registered")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    db_user_username = db.query(User).filter(User.username == user_data.username).first()
    if db_user_username:
        logger.warning(f"Registration failed: Username {user_data.username} already taken")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = User.get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.username, "id": db_user.id},
        expires_delta=access_token_expires
    )
    
    logger.info(f"User {user_data.username} registered successfully")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@router.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login a user and return JWT token
    """
    # Find user by username
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # Check if user exists and password is correct
    if not user or not user.verify_password(form_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Generate access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "id": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    } 