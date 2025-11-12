import { Search, Plus, FolderPlus, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useFileSystem } from '@/store/fileSystem.store'
import { useDocumentStore } from '@/store/document.store'
import { DirectoryItem } from '@/components/file-system/DirectoryItem'
import { CreateDirectoryModal } from '@/components/modals/CreateDirectoryModal'
import { DocumentService } from '@/services/document.service'

interface SidebarProps {
  onCreateDoc?: () => void
}

export function Sidebar({ onCreateDoc }: SidebarProps) {
  const [showCreateDirModal, setShowCreateDirModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

  const {
    directories,
    loading,
    error,
    loadDirectories,
    createDirectory,
    createDocument,
    selectDirectory
  } = useFileSystem()

  const { setCurrentDocument } = useDocumentStore()

  // 加载目录列表
  useEffect(() => {
    loadDirectories()
  }, [loadDirectories])

  // 创建目录
  const handleCreateDirectory = async (name: string) => {
    try {
      await createDirectory(name)
    } catch (error) {
      console.error('创建目录失败:', error)
      throw error
    }
  }

  // 创建文档
  const handleCreateDocument = async (directory: string, name: string) => {
    try {
      const newDoc = await createDocument(directory, name)
      // 创建成功后打开文档进行编辑
      setCurrentDocument(newDoc)
      setSelectedDocument(newDoc.path)
    } catch (error) {
      console.error('创建文档失败:', error)
      throw error
    }
  }

  // 选择文档
  const handleSelectDocument = async (docPath: string) => {
    try {
      setSelectedDocument(docPath)

      // 从IndexedDB加载文档内容
      const doc = await DocumentService.getDocumentByPath(docPath)
      if (doc) {
        setCurrentDocument(doc)
      }
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

      {/* project-docs 目录列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {/* project-docs 标题行 */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">project-docs</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={loadDirectories}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                title="刷新文件列表"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setShowCreateDirModal(true)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
                title="创建新目录"
              >
                <FolderPlus size={14} />
              </button>
            </div>
          </div>

          {/* 目录列表 */}
          <div className="space-y-1">
            {loading ? (
              <div className="text-center text-gray-500 py-4">
                <div className="animate-pulse text-sm">加载目录中...</div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">
                <div className="text-sm">{error}</div>
              </div>
            ) : directories.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                <div className="text-sm">暂无目录</div>
                <div className="text-xs mt-1">点击上方 + 按钮创建第一个目录</div>
              </div>
            ) : (
              directories.map((directory) => (
                <DirectoryItem
                  key={directory.path}
                  directory={directory}
                  onCreateDocument={handleCreateDocument}
                  onSelectDocument={handleSelectDocument}
                  selectedDocument={selectedDocument}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          生成AI上下文
        </button>
      </div>

      {/* 创建目录模态框 */}
      <CreateDirectoryModal
        isOpen={showCreateDirModal}
        onClose={() => setShowCreateDirModal(false)}
        onCreate={handleCreateDirectory}
        existingNames={directories.map(dir => dir.name)}
      />
    </div>
  )
}

