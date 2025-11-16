import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            게시물을 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-8">
            요청하신 게시물이 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/posts"
            className="btn-primary"
          >
            게시물 목록으로 돌아가기
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

