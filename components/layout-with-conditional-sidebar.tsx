"use client"

import { usePathname } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'

export function LayoutWithConditionalSidebar({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/'
  
  return (
    <div className="flex h-screen">
      {!isLandingPage && <SidebarNav />}
      <div className={`flex-1 ${!isLandingPage ? 'md:pl-64' : ''}`}>
        <div className="mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  )
} 