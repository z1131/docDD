import React from 'react'

interface FloatingLayoutProps {
  sidebar: React.ReactNode
  header: React.ReactNode
  children: React.ReactNode
}

export function FloatingLayout({ sidebar, header, children }: FloatingLayoutProps) {
  return (
    <div className="h-screen bg-gray-50 flex flex-col relative">
      {/* 悬浮顶栏 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-20">
        {header}
      </div>

      {/* 主要内容区域 */}
      <div className="flex flex-1 pt-16"> {/* 为顶栏留出空间 */}
        {/* 悬浮侧栏 */}
        <div className="fixed left-0 top-16 bottom-0 z-10">
          {sidebar}
        </div>

        {/* 内容区域 */}
        <div className="flex-1 ml-64">
          {children}
        </div>
      </div>
    </div>
  )
}