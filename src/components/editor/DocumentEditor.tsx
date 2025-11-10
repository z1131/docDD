import { useDocumentStore } from '@/store/document.store'
import { useEffect, useState } from 'react'
import { Edit3, Eye } from 'lucide-react'
import { MarkdownPreview } from './MarkdownPreview'

export function DocumentEditor() {
  const { currentDocument, saveDocument } = useDocumentStore()
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    // 当当前文档变化时，更新编辑器内容
  }, [currentDocument])

  const handleSave = async () => {
    if (currentDocument) {
      await saveDocument(currentDocument.title, currentDocument.content)
    } else {
      await saveDocument('未命名文档', '# 新文档\n\n开始编写你的文档内容...')
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentDocument) {
      useDocumentStore.setState({
        currentDocument: { ...currentDocument, title: e.target.value },
      })
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentDocument) {
      useDocumentStore.setState({
        currentDocument: { ...currentDocument, content: e.target.value },
      })
    }
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <input
          type="text"
          value={currentDocument?.title || '未命名文档'}
          onChange={handleTitleChange}
          className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full"
          placeholder="输入文档标题..."
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>最后修改: {currentDocument ? new Date(currentDocument.lastModified).toLocaleString('zh-CN') : '刚刚'}</span>
            <span>字数: {currentDocument?.content.length || 0}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              AI建议
            </button>
            <button
              onClick={toggleEditMode}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center space-x-1 ${
                isEditMode
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {isEditMode ? <Eye size={16} /> : <Edit3 size={16} />}
              <span>{isEditMode ? '预览' : '编辑'}</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Left: Preview (always visible) */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {currentDocument?.content ? (
              <MarkdownPreview content={currentDocument.content} />
            ) : (
              <div className="text-center text-gray-400 mt-12">
                <div className="mb-4">
                  <Eye size={48} className="mx-auto text-gray-300" />
                </div>
                <p className="text-lg">选择一个文档开始阅读</p>
                <p className="text-sm mt-2">或点击"编辑"按钮创建新文档</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor (only visible in edit mode) */}
        {isEditMode && (
          <div className="flex-1 p-6 border-l border-gray-200 flex flex-col">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Markdown 编辑器</h3>
              <p className="text-xs text-gray-500">支持标准 Markdown 语法</p>
            </div>
            <textarea
              value={currentDocument?.content || ''}
              onChange={handleContentChange}
              className="flex-1 p-4 font-mono text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="# 开始编写你的文档...\n\n支持 Markdown 格式。\n\n## 功能特性\n\n- 文档优先协作\n- AI智能建议\n- 版本管理\n"
            />
          </div>
        )}
      </div>
    </div>
  )
}
