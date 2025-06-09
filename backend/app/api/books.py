import logging
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
import httpx

from app.core.security import get_current_active_user
from app.models.user import User
from app.schemas.books import BookSearchResponse, BookDetailResponse

router = APIRouter()
logger = logging.getLogger(__name__)

# Open Library API URLs
OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPEN_LIBRARY_WORKS_URL = "https://openlibrary.org/works"


@router.get("/search", response_model=BookSearchResponse)
async def search_books(
    *,
    query: str = Query(..., description="Search query"),
    type: str = Query("title", description="Search type (title, author, isbn)"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Results per page"),
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Search for books in the Open Library API
    """
    logger.info(f"Searching for books with query: {query}, type: {type}")
    
    try:
        # Prepare query parameters based on search type
        params = {"limit": limit}
        if type == "title":
            params["title"] = query
        elif type == "author":
            params["author"] = query
        elif type == "isbn":
            params["isbn"] = query
        else:
            params["q"] = query
            
        # Optional pagination
        if page > 1:
            params["page"] = page
            
        async with httpx.AsyncClient() as client:
            response = await client.get(OPEN_LIBRARY_SEARCH_URL, params=params)
            response.raise_for_status()  # Raise exception for 4XX/5XX responses
            
            search_results = response.json()
            
            # Log successful search
            logger.info(f"Found {search_results.get('numFound', 0)} books matching query: {query}")
            
            return {
                "docs": search_results.get("docs", []),
                "numFound": search_results.get("numFound", 0),
                "page": page,
                "limit": limit,
            }
            
    except httpx.HTTPError as e:
        logger.error(f"Error searching Open Library API: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error fetching data from Open Library API: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error searching books: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred during search",
        )


@router.get("/{book_id}", response_model=BookDetailResponse)
async def get_book_details(
    *,
    book_id: str,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get detailed information about a book from Open Library
    """
    logger.info(f"Fetching details for book ID: {book_id}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OPEN_LIBRARY_WORKS_URL}/{book_id}.json")
            response.raise_for_status()
            
            book_data = response.json()
            
            # Log successful fetch
            logger.info(f"Successfully fetched details for book: {book_data.get('title', 'Unknown')}")
            
            # Enhance with cover info if available
            cover_id = book_data.get("covers", [None])[0] if "covers" in book_data else None
            
            return {
                "id": book_id,
                "title": book_data.get("title", "Unknown Title"),
                "authors": book_data.get("authors", []),
                "description": book_data.get("description", {}).get("value", "") 
                    if isinstance(book_data.get("description", {}), dict) 
                    else book_data.get("description", ""),
                "subjects": book_data.get("subjects", []),
                "created": book_data.get("created", {}).get("value", ""),
                "last_modified": book_data.get("last_modified", {}).get("value", ""),
                "cover_id": cover_id,
            }
            
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            logger.warning(f"Book not found: {book_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found",
            )
        logger.error(f"HTTP error fetching book details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error fetching data from Open Library API: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error fetching book details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred while fetching book details",
        ) 