'use client'

import { useState, useEffect } from 'react'
import { useUpbitWebSocket } from './useUpbitWebSocket'
import { useBithumbWebSocket } from './useBithumbWebSocket'
import { useBinanceWebSocket } from './useBinanceWebSocket'
import { useBybitWebSocket } from './useBybitWebSocket'
import { useExchangeRate } from './useExchangeRate'

interface CryptoData {
  symbol: string
  name: string
  koreanName: string
  englishName: string
  price: number
  change24h: number
  changePercent24h: number
  volume: number
  high24h: number
  low24h: number
  high52w: number
  low52w: number
}

interface ExchangeData {
  [exchange: string]: CryptoData[]
}

interface PriceComparison {
  symbol: string
  name: string
  koreanName: string
  englishName: string
  basePrice: number
  comparePrice: number
  priceDifference: number
  priceDifferencePercent: number
  baseExchange: string
  compareExchange: string
  change24h: number
  changePercent24h: number
  high52w: number
  low52w: number
  volume: number
}

export function useMultiExchangeData(baseExchange: string = 'upbit') {
  const [exchangeData, setExchangeData] = useState<ExchangeData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 디버그 모드 확인
  const isDebug = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_WEBSOCKET === 'true'

  // 각 거래소 데이터 가져오기
  const upbitData = useUpbitWebSocket()
  const bithumbData = useBithumbWebSocket()
  const binanceData = useBinanceWebSocket()
  const bybitData = useBybitWebSocket()
  
  // 환율 정보 가져오기
  const { rate: exchangeRate, loading: rateLoading, error: rateError } = useExchangeRate()

  // 기준 거래소의 코인 심볼 목록 가져오기
  const getBaseSymbols = () => {
    if (baseExchange === 'upbit') {
      return upbitData.cryptoData.map(crypto => crypto.symbol)
    } else if (baseExchange === 'bithumb') {
      return bithumbData.cryptoData.map(crypto => crypto.symbol)
    }
    return []
  }

  // 모든 거래소 데이터를 통합
  useEffect(() => {
    if (isDebug) console.log('useMultiExchangeData 업데이트:', {
      upbitLoading: upbitData.loading,
      upbitError: upbitData.error,
      upbitDataLength: upbitData.cryptoData.length,
      bithumbLoading: bithumbData.loading,
      bithumbError: bithumbData.error,
      bithumbDataLength: bithumbData.cryptoData.length,
      binanceLoading: binanceData.loading,
      binanceError: binanceData.error,
      binanceDataLength: binanceData.cryptoData.length,
      bybitLoading: bybitData.loading,
      bybitError: bybitData.error,
      bybitDataLength: bybitData.cryptoData.length
    })

    // 기준 거래소의 코인 심볼 목록
    const baseSymbols = getBaseSymbols()
    
    // 바이낸스와 바이비트 데이터를 기준 거래소의 코인들만 필터링
    const filteredBinanceData = baseSymbols.length > 0 
      ? binanceData.cryptoData.filter(crypto => baseSymbols.includes(crypto.symbol))
      : binanceData.cryptoData
    
    const filteredBybitData = baseSymbols.length > 0 
      ? bybitData.cryptoData.filter(crypto => baseSymbols.includes(crypto.symbol))
      : bybitData.cryptoData

    const newExchangeData: ExchangeData = {
      upbit: upbitData.cryptoData,
      bithumb: bithumbData.cryptoData,
      binance: filteredBinanceData,
      bybit: filteredBybitData
    }

    setExchangeData(newExchangeData)

    // 모든 거래소의 로딩 상태 확인
    const allLoading = upbitData.loading || bithumbData.loading || binanceData.loading || bybitData.loading
    setLoading(allLoading)

    // 에러 상태 확인
    const allErrors = [upbitData.error, bithumbData.error, binanceData.error, bybitData.error].filter(Boolean)
    if (allErrors.length > 0) {
      setError(allErrors.join(', '))
    } else {
      setError(null)
    }
  }, [
    upbitData.cryptoData, upbitData.loading, upbitData.error,
    bithumbData.cryptoData, bithumbData.loading, bithumbData.error,
    binanceData.cryptoData, binanceData.loading, binanceData.error,
    bybitData.cryptoData, bybitData.loading, bybitData.error
  ])

  // 가격 비교 데이터 생성
  const getPriceComparison = (baseExchange: string, compareExchange: string): PriceComparison[] => {
    const baseData = exchangeData[baseExchange] || []
    const compareData = exchangeData[compareExchange] || []

    if (isDebug) console.log('가격 비교 데이터 생성:', {
      baseExchange,
      compareExchange,
      baseDataLength: baseData.length,
      compareDataLength: compareData.length
    })

    const comparisons: PriceComparison[] = []

    // 기준 거래소의 모든 코인을 표시 (비교 거래소에 없어도 표시)
    baseData.forEach(baseCrypto => {
      const compareCrypto = compareData.find(crypto => crypto.symbol === baseCrypto.symbol)
      
      if (baseCrypto.price && baseCrypto.price > 0) {
        let priceDifference = 0
        let priceDifferencePercent = 0
        let comparePrice = 0

        // 비교 거래소에 해당 코인이 있는 경우에만 가격 차이 계산
        if (compareCrypto && compareCrypto.price && compareCrypto.price > 0) {
          comparePrice = compareCrypto.price
          priceDifference = baseCrypto.price - compareCrypto.price
          priceDifferencePercent = (priceDifference / compareCrypto.price) * 100
        }

        comparisons.push({
          symbol: baseCrypto.symbol,
          name: baseCrypto.name,
          koreanName: baseCrypto.koreanName,
          englishName: baseCrypto.englishName,
          basePrice: baseCrypto.price,
          comparePrice: comparePrice,
          priceDifference: priceDifference,
          priceDifferencePercent: priceDifferencePercent,
          baseExchange: baseExchange,
          compareExchange: compareExchange,
          change24h: baseCrypto.change24h,
          changePercent24h: baseCrypto.changePercent24h,
          high52w: baseCrypto.high52w,
          low52w: baseCrypto.low52w,
          volume: baseCrypto.volume
        })
      }
    })

    if (isDebug) console.log('표시할 코인 수:', comparisons.length)
    return comparisons.sort((a, b) => {
      // 가격 차이가 있는 코인을 먼저 표시, 그 다음 알파벳 순
      if (a.priceDifference !== 0 && b.priceDifference === 0) return -1
      if (a.priceDifference === 0 && b.priceDifference !== 0) return 1
      if (a.priceDifference !== 0 && b.priceDifference !== 0) {
        return Math.abs(b.priceDifferencePercent) - Math.abs(a.priceDifferencePercent)
      }
      return a.symbol.localeCompare(b.symbol)
    })
  }

  // 기준 거래소의 코인 심볼 목록 가져오기
  const getBaseExchangeSymbols = (baseExchange: string): string[] => {
    const baseData = exchangeData[baseExchange] || []
    return baseData.map(crypto => crypto.symbol)
  }


  return {
    exchangeData,
    loading,
    error,
    getPriceComparison,
    getBaseExchangeSymbols,
    exchangeRate
  }
}
