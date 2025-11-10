import { FileText, FolderOpen, Search, Plus } from 'lucide-react'

interface SidebarProps {
  onCreateDoc?: () => void
}

export function Sidebar({ onCreateDoc }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">AI文档系统</h1>
          <button
            onClick={onCreateDoc}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="新建文档"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="搜索文档..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Document Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {[
            { name: '项目概览', type: 'file' },
            { name: '业务模块', type: 'dir' },
            { name: '技术实现', type: 'dir' },
            { name: 'API规范', type: 'dir' },
            { name: '任务管理', type: 'dir' },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              {item.type === 'dir' ? (
                <FolderOpen size={16} className="mr-3 text-gray-500" />
              ) : (
                <FileText size={16} className="mr-3 text-blue-500" />
              )}
              <span className="text-gray-700">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          生成AI上下文
        </button>
      </div>
    </div>
  )
}
