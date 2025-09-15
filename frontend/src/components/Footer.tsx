export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 로고 및 설명 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-primary-400 mb-4">
              Why Up
            </h3>
            <p className="text-gray-300 mb-4 max-w-md">
              암호화폐 시장을 분석하고, 커뮤니티와 함께 소통하며, 투자 인사이트를 공유하세요.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">빠른 링크</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  홈
                </a>
              </li>
              <li>
                <a href="/posts" className="text-gray-300 hover:text-white transition-colors">
                  게시물
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                  소개
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  문의
                </a>
              </li>
            </ul>
          </div>

          {/* 지원 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">지원</h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-gray-300 hover:text-white transition-colors">
                  도움말
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  개인정보처리방침
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  이용약관
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  자주 묻는 질문
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Why Up. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
