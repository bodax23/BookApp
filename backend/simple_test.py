from fastapi import FastAPI
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
    return {"message": "API is working!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/books/search")
def search_books(query: str = "", type: str = "title"):
    print(f"Search request received: query='{query}', type='{type}'")
    
    # Sample book data
    books = [
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
        },
        {
            "key": "/works/OL6677889W",
            "title": "To Kill a Mockingbird",
            "author_name": ["Harper Lee"],
            "first_publish_year": 1960,
            "cover_i": 8323052,
            "isbn": ["9780061120084"]
        },
        {
            "key": "/works/OL7788990W",
            "title": "1984",
            "author_name": ["George Orwell"],
            "first_publish_year": 1949,
            "cover_i": 8312952,
            "isbn": ["9780451524935"]
        },
        {
            "key": "/works/OL8899001W",
            "title": "The Hobbit",
            "author_name": ["J.R.R. Tolkien"],
            "first_publish_year": 1937,
            "cover_i": 8363626,
            "isbn": ["9780618260300"]
        }
    ]
    
    # Filter books based on search query
    filtered_books = []
    
    # Handle empty query
    if not query or query.strip() == "":
        print("Empty query, returning all books")
        filtered_books = books
    else:
        query = query.lower().strip()
        print(f"Filtering books by '{query}' in {type}")
        
        for book in books:
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
    
    # Return results
    return {
        "numFound": len(filtered_books),
        "docs": filtered_books,
        "page": 1,
        "limit": 10
    }

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

@app.get("/api/books/{book_id}")
def get_book_details(book_id: str):
    # Sample book data based on ID
    books = {
        "OL6789012W": {
            "id": "OL6789012W",
            "title": "Harry Potter and the Sorcerer's Stone",
            "authors": [{"name": "J.K. Rowling"}],
            "description": "Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground. He knows no spells, has never helped to hatch a dragon, and has never worn a cloak of invisibility. All he knows is a miserable life with the Dursleys, his horrible aunt and uncle, and their abominable son, Dudley - a great big swollen spoiled bully.",
            "subjects": ["Fantasy", "Magic", "Wizards", "Fiction"],
            "created": "1997-06-26T00:00:00Z",
            "last_modified": "2020-01-01T00:00:00Z",
            "cover_id": 8372296,
        },
        "OL1122334W": {
            "id": "OL1122334W",
            "title": "Harry Potter and the Chamber of Secrets",
            "authors": [{"name": "J.K. Rowling"}],
            "description": "The Dursleys were so mean and hideous that summer that all Harry Potter wanted was to get back to the Hogwarts School for Witchcraft and Wizardry. But just as he's packing his bags, Harry receives a warning from a strange, impish creature named Dobby who says that if Harry Potter returns to Hogwarts, disaster will strike.",
            "subjects": ["Fantasy", "Magic", "Wizards", "Fiction"],
            "created": "1998-07-02T00:00:00Z",
            "last_modified": "2020-01-01T00:00:00Z",
            "cover_id": 8372297,
        },
        "OL2233445W": {
            "id": "OL2233445W",
            "title": "Harry Potter and the Prisoner of Azkaban",
            "authors": [{"name": "J.K. Rowling"}],
            "description": "Harry Potter is lucky to reach the age of thirteen, since he has already survived the murderous attacks of the feared Dark Lord on more than one occasion. But his hopes for a quiet term concentrating on Quidditch are dashed when a maniacal mass-murderer escapes from Azkaban, pursued by the soul-sucking Dementors who guard the prison.",
            "subjects": ["Fantasy", "Magic", "Wizards", "Fiction"],
            "created": "1999-07-08T00:00:00Z",
            "last_modified": "2020-01-01T00:00:00Z",
            "cover_id": 8372298,
        },
        "OL3344556W": {
            "id": "OL3344556W",
            "title": "Sherlock Holmes",
            "authors": [{"name": "Arthur Conan Doyle"}],
            "description": "The complete collection of Sherlock Holmes stories, including novels and short stories.",
            "subjects": ["Mystery", "Detective", "Fiction"],
            "created": "1887-01-01T00:00:00Z",
            "last_modified": "2020-01-01T00:00:00Z",
            "cover_id": 8372299,
        }
    }
    
    # Extract the ID from the path parameter
    clean_id = book_id.replace("/works/", "")
    
    # Return book details if found
    if clean_id in books:
        return books[clean_id]
    
    # Return a 404 if book not found
    return {"detail": "Book not found"}

# Run with: uvicorn simple_test:app --host localhost --port 9090 