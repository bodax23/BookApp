from fastapi import APIRouter

from .endpoints import auth, users, books, reading_list

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(books.router, prefix="/books", tags=["Books"])
api_router.include_router(reading_list.router, prefix="/reading-list", tags=["Reading List"]) 