import { useDocumentStore } from '@/store/document.store'
import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { EditableMarkdown } from './EditableMarkdown'

export function DocumentEditor() {
  const { currentDocument, saveDocument } = useDocumentStore()
  const [hasChanges, setHasChanges] = useState(false)

  // 初始化示例文档内容
  useEffect(() => {
    if (currentDocument?.id === 'welcome' && !currentDocument.content.includes('欢迎使用 Dodo')) {
      const welcomeContent = `# 欢迎使用 Dodo\n\n这是一个面向文档规范的AI编程协作平台，让人类与AI通过文档达成共识。\n\n## 快速开始\n\n1. **双击编辑**：双击任意文本段落直接编辑\n2. **保存文档**：使用 Ctrl+Enter 或点击保存按钮\n3. **切换模式**：使用编辑/预览按钮切换模式\n\n## 核心特性\n\n- ✨ **直接编辑**：在渲染版本上双击即可编辑\n- 🤖 **AI智能建议**：获取AI写作建议和优化\n- 📊 **版本管理**：自动保存和版本追踪\n- 🚀 **实时预览**：编辑时实时查看渲染效果\n\n## 编辑技巧\n\n### 基本操作\n- **双击段落**：开始编辑该段落\n- **Ctrl+Enter**：保存编辑内容\n- **Esc**：取消编辑\n- **点击编辑按钮**：全屏编辑模式\n\n### Markdown 语法\n\n\`\`\`# 标题\n## 二级标题\n### 三级标题\n\n**粗体文本** 和 *斜体文本*\n\n- 列表项1\n- 列表项2\n\n> 引用块\n\n[链接](https://example.com)\n\n\`\`\`\n\n---\n\n> **Dodo**: Document-driven Development, 让文档成为AI与开发者的协作契约。\n\n开始编写你的第一个文档吧！双击任意段落即可开始编辑。`

      if (currentDocument.content === '# 新文档\n\n开始编写你的文档内容...') {
        useDocumentStore.setState({
          currentDocument: { ...currentDocument, content: welcomeContent }
        })
        saveDocument(currentDocument.title, welcomeContent)
      }
    }
  }, [currentDocument])

  const handleSave = async () => {
    if (currentDocument) {
      await saveDocument(currentDocument.title, currentDocument.content)
      setHasChanges(false)
    }
  }

  const handleContentChange = (content: string) => {
    if (currentDocument) {
      useDocumentStore.setState({
        currentDocument: { ...currentDocument, content }
      })
      setHasChanges(true)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentDocument) {
      useDocumentStore.setState({
        currentDocument: { ...currentDocument, title: e.target.value }
      })
      setHasChanges(true)
    }
  }

  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={currentDocument?.title || '未命名文档'}
              onChange={handleTitleChange}
              className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-400"
              placeholder="输入文档标题..."
            />
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>字数: {currentDocument?.content.length || 0}</span>
              {hasChanges && <span className="text-orange-500 font-medium">有未保存的更改</span>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center space-x-1 ${
                hasChanges
                  ? 'text-white bg-orange-500 hover:bg-orange-600'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Save size={16} />
              <span>{hasChanges ? '保存' : '保存'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {currentDocument?.content ? (
            <EditableMarkdown
              content={currentDocument.content}
              onChange={handleContentChange}
              onSave={handleSave}
              isEditable={true}
            />
          ) : (
            <div className="text-center text-gray-400 mt-12">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,13 10,17 8,17 8,13"></polyline>
                </svg>
              </div>
              <p className="text-lg">选择一个文档开始阅读</p>
              <p className="text-sm mt-2">或创建新文档开始写作</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}