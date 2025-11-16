'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import KakaoLogin from '@/components/KakaoLogin'

export default function LoginPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 이미 로그인된 사용자는 홈으로 리다이렉트
  if (user) {
    router.push('/')
    return null
  }

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setErrorMessage(decodeURIComponent(error))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              로그인
            </h1>
            <p className="text-gray-600">
              카카오 계정으로 간편하게 로그인하세요
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="mt-6">
            <KakaoLogin
              onSuccess={() => router.push('/')}
              onError={(error) => {
                console.error('카카오 로그인 오류:', error)
                setErrorMessage(error)
              }}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
