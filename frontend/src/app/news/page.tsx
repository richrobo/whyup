'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CalendarIcon, UserIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

interface NewsItem {
  id: number
  title: string
  summary: string
  content: string
  author: string
  publishedAt: string
  category: string
  imageUrl?: string
  source: string
  url: string
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: '전체' },
    { id: 'bitcoin', name: '비트코인' },
    { id: 'ethereum', name: '이더리움' },
    { id: 'defi', name: 'DeFi' },
    { id: 'nft', name: 'NFT' },
    { id: 'regulation', name: '규제' },
    { id: 'market', name: '시장 분석' }
  ]

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // 실제로는 뉴스 API를 호출하지만, 여기서는 시뮬레이션
        const mockNews: NewsItem[] = [
          {
            id: 1,
            title: '비트코인 ETF 승인으로 기관 투자자 관심 급증',
            summary: '미국 SEC의 비트코인 ETF 승인으로 기관 투자자들의 암호화폐 투자 관심이 크게 증가하고 있습니다.',
            content: '비트코인 ETF가 승인되면서 기관 투자자들이 암호화폐 시장에 본격적으로 진입하고 있습니다...',
            author: '김투자',
            publishedAt: '2024-01-15T10:30:00Z',
            category: 'bitcoin',
            source: 'CoinDesk Korea',
            url: 'https://example.com/news/1'
          },
          {
            id: 2,
            title: '이더리움 2.0 업그레이드로 수수료 대폭 감소',
            summary: '이더리움의 최신 업그레이드로 거래 수수료가 크게 줄어들어 사용자들이 혜택을 보고 있습니다.',
            content: '이더리움 네트워크의 최신 업그레이드로 인해 거래 수수료가 평균 50% 이상 감소했습니다...',
            author: '박블록체인',
            publishedAt: '2024-01-15T09:15:00Z',
            category: 'ethereum',
            source: 'Ethereum News',
            url: 'https://example.com/news/2'
          },
          {
            id: 3,
            title: 'DeFi 프로토콜 총 예치액 1000억 달러 돌파',
            summary: '전체 DeFi 프로토콜의 총 예치액이 사상 최초로 1000억 달러를 돌파했습니다.',
            content: 'DeFi(탈중앙화 금융) 생태계가 새로운 이정표를 달성했습니다...',
            author: '이디파이',
            publishedAt: '2024-01-15T08:45:00Z',
            category: 'defi',
            source: 'DeFi Pulse',
            url: 'https://example.com/news/3'
          },
          {
            id: 4,
            title: 'NFT 시장 회복 신호, 거래량 30% 증가',
            summary: 'NFT 시장이 최근 거래량 증가로 회복 신호를 보이고 있습니다.',
            content: 'NFT 시장이 지난 주 거래량이 전주 대비 30% 증가하며 회복 신호를 보이고 있습니다...',
            author: '최엔에프티',
            publishedAt: '2024-01-15T07:20:00Z',
            category: 'nft',
            source: 'NFT News',
            url: 'https://example.com/news/4'
          },
          {
            id: 5,
            title: '한국 정부, 암호화폐 규제 가이드라인 발표',
            summary: '한국 정부가 암호화폐 거래소와 관련된 새로운 규제 가이드라인을 발표했습니다.',
            content: '한국 정부가 암호화폐 시장의 투명성과 안정성을 높이기 위한 새로운 규제 가이드라인을 발표했습니다...',
            author: '정부관계자',
            publishedAt: '2024-01-15T06:30:00Z',
            category: 'regulation',
            source: '정부보도자료',
            url: 'https://example.com/news/5'
          },
          {
            id: 6,
            title: '암호화폐 시장 전망: 2024년 주요 트렌드 분석',
            summary: '2024년 암호화폐 시장의 주요 트렌드와 전망을 전문가들이 분석했습니다.',
            content: '2024년 암호화폐 시장은 여러 중요한 변화를 맞이할 것으로 예상됩니다...',
            author: '시장분석가',
            publishedAt: '2024-01-15T05:15:00Z',
            category: 'market',
            source: 'Crypto Analysis',
            url: 'https://example.com/news/6'
          }
        ]
        
        setNews(mockNews)
        setLoading(false)
      } catch (error) {
        console.error('뉴스를 불러오는 중 오류가 발생했습니다:', error)
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            암호화폐 뉴스
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            최신 암호화폐 시장 동향과 뉴스를 확인하세요
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((item) => (
              <article key={item.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs font-medium rounded-full">
                      {categories.find(cat => cat.id === item.category)?.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.source}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    {item.summary}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>{item.author}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(item.publishedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {filteredNews.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              선택한 카테고리에 해당하는 뉴스가 없습니다.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
