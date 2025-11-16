'use client'

import { useState, useEffect, useRef } from 'react'
import { useExchangeRate } from './useExchangeRate'

interface BybitTicker {
  topic: string
  type: string
  data: {
    symbol: string
    lastPrice: string
    indexPrice: string
    markPrice: string
    prevPrice24h: string
    price24hPcnt: string
    highPrice24h: string
    lowPrice24h: string
    prevPrice1h: string
    openInterest: string
    openInterestValue: string
    turnover24h: string
    volume24h: string
    nextFundingTime: string
    fundingRate: string
    bid1Price: string
    bid1Size: string
    ask1Price: string
    ask1Size: string
  }
  cs: number
  ts: number
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

export function useBybitWebSocket() {
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
      const ws = new WebSocket('wss://stream.bybit.com/v5/public/spot')
      
      ws.onopen = () => {
        if (isDebug) console.log('바이비트 웹소켓 연결됨')
        setError(null)
        
        // 바이비트 웹소켓 구독 메시지 - 주요 코인들 구독
        const symbolsToSubscribe = ['BTCUSDT', 'ETHUSDT', 'XRPUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT', 'LTCUSDT', 'BCHUSDT', 'EOSUSDT', 'TRXUSDT']
        
        // 첫 번째 심볼로 구독 시작
        const subscribeMessage = {
          op: 'subscribe',
          args: [`tickers.${symbolsToSubscribe[0]}`]
        }
        
        ws.send(JSON.stringify(subscribeMessage))
        
        // 나머지 심볼들도 개별로 구독
        setTimeout(() => {
          symbolsToSubscribe.slice(1).forEach(symbol => {
            const msg = {
              op: 'subscribe',
              args: [`tickers.${symbol}`]
            }
            ws.send(JSON.stringify(msg))
          })
        }, 100)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // 구독 확인 메시지 무시
          if (data.success || data.ret_msg) {
            if (isDebug) console.log('바이비트 구독 확인:', data)
            return
          }
          
          if (data.topic && data.topic.startsWith('tickers.') && data.data) {
            const symbol = data.data.symbol.replace('USDT', '')
            const price = parseFloat(data.data.lastPrice)
            const changePercent = parseFloat(data.data.price24hPcnt) * 100
            const prevPrice = parseFloat(data.data.prevPrice24h)
            const change24h = price - prevPrice
            const volume = parseFloat(data.data.turnover24h)
            const high24h = parseFloat(data.data.highPrice24h)
            const low24h = parseFloat(data.data.lowPrice24h)
            
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
              high52w: 0, // 바이비트 API에서 52주 데이터를 제공하지 않음
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
            
            setLoading(false)
          }
        } catch (err) {
          console.error('바이비트 웹소켓 데이터 파싱 오류:', err)
        }
      }

      ws.onclose = (event) => {
        if (isDebug) console.log('바이비트 웹소켓 연결 종료:', event.code, event.reason)
        if (event.code !== 1000) { // 정상 종료가 아닌 경우에만 재연결
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isDebug) console.log('바이비트 웹소켓 재연결 시도')
            connectWebSocket()
          }, 3000)
        }
      }

      ws.onerror = (error) => {
        console.error('바이비트 웹소켓 오류:', error)
        setError('바이비트 웹소켓 연결 오류가 발생했습니다.')
      }

      wsRef.current = ws
    } catch (err) {
      console.error('바이비트 웹소켓 연결 실패:', err)
      setError('바이비트 웹소켓 연결에 실패했습니다.')
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
