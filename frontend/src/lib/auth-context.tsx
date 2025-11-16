'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  userid: string
  name?: string
  image?: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  kakaoLogin: (accessToken: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 로컬 스토리지에서 토큰 확인
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      // 토큰으로 사용자 정보 가져오기
      fetchUserInfo(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUserInfo = async (authToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // 토큰이 유효하지 않으면 제거
        localStorage.removeItem('token')
        setToken(null)
      }
    } catch (error) {
      console.error('사용자 정보를 가져오는 중 오류가 발생했습니다:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }


  const kakaoLogin = async (accessToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/kakao-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.access_token)
        setUser(data.user)
        localStorage.setItem('token', data.access_token)
        return true
      }
      return false
    } catch (error) {
      console.error('카카오 로그인 중 오류가 발생했습니다:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const value = {
    user,
    token,
    kakaoLogin,
    logout,
    loading,
    setToken,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
