'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { PaperAirplaneIcon, UserIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'

interface Message {
  id: string
  user: string
  message: string
  timestamp: Date
  type: 'user' | 'system'
}

export default function ChatPage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // WebSocket 연결
  useEffect(() => {
    if (!user || !token) return

    let websocket: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let isConnecting = false

    const connectWebSocket = () => {
      // 이미 연결 중이거나 연결되어 있으면 중복 연결 방지
      if (isConnecting || (ws && ws.readyState === WebSocket.OPEN)) {
        console.log('이미 연결 중이거나 연결됨')
        return
      }

      // 기존 연결이 있으면 닫기
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        console.log('기존 WebSocket 연결 닫기')
        ws.close()
        setWs(null)
      }

      isConnecting = true
      const wsUrl = 'wss://whyup-ggn1.onrender.com/ws'
      websocket = new WebSocket(wsUrl)

      websocket.onopen = () => {
        console.log('WebSocket 연결됨')
        setIsConnected(true)
        isConnecting = false
        
        // 인증 메시지 전송
        if (token) {
          websocket!.send(JSON.stringify({
            type: 'auth',
            token: token
          }))
        }
      }

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'message') {
            setMessages(prev => {
              // 중복 메시지 방지
              const isDuplicate = prev.some(msg => msg.id === data.id)
              if (isDuplicate) return prev
              
              return [...prev, {
                id: data.id,
                user: data.user,
                message: data.message,
                timestamp: new Date(data.timestamp),
                type: 'user'
              }]
            })
          } else if (data.type === 'system') {
            // 인증 완료 메시지는 표시하지 않음
            if (data.message && data.message.includes('인증이 완료되었습니다')) {
              console.log('인증 완료:', data.message)
              return
            }
            
            setMessages(prev => {
              // 중복 메시지 방지
              const isDuplicate = prev.some(msg => msg.id === data.id)
              if (isDuplicate) return prev
              
              return [...prev, {
                id: data.id,
                user: '시스템',
                message: data.message,
                timestamp: new Date(data.timestamp),
                type: 'system'
              }]
            })
          } else if (data.type === 'user_count') {
            // 동시접속자 수 업데이트
            setUserCount(data.count)
          }
        } catch (error) {
          console.error('메시지 파싱 오류:', error)
        }
      }

      websocket.onclose = (event) => {
        console.log('WebSocket 연결 끊어짐:', event.code, event.reason)
        setIsConnected(false)
        isConnecting = false
        
        // 재연결 시도 (중복 방지)
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            if (!isConnected && !isConnecting) {
              console.log('WebSocket 재연결 시도...')
              connectWebSocket()
            }
            reconnectTimeout = null
          }, 3000)
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocket 오류:', error)
        setIsConnected(false)
        isConnecting = false
      }

      setWs(websocket)
    }

    connectWebSocket()

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }
      if (websocket) {
        websocket.close()
        setWs(null)
      }
      setIsConnected(false)
      isConnecting = false
    }
  }, [user?.id, token]) // user 객체 전체 대신 user.id만 의존성으로 사용

  // 페이지 언마운트 시 WebSocket 연결 정리
  useEffect(() => {
    return () => {
      console.log('채팅 페이지 언마운트 - WebSocket 연결 정리')
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.close()
        setWs(null)
      }
      setIsConnected(false)
    }
  }, [])

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim() || !ws || !isConnected || isSending) return

    setIsSending(true)
    
    const message = {
      type: 'message',
      message: newMessage.trim(),
      user: user?.name || user?.userid || '익명'
    }

    // 중복 전송 방지를 위한 디바운스
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      setNewMessage('')
      
      // 전송 완료 후 상태 리셋
      setTimeout(() => {
        setIsSending(false)
      }, 1000)
    } else {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 현재 경로가 /chat이 아니면 새 페이지에 렌더링하지 않음
  if (pathname !== '/chat') {
    return null
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-4 pb-20">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              실시간 채팅
            </h1>
            <div className="flex items-center space-x-4">
              {/* 동시접속자 수 표시 */}
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                <UserIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {userCount}명 접속
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {isConnected ? '연결됨' : '연결 끊김'}
                </span>
              </div>
            </div>
          </div>

          {/* 메시지 목록 */}
          <div className="h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-white dark:bg-gray-800">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>아직 메시지가 없습니다.</p>
                <p className="text-sm">첫 메시지를 보내보세요!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => {
                  // 이전 메시지와 같은 사용자인지 확인
                  const currentUserName = user?.name || user?.userid || ''
                  const isSameUserAsPrevious = index > 0 && 
                    messages[index - 1].user === msg.user && 
                    msg.user !== currentUserName && 
                    msg.type !== 'system'
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.user === currentUserName ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`flex ${msg.user === currentUserName ? 'flex-row' : 'flex-row-reverse'} items-end ${msg.user === currentUserName ? 'space-x-2' : 'space-x-3'}`}>
                        {/* 시간 표시 */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          {msg.timestamp.toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </div>
                        
                        {/* 메시지 컨테이너 */}
                        <div className="flex flex-col">
                          {/* 다른 사람 메시지의 닉네임 (연속 메시지가 아닐 때만 표시) */}
                          {msg.user !== currentUserName && msg.type !== 'system' && !isSameUserAsPrevious && (
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 px-1">
                              {msg.user}
                            </div>
                          )}
                          
                          {/* 메시지 박스 */}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.user === currentUserName
                                ? 'bg-primary-600 text-white'
                                : msg.type === 'system'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
                            }`}
                          >
                            <div className="text-sm">{msg.message}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* 메시지 입력 */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 input-field"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected || isSending}
              className="btn-primary flex items-center justify-center px-4 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              {isSending && <span className="ml-2 text-sm">전송중...</span>}
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
