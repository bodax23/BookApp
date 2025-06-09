from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import json

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample book data
BOOKS = [
    {
        "key": "/works/OL6789012W",
        "title": "Harry Potter and the Sorcerer's Stone",
        "author_name": ["J.K. Rowling"],
        "first_publish_year": 1997,
        "cover_i": 8372296,
        "isbn": ["9780590353427"]
    },
    {
        "key": "/works/OL1122334W",
        "title": "Harry Potter and the Chamber of Secrets",
        "author_name": ["J.K. Rowling"],
        "first_publish_year": 1998,
        "cover_i": 8372297,
        "isbn": ["9780439064866"]
    },
    {
        "key": "/works/OL2233445W",
        "title": "Harry Potter and the Prisoner of Azkaban",
        "author_name": ["J.K. Rowling"],
        "first_publish_year": 1999,
        "cover_i": 8372298,
        "isbn": ["9780439136358"]
    },
    {
        "key": "/works/OL3344556W",
        "title": "Sherlock Holmes",
        "author_name": ["Arthur Conan Doyle"],
        "first_publish_year": 1887,
        "cover_i": 8372299,
        "isbn": ["9780439139595"]
    },
    {
        "key": "/works/OL4455667W",
        "title": "The Great Gatsby",
        "author_name": ["F. Scott Fitzgerald"],
        "first_publish_year": 1925,
        "cover_i": 8323053,
        "isbn": ["9780061120084"]
    },
    {
        "key": "/works/OL5566778W",
        "title": "Pride and Prejudice",
        "author_name": ["Jane Austen"],
        "first_publish_year": 1813,
        "cover_i": 8340981,
        "isbn": ["9780439023481"]
    }
]

# Book details data
BOOK_DETAILS = {
    "OL6789012W": {
        "id": "OL6789012W",
        "title": "Harry Potter and the Sorcerer's Stone",
        "authors": [{"name": "J.K. Rowling"}],
        "description": "Harry Potter has never been the star of a Quidditch team...",
        "subjects": ["Fantasy", "Magic", "Wizards"],
        "cover_id": 8372296
    },
    "OL3344556W": {
        "id": "OL3344556W",
        "title": "Sherlock Holmes",
        "authors": [{"name": "Arthur Conan Doyle"}],
        "description": "The complete collection of Sherlock Holmes stories...",
        "subjects": ["Mystery", "Detective"],
        "cover_id": 8372299
    }
}

# In-memory reading list
READING_LIST = []

@app.get("/")
def read_root():
    return {"message": "API is working!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/books/search")
def search_books(
    query: str = Query("", description="Search query"),
    type: str = Query("title", description="Search type (title, author, isbn)"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Results per page")
):
    print(f"Search request: query='{query}', type='{type}'")
    
    if not query.strip():
        print("Empty query, returning all books")
        return {
            "numFound": len(BOOKS),
            "docs": BOOKS,
            "page": page,
            "limit": limit
        }
    
    filtered_books = []
    query = query.lower().strip()
    
    for book in BOOKS:
        if type == "title" and query in book["title"].lower():
            print(f"Match found in title: {book['title']}")
            filtered_books.append(book)
        elif type == "author" and any(query in author.lower() for author in book["author_name"]):
            print(f"Match found in author: {', '.join(book['author_name'])}")
            filtered_books.append(book)
        elif type == "isbn" and any(query in isbn for isbn in book["isbn"]):
            print(f"Match found in ISBN: {', '.join(book['isbn'])}")
            filtered_books.append(book)
    
    print(f"Found {len(filtered_books)} matching books")
    
    return {
        "numFound": len(filtered_books),
        "docs": filtered_books,
        "page": page,
        "limit": limit
    }

@app.get("/api/books/{book_id}")
def get_book_details(book_id: str):
    clean_id = book_id.replace("/works/", "")
    
    if clean_id in BOOK_DETAILS:
        return BOOK_DETAILS[clean_id]
    
    return {"detail": "Book not found"}

@app.get("/api/reading-list")
def get_reading_list():
    return READING_LIST

@app.post("/api/reading-list")
def add_to_reading_list(book: Dict[str, Any]):
    # Check if book is already in reading list
    for item in READING_LIST:
        if item["book_id"] == book.get("book_id"):
            return {"detail": "Book already in reading list"}
    
    # Create new reading list item
    new_item = {
        "id": len(READING_LIST) + 1,
        "user_id": 1,
        "book_id": book.get("book_id", ""),
        "title": book.get("title", ""),
        "author": book.get("author", ""),
        "cover_id": book.get("cover_id"),
        "year": book.get("year"),
        "added_at": "2023-06-09T12:00:00Z"
    }
    
    READING_LIST.append(new_item)
    return new_item

@app.delete("/api/reading-list/{item_id}")
def remove_from_reading_list(item_id: int):
    for i, item in enumerate(READING_LIST):
        if item["id"] == item_id:
            removed = READING_LIST.pop(i)
            return {"message": f"Removed {removed['title']} from reading list"}
    
    return {"detail": "Book not found in reading list"}

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server on http://localhost:9090")
    uvicorn.run("fixed_test:app", host="localhost", port=9090, log_level="info") 