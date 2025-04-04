import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: number;
  email: string;
  fullName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  travelGroups: any[];
}

export function useAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    // Kiểm tra authentication khi component mount
    checkAuth()
  }, [])

  const checkAuth = () => {
    const storedToken = localStorage.getItem("token");
    const userStr = localStorage.getItem('user')
    
    if (storedToken && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setIsAuthenticated(true)
        setUser(userData)
        setToken(storedToken); 
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

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setToken(null)
    router.push('/page/auth/login')
  }

  return { isAuthenticated, user, token, logout, checkAuth }
}
