import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Spinner, Text, Alert, AlertIcon, Center, VStack } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();
  const [showDebug, setShowDebug] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authAttempts, setAuthAttempts] = useState(0);
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  // Verify authentication on component mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const result = await checkAuth();
        setAuthChecked(true);
        
        if (!result && authAttempts < 2) {
          // Try one more time if first check fails
          setAuthAttempts(prev => prev + 1);
          setTimeout(() => {
            setAuthChecked(false);
          }, 500);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setAuthChecked(true); // Still mark as checked even on error
      }
    };
    
    // Don't check auth more than necessary
    if (!authChecked) {
      verifyAuth();
    }
    
    // Show debug info after 1 second
    const timer = setTimeout(() => {
      setShowDebug(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkAuth, authChecked, authAttempts]);

  // If still loading, show spinner
  if (isLoading || !authChecked) {
    return (
      <Center h="calc(100vh - 200px)">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text>Verifying authentication...</Text>
          
          {showDebug && (
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Authentication Status:</Text>
                <Text>Token exists: {token ? 'Yes' : 'No'}</Text>
                <Text>User stored: {storedUser ? 'Yes' : 'No'}</Text>
                <Text>Current path: {location.pathname}</Text>
                <Text>Authentication verified: {isAuthenticated ? 'Yes' : 'No'}</Text>
              </Box>
            </Alert>
          )}
        </VStack>
      </Center>
    );
  }

  // If not authenticated and checks completed, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute; 