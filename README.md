# Reading List Application

A full-stack application for searching and managing your reading list.

## Features

### Authentication
- User registration and login using JWT tokens
- Protected routes that require authentication

### Book Search
- Search books by title, author, or ISBN using Open Library API
- Display search results with book title, author, year, and cover image

### Book Details
- View detailed information about a book
- See cover image, title, author, publication year, and description

### Reading List
- Add books to your personal reading list
- Remove books from your reading list
- Data stored in MySQL database
- Reading list is user-specific

## Tech Stack

### Backend
- FastAPI (Python)
- MySQL database
- SQLAlchemy ORM
- JWT authentication

### Frontend
- React with TypeScript
- Chakra UI for components
- React Router for navigation
- Axios for API requests

## Getting Started

### Prerequisites
- Node.js and npm
- Python 3.8 or higher


### Running the Application

1. **Start the backend:**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 9090 --reload
```

2. **Start the frontend:**

```bash
cd frontend
npm install
npm run dev
```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login and get JWT token

### Books
- GET `/api/books/search` - Search for books
- GET `/api/books/{book_id}` - Get book details

### Reading List
- GET `/api/reading-list` - Get user's reading list
- POST `/api/reading-list` - Add book to reading list
- DELETE `/api/reading-list/{item_id}` - Remove book from reading list

### Users
- GET `/api/users/me` - Get current user profile
- GET `/api/users/me/reading-list` - Get user profile with reading list

## Docker Setup

### Prerequisites
- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)

### Build and Run with Docker Compose

1. Build and start all services:

```powershell
# From the project root
docker-compose up --build
```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Stopping Services

```powershell
docker-compose down
```

### Dockerfile Locations
- Backend: `docker/backend.Dockerfile`
- Frontend: `docker/frontend.Dockerfile`

### .dockerignore
- Each service has a `.dockerignore` file to optimize Docker builds.

---
