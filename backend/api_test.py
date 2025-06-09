import requests
import json
import sys
from urllib.parse import urlencode

BASE_URL = "http://localhost:8004/api"

def print_json(data):
    """Print JSON data in a pretty format"""
    print(json.dumps(data, indent=2))

def test_search_books(query, search_type="title"):
    """Test the book search endpoint"""
    params = {
        "query": query,
        "type": search_type
    }
    url = f"{BASE_URL}/books/search?{urlencode(params)}"
    print(f"Testing search URL: {url}")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        print(f"Search for '{query}' by {search_type} found {data.get('numFound', 0)} results:")
        if data.get('docs'):
            for i, book in enumerate(data['docs'], 1):
                print(f"{i}. {book.get('title')} by {', '.join(book.get('author_name', ['Unknown']))}")
        else:
            print("No books found.")
        
        return data
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_reading_list():
    """Test reading list endpoints"""
    print("\nTesting reading list endpoints:")
    
    # Get reading list
    try:
        response = requests.get(f"{BASE_URL}/reading-list")
        response.raise_for_status()
        data = response.json()
        
        print(f"Current reading list has {len(data)} items:")
        for item in data:
            print(f"- {item.get('title')} by {item.get('author')}")
    except Exception as e:
        print(f"Error getting reading list: {e}")
    
    # Add a book to reading list
    book_data = {
        "book_id": "OL99999W",
        "title": "Test Book",
        "author": "Test Author",
        "cover_id": 12345,
        "year": 2023
    }
    
    try:
        response = requests.post(f"{BASE_URL}/reading-list", json=book_data)
        response.raise_for_status()
        data = response.json()
        
        print(f"Added book to reading list: {data.get('title')} by {data.get('author')}")
        
        # Save the ID for deletion
        item_id = data.get('id')
        
        # Delete the book from reading list
        if item_id:
            response = requests.delete(f"{BASE_URL}/reading-list/{item_id}")
            response.raise_for_status()
            print(f"Removed book from reading list (ID: {item_id})")
    except Exception as e:
        print(f"Error with reading list operations: {e}")

if __name__ == "__main__":
    # Use command line arguments if provided
    if len(sys.argv) > 1:
        query = sys.argv[1]
        search_type = sys.argv[2] if len(sys.argv) > 2 else "title"
    else:
        # Default test cases
        print("Running default tests...")
        test_search_books("harry", "title")
        test_search_books("tolkien", "author")
        test_search_books("978", "isbn")
        test_search_books("H", "title")  # Test partial matching
        
        # Test reading list functionality
        test_reading_list() 