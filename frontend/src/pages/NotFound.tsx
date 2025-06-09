import { Box, Heading, Text, Button, Center, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const NotFound = () => {
  return (
    <Center h="calc(100vh - 200px)">
      <VStack spacing={6} textAlign="center">
        <Heading as="h1" size="4xl" color="blue.500">
          404
        </Heading>
        <Heading as="h2" size="xl">
          Page Not Found
        </Heading>
        <Text fontSize="lg" color="gray.600" maxW="500px">
          The page you are looking for doesn't exist or has been moved.
        </Text>
        <Button as={RouterLink} to="/" colorScheme="blue" size="lg">
          Return to Home
        </Button>
      </VStack>
    </Center>
  )
}

export default NotFound 