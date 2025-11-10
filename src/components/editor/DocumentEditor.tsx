import { useDocumentStore } from '@/store/document.store'
import { useEffect } from 'react'

export function DocumentEditor() {
  const { currentDocument, saveDocument } = useDocumentStore()

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
              onClick={handleSave}
              className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex">
        {/* Left: Markdown Editor */}
        <div className="flex-1 p-6">
          <textarea
            value={currentDocument?.content || ''}
            onChange={handleContentChange}
            className="w-full h-full p-4 font-mono text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="# 开始编写你的文档...\n\n支持 Markdown 格式。\n\n## 功能特性\n\n- 文档优先协作\n- AI智能建议\n- 版本管理\n"
          />
        </div>

        {/* Right: Preview */}
        <div className="flex-1 p-6 border-l border-gray-200">
          <div className="h-full p-4 border border-gray-300 rounded-lg overflow-y-auto">
            {currentDocument?.content ? (
              <div className="prose prose-gray max-w-none">
                <h2>预览</h2>
                <p className="text-gray-500 italic">
                  Markdown预览功能待完善，当前显示原文：
                </p>
                <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                  {currentDocument.content}
                </pre>
              </div>
            ) : (
              <div className="text-center text-gray-400 mt-12">
                <p>开始编写文档查看预览</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
