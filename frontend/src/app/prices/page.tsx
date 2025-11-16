'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ExchangeSelector from '@/components/ExchangeSelector'
import { useMultiExchangeData } from '@/hooks/useMultiExchangeData'
import { useTheme } from '@/lib/theme-context'
import { ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// 거래량을 억단위로 변환하는 함수
const formatVolume = (volume: number): string => {
  if (volume >= 100000000) {
    return `${(volume / 100000000).toFixed(1)}억`
  } else if (volume >= 10000) {
    return `${(volume / 10000).toFixed(1)}만`
  } else {
    return volume.toLocaleString()
  }
}

export default function PricesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [baseExchange, setBaseExchange] = useState('upbit')
  const { exchangeData, loading, error, getPriceComparison, getBaseExchangeSymbols, exchangeRate } = useMultiExchangeData(baseExchange)
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change' | 'high52w' | 'low52w' | 'volume' | 'priceDifference'>('change')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [compareExchange, setCompareExchange] = useState('bithumb')
  const [isNavigating, setIsNavigating] = useState(false)

  // 기준 거래소 옵션 (업비트, 빗썸만)
  const baseExchangeOptions = [
    { value: 'upbit', label: '업비트' },
    { value: 'bithumb', label: '빗썸' }
  ]

  // 전체 거래소 옵션
  const allExchangeOptions = [
    { value: 'upbit', label: '업비트' },
    { value: 'bithumb', label: '빗썸' },
    { value: 'binance', label: '바이낸스' },
    { value: 'bybit', label: '바이비트' }
  ]

  // 비교 거래소 옵션 (기준 거래소 제외)
  const compareExchangeOptions = allExchangeOptions.filter(exchange => exchange.value !== baseExchange)

  // 기준 거래소가 변경될 때 비교 거래소 자동 조정
  useEffect(() => {
    // 현재 선택된 비교 거래소가 기준 거래소와 같거나, 비교 옵션에 없으면 첫 번째 옵션으로 변경
    if (compareExchange === baseExchange || !compareExchangeOptions.find(ex => ex.value === compareExchange)) {
      setCompareExchange(compareExchangeOptions[0]?.value || 'bithumb')
    }
  }, [baseExchange, compareExchange, compareExchangeOptions])

  // 페이지 이동 시 새 페이지에 렌더링
  useEffect(() => {
    const handleNavigation = () => {
      setIsNavigating(true)
      // 페이지 이동 시 컴포넌트를 새로 렌더링하기 위해 강제 리렌더링
      setTimeout(() => {
        setIsNavigating(false)
      }, 100)
    }

    // 현재 경로가 /prices가 아닐 때만 새 페이지에 렌더링
    if (pathname !== '/prices') {
      handleNavigation()
    }
  }, [pathname])

  // 가격 비교 데이터 가져오기
  const priceComparisons = getPriceComparison(baseExchange, compareExchange)

  const filteredAndSortedData = priceComparisons
    .filter(crypto => 
      crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      crypto.koreanName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortBy) {
        case 'name':
          aValue = a.symbol
          bValue = b.symbol
          break
        case 'price':
          aValue = a.basePrice || 0
          bValue = b.basePrice || 0
          break
        case 'change':
          aValue = a.changePercent24h || 0
          bValue = b.changePercent24h || 0
          break
        case 'high52w':
          aValue = a.high52w || 0
          bValue = b.high52w || 0
          break
        case 'low52w':
          aValue = a.low52w || 0
          bValue = b.low52w || 0
          break
        case 'volume':
          aValue = a.volume || 0
          bValue = b.volume || 0
          break
        case 'priceDifference':
          aValue = a.priceDifference || 0
          bValue = b.priceDifference || 0
          break
        default:
          aValue = a.priceDifferencePercent || 0
          bValue = b.priceDifferencePercent || 0
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortOrder === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number)
      }
    })

  const handleSort = (newSortBy: 'name' | 'price' | 'change' | 'high52w' | 'low52w' | 'volume' | 'priceDifference') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  // 현재 경로가 /prices가 아니면 새 페이지에 렌더링하지 않음
  if (pathname !== '/prices') {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          {/* TradingView BTCUSDT 차트 */}
          <div className="mb-6">
            <div style={{ height: '400px', width: '100%' }}>
              <iframe
                src={`https://s.tradingview.com/widgetembed/?hideideas=1&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=kr#%7B%22symbol%22%3A%22BINANCE%3ABTCUSDT%22%2C%22frameElementId%22%3A%22tradingview_a4def%22%2C%22interval%22%3A%2215%22%2C%22allow_symbol_change%22%3A%221%22%2C%22save_image%22%3A%220%22%2C%22studies%22%3A%22%5B%5D%22%2C%22theme%22%3A%22${theme === 'dark' ? 'Dark' : 'Light'}%22%2C%22style%22%3A%221%22%2C%22timezone%22%3A%22Asia%2FSeoul%22%2C%22studies_overrides%22%3A%22%7B%7D%22%2C%22utm_source%22%3A%22whyup.com%22%2C%22utm_medium%22%3A%22widget_new%22%2C%22utm_campaign%22%3A%22chart%22%2C%22utm_term%22%3A%22BINANCE%3ABTCUSDT%22%2C%22page-uri%22%3A%22whyup.com%2F%22%7D`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="TradingView Chart"
              ></iframe>
            </div>
          </div>
          
          {/* 거래소 선택 및 검색 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 거래소 선택 부분 */}
              <div className="flex flex-col sm:flex-row gap-6 flex-1">
                <div className="flex flex-col sm:flex-row gap-6 flex-1">
                  <ExchangeSelector
                    selectedExchange={baseExchange}
                    onExchangeChange={setBaseExchange}
                    label="기준 거래소"
                    exchanges={baseExchangeOptions}
                  />
                  <ExchangeSelector
                    selectedExchange={compareExchange}
                    onExchangeChange={setCompareExchange}
                    label="비교 거래소"
                    exchanges={compareExchangeOptions}
                  />
                </div>
                
                {/* 검색창 - 기준 거래소 오른쪽에 고정 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                  <div className="relative w-full sm:w-80">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="코인명 또는 심볼 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              
              {/* 기준 개수 및 환율 - 오른쪽 배치 */}
              <div className="flex flex-col items-end bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  기준: <span className="text-primary-600 dark:text-primary-400 font-semibold">{exchangeData[baseExchange]?.length || 0}개</span>
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  환율: <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {exchangeRate > 0 ? `${exchangeRate.toLocaleString()}원` : '0원 (환율 정보 없음)'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 가격 테이블 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th 
                    className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      코인명
                      {sortBy === 'name' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center justify-end">
                      <span className="hidden lg:inline">현재가 (기준/비교)</span>
                      <span className="lg:hidden">현재가</span>
                      {sortBy === 'price' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('priceDifference')}
                  >
                    <div className="flex items-center justify-end">
                      가격차
                      {sortBy === 'priceDifference' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('change')}
                  >
                    <div className="flex items-center justify-end">
                      전일대비
                      {sortBy === 'change' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="hidden lg:table-cell px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('high52w')}
                  >
                    <div className="flex items-center justify-end">
                      52주최고
                      {sortBy === 'high52w' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="hidden lg:table-cell px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('low52w')}
                  >
                    <div className="flex items-center justify-end">
                      52주최저
                      {sortBy === 'low52w' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleSort('volume')}
                  >
                    <div className="flex items-center justify-end">
                      거래액
                      {sortBy === 'volume' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAndSortedData.map((crypto) => (
                  <tr key={crypto.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {crypto.koreanName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {crypto.symbol}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {crypto.basePrice ? crypto.basePrice.toLocaleString() : '0'}
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 mt-1 hidden lg:block">
                        {crypto.comparePrice > 0 ? crypto.comparePrice.toLocaleString() : '-'}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      {crypto.comparePrice > 0 ? (
                        <>
                          <div className={`text-xs sm:text-sm font-medium ${
                            crypto.priceDifferencePercent >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {crypto.priceDifferencePercent >= 0 ? '+' : ''}{crypto.priceDifferencePercent ? crypto.priceDifferencePercent.toFixed(2) : '0.00'}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                            {crypto.priceDifference >= 0 ? '+' : ''}{crypto.priceDifference ? crypto.priceDifference.toLocaleString() : '0'}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                          -
                        </div>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      <div className={`text-xs sm:text-sm font-medium ${
                        crypto.changePercent24h >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {crypto.changePercent24h >= 0 ? '+' : ''}{crypto.changePercent24h ? crypto.changePercent24h.toFixed(2) : '0.00'}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                        {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h ? crypto.change24h.toLocaleString() : '0'}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-right">
                      {crypto.high52w && crypto.basePrice ? (
                        <>
                          <div className={`text-sm font-medium ${
                            crypto.basePrice >= crypto.high52w 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {crypto.basePrice >= crypto.high52w ? '-' : '+'}{Math.abs(((crypto.high52w - crypto.basePrice) / crypto.basePrice) * 100).toFixed(2)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {crypto.high52w.toLocaleString()}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400 dark:text-gray-500">
                          -
                        </div>
                      )}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-right">
                      {crypto.low52w && crypto.basePrice ? (
                        <>
                          <div className={`text-sm font-medium ${
                            crypto.basePrice <= crypto.low52w 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {crypto.basePrice <= crypto.low52w ? '+' : '-'}{Math.abs(((crypto.basePrice - crypto.low52w) / crypto.low52w) * 100).toFixed(2)}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {crypto.low52w.toLocaleString()}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400 dark:text-gray-500">
                          -
                        </div>
                      )}
                    </td>
                    <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {crypto.volume ? formatVolume(crypto.volume) : '0'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
