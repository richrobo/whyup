'use client'

import { useState, useEffect } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import CryptoAnalysisModal from './CryptoAnalysisModal'

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
}

export default function CryptoPrices() {
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoPrice | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crypto/prices`)
        if (response.ok) {
          const data = await response.json()
          setPrices(data)
        } else {
          console.error('가격 정보를 불러오는데 실패했습니다')
        }
      } catch (error) {
        console.error('가격 정보를 불러오는 중 오류가 발생했습니다:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrices()
    
    // 5초마다 가격 업데이트
    const interval = setInterval(fetchPrices, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleCryptoClick = (crypto: CryptoPrice) => {
    setSelectedCrypto(crypto)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedCrypto(null)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          실시간 암호화폐 가격
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        실시간 암호화폐 가격
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {prices.map((crypto) => (
          <div 
            key={crypto.symbol} 
            className="crypto-card cursor-pointer"
            onClick={() => handleCryptoClick(crypto)}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {crypto.symbol}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {crypto.name}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${crypto.price.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: crypto.price < 1 ? 4 : 2 
                })}
              </p>
              <div className={`flex items-center text-sm ${
                crypto.changePercent24h >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {crypto.changePercent24h >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span>
                  {crypto.changePercent24h >= 0 ? '+' : ''}{crypto.changePercent24h.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedCrypto && (
        <CryptoAnalysisModal
          isOpen={isModalOpen}
          onClose={closeModal}
          crypto={selectedCrypto}
        />
      )}
    </div>
  )
}
