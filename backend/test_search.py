import requests
import json

def test_search(query, search_type="title"):
    """Test search functionality"""
    url = f"http://localhost:9090/api/books/search?query={query}&type={search_type}"
    print(f"Testing URL: {url}")
    
    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Found {data.get('numFound', 0)} results:")
            
            for i, book in enumerate(data.get('docs', []), 1):
                print(f"{i}. {book.get('title')} by {', '.join(book.get('author_name', ['Unknown']))}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {str(e)}")

if __name__ == "__main__":
    print("Testing search with different queries:")
    
    test_search("harry")
    print("\n---\n")
    
    test_search("sherlock")
    print("\n---\n")
    
    test_search("gatsby")
    print("\n---\n")
    
    test_search("rowling", "author")
    print("\n---\n")
    
    test_search("978", "isbn") 