import React from 'react';
import { Box, SimpleGrid, useToast, Text } from '@chakra-ui/react';
import BookCard from './BookCard';
import { BookItem } from '../types';
import { readingListApi } from '../services/api';

interface BookListProps {
  books: BookItem[];
}

const BookList: React.FC<BookListProps> = ({ books }) => {
  const toast = useToast();

  const handleAddToReadingList = async (book: BookItem) => {
    try {
      // Validate that book has required properties
      if (!book || !book.key) {
        throw new Error('Invalid book data');
      }
      
      // Extract the work ID from the key (format: /works/OL12345W)
      const bookId = book.key.split('/').pop() || book.id || '';
      
      // Get author name - join multiple authors if present
      const authorName = book.author_name?.join(', ') || 'Unknown Author';
      
      await readingListApi.addToReadingList({
        book_id: bookId,
        title: book.title || 'Unknown Title',
        author: authorName,
        cover_id: book.cover_i?.toString(),
      });
      
      toast({
        title: 'Book added',
        description: `"${book.title}" has been added to your reading list.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      
      // Check if error is due to book already in reading list
      let errorMessage = 'Could not add book to your reading list. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('already in reading list')) {
          errorMessage = 'This book is already in your reading list.';
        } else if (error.message === 'Invalid book data') {
          errorMessage = 'This book has incomplete data and cannot be added.';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle case where books is undefined or empty
  if (!books || books.length === 0) {
    return (
      <Box py={4}>
        <Text>No books to display.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
        {books.map((book, index) => (
          <BookCard 
            key={book.key || `mock-book-${index}`} 
            book={book} 
            onAddToReadingList={() => handleAddToReadingList(book)} 
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default BookList; 