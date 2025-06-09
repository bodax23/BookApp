import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Image, 
  Text, 
  Button, 
  VStack, 
  Heading, 
  Badge, 
  useToast, 
  Flex, 
  Tooltip 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { BookItem } from '../types';
import { getBookCoverUrl } from '../services/api';

interface BookCardProps {
  book: BookItem;
  onAddToReadingList: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onAddToReadingList }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  
  // Extract book ID from key for the detail page link - fallback to id if available
  const bookId = book.key 
    ? book.key.split('/').pop() 
    : book.id || 'unknown';
  
  // Set up cover image with fallbacks
  useEffect(() => {
    // Get primary cover image URL
    if (book.cover_i) {
      setCoverUrl(getBookCoverUrl(book.cover_i, 'M'));
    } 
    // Try ISBN if available
    else if (book.isbn && book.isbn.length > 0) {
      setCoverUrl(`https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`);
    }
    // Fallback to placeholder
    else {
      setCoverUrl('https://via.placeholder.com/180x280?text=No+Cover');
    }
  }, [book.cover_i, book.isbn]);
  
  // Format author names
  const authors = book.author_name?.join(', ') || 'Unknown Author';
  
  // Handle adding to reading list with loading state
  const handleAddToList = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation to prevent navigation
    e.preventDefault(); // Prevent default link behavior
    
    setIsAdding(true);
    try {
      await onAddToReadingList();
    } catch (error) {
      console.error('Error in BookCard when adding to reading list:', error);
      toast({
        title: 'Error',
        description: 'Could not add book to reading list',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAdding(false);
    }
  };
  
  // Handle card click for navigation
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Only navigate if we have a valid bookId
    if (bookId && bookId !== 'unknown') {
      try {
        navigate(`/books/${bookId}`);
      } catch (error) {
        console.error('Navigation error:', error);
        toast({
          title: 'Navigation Error',
          description: 'Could not navigate to book details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'Information',
        description: 'Book details are not available for this item',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle image loading error
  const handleImageError = () => {
    // If primary cover fails, try ISBN fallback if available
    if (book.isbn && book.isbn.length > 0 && !coverUrl.includes('isbn')) {
      setCoverUrl(`https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg`);
    } 
    // If ISBN fails or isn't available, use placeholder
    else if (!coverUrl.includes('placeholder')) {
      setCoverUrl('https://via.placeholder.com/180x280?text=No+Cover');
    }
    setIsImageLoading(false);
  };
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      shadow="md"
      transition="all 0.3s"
      _hover={{ shadow: 'lg', transform: 'translateY(-5px)' }}
      height="100%"
      display="flex"
      flexDirection="column"
      onClick={handleCardClick}
      cursor="pointer"
      position="relative"
      background="white"
    >
      <Box flex="1">
        <Box 
          height="200px" 
          width="100%" 
          overflow="hidden" 
          position="relative"
          bgGradient="linear(to-b, gray.100, gray.200)"
        >
          <Image 
            src={coverUrl} 
            alt={`Cover of ${book.title}`}
            height="100%"
            width="100%"
            objectFit="cover"
            fallbackSrc="https://via.placeholder.com/180x280?text=No+Cover"
            onError={handleImageError}
            opacity={isImageLoading ? 0.8 : 1}
            transition="opacity 0.3s"
            onLoad={() => setIsImageLoading(false)}
          />
          
          {book.first_publish_year && (
            <Badge 
              position="absolute" 
              top="2" 
              right="2" 
              colorScheme="blue"
              borderRadius="full"
              px={2}
              fontSize="xs"
              bg="rgba(66, 153, 225, 0.8)"
              color="white"
            >
              {book.first_publish_year}
            </Badge>
          )}
        </Box>
        
        <VStack p={4} align="start" spacing={2} flex="1">
          <Tooltip label={book.title} placement="top" hasArrow>
            <Heading size="sm" noOfLines={2}>
              {book.title || 'Unknown Title'}
            </Heading>
          </Tooltip>
          
          <Tooltip label={authors} placement="top" hasArrow>
            <Text fontSize="sm" color="gray.600" noOfLines={1}>
              {authors}
            </Text>
          </Tooltip>
          
          {book.isbn && book.isbn.length > 0 && (
            <Flex wrap="wrap" gap={1}>
              <Badge colorScheme="purple" fontSize="xs">
                ISBN: {book.isbn[0].substring(0, 13)}...
              </Badge>
            </Flex>
          )}
        </VStack>
      </Box>
      
      <Box p={4} pt={0}>
        <Button 
          onClick={handleAddToList}
          colorScheme="green" 
          size="sm"
          width="full"
          isLoading={isAdding}
          loadingText="Adding"
        >
          Add to Reading List
        </Button>
      </Box>
    </Box>
  );
};

export default BookCard; 