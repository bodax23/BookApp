import uvicorn

if __name__ == "__main__":
    print("Starting FastAPI server on http://localhost:9090")
    uvicorn.run("test_full_app:app", host="localhost", port=9090, log_level="info") 