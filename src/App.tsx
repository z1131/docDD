import { useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { DocumentEditor } from './components/editor/DocumentEditor'
import { useDocumentStore } from './store/document.store'
import { DocumentService } from './services/document.service'

function App() {
  const { loadDocuments, createDocument } = useDocumentStore()

  // 初始化时加载文档
  useEffect(() => {
    const initializeApp = async () => {
      await loadDocuments()
      // 如果没有文档，创建一个示例文档
      const existingDocs = await DocumentService.getAllDocuments()
      if (existingDocs.length === 0) {
        await createDocument(
          'welcome',
          '欢迎使用AI文档系统',
          `# 欢迎使用AI文档驱动开发系统\n\n这是一个面向文档规范的AI编程协作平台。\n\n## 快速开始\n\n1. **编写文档**：在左侧创建新文档\n2. **AI建议**：点击'AI建议'获取智能建议\n3. **生成上下文**：使用'生成AI上下文'功能\n\n## 核心特性\n\n- ✨ 文档优先协作\n- 🤖 AI智能建议\n- 📊 版本管理\n- 🚀 提升开发效率\n`
        )
      }
    }

    initializeApp()
  }, [loadDocuments, createDocument])

  const handleCreateDoc = async () => {
    await createDocument(
      `doc-${Date.now()}`,
      '未命名文档',
      '# 新文档\n\n开始编写你的文档内容...'
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onCreateDoc={handleCreateDoc} />
      <div className="flex-1">
        <DocumentEditor />
      </div>
    </div>
  )
}

export default App
