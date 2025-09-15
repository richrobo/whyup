'use client'

import { useState, useEffect, useRef } from 'react'

interface UpbitTicker {
  type: string
  code: string
  opening_price: number
  high_price: number
  low_price: number
  trade_price: number
  prev_closing_price: number
  acc_trade_price: number
  change: string
  change_price: number
  signed_change_price: number
  change_rate: number
  signed_change_rate: number
  ask_bid: string
  trade_volume: number
  acc_trade_volume: number
  trade_date: string
  trade_time: string
  trade_timestamp: number
  acc_ask_volume: number
  acc_bid_volume: number
  highest_52_week_price: number
  highest_52_week_date: string
  lowest_52_week_price: number
  lowest_52_week_date: string
  market_state: string
  is_trading_suspended: boolean
  delisting_date: string | null
  market_warning: string
  timestamp: number
  acc_trade_price_24h: number
  acc_trade_volume_24h: number
  stream_type: string
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

interface UpbitMarket {
  market: string
  korean_name: string
  english_name: string
  market_event: {
    warning: boolean
    caution: {
      PRICE_FLUCTUATIONS: boolean
      TRADING_VOLUME_SOARING: boolean
      DEPOSIT_AMOUNT_SOARING: boolean
      GLOBAL_PRICE_DIFFERENCES: boolean
      CONCENTRATION_OF_SMALL_ACCOUNTS: boolean
    }
  }
}

export function useUpbitWebSocket() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [markets, setMarkets] = useState<string[]>([])
  const [marketInfo, setMarketInfo] = useState<Map<string, {koreanName: string, englishName: string}>>(new Map())
  const marketInfoRef = useRef<Map<string, {koreanName: string, englishName: string}>>(new Map())

  // 업비트 마켓 목록 가져오기
  const fetchMarkets = async () => {
    try {
      const response = await fetch('https://api.upbit.com/v1/market/all')
      const data: UpbitMarket[] = await response.json()
      
      // KRW 마켓만 필터링
      const krwMarkets = data
        .filter(market => market.market.startsWith('KRW-'))
        .map(market => market.market)
      
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
      console.error('마켓 목록 가져오기 실패:', err)
      setError('마켓 목록을 가져올 수 없습니다.')
      return []
    }
  }

  const connectWebSocket = async () => {
    try {
      // 먼저 마켓 목록을 가져옴
      const marketList = await fetchMarkets()
      if (marketList.length === 0) {
        setError('마켓 목록을 가져올 수 없습니다.')
        return
      }

      // 마켓 정보가 로드될 때까지 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100))

      const ws = new WebSocket('wss://api.upbit.com/websocket/v1')
      
      ws.onopen = () => {
        console.log('업비트 웹소켓 연결됨')
        setError(null)
        
        // 업비트 웹소켓 구독 메시지 (배열 형태로 전송)
        const subscribeMessage = [
          { ticket: 'upbit-ticker' },
          {
            type: 'ticker',
            codes: marketList
          },
          { format: 'DEFAULT' }
        ]
        
        ws.send(JSON.stringify(subscribeMessage))
      }

      ws.onmessage = async (event) => {
        try {
          // 업비트 웹소켓은 바이너리 데이터를 전송하므로 Blob을 텍스트로 변환
          let data: UpbitTicker
          
          if (event.data instanceof Blob) {
            const text = await event.data.text()
            data = JSON.parse(text)
          } else {
            data = JSON.parse(event.data)
          }
          
          if (data.type === 'ticker') {
            const symbol = data.code.replace('KRW-', '')
            const marketData = marketInfoRef.current.get(data.code)
            
            console.log('Processing ticker for', data.code, 'marketData:', marketData)
            
            const cryptoInfo: CryptoData = {
              symbol: symbol,
              name: getCoinName(symbol),
              koreanName: marketData?.koreanName || symbol,
              englishName: marketData?.englishName || symbol,
              price: data.trade_price,
              change24h: data.signed_change_price,
              changePercent24h: data.signed_change_rate * 100,
              volume: data.acc_trade_price_24h, // 거래대금 (원)
              high24h: data.high_price,
              low24h: data.low_price,
              high52w: data.highest_52_week_price,
              low52w: data.lowest_52_week_price
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
          console.error('웹소켓 데이터 파싱 오류:', err)
        }
      }

      ws.onclose = () => {
        console.log('업비트 웹소켓 연결 종료')
        // 3초 후 재연결 시도
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket()
        }, 3000)
      }

      ws.onerror = (error) => {
        console.error('업비트 웹소켓 오류:', error)
        setError('웹소켓 연결 오류가 발생했습니다.')
      }

      wsRef.current = ws
    } catch (err) {
      console.error('웹소켓 연결 실패:', err)
      setError('웹소켓 연결에 실패했습니다.')
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
    'TRX': 'TRON',
    'ETC': 'Ethereum Classic',
    'XLM': 'Stellar',
    'QTUM': 'Qtum',
    'BTT': 'BitTorrent',
    'ICX': 'ICON',
    'VET': 'VeChain',
    'THETA': 'Theta Network',
    'ONT': 'Ontology',
    'ZIL': 'Zilliqa',
    'EGLD': 'MultiversX',
    'ZRX': '0x Protocol',
    'BAT': 'Basic Attention Token',
    'IOST': 'IOST',
    'DGB': 'DigiByte',
    'CRO': 'Cronos',
    'SOL': 'Solana',
    'MATIC': 'Polygon',
    'AVAX': 'Avalanche',
    'ATOM': 'Cosmos',
    'NEAR': 'NEAR Protocol',
    'ALGO': 'Algorand',
    'FTM': 'Fantom',
    'SAND': 'The Sandbox',
    'MANA': 'Decentraland',
    'AXS': 'Axie Infinity',
    'CHZ': 'Chiliz',
    'ENJ': 'Enjin Coin',
    'GRT': 'The Graph',
    '1INCH': '1inch',
    'COMP': 'Compound',
    'UNI': 'Uniswap',
    'SUSHI': 'SushiSwap',
    'YFI': 'Yearn.finance',
    'AAVE': 'Aave',
    'SNX': 'Synthetix',
    'MKR': 'Maker',
    'CRV': 'Curve DAO Token',
    'BAL': 'Balancer',
    'KNC': 'Kyber Network Crystal',
    'REP': 'Augur',
    'LRC': 'Loopring',
    'OMG': 'OMG Network',
    'BNT': 'Bancor',
    'REN': 'Ren',
    'KAVA': 'Kava',
    'BAND': 'Band Protocol',
    'NU': 'NuCypher'
  }
  
  return coinNames[symbol] || symbol
}
