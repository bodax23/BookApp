from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Mock API is working!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/books/search")
def search_books(
    query: str = Query("", description="Search query"),
    type: str = Query("title", description="Search type (title, author, isbn)")
):
    # Hardcoded responses based on query
    query = query.lower()
    
    if "harry" in query or "potter" in query:
        return {
            "numFound": 3,
            "docs": [
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
                }
            ],
            "page": 1,
            "limit": 10
        }
    elif "sherlock" in query or "holmes" in query:
        return {
            "numFound": 1,
            "docs": [
                {
                    "key": "/works/OL3344556W",
                    "title": "Sherlock Holmes",
                    "author_name": ["Arthur Conan Doyle"],
                    "first_publish_year": 1887,
                    "cover_i": 8372299,
                    "isbn": ["9780439139595"]
                }
            ],
            "page": 1,
            "limit": 10
        }
    elif "gatsby" in query:
        return {
            "numFound": 1,
            "docs": [
                {
                    "key": "/works/OL4455667W",
                    "title": "The Great Gatsby",
                    "author_name": ["F. Scott Fitzgerald"],
                    "first_publish_year": 1925,
                    "cover_i": 8323053,
                    "isbn": ["9780061120084"]
                }
            ],
            "page": 1,
            "limit": 10
        }
    elif "rowling" in query and type == "author":
        return {
            "numFound": 3,
            "docs": [
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
                }
            ],
            "page": 1,
            "limit": 10
        }
    else:
        # Return empty results for any other query
        return {
            "numFound": 0,
            "docs": [],
            "page": 1,
            "limit": 10
        }

@app.get("/api/books/{book_id}")
def get_book_details(book_id: str):
    # Extract the ID from the path parameter
    clean_id = book_id.replace("/works/", "")
    
    # Hardcoded responses based on book ID
    if clean_id == "OL6789012W":
        return {
            "id": "OL6789012W",
            "title": "Harry Potter and the Sorcerer's Stone",
            "authors": [{"name": "J.K. Rowling"}],
            "description": "Harry Potter has never been the star of a Quidditch team...",
            "subjects": ["Fantasy", "Magic", "Wizards"],
            "cover_id": 8372296
        }
    elif clean_id == "OL3344556W":
        return {
            "id": "OL3344556W",
            "title": "Sherlock Holmes",
            "authors": [{"name": "Arthur Conan Doyle"}],
            "description": "The complete collection of Sherlock Holmes stories...",
            "subjects": ["Mystery", "Detective"],
            "cover_id": 8372299
        }
    else:
        return {"detail": "Book not found"}

@app.get("/api/reading-list")
def get_reading_list():
    return []

@app.post("/api/reading-list")
def add_to_reading_list(book: dict):
    return {
        "id": 1,
        "user_id": 1,
        "book_id": book.get("book_id", ""),
        "title": book.get("title", ""),
        "author": book.get("author", ""),
        "cover_id": book.get("cover_id"),
        "year": book.get("year"),
        "added_at": "2023-06-09T12:00:00Z"
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting Mock API server on http://localhost:9091")
    uvicorn.run("simple_mock:app", host="localhost", port=9091, log_level="info") 