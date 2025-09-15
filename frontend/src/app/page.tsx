'use client'

import { useAuth } from '@/lib/auth-context'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import TopGainers from '@/components/TopGainers'
import Footer from '@/components/Footer'

export default function Home() {
  const { user, loading } = useAuth()

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
