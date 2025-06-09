import React, { useState } from 'react';
import { Box, Input, Select, Button, Flex, Text, useToast, Code } from '@chakra-ui/react';
import { booksApi, openLibraryDirectApi } from '../services/api';
import BookList from './BookList';
import { BookItem } from '../types';

const BookSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('title');
  const [results, setResults] = useState<BookItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const toast = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: 'Search query required',
        description: 'Please enter a search term',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSearching(true);
    setCurrentPage(1);
    setDebugInfo('');
    
    try {
      // Use direct OpenLibrary API
      const data = await openLibraryDirectApi.searchBooks(query, searchType, 1, 10);
      
      setResults(data.docs || []);
      setTotalResults(data.numFound || 0);
      setSearchPerformed(true);
      
      setDebugInfo(`Found ${data.numFound} results for "${query}" in ${searchType}`);
    } catch (error) {
      console.error('Search error:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: 'Search failed',
        description: 'Could not perform search. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(totalResults / 10)) return;
    
    setIsSearching(true);
    setDebugInfo('');
    
    try {
      const data = await openLibraryDirectApi.searchBooks(query, searchType, newPage, 10);
      
      setResults(data.docs || []);
      setCurrentPage(newPage);
      
      setDebugInfo(`Page ${newPage}: Showing results ${(newPage-1)*10+1}-${Math.min(newPage*10, data.numFound)} of ${data.numFound}`);
    } catch (error) {
      console.error('Pagination error:', error);
      setDebugInfo(`Pagination error: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: 'Failed to load page',
        description: 'Could not load the next page of results.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    setIsTestingApi(true);
    setDebugInfo('Testing OpenLibrary API connection...');
    
    try {
      // Test the OpenLibrary API with a simple search
      const testResponse = await fetch('https://openlibrary.org/search.json?q=harry+potter&limit=1');
      
      if (!testResponse.ok) {
        throw new Error(`OpenLibrary API responded with status: ${testResponse.status}`);
      }
      
      const testData = await testResponse.json();
      
      setDebugInfo(
        `OpenLibrary API Test Successful!\n` +
        `Total results: ${testData.numFound}\n` +
        `First book: "${testData.docs[0]?.title}" by ${testData.docs[0]?.author_name?.join(', ') || 'Unknown'}`
      );
      
      toast({
        title: 'API test successful',
        description: 'Successfully connected to OpenLibrary API',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('API test error:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : String(error)}`);
      
      toast({
        title: 'API test failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSearch}>
        <Flex gap={2} mb={4} direction={{ base: 'column', md: 'row' }}>
          <Select 
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            width={{ base: 'full', md: '150px' }}
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="isbn">ISBN</option>
          </Select>
          
          <Input
            placeholder={`Search by ${searchType}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            flex="1"
          />
          
          <Button 
            type="submit"
            colorScheme="blue"
            isLoading={isSearching}
            loadingText="Searching"
          >
            Search
          </Button>
        </Flex>
      </form>

      {/* Debug controls */}
      <Flex mt={2} mb={4} gap={2}>
        <Button 
          size="sm"
          colorScheme="orange"
          onClick={testApiConnection}
          isLoading={isTestingApi}
        >
          Test API Connection
        </Button>
      </Flex>

      {debugInfo && (
        <Box mt={2} mb={4} p={2} bg="gray.100" borderRadius="md" maxH="200px" overflowY="auto">
          <Text fontSize="sm" fontWeight="bold" mb={1}>Info:</Text>
          <Code display="block" whiteSpace="pre" p={2} fontSize="xs" overflowX="auto">
            {debugInfo}
          </Code>
        </Box>
      )}

      {searchPerformed && (
        <>
          {totalResults > 0 ? (
            <>
              <Text mb={2}>
                Found {totalResults} result{totalResults !== 1 ? 's' : ''}
              </Text>
              <BookList books={results} />
              
              {/* Pagination Controls */}
              {totalResults > 10 && (
                <Flex justify="center" mt={5} gap={2}>
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1 || isSearching}
                  >
                    Previous
                  </Button>
                  
                  <Text alignSelf="center">
                    Page {currentPage} of {Math.ceil(totalResults / 10)}
                  </Text>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage >= Math.ceil(totalResults / 10) || isSearching}
                  >
                    Next
                  </Button>
                </Flex>
              )}
            </>
          ) : (
            <Text>No results found. Try another search term.</Text>
          )}
        </>
      )}
    </Box>
  );
};

export default BookSearch; 