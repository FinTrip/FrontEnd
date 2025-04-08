import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  fullName: string;
  email: string;
  id?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  travelGroups?: any[];
}

export function useAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra authentication khi component mount
    checkAuth()

    // Thêm event listener cho custom event authStateChanged
    const handleAuthStateChange = () => {
      checkAuth()
    }

    window.addEventListener('authStateChanged', handleAuthStateChange)
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange)
    }
  }, [])

  const checkAuth = () => {
    const storedToken = localStorage.getItem("token");
    const userStr = localStorage.getItem('user')
    
    if (storedToken && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setIsAuthenticated(true)
        setUser(userData)
        setToken(storedToken)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setIsAuthenticated(false)
        setUser(null)
        setToken(null)
      }
    } else {
      setIsAuthenticated(false)
      setUser(null)
      setToken(null)
    }
  }

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
    setToken(token)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authStateChanged'))
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setToken(null)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authStateChanged'))
    router.push('/page/auth/login')
  }

  return { isAuthenticated, user, token, login, logout, checkAuth }
}
