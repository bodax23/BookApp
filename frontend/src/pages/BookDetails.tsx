import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Heading,
  Text,
  Image,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Button,
  VStack,
  HStack,
  Badge,
  Divider,
  useToast,
  Flex,
  IconButton,
} from '@chakra-ui/react'
import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons'
import { getBookDetails, getBookCoverUrl, addToReadingList } from '../services/api'
import type { BookDetail } from '../services/api'
import { useAuth } from '../context/AuthContext'

const BookDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<BookDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  
  const navigate = useNavigate()
  const toast = useToast()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) return
      
      try {
        setIsLoading(true)
        setError(null)
        const data = await getBookDetails(id)
        setBook(data)
      } catch (err) {
        setError('Failed to load book details. Please try again later.')
        toast({
          title: 'Error',
          description: 'Could not load book details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookDetails()
  }, [id, toast])

  const handleAddToReadingList = async () => {
    if (!book || !id) return
    
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to add books to your reading list',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      navigate('/login')
      return
    }
    
    try {
      setIsAdding(true)
      
      // Get first author name if available
      const authorName = book.authors && book.authors.length > 0 
        ? book.authors[0].name 
        : 'Unknown Author'
      
      await addToReadingList({
        book_id: id,
        title: book.title,
        author: authorName,
        cover_id: book.cover_i?.toString(),
        year: book.publish_date ? parseInt(book.publish_date.split(',').pop()?.trim() || '0') : undefined,
      })
      
      toast({
        title: 'Success!',
        description: 'Book added to your reading list',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add book to reading list',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsAdding(false)
    }
  }

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  if (error || !book) {
    return (
      <Box>
        <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} mb={4} variant="outline">
          Back
        </Button>
        
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error || 'Book not found'}
        </Alert>
      </Box>
    )
  }

  // Process book data
  const coverUrl = getBookCoverUrl(book.cover_i || 0, 'L')
  const authorNames = book.authors?.map(a => a.name).join(', ') || 'Unknown Author'
  const publishYear = book.publish_date || 'Unknown'
  const description = book.description?.value || book.description || 'No description available'

  return (
    <Box>
      <Button leftIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} mb={6} variant="outline">
        Back to search
      </Button>
      
      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        gap={{ base: 6, md: 10 }}
        mb={10}
      >
        <Box 
          flexShrink={0} 
          width={{ base: '100%', md: '300px' }}
          mx={{ base: 'auto', md: 0 }}
        >
          <Image
            src={coverUrl || 'https://via.placeholder.com/300x450?text=No+Cover'}
            alt={`Cover for ${book.title}`}
            borderRadius="md"
            boxShadow="lg"
            objectFit="cover"
            width="100%"
            fallbackSrc="https://via.placeholder.com/300x450?text=No+Cover"
          />
          
          <Button
            colorScheme="green"
            leftIcon={<AddIcon />}
            mt={4}
            width="100%"
            onClick={handleAddToReadingList}
            isLoading={isAdding}
            loadingText="Adding"
          >
            Add to Reading List
          </Button>
        </Box>
        
        <Box flex={1}>
          <VStack align="flex-start" spacing={4}>
            <Heading as="h1" size="xl">
              {book.title}
            </Heading>
            
            <Text fontSize="lg" fontWeight="medium">
              By {authorNames}
            </Text>
            
            <HStack spacing={3}>
              <Badge colorScheme="blue" fontSize="md" px={2} py={1}>
                {publishYear}
              </Badge>
              
              {book.subjects && book.subjects.length > 0 && (
                book.subjects.slice(0, 3).map((subject, index) => (
                  <Badge key={index} colorScheme="purple" fontSize="sm">
                    {subject}
                  </Badge>
                ))
              )}
            </HStack>
            
            <Divider />
            
            {book.isbn_13 && book.isbn_13.length > 0 && (
              <Text fontSize="sm" color="gray.600">
                ISBN: {book.isbn_13[0]}
              </Text>
            )}
            
            <Heading as="h3" size="md" mt={2}>
              Description
            </Heading>
            
            <Text whiteSpace="pre-line">
              {description}
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Box>
  )
}

export default BookDetails 