import React from 'react';
import { Box, Image, Text, Button, Heading, Badge } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ReadingListItem } from '../types';
import { getBookCoverUrl } from '../services/api';

interface ReadingListCardProps {
  item: ReadingListItem;
  onRemove: () => void;
}

const ReadingListCard: React.FC<ReadingListCardProps> = ({ item, onRemove }) => {
  const coverUrl = item.cover_id 
    ? getBookCoverUrl(Number(item.cover_id) || 0, 'M') 
    : 'https://via.placeholder.com/180x280?text=No+Cover';
    
  // Format date added
  const addedDate = new Date(item.added_at).toLocaleDateString();
  
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden" 
      shadow="md"
      transition="all 0.3s"
      _hover={{ shadow: 'lg' }}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Box as={RouterLink} to={`/books/${item.book_id}`} flex="1">
        <Image 
          src={coverUrl} 
          alt={`Cover of ${item.title}`}
          height="200px"
          width="100%"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/180x280?text=No+Cover"
        />
        
        <Box p={4}>
          <Heading size="sm" noOfLines={2} mb={2}>
            {item.title}
          </Heading>
          
          <Text fontSize="sm" color="gray.600" noOfLines={1} mb={2}>
            {item.author || 'Unknown Author'}
          </Text>
          
          <Badge colorScheme="blue" mb={2}>
            Added: {addedDate}
          </Badge>
        </Box>
      </Box>
      
      <Box p={4} pt={0}>
        <Button 
          onClick={onRemove}
          colorScheme="red" 
          size="sm"
          width="full"
        >
          Remove
        </Button>
      </Box>
    </Box>
  );
};

export default ReadingListCard; 