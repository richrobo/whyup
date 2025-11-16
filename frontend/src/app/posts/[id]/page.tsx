import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PostContent from './PostContent'
import { PostWithAuthor } from '@/types'

async function getPost(postId: string): Promise<PostWithAuthor | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('게시물을 불러오는 중 오류가 발생했습니다:', error)
    return null
  }
}

export default async function PostDetailPage({
  params
}: {
  params: { id: string }
}) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <PostContent post={post} />
      </div>
      <Footer />
    </div>
  )
}
