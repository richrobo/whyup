'use client'

import { useState, useEffect, useRef } from 'react'

interface BithumbTicker {
  ty: string // type
  cd: string // code
  op: number // open price
  hp: number // high price
  lp: number // low price
  tp: number // trade price (current price)
  pcp: number // previous close price
  c: string // change (RISE/FALL)
  cp: number // change price
  scp: number // signed change price
  cr: number // change rate
  scr: number // signed change rate
  tv: number // trade volume
  atv: number // acc trade volume
  atv24h: number // acc trade volume 24h
  atp: number // acc trade price
  atp24h: number // acc trade price 24h
  tdt: string // trade date
  ttm: string // trade time
  ttms: number // trade timestamp
  ab: string // ask/bid
  aav: number // acc ask volume
  abv: number // acc bid volume
  h52wp: number // high 52 week price
  h52wdt: string // high 52 week date
  l52wp: number // low 52 week price
  l52wdt: string // low 52 week date
  ms: string // market state
  its: boolean // is trading suspended
  dd: string | null // delisting date
  mw: string // market warning
  tms: number // timestamp
  st: string // stream type
}

interface BithumbMarket {
  market: string
  korean_name: string
  english_name: string
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

export function useBithumbWebSocket() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [markets, setMarkets] = useState<string[]>([])
  const [marketInfo, setMarketInfo] = useState<Map<string, {koreanName: string, englishName: string}>>(new Map())
  
  // 디버그 모드 확인
  const isDebug = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_WEBSOCKET === 'true'
  const marketInfoRef = useRef<Map<string, {koreanName: string, englishName: string}>>(new Map())

  // 빗썸 마켓 목록 가져오기
  const fetchMarkets = async () => {
    try {
      if (isDebug) console.log('빗썸 마켓 목록 가져오기 시작...')
      const response = await fetch('https://api.bithumb.com/v1/market/all')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: BithumbMarket[] = await response.json()
      if (isDebug) console.log('빗썸 마켓 데이터:', data.slice(0, 5)) // 처음 5개만 로그
      
      // KRW 마켓만 필터링
      const krwMarkets = data
        .filter(market => market.market.startsWith('KRW-'))
        .map(market => market.market)
      
      if (isDebug) console.log('빗썸 KRW 마켓 총 개수:', krwMarkets.length)
      if (isDebug) console.log('빗썸 KRW 마켓 샘플:', krwMarkets.slice(0, 10)) // 처음 10개만 로그
      
      // 마켓 정보 맵 생성
      const marketInfoMap = new Map<string, {koreanName: string, englishName: string}>()
      data
        .filter(market => market.market.startsWith('KRW-'))
        .forEach(market => {
          marketInfoMap.set(market.market, {
            koreanName: market.korean_name,
            englishName: market.english_name
          })
        })
      
      setMarkets(krwMarkets)
      setMarketInfo(marketInfoMap)
      marketInfoRef.current = marketInfoMap
      return krwMarkets
    } catch (err) {
      console.error('빗썸 마켓 목록 가져오기 실패:', err)
      setError(`빗썸 마켓 목록을 가져올 수 없습니다: ${err}`)
      return []
    }
  }

  const connectWebSocket = async () => {
    try {
      if (isDebug) console.log('빗썸 웹소켓 연결 시작...')
      
      // 먼저 마켓 목록을 가져옴
      const marketList = await fetchMarkets()
      if (isDebug) console.log('빗썸 마켓 목록 길이:', marketList.length)
      
      if (marketList.length === 0) {
        console.error('빗썸 마켓 목록이 비어있음')
        setError('빗썸 마켓 목록을 가져올 수 없습니다.')
        setLoading(false) // 로딩 상태 해제
        return
      }

      // 마켓 정보가 로드될 때까지 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100))

      if (isDebug) console.log('빗썸 웹소켓 연결 시도...')
      const ws = new WebSocket('wss://ws-api.bithumb.com/websocket/v1')
      
      ws.onopen = () => {
        if (isDebug) console.log('빗썸 웹소켓 연결됨')
        setError(null)
        
        // 빗썸 웹소켓 구독 메시지
        const subscribeMessage = [
          { ticket: 'bithumb-ticker' },
          {
            type: 'ticker',
            codes: marketList // 모든 KRW 마켓 구독
          },
          { format: 'SIMPLE' }
        ]
        
        if (isDebug) console.log('빗썸 구독 메시지 전송:', subscribeMessage)
        ws.send(JSON.stringify(subscribeMessage))
      }

      ws.onmessage = async (event) => {
        try {
          if (isDebug) console.log('빗썸 웹소켓 메시지 수신:', event.data)
          
          // 빗썸 웹소켓은 바이너리 데이터를 전송하므로 Blob을 텍스트로 변환
          let data: BithumbTicker
          
          if (event.data instanceof Blob) {
            const text = await event.data.text()
            data = JSON.parse(text)
          } else {
            data = JSON.parse(event.data)
          }
          
          if (isDebug) console.log('빗썸 파싱된 데이터:', data)
          
          if (data.ty === 'ticker') {
            const symbol = data.cd.replace('KRW-', '')
            const marketData = marketInfoRef.current.get(data.cd)
            
            if (isDebug) console.log('빗썸 티커 처리:', data.cd, 'marketData:', marketData)
            
            const price = data.tp // trade price (현재가)
            const changePercent = data.scr * 100 // signed change rate
            const change24h = data.scp // signed change price
            const volume = data.atp24h // acc trade price 24h (거래대금)
            const high24h = data.hp // high price
            const low24h = data.lp // low price
            const high52w = data.h52wp // high 52 week price
            const low52w = data.l52wp // low 52 week price
            
            const cryptoInfo: CryptoData = {
              symbol: symbol,
              name: getCoinName(symbol),
              koreanName: marketData?.koreanName || symbol,
              englishName: marketData?.englishName || symbol,
              price: price,
              change24h: change24h,
              changePercent24h: changePercent,
              volume: volume,
              high24h: high24h,
              low24h: low24h,
              high52w: high52w,
              low52w: low52w
            }

            setCryptoData(prev => {
              const existing = prev.find(item => item.symbol === cryptoInfo.symbol)
              if (existing) {
                return prev.map(item => 
                  item.symbol === cryptoInfo.symbol ? cryptoInfo : item
                )
              } else {
                const newData = [...prev, cryptoInfo].sort((a, b) => b.changePercent24h - a.changePercent24h)
                if (isDebug) console.log('빗썸 처리된 코인 수:', newData.length)
                return newData
              }
            })
            
            setLoading(false)
          }
        } catch (err) {
          console.error('빗썸 웹소켓 데이터 파싱 오류:', err)
        }
      }

      ws.onclose = () => {
        if (isDebug) console.log('빗썸 웹소켓 연결 종료')
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket()
        }, 3000)
      }

      ws.onerror = (error) => {
        console.error('빗썸 웹소켓 오류:', error)
        setError('빗썸 웹소켓 연결 오류가 발생했습니다.')
      }

      wsRef.current = ws
    } catch (err) {
      console.error('빗썸 웹소켓 연결 실패:', err)
      setError('빗썸 웹소켓 연결에 실패했습니다.')
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

  return { cryptoData, loading, error, markets, marketInfo }
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
