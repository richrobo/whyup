'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CreatePostPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    is_published: true
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()
  const router = useRouter()

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!user) {
    router.push('/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const post = await response.json()
        router.push(`/posts/${post.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || '게시물 작성 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('게시물 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="card">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              새 게시물 작성
            </h1>
            <p className="text-gray-600">
              새로운 게시물을 작성하여 커뮤니티와 소통해보세요
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="게시물 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                요약
              </label>
              <input
                type="text"
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                className="input-field"
                placeholder="게시물 요약을 입력하세요 (선택사항)"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용 *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={12}
                className="input-field"
                placeholder="게시물 내용을 입력하세요"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                즉시 게시하기
              </label>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '작성 중...' : '게시물 작성'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
