import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, SimpleGrid, Spinner, Button, useToast } from '@chakra-ui/react';
import { readingListApi } from '../services/api';
import { ReadingListItem } from '../types';
import ReadingListCard from './ReadingListCard';

const ReadingList: React.FC = () => {
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchReadingList = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await readingListApi.getReadingList();
      setReadingList(data);
    } catch (error) {
      console.error('Error fetching reading list:', error);
      setError('Failed to load your reading list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadingList();
  }, []);

  const handleRemoveFromList = async (itemId: number) => {
    try {
      await readingListApi.removeFromReadingList(itemId);
      
      // Update the state to remove the item
      setReadingList(readingList.filter(item => item.id !== itemId));
      
      toast({
        title: 'Book removed',
        description: 'Book removed from your reading list',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error removing book from reading list:', error);
      toast({
        title: 'Error',
        description: 'Could not remove book from your reading list',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading your reading list...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={10}>
        <Text color="red.500">{error}</Text>
        <Button mt={4} onClick={fetchReadingList}>Try Again</Button>
      </Box>
    );
  }

  if (readingList.length === 0) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="md" mb={4}>Your Reading List is Empty</Heading>
        <Text>Search for books and add them to your reading list.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>Your Reading List</Heading>
      
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={5}>
        {readingList.map(item => (
          <ReadingListCard 
            key={item.id}
            item={item}
            onRemove={() => handleRemoveFromList(item.id)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ReadingList; 