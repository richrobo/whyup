'use client'

import { useState } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { useUpbitWebSocket } from '@/hooks/useUpbitWebSocket'
import CryptoAnalysisModal from './CryptoAnalysisModal'

export default function TopGainers() {
  const { cryptoData, loading, error } = useUpbitWebSocket()
  const [selectedCrypto, setSelectedCrypto] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCryptoClick = (crypto: any) => {
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
          상승률 상위 5개
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          상승률 상위 5개
        </h2>
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    )
  }

  const topGainers = cryptoData
    .filter(crypto => crypto.changePercent24h > 0)
    .sort((a, b) => b.changePercent24h - a.changePercent24h)
    .slice(0, 5)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        상승률 상위 5개
      </h2>
      
      {topGainers.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          상승 중인 코인이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {topGainers.map((crypto, index) => (
            <div 
              key={crypto.symbol} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              onClick={() => handleCryptoClick(crypto)}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {crypto.koreanName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {crypto.englishName}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ₩{crypto.price.toLocaleString()}
                </p>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    +{crypto.changePercent24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
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
