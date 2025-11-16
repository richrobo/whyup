'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { PostWithAuthor } from '@/types'
import { EyeIcon, CalendarIcon, UserIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface PostContentProps {
  post: PostWithAuthor
}

export default function PostContent({ post }: PostContentProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  
  const { user, token } = useAuth()
  const router = useRouter()

  const handleDelete = async () => {
    if (!post || !token) return

    setDeleting(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        router.push('/posts')
      } else {
        setError('게시물 삭제 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('게시물 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const isAuthor = user && post && user.id === post.author_id

  return (
    <>
      <article className="card">
        {/* 게시물 헤더 */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex-1">
              {post.title}
            </h1>
            {isAuthor && (
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => router.push(`/posts/${post.id}/edit`)}
                  className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  title="수정"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="삭제"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {post.summary && (
            <p className="text-lg text-gray-600 mb-6">
              {post.summary}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 border-b border-gray-200 pb-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2" />
                <span>{post.author?.username || '익명'}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>
                  {new Date(post.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-2" />
              <span>{post.view_count}</span>
            </div>
          </div>
        </header>

        {/* 게시물 내용 */}
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {post.content}
          </div>
        </div>
      </article>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              게시물 삭제
            </h3>
            <p className="text-gray-600 mb-6">
              이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}
            <div className="flex space-x-4">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

