'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
// import { 
//   UserIcon, 
//   Cog6ToothIcon, 
//   InformationCircleIcon,
//   ChartBarIcon,
//   CurrencyDollarIcon,
//   TrendingUpIcon,
//   TrendingDownIcon
// } from '@heroicons/react/24/outline'

interface WhalePosition {
  id: string
  address: string
  balance: number
  change: number
  timestamp: Date
}

export default function MorePage() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [whalePositions, setWhalePositions] = useState<WhalePosition[]>([])
  const [loading, setLoading] = useState(true)

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    // 임시로 인증 체크 비활성화
    // if (!user) {
    //   router.push('/login')
    // }
  }, [user, router])

  // 고래 포지션 데이터 로드 (실제로는 API에서 가져와야 함)
  useEffect(() => {
    const loadWhalePositions = async () => {
      // 임시 더미 데이터
      const dummyData: WhalePosition[] = [
        {
          id: '1',
          address: '0x1234...5678',
          balance: 1250.5,
          change: 5.2,
          timestamp: new Date()
        },
        {
          id: '2',
          address: '0x9876...5432',
          balance: 890.3,
          change: -2.1,
          timestamp: new Date()
        },
        {
          id: '3',
          address: '0xabcd...efgh',
          balance: 2100.7,
          change: 8.9,
          timestamp: new Date()
        },
        {
          id: '4',
          address: '0x5678...9abc',
          balance: 1567.2,
          change: -1.5,
          timestamp: new Date()
        },
        {
          id: '5',
          address: '0xdef0...1234',
          balance: 3200.1,
          change: 12.3,
          timestamp: new Date()
        }
      ]
      
      setWhalePositions(dummyData)
      setLoading(false)
    }

    loadWhalePositions()
  }, [])

  // 현재 경로가 /more가 아니면 새 페이지에 렌더링하지 않음
  if (pathname !== '/more') {
    return null
  }

  // 임시로 인증 체크 비활성화
  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-4 pb-20">
        {/* 프로필 섹션 */}
        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <div className="text-2xl">👤</div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.nickname || '닉네임이 설정되지 않았습니다'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.introduce || '자기소개가 없습니다'}
              </p>
              <div className="flex items-center mt-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user?.is_verified 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {user?.is_verified ? '인증됨' : '미인증'}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="btn-secondary"
            >
              프로필 편집
            </button>
          </div>
        </div>

        {/* 고래 포지션 섹션 */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              고래 포지션
            </h3>
            <div className="text-xl">📊</div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {whalePositions.map((whale) => (
                <div
                  key={whale.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <div className="text-lg">💰</div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {whale.address}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {whale.balance.toLocaleString()} ETH
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-lg ${whale.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {whale.change > 0 ? '📈' : '📉'}
                    </div>
                    <span className={`font-medium ${
                      whale.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {whale.change > 0 ? '+' : ''}{whale.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 설정 및 정보 섹션 */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            설정 및 정보
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/profile')}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="text-lg">👤</div>
              <span className="text-gray-900 dark:text-white">프로필 설정</span>
            </button>
            
            <button
              onClick={() => router.push('/prices')}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="text-lg">📊</div>
              <span className="text-gray-900 dark:text-white">가격 차트</span>
            </button>
            
            <button
              onClick={() => router.push('/news')}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="text-lg">📰</div>
              <span className="text-gray-900 dark:text-white">뉴스</span>
            </button>
            
            <button
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className="text-lg">⚙️</div>
              <span className="text-gray-900 dark:text-white">앱 설정</span>
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
