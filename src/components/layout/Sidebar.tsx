import { Search, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { DocTree } from './DocTree'
import { FileService, FileNode } from '@/services/file.service'
import { useDocumentStore } from '@/store/document.store'
import { DocumentService } from '@/services/document.service'

interface SidebarProps {
  onCreateDoc?: () => void
}

export function Sidebar({ onCreateDoc }: SidebarProps) {
  const [docTree, setDocTree] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(true)
  const { setCurrentDocument } = useDocumentStore()

  // 加载文档树
  useEffect(() => {
    loadDocTree()
  }, [])

  const loadDocTree = async () => {
    try {
      setLoading(true)
      const tree = await FileService.getDocTree()
      setDocTree(tree)
    } catch (error) {
      console.error('加载文档树失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 点击文档文件
  const handleFileClick = async (node: FileNode) => {
    if (node.type !== 'file') return

    try {
      const content = await FileService.readDocument(node.path)

      // 创建或更新文档
      const doc = await DocumentService.createDocument(
        node.path.replace('/project-docs/', ''),
        node.name,
        content
      )

      setCurrentDocument(doc)
    } catch (error) {
      console.error('加载文档失败:', error)
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-900">Dodo</h1>
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
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <div className="animate-pulse">加载文档中...</div>
          </div>
        ) : docTree.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            暂无文档
          </div>
        ) : (
          <DocTree nodes={docTree} onFileClick={handleFileClick} />
        )}
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

