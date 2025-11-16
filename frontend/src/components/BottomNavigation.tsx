'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ChartBarIcon, 
  NewspaperIcon, 
  EllipsisHorizontalIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { 
  HomeIcon as HomeIconSolid, 
  ChartBarIcon as ChartBarIconSolid, 
  NewspaperIcon as NewspaperIconSolid, 
  EllipsisHorizontalIcon as EllipsisHorizontalIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid
} from '@heroicons/react/24/solid'

const navigationItems = [
  {
    name: '홈',
    href: '/',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  {
    name: '가격',
    href: '/prices',
    icon: ChartBarIcon,
    iconSolid: ChartBarIconSolid,
  },
  {
    name: '채팅',
    href: '/chat',
    icon: ChatBubbleLeftRightIcon,
    iconSolid: ChatBubbleLeftRightIconSolid,
  },
  {
    name: '뉴스',
    href: '/news',
    icon: NewspaperIcon,
    iconSolid: NewspaperIconSolid,
  },
  {
    name: '더보기',
    href: '/more',
    icon: EllipsisHorizontalIcon,
    iconSolid: EllipsisHorizontalIconSolid,
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.iconSolid : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

