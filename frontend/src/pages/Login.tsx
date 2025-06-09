import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Link,
  useToast,
  VStack,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  
  const validateForm = () => {
    let isValid = true
    
    // Reset errors
    setEmailError('')
    setPasswordError('')
    
    // Validate email
    if (!email) {
      setEmailError('Email is required')
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid')
      isValid = false
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    }
    
    return isValid
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setIsSubmitting(true)
      await login(email, password)
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      minH="calc(100vh - 200px)"
    >
      <Card width="100%" maxW="450px" boxShadow="lg">
        <CardBody p={8}>
          <VStack spacing={6} align="stretch">
            <Heading as="h1" size="xl" textAlign="center">
              Welcome Back
            </Heading>
            
            <Text textAlign="center" color="gray.600">
              Sign in to access your reading list
            </Text>
            
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isInvalid={!!emailError} isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  <FormErrorMessage>{emailError}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!passwordError} isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                    />
                    <InputRightElement width="3rem">
                      <Button
                        h="1.5rem"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                      >
                        {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{passwordError}</FormErrorMessage>
                </FormControl>
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  width="full" 
                  mt={4}
                  isLoading={isSubmitting}
                  loadingText="Signing in"
                >
                  Sign In
                </Button>
              </VStack>
            </Box>
            
            <Text textAlign="center">
              Don't have an account?{' '}
              <Link as={RouterLink} to="/register" color="blue.500">
                Sign up
              </Link>
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default Login 