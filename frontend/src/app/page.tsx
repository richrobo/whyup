'use client'

import { useAuth } from '@/lib/auth-context'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import TopGainers from '@/components/TopGainers'
import Footer from '@/components/Footer'

export default function Home() {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)

  useEffect(() => {
    const login = searchParams.get('login')
    if (login === 'success') {
      setShowLoginSuccess(true)
      // 3초 후 메시지 숨기기
      setTimeout(() => setShowLoginSuccess(false), 3000)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {showLoginSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                카카오 로그인이 성공적으로 완료되었습니다!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <main>
        <Hero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 상승률 상위 5개 섹션 */}
          <div className="mb-12">
            <TopGainers />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
