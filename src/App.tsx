import { useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { FloatingLayout } from './components/layout/FloatingLayout'
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
          '欢迎使用 Dodo',
          `# 欢迎使用 Dodo\n\n这是一个面向文档规范的AI编程协作平台，让人类与AI通过文档达成共识。\n\n## 快速开始\n\n1. **编写文档**：在左侧创建新文档\n2. **AI建议**：点击'AI建议'获取智能建议\n3. **生成上下文**：使用'生成AI上下文'功能\n\n## 核心特性\n\n- ✨ 文档优先协作\n- 🤖 AI智能建议\n- 📊 版本管理\n- 🚀 提升开发效率\n\n> Dodo: Document-driven Development, 让文档成为AI与开发者的协作契约。`
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

  // 创建侧栏
  const sidebar = (
    <Sidebar onCreateDoc={handleCreateDoc} />
  )

  // 创建顶栏 - 简化版本，只显示应用标题
  const header = (
    <div className="px-6 py-3 flex items-center">
      <h1 className="text-xl font-semibold text-gray-900">Dodo</h1>
    </div>
  )

  return (
    <FloatingLayout sidebar={sidebar} header={header}>
      <div className="h-full bg-white">
        <DocumentEditor />
      </div>
    </FloatingLayout>
  )
}

export default App
