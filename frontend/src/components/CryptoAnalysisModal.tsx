'use client'

import { useState } from 'react'
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface CryptoAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  crypto: {
    symbol: string
    name: string
    price: number
    changePercent24h: number
    change24h: number
  }
}

export default function CryptoAnalysisModal({ isOpen, onClose, crypto }: CryptoAnalysisModalProps) {
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)

  const generateAnalysis = async () => {
    setLoading(true)
    try {
      // 실제로는 OpenAI API를 호출하지만, 여기서는 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockAnalysis = `
**${crypto.name} (${crypto.symbol}) 가격 변동 분석**

현재 가격: ₩${crypto.price.toLocaleString()}
24시간 변동: ${crypto.change24h >= 0 ? '+' : ''}₩${crypto.change24h.toLocaleString()}
24시간 변동률: ${crypto.changePercent24h >= 0 ? '+' : ''}${crypto.changePercent24h.toFixed(2)}%

**주요 변동 요인:**

1. **시장 심리**
   - ${crypto.changePercent24h >= 0 ? '긍정적인 시장 심리가 가격 상승을 이끌고 있습니다.' : '부정적인 시장 심리가 가격 하락을 야기하고 있습니다.'}
   - 투자자들의 위험 선호도가 ${crypto.changePercent24h >= 0 ? '증가' : '감소'}하고 있습니다.

2. **기술적 분석**
   - ${crypto.changePercent24h >= 0 ? '상승 추세가 지속되고 있으며, 저항선을 돌파할 가능성이 높습니다.' : '하락 추세가 지속되고 있으며, 지지선 테스트가 예상됩니다.'}
   - 거래량이 ${crypto.changePercent24h >= 0 ? '증가' : '감소'}하여 ${crypto.changePercent24h >= 0 ? '상승' : '하락'} 모멘텀이 강화되고 있습니다.

3. **기본적 분석**
   - ${crypto.symbol === 'BTC' ? '비트코인 ETF 승인 소식과 기관 투자자들의 관심 증가' : 
     crypto.symbol === 'ETH' ? '이더리움 2.0 업그레이드와 DeFi 생태계 성장' :
     crypto.symbol === 'BNB' ? '바이낸스 거래소 성과와 BSC 생태계 확장' :
     crypto.symbol === 'ADA' ? '카르다노 스마트 컨트랙트 기능 강화' :
     '솔라나 생태계 성장과 NFT 시장 활성화'}가 가격에 영향을 미치고 있습니다.

4. **외부 요인**
   - 글로벌 경제 상황과 중앙은행 정책이 암호화폐 시장에 영향을 주고 있습니다.
   - 규제 환경의 변화가 투자자 심리에 영향을 미치고 있습니다.

**투자 조언:**
- 단기적으로는 ${crypto.changePercent24h >= 0 ? '상승 추세가 지속될 가능성이 높습니다.' : '하락 압력이 지속될 수 있습니다.'}
- 장기 투자 관점에서는 기술적 혁신과 채택률 증가를 고려해야 합니다.
- 투자 전 충분한 리서치와 리스크 관리가 필요합니다.

*이 분석은 AI가 생성한 것으로, 투자 조언이 아닙니다. 투자 결정은 신중히 하시기 바랍니다.`
      
      setAnalysis(mockAnalysis)
    } catch (error) {
      setAnalysis('분석을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {crypto.name} 가격 분석
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!analysis && !loading && (
            <div className="text-center py-8">
              <SparklesIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI 가격 분석 생성
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {crypto.name}의 현재 가격 변동에 대한 상세한 분석을 생성합니다.
              </p>
              <button
                onClick={generateAnalysis}
                className="btn-primary flex items-center mx-auto"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                분석 생성하기
              </button>
            </div>
          )}
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                AI가 {crypto.name} 가격 변동을 분석하고 있습니다...
              </p>
            </div>
          )}
          
          {analysis && (
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                {analysis}
              </pre>
            </div>
          )}
        </div>
        
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
