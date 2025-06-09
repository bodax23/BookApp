from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Open Library API URLs
OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPEN_LIBRARY_BOOK_URL = "https://openlibrary.org/works/{}.json"

@app.get("/")
def read_root():
    return {"message": "Open Library API service is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/books/search")
async def search_books(
    query: str = Query(..., description="Search query"),
    type: str = Query("title", description="Search type (title, author, isbn)"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Results per page"),
):
    """
    Search books via Open Library API
    """
    logger.info(f"Searching for {query} by {type}")
    
    # Map our search type to Open Library's search fields
    field_map = {
        "title": "title",
        "author": "author",
        "isbn": "isbn"
    }
    
    search_field = field_map.get(type, "q")
    
    # Calculate offset for pagination
    offset = (page - 1) * limit
    
    # Build query parameters
    params = {
        search_field: query,
        "limit": limit,
        "offset": offset,
        "fields": "key,title,author_name,first_publish_year,cover_i,isbn",
        "mode": "everything"
    }
    
    logger.info(f"Making request to Open Library: {params}")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(OPEN_LIBRARY_SEARCH_URL, params=params)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Found {data.get('numFound', 0)} results")
            
            return {
                "numFound": data.get("numFound", 0),
                "docs": data.get("docs", []),
                "page": page,
                "limit": limit
            }
    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred: {e}")
        return {"error": str(e), "numFound": 0, "docs": [], "page": page, "limit": limit}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": str(e), "numFound": 0, "docs": [], "page": page, "limit": limit}

@app.get("/api/books/{book_id}")
async def get_book_details(book_id: str):
    """
    Get book details via Open Library API
    """
    # Clean the book ID if it contains a path prefix
    clean_id = book_id.replace("/works/", "")
    
    logger.info(f"Fetching book details for {clean_id}")
    
    try:
        # Get book details
        async with httpx.AsyncClient() as client:
            url = OPEN_LIBRARY_BOOK_URL.format(clean_id)
            logger.info(f"Making request to: {url}")
            
            response = await client.get(url)
            response.raise_for_status()
            
            book_data = response.json()
            
            # Extract and format the data
            book_details = {
                "id": clean_id,
                "title": book_data.get("title", "Unknown Title"),
                "description": book_data.get("description", {}).get("value", "") if isinstance(book_data.get("description"), dict) else book_data.get("description", ""),
                "subjects": book_data.get("subjects", []),
                "created": book_data.get("created", {}).get("value", "") if isinstance(book_data.get("created"), dict) else "",
                "last_modified": book_data.get("last_modified", {}).get("value", "") if isinstance(book_data.get("last_modified"), dict) else "",
                "cover_id": book_data.get("covers", [None])[0] if book_data.get("covers") else None,
            }
            
            # Get author details if available
            authors = []
            if "authors" in book_data and isinstance(book_data["authors"], list):
                for author in book_data["authors"]:
                    if "author" in author and "key" in author["author"]:
                        # We could fetch author details, but for simplicity we'll just use the key
                        author_key = author["author"]["key"].split("/")[-1]
                        authors.append({"name": author_key})
            
            book_details["authors"] = authors
            
            return book_details
    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred: {e}")
        return {"error": str(e)}
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    print("Starting Open Library API service on http://localhost:9092")
    uvicorn.run("open_library_api:app", host="localhost", port=9092, log_level="info") 