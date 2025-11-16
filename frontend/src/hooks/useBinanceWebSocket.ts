'use client'

import { useState, useEffect, useRef } from 'react'
import { useExchangeRate } from './useExchangeRate'

interface BinanceTicker {
  e: string // event type
  E: number // event time
  s: string // symbol
  p: string // price change
  P: string // price change percent
  w: string // weighted average price
  x: string // previous close price
  c: string // current close price
  Q: string // last quantity
  b: string // best bid price
  B: string // best bid quantity
  a: string // best ask price
  A: string // best ask quantity
  o: string // open price
  h: string // high price
  l: string // low price
  v: string // volume
  q: string // quote volume
  O: number // open time
  C: number // close time
  F: number // first trade id
  L: number // last trade id
  n: number // trade count
}

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

export function useBinanceWebSocket() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // 환율 정보 가져오기
  const { rate: krwRate, loading: rateLoading, error: rateError } = useExchangeRate()
  
  // 디버그 모드 확인
  const isDebug = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_WEBSOCKET === 'true'

  const connectWebSocket = () => {
    try {
      // 바이낸스 USDT 페어 웹소켓 - 개별 스트림으로 연결
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr')
      
      ws.onopen = () => {
        if (isDebug) console.log('바이낸스 웹소켓 연결됨')
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // 바이낸스 배열 형태의 티커 데이터 처리
          if (Array.isArray(data)) {
            // 모든 USDT 페어를 처리 (나중에 필터링)
            data.forEach((ticker: any) => {
              if (ticker.s.endsWith('USDT')) {
                const symbol = ticker.s.replace('USDT', '')
                const price = parseFloat(ticker.c)
                const changePercent = parseFloat(ticker.P)
                const change24h = parseFloat(ticker.p)
                const volume = parseFloat(ticker.q)
                const high24h = parseFloat(ticker.h)
                const low24h = parseFloat(ticker.l)
                
                // USD를 KRW로 변환 (실시간 환율 사용)
                const krwPrice = price * krwRate
                const krwChange24h = change24h * krwRate
                const krwVolume = volume * krwRate
                const krwHigh24h = high24h * krwRate
                const krwLow24h = low24h * krwRate
                
                const cryptoInfo: CryptoData = {
                  symbol: symbol,
                  name: getCoinName(symbol),
                  koreanName: getKoreanName(symbol),
                  englishName: getCoinName(symbol),
                  price: krwPrice,
                  change24h: krwChange24h,
                  changePercent24h: changePercent,
                  volume: krwVolume,
                  high24h: krwHigh24h,
                  low24h: krwLow24h,
                  high52w: 0, // 바이낸스 API에서 52주 데이터를 제공하지 않음
                  low52w: 0
                }

                setCryptoData(prev => {
                  const existing = prev.find(item => item.symbol === cryptoInfo.symbol)
                  if (existing) {
                    return prev.map(item => 
                      item.symbol === cryptoInfo.symbol ? cryptoInfo : item
                    )
                  } else {
                    return [...prev, cryptoInfo].sort((a, b) => b.changePercent24h - a.changePercent24h)
                  }
                })
              }
            })
            
            setLoading(false)
          }
        } catch (err) {
          console.error('바이낸스 웹소켓 데이터 파싱 오류:', err)
        }
      }

      ws.onclose = (event) => {
        if (isDebug) console.log('바이낸스 웹소켓 연결 종료:', event.code, event.reason)
        if (event.code !== 1000) { // 정상 종료가 아닌 경우에만 재연결
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isDebug) console.log('바이낸스 웹소켓 재연결 시도')
            connectWebSocket()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('바이낸스 웹소켓 오류:', error)
        setError('바이낸스 웹소켓 연결 오류가 발생했습니다.')
      }

      wsRef.current = ws
    } catch (err) {
      console.error('바이낸스 웹소켓 연결 실패:', err)
      setError('바이낸스 웹소켓 연결에 실패했습니다.')
    }
  }

  useEffect(() => {
    connectWebSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return { cryptoData, loading, error }
}

// 코인 이름 매핑 함수
function getCoinName(symbol: string): string {
  const coinNames: { [key: string]: string } = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'XRP': 'Ripple',
    'ADA': 'Cardano',
    'DOT': 'Polkadot',
    'LINK': 'Chainlink',
    'LTC': 'Litecoin',
    'BCH': 'Bitcoin Cash',
    'EOS': 'EOS',
    'TRX': 'TRON'
  }
  
  return coinNames[symbol] || symbol
}

function getKoreanName(symbol: string): string {
  const koreanNames: { [key: string]: string } = {
    'BTC': '비트코인',
    'ETH': '이더리움',
    'XRP': '리플',
    'ADA': '에이다',
    'DOT': '폴카닷',
    'LINK': '체인링크',
    'LTC': '라이트코인',
    'BCH': '비트코인캐시',
    'EOS': '이오스',
    'TRX': '트론'
  }
  
  return koreanNames[symbol] || symbol
}
