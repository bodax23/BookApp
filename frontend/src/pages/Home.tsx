import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Input,
  Button,
  Text,
  Flex,
  Center,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Image,
  Badge,
  InputGroup,
  InputRightElement,
  Select,
  useToast,
  Spinner,
  IconButton,
  Tooltip,
  Link,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { FiExternalLink } from 'react-icons/fi';
import { searchBooks, addToReadingList } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Book interface to type our API responses
interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  id: string;
}

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [addingToList, setAddingToList] = useState<Record<string, boolean>>({});
  const toast = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast({
        title: 'Search query required',
        description: 'Please enter a search term',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setHasSearched(true);
      
      // Log search parameters to console for debugging
      console.log('Searching with params:', {
        query: searchQuery,
        searchType,
        limit: 20
      });
      
      const response = await searchBooks({
        query: searchQuery,
        searchType: searchType as 'title' | 'author' | 'isbn',
        limit: 20
      });
      
      console.log('Raw search response:', response);
      
      // Map the API response to our Book interface
      const books: Book[] = (response.docs || []).map((book: any) => ({
        id: book.key?.replace('/works/', '') || book.key || Math.random().toString(),
        key: book.key || '',
        title: book.title || 'Unknown Title',
        author_name: book.author_name || ['Unknown Author'],
        first_publish_year: book.first_publish_year,
        cover_i: book.cover_i,
        isbn: book.isbn
      }));
      
      console.log('Processed books:', books);
      
      setSearchResults(books);
      setTotalResults(response.numFound || 0);
      
      if (books.length === 0) {
        toast({
          title: 'No results found',
          description: 'Try a different search term or search type',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'An error occurred while searching for books',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToReadingList = async (book: Book) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please login to add books to your reading list',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }
    
    try {
      setAddingToList(prev => ({ ...prev, [book.id]: true }));
      
      await addToReadingList({
        book_id: book.id,
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        cover_id: book.cover_i?.toString(),
        year: book.first_publish_year,
      });
      
      toast({
        title: 'Book added',
        description: `"${book.title}" added to your reading list`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error adding to reading list:', error);
      
      const errorMessage = error.response?.data?.detail || 'Failed to add book to reading list';
      const isAlreadyAdded = errorMessage.includes('already in reading list');
      
      toast({
        title: isAlreadyAdded ? 'Already in list' : 'Error',
        description: errorMessage,
        status: isAlreadyAdded ? 'info' : 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAddingToList(prev => ({ ...prev, [book.id]: false }));
    }
  };

  const handleViewDetails = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  // Helper function to get book cover URL
  const getBookCover = (book: Book): string => {
    return book.cover_i 
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : "https://via.placeholder.com/150x225?text=No+Cover";
  };

  return (
    <Box>
      <Center mb={8}>
        <Heading as="h1" size="xl">
          Find Your Next Book
        </Heading>
      </Center>

      <Box 
        as="form" 
        onSubmit={handleSearch}
        maxW="800px" 
        mx="auto" 
        mb={10}
        p={6}
        borderRadius="lg"
        boxShadow="md"
        bg="white"
      >
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <Select 
            value={searchType} 
            onChange={(e) => setSearchType(e.target.value)}
            width={{ base: '100%', md: '200px' }}
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="isbn">ISBN</option>
          </Select>
          
          <InputGroup flex={1}>
            <Input
              placeholder={`Search by ${searchType}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button 
                h="1.75rem" 
                size="sm" 
                colorScheme="blue"
                type="submit" 
                isLoading={isLoading}
                leftIcon={<SearchIcon />}
              >
                Search
              </Button>
            </InputRightElement>
          </InputGroup>
        </Flex>
      </Box>

      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : hasSearched && searchResults.length > 0 ? (
        <>
          <Text mb={4} fontSize="md" color="gray.600">
            Found {totalResults} results. Showing top {searchResults.length}.
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
            {searchResults.map((book) => (
              <Card key={book.id} maxW="sm" boxShadow="md" borderRadius="lg" overflow="hidden">
                <Image
                  src={getBookCover(book)}
                  alt={`Cover for ${book.title}`}
                  height="200px"
                  width="100%"
                  objectFit="cover"
                  className="hover:opacity-90 transition-opacity"
                />
                <CardBody>
                  <Stack spacing="3">
                    <Heading size="md" noOfLines={2} title={book.title}>
                      {book.title}
                    </Heading>
                    <Text>
                      By {book.author_name ? book.author_name[0] : 'Unknown Author'}
                    </Text>
                    <Flex justifyContent="space-between" alignItems="center">
                      <Badge colorScheme="blue">
                        {book.first_publish_year || 'Unknown Year'}
                      </Badge>
                      <Flex gap={2}>
                        <Tooltip label="View Details">
                          <IconButton
                            aria-label="View book details" 
                            icon={<Icon as={FiExternalLink} />}
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => handleViewDetails(book.id)}
                          />
                        </Tooltip>
                        <Tooltip label="Add to Reading List">
                          <IconButton
                            aria-label="Add to reading list" 
                            icon={<AddIcon />} 
                            size="sm"
                            colorScheme="green"
                            isLoading={addingToList[book.id]}
                            onClick={() => handleAddToReadingList(book)}
                          />
                        </Tooltip>
                      </Flex>
                    </Flex>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </>
      ) : hasSearched ? (
        <Center py={10}>
          <Text fontSize="xl" color="gray.500">
            No books found. Try a different search term.
          </Text>
        </Center>
      ) : (
        <Center py={10}>
          <Box textAlign="center" maxW="600px">
            <Text fontSize="xl" color="gray.500" mb={4}>
              Enter a search term to find books
            </Text>
            <Text color="gray.400">
              Search by title, author, or ISBN to discover books from the Open Library.
              {!isAuthenticated && (
                <Box mt={4}>
                  <Link color="blue.500" href="/login">
                    Login
                  </Link>{' '}
                  or{' '}
                  <Link color="blue.500" href="/register">
                    Register
                  </Link>{' '}
                  to add books to your reading list.
                </Box>
              )}
            </Text>
          </Box>
        </Center>
      )}
    </Box>
  );
};

export default Home; 