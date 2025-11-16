'use client'

import Link from 'next/link'
import { useTheme } from '@/lib/theme-context'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Why Up
            </Link>
          </div>

          {/* 다크모드 토글만 유지 */}
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {theme === 'light' ? (
                <MoonIcon className="h-5 w-5" />
              ) : (
                <SunIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
