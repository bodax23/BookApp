import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Button,
  Flex,
  VStack,
  useToast,
  Badge,
  Image,
  IconButton,
} from '@chakra-ui/react'
import { DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from 'react-router-dom'
import { getReadingList, removeFromReadingList, getBookCoverUrl } from '../services/api'
import type { ReadingListItem } from '../services/api'

const ReadingList = () => {
  const [readingList, setReadingList] = useState<ReadingListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const toast = useToast()

  const fetchReadingList = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getReadingList()
      setReadingList(data)
    } catch (err) {
      setError('Failed to load your reading list. Please try again later.')
      toast({
        title: 'Error',
        description: 'Could not load your reading list',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReadingList()
  }, [])

  const handleRemoveBook = async (id: number, title: string) => {
    try {
      await removeFromReadingList(id)
      setReadingList((prevList) => prevList.filter((item) => item.id !== id))
      toast({
        title: 'Book removed',
        description: `"${title}" has been removed from your reading list`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to remove book from reading list',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md" mt={4}>
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  if (readingList.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Heading as="h1" size="xl" mb={6}>
          Your Reading List
        </Heading>
        <Text fontSize="lg" color="gray.600" mb={6}>
          You haven't added any books to your reading list yet.
        </Text>
        <Button as={RouterLink} to="/" colorScheme="blue">
          Discover Books
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Heading as="h1" size="xl" mb={6}>
        Your Reading List
      </Heading>
      <Text fontSize="md" color="gray.600" mb={6}>
        You have {readingList.length} book{readingList.length !== 1 ? 's' : ''} in your reading list.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
        {readingList.map((book) => (
          <Box
            key={book.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
          >
            <Flex direction="column" height="100%">
              <Image
                src={getBookCoverUrl(book.cover_id || 0)}
                fallbackSrc="https://via.placeholder.com/150x225?text=No+Cover"
                alt={`Cover for ${book.title}`}
                height="200px"
                objectFit="cover"
              />

              <Box p={4} flex="1">
                <VStack align="start" spacing={2}>
                  <Heading as="h3" size="md" noOfLines={2}>
                    {book.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    By {book.author}
                  </Text>
                  {book.year && (
                    <Badge colorScheme="blue" mt={1}>
                      {book.year}
                    </Badge>
                  )}
                  <Text fontSize="xs" color="gray.500">
                    Added: {new Date(book.added_at).toLocaleDateString()}
                  </Text>
                </VStack>

                <Flex mt={4} justify="space-between" align="center">
                  <Button
                    as={RouterLink}
                    to={`/book/${book.book_id}`}
                    size="sm"
                    leftIcon={<ExternalLinkIcon />}
                    variant="outline"
                    colorScheme="blue"
                  >
                    Details
                  </Button>
                  <IconButton
                    aria-label="Remove from reading list"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleRemoveBook(book.id, book.title)}
                  />
                </Flex>
              </Box>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default ReadingList 