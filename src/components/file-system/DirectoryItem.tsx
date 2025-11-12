import React, { useState, useEffect } from 'react'
import { Folder, Plus, FileText, ChevronRight } from 'lucide-react'
import { DirectoryInfo } from '@/lib/filesystem/fileService'
import { CreateDocumentModal } from '@/components/modals/CreateDocumentModal'
import { FileService, FileNode } from '@/services/file.service'
import { DocumentService } from '@/services/document.service'

interface DirectoryItemProps {
  directory: DirectoryInfo
  onCreateDocument: (directory: string, name: string) => Promise<void>
  onSelectDocument: (path: string) => void
  selectedDocument?: string | null
}

export function DirectoryItem({
  directory,
  onCreateDocument,
  onSelectDocument,
  selectedDocument
}: DirectoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCreateDocModal, setShowCreateDocModal] = useState(false)
  const [documents, setDocuments] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(false)

  // 加载目录下的文档列表 - 从真实文件系统读取
  const loadDocuments = async () => {
    if (!isExpanded) {
      setLoading(true)
      try {
        // 从FileSystemService加载该目录下的文档
        const { FileSystemService } = await import('@/lib/filesystem/fileService')
        const dirDocs = await FileSystemService.getDocumentsInDirectory(directory.name)
        setDocuments(dirDocs)
      } catch (error) {
        console.error('加载文档列表失败:', error)
      } finally {
        setLoading(false)
      }
    }
    setIsExpanded(!isExpanded)
  }

  const handleCreateDocument = async (name: string) => {
    try {
      await onCreateDocument(directory.name, name)
      // 创建成功后重新加载文档列表
      if (isExpanded) {
        const { FileSystemService } = await import('@/lib/filesystem/fileService')
        const dirDocs = await FileSystemService.getDocumentsInDirectory(directory.name)
        setDocuments(dirDocs)
      }
    } catch (error) {
      console.error('创建文档失败:', error)
      throw error
    }
  }

  const handleDocumentClick = async (doc: FileNode) => {
    try {
      // 使用FileService读取文档内容
      const content = await FileService.readDocument(doc.path)

      // 创建或更新文档到IndexedDB以便编辑
      const existingDoc = await DocumentService.getDocumentByPath(doc.path)

      if (existingDoc) {
        onSelectDocument(doc.path)
      } else {
        // 如果IndexedDB中没有，创建一个新的
        const newDoc = await DocumentService.createDocument(
          doc.path,
          doc.name,
          content
        )
        onSelectDocument(newDoc.path)
      }
    } catch (error) {
      console.error('加载文档失败:', error)
    }
  }

  return (
    <>
      <div className="border-b border-gray-100 last:border-b-0">
        {/* 目录头部 */}
        <div
          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={loadDocuments}
        >
          <div className="flex items-center space-x-2">
            <ChevronRight
              size={14}
              className={`text-gray-400 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
            <Folder size={16} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-900">{directory.name}</span>
            <span className="text-xs text-gray-500">({directory.fileCount})</span>
          </div>

          {/* 创建文档按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowCreateDocModal(true)
            }}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="创建新文档"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* 文档列表 */}
        {isExpanded && (
          <div className="bg-gray-50/50">
            {loading ? (
              <div className="px-8 py-2 text-xs text-gray-500">
                加载中...
              </div>
            ) : documents.length === 0 ? (
              <div className="px-8 py-2 text-xs text-gray-400">
                空目录
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.path}
                  onClick={() => handleDocumentClick(doc)}
                  className={`flex items-center space-x-2 px-8 py-1.5 text-sm hover:bg-gray-100 cursor-pointer transition-colors ${
                    selectedDocument === doc.path ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <FileText size={14} />
                  <span className="truncate">{doc.name}.md</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 创建文档模态框 */}
      <CreateDocumentModal
        isOpen={showCreateDocModal}
        onClose={() => setShowCreateDocModal(false)}
        onCreate={handleCreateDocument}
        existingNames={documents.map(doc => doc.name)}
        directory={directory.name}
      />
    </>
  )
}