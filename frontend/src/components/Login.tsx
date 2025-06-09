import React, { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  Link,
  useToast,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  FormErrorMessage,
  FormHelperText,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [emailUsernameError, setEmailUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Get the redirect path from location state or default to '/'
  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailUsernameError(null);
    setPasswordError(null);
    setError(null);
    
    // Email/Username validation
    if (!emailOrUsername) {
      setEmailUsernameError('Email or username is required');
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(emailOrUsername, password);
      
      toast({
        title: 'Login successful',
        description: 'Welcome back! Redirecting...',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setLoginSuccess(true);
      
      // Navigate to the page the user was trying to access or home
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.message?.includes('422')) {
        setError('Authentication failed. The server couldn\'t process your request. Please check your credentials format.');
      } else if (error.message?.includes('401')) {
        setError('Invalid email/username or password. Please try again.');
      } else if (error.message?.includes('Network Error')) {
        setError('Could not connect to the server. Please check your internet connection and try again.');
      } else {
        setError(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <VStack spacing={6}>
        <Heading size="lg">Login</Heading>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        {loginSuccess && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            Login successful! Redirecting...
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4} align="start">
            <FormControl isRequired isInvalid={!!emailUsernameError}>
              <FormLabel>Email or Username</FormLabel>
              <Input 
                type="text" 
                value={emailOrUsername} 
                onChange={(e) => setEmailOrUsername(e.target.value)} 
                placeholder="Enter your email or username"
              />
              <FormHelperText>
                You can login with either your email address or username
              </FormHelperText>
              {emailUsernameError && <FormErrorMessage>{emailUsernameError}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isRequired isInvalid={!!passwordError}>
              <FormLabel>Password</FormLabel>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password"
              />
              {passwordError && <FormErrorMessage>{passwordError}</FormErrorMessage>}
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="blue" 
              isLoading={isSubmitting} 
              loadingText="Logging In"
              width="full"
            >
              Login
            </Button>
          </VStack>
        </form>
        
        <Text>
          Don't have an account?{' '}
          <Link as={RouterLink} to="/register" color="blue.500">
            Register here
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Login; 