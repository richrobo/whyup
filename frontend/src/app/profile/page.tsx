'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { UserIcon, PencilIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [userPosts, setUserPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    introduce: ''
  })
  const [nicknameCheck, setNicknameCheck] = useState({
    checked: false,
    available: false,
    message: ''
  })

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      setFormData({
        nickname: user.nickname || '',
        introduce: user.introduce || ''
      })
      fetchUserPosts()
    }
  }, [user, router])

  const fetchUserPosts = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/user/${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserPosts(data)
      }
    } catch (error) {
      console.error('사용자 게시물을 불러오는 중 오류가 발생했습니다:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // 닉네임이 변경되면 중복 확인 상태 초기화
    if (name === 'nickname') {
      setNicknameCheck({
        checked: false,
        available: false,
        message: ''
      })
    }
  }

  const checkNicknameAvailability = async () => {
    if (!formData.nickname.trim()) {
      setNicknameCheck({
        checked: false,
        available: false,
        message: '닉네임을 입력해주세요.'
      })
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/auth/check-nickname?nickname=${encodeURIComponent(formData.nickname)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNicknameCheck({
          checked: true,
          available: data.available,
          message: data.message
        })
      } else {
        setNicknameCheck({
          checked: true,
          available: false,
          message: '닉네임 확인 중 오류가 발생했습니다.'
        })
      }
    } catch (error) {
      console.error('닉네임 중복 확인 오류:', error)
      setNicknameCheck({
        checked: true,
        available: false,
        message: '닉네임 확인 중 오류가 발생했습니다.'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    // 닉네임이 변경되었는데 중복 확인을 하지 않은 경우
    if (formData.nickname !== user.nickname && !nicknameCheck.checked) {
      alert('닉네임 중복 확인을 해주세요.')
      return
    }

    // 닉네임이 변경되었는데 사용 불가능한 경우
    if (formData.nickname !== user.nickname && nicknameCheck.checked && !nicknameCheck.available) {
      alert('사용할 수 없는 닉네임입니다.')
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/auth/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setEditing(false)
        
        // 성공 메시지 표시
        alert('프로필이 성공적으로 업데이트되었습니다!')
        
        // 사용자 정보 새로고침
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(`프로필 업데이트 중 오류가 발생했습니다: ${errorData.detail || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('프로필 업데이트 중 오류가 발생했습니다:', error)
      alert('프로필 업데이트 중 오류가 발생했습니다.')
    }
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 프로필 정보 */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.nickname || '닉네임이 설정되지 않았습니다'}
                </h1>
                {user.introduce && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {user.introduce}
                  </p>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      닉네임
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        name="nickname"
                        value={formData.nickname}
                        onChange={handleInputChange}
                        className="input-field flex-1"
                        required
                        maxLength={50}
                      />
                      <button
                        type="button"
                        onClick={checkNicknameAvailability}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        중복확인
                      </button>
                    </div>
                    {nicknameCheck.checked && (
                      <p className={`text-sm mt-1 ${
                        nicknameCheck.available 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {nicknameCheck.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      자기소개
                    </label>
                    <textarea
                      name="introduce"
                      value={formData.introduce}
                      onChange={handleInputChange}
                      className="input-field"
                      rows={4}
                      placeholder="자기소개를 입력해주세요..."
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.introduce.length}/500
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      type="submit" 
                      className="btn-primary flex-1"
                      disabled={formData.nickname !== user.nickname && (!nicknameCheck.checked || !nicknameCheck.available)}
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false)
                        setNicknameCheck({ checked: false, available: false, message: '' })
                      }}
                      className="btn-secondary flex-1"
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>
                      가입일: {new Date(user.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.is_verified 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {user.is_verified ? '인증됨' : '미인증'}
                    </span>
                  </div>
                  {user.introduce && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-medium mb-1">자기소개:</p>
                      <p className="whitespace-pre-wrap">{user.introduce}</p>
                    </div>
                  )}
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    프로필 편집
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 사용자 게시물 */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                내 게시물
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    아직 작성한 게시물이 없습니다.
                  </p>
                  <a
                    href="/posts/create"
                    className="btn-primary"
                  >
                    첫 게시물 작성하기
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post: any) => (
                    <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {post.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          <span>{post.view_count}</span>
                        </div>
                      </div>
                      {post.summary && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {post.summary}
                        </p>
                      )}
                      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </span>
                        <div className="flex space-x-2">
                          <a
                            href={`/posts/${post.id}`}
                            className="text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            보기
                          </a>
                          <a
                            href={`/posts/${post.id}/edit`}
                            className="text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            편집
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
