'use client'

import { useAuth } from '@/lib/auth-context'

interface KakaoLoginProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function KakaoLogin({ onSuccess, onError }: KakaoLoginProps) {
  const { setToken, setUser } = useAuth()

  const handleKakaoCallback = async (accessToken: string, refreshToken: string, user: any, kakaoAccessToken: string, kakaoRefreshToken: string) => {
    try {
      if (accessToken && user) {
        // AuthContext에 직접 설정
        setToken(accessToken)
        setUser(user)
        localStorage.setItem('token', accessToken)
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken)
        }
        
        // 카카오 토큰도 저장 (필요한 경우)
        if (kakaoAccessToken) {
          localStorage.setItem('kakao_access_token', kakaoAccessToken)
        }
        if (kakaoRefreshToken) {
          localStorage.setItem('kakao_refresh_token', kakaoRefreshToken)
        }
        
        console.log('카카오 로그인 성공:', user)
        onSuccess?.()
      } else {
        onError?.('카카오 로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('카카오 로그인 처리 중 오류:', error)
      onError?.('카카오 로그인 처리 중 오류가 발생했습니다.')
    }
  }

  const handleKakaoLogin = () => {
    try {
      console.log('카카오 로그인 버튼 클릭됨')
      // 카카오 OAuth URL 생성
      const REST_API_KEY = '3f136af5426d0667ca9541cf878c2246'
      const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`
      
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
      
      console.log('카카오 OAuth URL:', kakaoAuthUrl)
      
      // 모바일에서는 현재 페이지에서 리다이렉트
      window.location.href = kakaoAuthUrl

    } catch (error) {
      console.error('카카오 로그인 오류:', error)
      onError?.('카카오 로그인 중 오류가 발생했습니다.')
    }
  }

  return (
    <div>
      <button
        onClick={handleKakaoLogin}
        className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium transition-colors"
      >
        <span className="text-2xl mr-2">💬</span>
        카카오로 로그인
      </button>
      
      {/* 디버깅 정보 */}
      <div className="mt-2 text-xs text-gray-500">
        <div>OAuth URL 방식 사용</div>
        <div>상태: 준비됨</div>
      </div>
    </div>
  )
}