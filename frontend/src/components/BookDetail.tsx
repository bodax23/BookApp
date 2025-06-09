import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Image, 
  Heading, 
  Text, 
  Button, 
  Spinner, 
  Flex, 
  Badge, 
  VStack, 
  HStack,
  useToast,
  Link,
  Grid,
  Divider,
  SimpleGrid,
  Icon,
  Tooltip,
  Code
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { booksApi, readingListApi, getBookCoverUrl, openLibraryDirectApi } from '../services/api';
import { BookDetail as BookDetailType } from '../types';

// Create custom external link icon since Chakra UI's ExternalLinkIcon may not be available
const ExternalLinkIcon = () => (
  <Icon viewBox="0 0 24 24" boxSize="0.9em" ml="1px">
    <path
      fill="currentColor"
      d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const BookDetail: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [book, setBook] = useState<BookDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [additionalInfo, setAdditionalInfo] = useState<any>(null);
  const [isbnList, setIsbnList] = useState<string[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(0);

  // Fetch the book details
  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    const fetchBookDetails = async () => {
      if (!bookId) return;
      
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }
      
      try {
        console.log(`Fetching details for book ID: ${bookId}`);
        
        // Try direct OpenLibrary API first
        const data = await openLibraryDirectApi.getBookDetails(bookId);
        console.log('Book data received:', data);
        
        if (isMounted) {
          setBook(data);
          
          // Set a default cover URL based on data
          if (data.cover_i) {
            setCoverUrl(getBookCoverUrl(data.cover_i, 'L'));
          } else {
            setCoverUrl('https://via.placeholder.com/250x400?text=No+Cover');
          }
        }
        
        // Get edition-specific information for more details
        try {
          const editionUrl = `https://openlibrary.org/works/${data.id || bookId}/editions.json?limit=1`;
          console.log('Fetching edition data from:', editionUrl);
          
          const editionResponse = await fetch(editionUrl);
          if (editionResponse.ok) {
            const editionData = await editionResponse.json();
            console.log('Edition data received:', editionData);
            
            if (editionData.entries && editionData.entries.length > 0) {
              const firstEdition = editionData.entries[0];
              
              if (isMounted) {
                setAdditionalInfo(firstEdition);
                
                // Get ISBN from edition
                const isbn13List = firstEdition.isbn_13 || [];
                const isbn10List = firstEdition.isbn_10 || [];
                
                if (isbn13List.length > 0 || isbn10List.length > 0) {
                  const combinedIsbns = [...isbn13List, ...isbn10List];
                  setIsbnList(combinedIsbns);
                  
                  // Try to use edition cover if available
                  if (firstEdition.covers && firstEdition.covers.length > 0) {
                    setCoverUrl(getBookCoverUrl(firstEdition.covers[0], 'L'));
                  }
                  // Or try ISBN-based cover
                  else if (combinedIsbns.length > 0) {
                    setCoverUrl(`https://covers.openlibrary.org/b/isbn/${combinedIsbns[0]}-L.jpg`);
                  }
                }
              }
            }
          } else {
            console.warn('Failed to fetch edition data:', await editionResponse.text());
          }
        } catch (editionError) {
          console.error('Error fetching edition data:', editionError);
          // Continue - this is not a critical error
        }
        
        // If still no cover, try the works endpoint as a last resort
        if (coverUrl === 'https://via.placeholder.com/250x400?text=No+Cover' && isMounted) {
          try {
            const worksId = data.id || bookId;
            const coverResponse = await fetch(`https://openlibrary.org/works/${worksId}.json`);
            if (coverResponse.ok) {
              const coverData = await coverResponse.json();
              console.log('Works data for cover:', coverData);
              
              if (coverData.covers && coverData.covers.length > 0 && isMounted) {
                setCoverUrl(getBookCoverUrl(coverData.covers[0], 'L'));
              }
            }
          } catch (coverError) {
            console.error('Error fetching cover from works endpoint:', coverError);
            // Continue - we already have a placeholder
          }
        }
        
      } catch (error) {
        console.error('Error fetching book details:', error);
        
        if (isMounted) {
          if (loadingAttempts < 2) {
            // Retry loading once
            setLoadingAttempts(prev => prev + 1);
            setError('Error loading book details. Retrying...');
            
            // Wait a moment before retrying
            setTimeout(() => {
              if (isMounted) fetchBookDetails();
            }, 1500);
            return;
          } else {
            setError('Could not load book details. Please try again later.');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookDetails();
    
    // Cleanup function to prevent updates after unmount
    return () => {
      isMounted = false;
    };
  }, [bookId, loadingAttempts]);

  const handleAddToReadingList = async () => {
    if (!book) return;
    
    setIsAddingToList(true);
    
    try {
      // Extract author names as a string
      const authorNames = book.authors?.map(author => author.name).join(', ') || 'Unknown Author';
      
      await readingListApi.addToReadingList({
        book_id: book.id,
        title: book.title,
        author: authorNames,
        cover_id: book.cover_i?.toString(),
      });
      
      toast({
        title: 'Success',
        description: `"${book.title}" has been added to your reading list.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      
      // Check if error is due to book already in reading list
      let errorMessage = 'Could not add book to your reading list. Please try again.';
      if (error instanceof Error && error.message.includes('already in reading list')) {
        errorMessage = 'This book is already in your reading list.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAddingToList(false);
    }
  };

  // Convert markdown links to JSX - this handles the OpenLibrary description format
  const renderDescription = (description: string) => {
    if (!description) return null;
    
    // Check if the description has markdown links
    if (description.includes('](https://')) {
      // Replace markdown links with JSX Link components
      const parts = description.split(/(\[.*?\]\(https:\/\/.*?\))/g);
      
      return (
        <>
          {parts.map((part, index) => {
            // Check if this part is a markdown link
            const linkMatch = part.match(/\[(.*?)\]\((https:\/\/.*?)\)/);
            if (linkMatch) {
              const [_, text, url] = linkMatch;
              return (
                <Link key={index} href={url} color="blue.500" isExternal>
                  {text} <ExternalLinkIcon />
                </Link>
              );
            }
            // Regular text - strip any trailing dashes (common in OpenLibrary descriptions)
            return part.replace(/^-+$/gm, '');
          })}
        </>
      );
    }
    
    // Regular text description
    return description;
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading book details...</Text>
        {loadingAttempts > 0 && (
          <Text mt={2} fontSize="sm" color="orange.500">
            Retrying... (Attempt {loadingAttempts + 1})
          </Text>
        )}
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500" mb={4}>{error || 'Book not found'}</Text>
        
        {bookId && (
          <Box mb={4}>
            <Text fontSize="sm" color="gray.600">Book ID:</Text>
            <Code>{bookId}</Code>
          </Box>
        )}
        
        <Button onClick={() => navigate(-1)} mr={2}>
          Go Back
        </Button>
        
        <Button 
          colorScheme="blue" 
          onClick={() => {
            setLoadingAttempts(0);
            setIsLoading(true);
            setError(null);
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button mb={4} onClick={() => navigate(-1)}>
        ← Back to Search
      </Button>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        gap={8} 
        align={{ base: 'center', md: 'start' }}
      >
        <Box 
          width={{ base: '100%', md: '250px' }} 
          maxWidth="250px"
          mb={{ base: 4, md: 0 }}
        >
          <Box position="relative">
            <Image
              src={coverUrl}
              alt={`Cover of ${book.title}`}
              borderRadius="md"
              shadow="md"
              width="100%"
              fallbackSrc="https://via.placeholder.com/250x400?text=No+Cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // If primary cover fails, try ISBN cover
                if (isbnList.length > 0 && !target.src.includes('placeholder')) {
                  target.src = `https://covers.openlibrary.org/b/isbn/${isbnList[0]}-L.jpg`;
                } else {
                  target.src = "https://via.placeholder.com/250x400?text=No+Cover";
                }
              }}
            />
            
            {/* View on OpenLibrary link */}
            <Link 
              href={`https://openlibrary.org/works/${book.id}`} 
              isExternal
              position="absolute"
              bottom="2"
              right="2"
              bg="rgba(0,0,0,0.7)"
              color="white"
              p="1"
              borderRadius="md"
              fontSize="xs"
              _hover={{ bg: "rgba(0,0,0,0.9)" }}
            >
              View on OpenLibrary <ExternalLinkIcon />
            </Link>
          </Box>
          
          <Button
            mt={4}
            colorScheme="green"
            width="100%"
            onClick={handleAddToReadingList}
            isLoading={isAddingToList}
            loadingText="Adding"
          >
            Add to Reading List
          </Button>
          
          {/* ISBN Information */}
          {isbnList.length > 0 && (
            <Box mt={4} fontSize="sm">
              <Text fontWeight="bold">ISBN:</Text>
              {isbnList.map((isbn, index) => (
                <Text key={index}>{isbn}</Text>
              ))}
            </Box>
          )}
        </Box>
        
        <Box flex="1">
          <Heading size="xl" mb={2}>
            {book.title}
          </Heading>
          
          <HStack spacing={2} mb={4} flexWrap="wrap">
            {book.authors?.map((author, index) => (
              <Badge key={index} colorScheme="blue">
                {author.name}
              </Badge>
            ))}
            {(!book.authors || book.authors.length === 0) && (
              <Badge colorScheme="gray">Unknown Author</Badge>
            )}
          </HStack>
          
          {/* Publication Information */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            {book.publish_date && (
              <Box>
                <Text fontWeight="bold">Published:</Text>
                <Text>{book.publish_date}</Text>
              </Box>
            )}
            
            {additionalInfo?.publishers && additionalInfo.publishers.length > 0 && (
              <Box>
                <Text fontWeight="bold">Publisher:</Text>
                <Text>{additionalInfo.publishers.join(', ')}</Text>
              </Box>
            )}
            
            {additionalInfo?.number_of_pages && (
              <Box>
                <Text fontWeight="bold">Pages:</Text>
                <Text>{additionalInfo.number_of_pages}</Text>
              </Box>
            )}
            
            {additionalInfo?.physical_format && (
              <Box>
                <Text fontWeight="bold">Format:</Text>
                <Text>{additionalInfo.physical_format}</Text>
              </Box>
            )}
          </SimpleGrid>
          
          {/* Description */}
          {book.description && (
            <Box mb={4}>
              <Heading size="md" mb={2}>Description</Heading>
              <Text whiteSpace="pre-wrap">
                {renderDescription(book.description)}
              </Text>
            </Box>
          )}
          
          <Divider my={4} />
          
          {/* Subjects */}
          {book.subjects && book.subjects.length > 0 && (
            <Box mb={4}>
              <Heading size="md" mb={2}>Subjects</Heading>
              <Flex gap={2} flexWrap="wrap">
                {book.subjects.slice(0, 20).map((subject, index) => (
                  <Badge key={index} colorScheme="purple">
                    {subject}
                  </Badge>
                ))}
                {book.subjects.length > 20 && (
                  <Tooltip label={book.subjects.slice(20).join(', ')}>
                    <Badge colorScheme="gray">
                      +{book.subjects.length - 20} more <InfoIcon />
                    </Badge>
                  </Tooltip>
                )}
              </Flex>
            </Box>
          )}
          
          {/* Additional details */}
          <VStack align="start" spacing={1} mt={4}>
            {book.created && (
              <Text fontSize="sm" color="gray.600">
                <strong>Created:</strong> {new Date(book.created).toLocaleDateString()}
              </Text>
            )}
            {book.last_modified && (
              <Text fontSize="sm" color="gray.600">
                <strong>Last Updated:</strong> {new Date(book.last_modified).toLocaleDateString()}
              </Text>
            )}
            <Text fontSize="sm" color="gray.600">
              <strong>Book ID:</strong> {book.id}
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default BookDetail; 