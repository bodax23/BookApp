import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ChakraProvider, Box, Container, Flex, Heading, Button, Spacer } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import components
import Login from './components/Login';
import Register from './components/Register';
import BookSearch from './components/BookSearch';
import BookDetail from './components/BookDetail';
import ReadingList from './components/ReadingList';

// Navigation component
const Navigation: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  
  return (
    <Box as="nav" bg="blue.600" color="white" p={4} mb={8}>
      <Container maxW="container.xl">
        <Flex align="center">
          <Heading size="md" as={Link} to="/" _hover={{ textDecoration: 'none' }}>
            Reading List App
          </Heading>
          
          <Spacer />
          
          <Flex gap={4}>
            {isAuthenticated ? (
              <>
                <Button as={Link} to="/" variant="ghost" _hover={{ bg: 'blue.500' }}>
                  Search Books
                </Button>
                
                <Button as={Link} to="/reading-list" variant="ghost" _hover={{ bg: 'blue.500' }}>
                  My Reading List
                </Button>
                
                <Button onClick={logout} variant="outline" _hover={{ bg: 'blue.500' }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="ghost" _hover={{ bg: 'blue.500' }}>
                  Login
                </Button>
                
                <Button as={Link} to="/register" variant="outline" _hover={{ bg: 'blue.500' }}>
                  Register
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

// Main App component
const AppContent: React.FC = () => {
  return (
    <Router>
      <Navigation />
      
      <Container maxW="container.xl" pb={8}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <BookSearch />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/books/:bookId" 
            element={
              <ProtectedRoute>
                <BookDetail />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reading-list" 
            element={
              <ProtectedRoute>
                <ReadingList />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </Router>
  );
};

// Wrap with providers
const App: React.FC = () => {
  return (
    <ChakraProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ChakraProvider>
  );
};

export default App; 