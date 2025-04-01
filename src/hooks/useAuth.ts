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

  useEffect(() => {
    // Kiểm tra authentication khi component mount
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setIsAuthenticated(true)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
        setIsAuthenticated(false)
        setUser(null)
      }
    } else {
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    router.push('/page/auth/login')
  }

  return { isAuthenticated, user, logout, checkAuth }
}
