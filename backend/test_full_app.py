from fastapi import FastAPI, Depends, HTTPException, Body, Query
from fastapi.middleware.cors import CORSMiddleware
import logging
import httpx
from datetime import datetime, timedelta
import json
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, EmailStr, Field

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models for auth
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Models for reading list
class ReadingListItemCreate(BaseModel):
    book_id: str
    title: str
    author: str
    cover_id: Optional[int] = None
    year: Optional[int] = None

class ReadingListItem(ReadingListItemCreate):
    id: int
    user_id: int
    added_at: str

# In-memory storage for reading list
reading_list_items = []

# Create FastAPI app
app = FastAPI(title="Test Full API")

# Add CORS middleware with broader configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],
)

# Routes
@app.get("/")
def root():
    logger.info("Root endpoint called")
    return {
        "message": "Welcome to the Test API",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/health")
def health_check():
    """Test health check endpoint"""
    logger.info("Health check called")
    return {"status": "healthy"}

@app.get("/test-http")
async def test_http():
    """Test HTTP request to external API"""
    logger.info("Testing HTTP request")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://httpbin.org/get")
            return {
                "status": "success",
                "data": response.json()
            }
    except Exception as e:
        logger.error(f"HTTP test failed: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

# Test Auth endpoints
@app.post("/api/auth/login", response_model=Token)
def login(login_data: UserLogin):
    """Test login endpoint"""
    logger.info(f"Login attempt for: {login_data.email}")
    
    # For testing, always succeed
    test_user = UserResponse(
        id=1,
        username="testuser",
        email=login_data.email
    )
    
    return {
        "access_token": "test_token_12345",
        "token_type": "bearer",
        "user": test_user
    }

@app.post("/api/auth/register", response_model=Token)
def register(register_data: UserRegister):
    """Test register endpoint"""
    logger.info(f"Register attempt for: {register_data.email}")
    
    # For testing, always succeed
    test_user = UserResponse(
        id=1,
        username=register_data.username,
        email=register_data.email
    )
    
    return {
        "access_token": "test_token_12345",
        "token_type": "bearer",
        "user": test_user
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user():
    """Test get current user endpoint"""
    logger.info("Get current user called")
    
    # For testing, return a test user
    return UserResponse(
        id=1,
        username="testuser",
        email="test@example.com"
    )

@app.get("/api/reading-list")
def get_reading_list():
    """Get all items in the reading list"""
    logger.info("Get reading list called")
    return reading_list_items

@app.post("/api/reading-list", status_code=201)
def add_to_reading_list(item: ReadingListItemCreate):
    """Add a book to the reading list"""
    logger.info(f"Adding book to reading list: {item.title}")
    
    # Check if book is already in the reading list
    for existing_item in reading_list_items:
        if existing_item["book_id"] == item.book_id:
            raise HTTPException(
                status_code=400,
                detail="Book already in reading list"
            )
    
    # Create a new reading list item
    new_item = {
        "id": len(reading_list_items) + 1,
        "user_id": 1,  # Always use test user ID
        "book_id": item.book_id,
        "title": item.title,
        "author": item.author,
        "cover_id": item.cover_id,
        "year": item.year,
        "added_at": datetime.now().isoformat()
    }
    
    # Add to reading list
    reading_list_items.append(new_item)
    
    return new_item

@app.delete("/api/reading-list/{item_id}")
def remove_from_reading_list(item_id: int):
    """Remove a book from the reading list"""
    logger.info(f"Removing book from reading list: ID {item_id}")
    
    # Find the item
    for i, item in enumerate(reading_list_items):
        if item["id"] == item_id:
            # Remove the item
            reading_list_items.pop(i)
            return {"message": "Book removed from reading list"}
    
    # Item not found
    raise HTTPException(
        status_code=404,
        detail="Book not found in reading list"
    )

# Book search endpoint using real Open Library API
@app.get("/api/books/search")
async def search_books(
    query: str = Query(..., description="Search query"),
    type: str = Query("title", description="Search type (title, author, isbn)"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Results per page"),
):
    """Search books using the real Open Library API"""
    logger.info(f"Book search: query='{query}', type='{type}', page={page}, limit={limit}")
    
    # Define the Open Library API URL
    open_library_url = "https://openlibrary.org/search.json"
    
    # Define the search field based on type
    search_field = "title"
    if type == "author":
        search_field = "author"
    elif type == "isbn":
        search_field = "isbn"
    
    # Build parameters for Open Library API
    params = {
        "q": query,
        "fields": "key,title,author_name,first_publish_year,cover_i,isbn",
        "page": page,
        "limit": limit,
    }
    
    # Add search field if it's not a general search
    if search_field:
        params[search_field] = query
    
    try:
        # Make request to Open Library API
        async with httpx.AsyncClient() as client:
            logger.info(f"Requesting from Open Library API: {open_library_url} with params: {params}")
            response = await client.get(open_library_url, params=params, timeout=10.0)
            
            if response.status_code != 200:
                logger.error(f"Open Library API error: {response.status_code} - {response.text}")
                return {
                    "numFound": 0,
                    "docs": [],
                    "page": page,
                    "limit": limit,
                    "error": f"API error: {response.status_code}"
                }
            
            # Parse the response
            data = response.json()
            logger.info(f"Found {data.get('numFound', 0)} books from Open Library API")
            
            # Return formatted results
            return {
                "numFound": data.get("numFound", 0),
                "docs": data.get("docs", []),
                "page": page,
                "limit": limit,
            }
    
    except Exception as e:
        logger.error(f"Error querying Open Library API: {str(e)}")
        
        # Fallback to sample data if API call fails
        logger.info("Using sample data as fallback")
        sample_books = [
            {
                "key": "/works/OL1234567W",
                "title": "Harry Potter and the Sorcerer's Stone",
                "author_name": ["J.K. Rowling"],
                "first_publish_year": 1997,
                "cover_i": 8372296,
                "isbn": ["9780590353427"],
            },
            {
                "key": "/works/OL2345678W",
                "title": "To Kill a Mockingbird",
                "author_name": ["Harper Lee"],
                "first_publish_year": 1960,
                "cover_i": 8323052,
                "isbn": ["9780061120084"],
            },
            {
                "key": "/works/OL3456789W",
                "title": "1984",
                "author_name": ["George Orwell"],
                "first_publish_year": 1949,
                "cover_i": 8312952,
                "isbn": ["9780451524935"],
            },
            {
                "key": "/works/OL4567890W",
                "title": "Pride and Prejudice",
                "author_name": ["Jane Austen"],
                "first_publish_year": 1813,
                "cover_i": 8388048,
                "isbn": ["9780141439518"],
            },
            {
                "key": "/works/OL5678901W",
                "title": "The Catcher in the Rye",
                "author_name": ["J.D. Salinger"],
                "first_publish_year": 1951,
                "cover_i": 8325011,
                "isbn": ["9780316769488"],
            },
        ]
        
        # For 'harry potter' queries, make sure we return some results
        if 'harry' in query.lower() or 'potter' in query.lower():
            return {
                "numFound": 1,
                "docs": [sample_books[0]],
                "page": page,
                "limit": limit,
                "note": "Using fallback sample data due to API error"
            }
        
        # For 'tolkien' queries, return some results
        if 'tolkien' in query.lower() or 'ring' in query.lower():
            return {
                "numFound": 1,
                "docs": [{
                    "key": "/works/OL8901234W",
                    "title": "The Lord of the Rings",
                    "author_name": ["J.R.R. Tolkien"],
                    "first_publish_year": 1954,
                    "cover_i": 8372427,
                    "isbn": ["9780618640157"],
                }],
                "page": page,
                "limit": limit,
                "note": "Using fallback sample data due to API error"
            }
        
        # Filter sample books based on query
        filtered_books = []
        query = query.lower()
        
        for book in sample_books:
            if type == "title" and query in book["title"].lower():
                filtered_books.append(book)
            elif type == "author" and any(query in author.lower() for author in book["author_name"]):
                filtered_books.append(book)
            elif type == "isbn" and any(query in isbn for isbn in book["isbn"]):
                filtered_books.append(book)
        
        return {
            "numFound": len(filtered_books),
            "docs": filtered_books,
            "page": page,
            "limit": limit,
            "note": "Using fallback sample data due to API error"
        }

@app.get("/api/books/{book_id}")
async def get_book_details(book_id: str):
    """Get book details from Open Library API"""
    logger.info(f"Book details request for ID: {book_id}")
    
    # Clean the book_id (remove "/works/" prefix if present)
    if book_id.startswith("/works/"):
        book_id = book_id
    else:
        book_id = f"/works/{book_id}"
    
    # Define the Open Library API URL
    open_library_url = f"https://openlibrary.org{book_id}.json"
    
    try:
        # Make request to Open Library API
        async with httpx.AsyncClient() as client:
            logger.info(f"Requesting from Open Library API: {open_library_url}")
            response = await client.get(open_library_url, timeout=10.0)
            
            if response.status_code != 200:
                logger.error(f"Open Library API error: {response.status_code} - {response.text}")
                # Return sample data if API call fails
                return {
                    "id": book_id,
                    "title": "Sample Book Title",
                    "authors": [{"name": "Sample Author"}],
                    "description": "This is a sample book description for testing purposes.",
                    "subjects": ["Fiction", "Literature", "Sample"],
                    "created": "2023-01-01T00:00:00Z",
                    "last_modified": "2023-01-01T00:00:00Z",
                    "cover_id": 8352301,
                    "note": "Using sample data due to API error"
                }
            
            # Parse the response
            data = response.json()
            logger.info(f"Received book details from Open Library API: {data.get('title', 'Unknown title')}")
            
            # Format the response
            result = {
                "id": book_id.replace("/works/", ""),
                "title": data.get("title", "Unknown title"),
                "created": data.get("created", {}).get("value", "Unknown date"),
                "last_modified": data.get("last_modified", {}).get("value", "Unknown date"),
            }
            
            # Try to get the description
            if "description" in data:
                if isinstance(data["description"], dict):
                    result["description"] = data["description"].get("value", "")
                else:
                    result["description"] = data["description"]
            
            # Try to get subjects
            if "subjects" in data:
                result["subjects"] = data["subjects"]
            
            # Try to get cover ID
            if "covers" in data and len(data["covers"]) > 0:
                result["cover_id"] = data["covers"][0]
            
            # Get author information
            if "authors" in data:
                result["authors"] = []
                for author in data["authors"]:
                    if isinstance(author, dict) and "author" in author:
                        author_key = author["author"]["key"]
                        # Fetch author details
                        author_url = f"https://openlibrary.org{author_key}.json"
                        author_response = await client.get(author_url, timeout=5.0)
                        if author_response.status_code == 200:
                            author_data = author_response.json()
                            result["authors"].append({"name": author_data.get("name", "Unknown author")})
                        else:
                            result["authors"].append({"name": "Unknown author"})
            
            return result
            
    except Exception as e:
        logger.error(f"Error querying Open Library API for book details: {str(e)}")
        
        # Return sample data if API call fails
        return {
            "id": book_id.replace("/works/", ""),
            "title": "Sample Book Title",
            "authors": [{"name": "Sample Author"}],
            "description": "This is a sample book description for testing purposes.",
            "subjects": ["Fiction", "Literature", "Sample"],
            "created": "2023-01-01T00:00:00Z",
            "last_modified": "2023-01-01T00:00:00Z",
            "cover_id": 8352301,
            "note": "Using sample data due to API error"
        }

# Run with: uvicorn test_full_app:app --host 0.0.0.0 --port 8003 