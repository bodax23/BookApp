import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, userApi } from '../services/api'

interface User {
  id: number
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Add storage event listener to sync auth state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // Token was removed, log out the user
          setUser(null);
        } else if (e.newValue !== e.oldValue) {
          // Token changed, try to get user data
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (error) {
              console.error('Error parsing stored user:', error);
            }
          }
        }
      } else if (e.key === 'user') {
        if (!e.newValue) {
          // User was removed
          setUser(null);
        } else if (e.newValue !== e.oldValue) {
          // User changed
          try {
            setUser(JSON.parse(e.newValue));
          } catch (error) {
            console.error('Error parsing stored user:', error);
          }
        }
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Check if we already have a user in localStorage on mount
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser && !user) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user on mount:', error);
      }
    }

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // Check authentication status when component mounts
  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth initialization error:', error);
        
        // Try to restore user from localStorage as fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('Restored user from localStorage:', parsedUser);
          } catch (parseError) {
            console.error('Error parsing stored user:', parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [])

  // Function to check if user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Check if token exists
      if (authApi.isAuthenticated()) {
        try {
          // Try to get user data from the API
          const userData = await userApi.getCurrentUser();
          setUser(userData);
          
          // Store user in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(userData));
          
          setIsLoading(false);
          return true;
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          // Try to restore user from localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              setIsLoading(false);
              return true;
            } catch (parseError) {
              console.error('Error parsing stored user:', parseError);
            }
          }
          
          // If we can't get user data and no stored user, clear the token
          authApi.logout();
          setUser(null);
          setIsLoading(false);
          return false;
        }
      } else {
        setUser(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      setIsLoading(false);
      return false;
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.login({ email, password })
      console.log('Login response:', response)
      
      if (response.user) {
        setUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        // If we don't get a user from the login response, try to fetch it
        try {
          const userData = await userApi.getCurrentUser()
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (userError) {
          console.error('Error fetching user after login:', userError)
          throw new Error('Could not fetch user data after login');
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error;
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('Registering with:', { username, email, password: '***' })
      const response = await authApi.register({ username, email, password })
      console.log('Registration response:', response)
      
      if (response.user) {
        setUser(response.user)
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        // If we don't get a user from the registration response, try to login
        try {
          await login(email, password)
        } catch (loginError) {
          console.error('Error logging in after registration:', loginError)
          throw new Error('Registration successful but could not log in');
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error;
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 