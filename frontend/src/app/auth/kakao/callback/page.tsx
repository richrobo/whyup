'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function KakaoCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    console.log('콜백 페이지 로드됨')
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    
    console.log('URL 파라미터:', { code, error })

    if (error) {
      console.log('에러 발생:', error)
      // 에러가 있는 경우 로그인 페이지로 리다이렉트
      router.push('/login?error=' + encodeURIComponent('카카오 로그인에 실패했습니다.'))
      return
    }

    if (code) {
      console.log('인증 코드 받음:', code)
      // 인증 코드를 받은 경우, 액세스 토큰으로 교환
      // 중복 요청 방지를 위해 약간의 지연
      setTimeout(() => {
        exchangeCodeForToken(code)
      }, 100)
    } else {
      console.log('인증 코드 없음')
      router.push('/login?error=' + encodeURIComponent('인증 코드를 받을 수 없습니다.'))
    }
  }, [searchParams, router])

  const exchangeCodeForToken = async (code: string) => {
    try {
      console.log('토큰 교환 시작:', code)
      const apiUrl = 'http://localhost:8000'
      console.log('API URL:', `${apiUrl}/api/auth/kakao-token-exchange`)
      console.log('요청 데이터:', { code })
      
      // 중복 요청 방지를 위한 플래그
      if (window.kakaoTokenExchangeInProgress) {
        console.log('이미 토큰 교환이 진행 중입니다.')
        return
      }
      
      window.kakaoTokenExchangeInProgress = true
      
      // 백엔드 API를 통해 토큰 교환
      console.log('백엔드 API 요청 시작...')
      const response = await fetch(`${apiUrl}/api/auth/kakao-token-exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
        }),
      })
      
      console.log('백엔드 응답 상태:', response.status)
      console.log('백엔드 응답 헤더:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          console.error('응답 파싱 실패:', e)
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.error('백엔드 토큰 교환 실패:', errorData)
        throw new Error(errorData.error || '토큰 교환에 실패했습니다.')
      }

      const data = await response.json()
      console.log('백엔드 응답:', data)
      
      // 로컬 스토리지에 토큰 저장
      localStorage.setItem('token', data.access_token)
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }
      
      // 카카오 토큰도 저장 (필요한 경우)
      if (data.kakao_access_token) {
        localStorage.setItem('kakao_access_token', data.kakao_access_token)
      }
      if (data.kakao_refresh_token) {
        localStorage.setItem('kakao_refresh_token', data.kakao_refresh_token)
      }
      
      // 사용자 정보 저장
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      
      // 성공 시 메인 페이지로 리다이렉트
      router.push('/?login=success')
    } catch (error) {
      console.error('토큰 교환 오류:', error)
      console.error('에러 타입:', typeof error)
      console.error('에러 상세:', error)
      
      let errorMessage = '토큰 교환 중 오류가 발생했습니다.'
      
      if (error instanceof Error) {
        errorMessage = error.message
        if (error.message.includes('Failed to fetch')) {
          errorMessage = '백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
        }
      }
      
      // 에러 시 로그인 페이지로 리다이렉트
      router.push('/login?error=' + encodeURIComponent(errorMessage))
    } finally {
      window.kakaoTokenExchangeInProgress = false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-600">카카오 로그인 처리 중...</p>
      </div>
    </div>
  )
}
