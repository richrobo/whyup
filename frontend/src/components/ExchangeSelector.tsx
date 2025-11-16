'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, BuildingOfficeIcon, CheckIcon } from '@heroicons/react/24/outline'

interface ExchangeSelectorProps {
  selectedExchange: string
  onExchangeChange: (exchange: string) => void
  label: string
  exchanges: { value: string; label: string }[]
}

// 거래소별 아이콘과 색상 매핑
const getExchangeInfo = (exchange: string) => {
  const exchangeMap: { [key: string]: { color: string; bgColor: string; icon: string } } = {
    'upbit': { 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'U'
    },
    'bithumb': { 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'B'
    },
    'binance': { 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: 'B'
    },
    'coinbase': { 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      icon: 'C'
    },
    'bybit': { 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'B'
    }
  }
  
  return exchangeMap[exchange] || { 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    icon: '?'
  }
}

// 거래소별 SVG 아이콘 컴포넌트
const ExchangeIcon = ({ exchange, className }: { exchange: string; className?: string }) => {
  switch (exchange) {
    case 'upbit':
      return (
        <div className={`w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold ${className}`}>
          U
        </div>
      )
    case 'bithumb':
      return (
        <div className={`w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold ${className}`}>
          B
        </div>
      )
    case 'binance':
      return (
        <div className={`w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold ${className}`}>
          B
        </div>
      )
    case 'coinbase':
      return (
        <div className={`w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ${className}`}>
          C
        </div>
      )
    case 'bybit':
      return (
        <div className={`w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold ${className}`}>
          B
        </div>
      )
    default:
      return (
        <div className={`w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold ${className}`}>
          ?
        </div>
      )
  }
}

export default function ExchangeSelector({ 
  selectedExchange, 
  onExchangeChange, 
  label, 
  exchanges 
}: ExchangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedExchangeInfo = getExchangeInfo(selectedExchange)
  
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSelect = (exchange: string) => {
    onExchangeChange(exchange)
    setIsOpen(false)
  }
  
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
        {label}
      </label>
      <div className="relative" ref={dropdownRef}>
        {/* 선택된 거래소 표시 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${selectedExchangeInfo.bgColor} border border-gray-200 dark:border-gray-600 rounded-lg p-3 min-w-[150px] transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExchangeIcon exchange={selectedExchange} className="mr-2" />
              <span className={`text-sm font-medium ${selectedExchangeInfo.color}`}>
                {exchanges.find(ex => ex.value === selectedExchange)?.label}
              </span>
            </div>
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </button>
        
        {/* 드롭다운 옵션들 */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden">
            {exchanges.map((exchange) => {
              const exchangeInfo = getExchangeInfo(exchange.value)
              const isSelected = exchange.value === selectedExchange
              
              return (
                <button
                  key={exchange.value}
                  onClick={() => handleSelect(exchange.value)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center justify-between ${
                    isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <ExchangeIcon exchange={exchange.value} className="mr-2" />
                    <span className={`text-sm font-medium ${exchangeInfo.color}`}>
                      {exchange.label}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
