'use client'

import Link from 'next/link'
import { PostWithAuthor } from '@/types'
import { EyeIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline'

interface PostsListProps {
  posts: PostWithAuthor[]
}

export default function PostsList({ posts }: PostsListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          아직 게시물이 없습니다.
        </div>
        <p className="text-gray-400 mt-2">
          첫 번째 게시물을 작성해보세요!
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="card hover:shadow-lg transition-shadow duration-200"
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
              {post.title}
            </h3>
            {post.summary && (
              <p className="text-gray-600 line-clamp-3">
                {post.summary}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                <span>{post.author?.username || '익명'}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>
                  {new Date(post.created_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{post.view_count}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
