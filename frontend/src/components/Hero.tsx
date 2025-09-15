'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function Hero() {
  const { user } = useAuth()

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Why Up에 오신 것을 환영합니다
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 dark:text-primary-200 mb-8 max-w-3xl mx-auto">
            암호화폐 시장을 분석하고, 커뮤니티와 함께 소통하며, 투자 인사이트를 공유하세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  href="/posts/create"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
                >
                  글쓰기 시작하기
                </Link>
                <Link
                  href="/posts"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
                >
                  게시물 둘러보기
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
                >
                  지금 시작하기
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
                >
                  로그인
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
