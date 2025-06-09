from fastapi import FastAPI
import logging

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a simple FastAPI app
app = FastAPI(title="Test API")

@app.get("/")
def root():
    logger.info("Root endpoint called")
    return {"message": "Hello World"}

@app.get("/health")
def health_check():
    logger.info("Health check called")
    return {"status": "healthy"} 