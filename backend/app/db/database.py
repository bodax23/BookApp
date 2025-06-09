import logging
import time
from sqlalchemy.exc import OperationalError
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_db_and_tables():
    """Create the database tables from SQLModel models"""
    max_retries = 10
    retry_delay = 5
    for i in range(max_retries):
        try:
            logger.info("Creating database tables if they don't exist")
            SQLModel.metadata.create_all(engine)
            logger.info("Database tables created successfully")
            return
        except OperationalError as e:
            logger.error(f"Error creating database tables: {e}")
            if i < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                time.sleep(retry_delay)
            else:
                logger.error("Failed to create database tables after multiple retries.")
                raise

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 