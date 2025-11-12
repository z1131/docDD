import { Document, AISuggestion } from '@/types'
import { DocumentStore, AISuggestionStore, DocumentVersionStore } from '@/lib/storage'

/**
 * 文档管理服务
 * 提供文档的增删改查、版本管理、AI建议等核心功能
 */
export class DocumentService {
  /**
   * 创建新文档
   */
  static async createDocument(path: string, title: string, content: string): Promise<Document> {
    const doc: Document = {
      id: this.generateId(),
      path,
      title,
      content,
      tags: this.extractTags(content),
      isAIProposal: false,
      lastModified: Date.now(),
      modifiedBy: 'human',
    }

    await DocumentStore.add(doc)
    return doc
  }

  /**
   * 更新文档
   */
  static async updateDocument(
    id: string,
    updates: Partial<Pick<Document, 'title' | 'content' | 'tags'>>
  ): Promise<Document> {
    const doc = await DocumentStore.get(id)
    if (!doc) {
      throw new Error(`Document not found: ${id}`)
    }

    const updatedDoc: Document = {
      ...doc,
      ...updates,
      lastModified: Date.now(),
      modifiedBy: 'human',
    }

    // 如果内容变更，保存历史版本
    if (updates.content && updates.content !== doc.content) {
      await this.saveVersion(doc)
    }

    await DocumentStore.update(updatedDoc)
    return updatedDoc
  }

  /**
   * 获取文档
   */
  static async getDocument(id: string): Promise<Document | undefined> {
    return DocumentStore.get(id)
  }

  /**
   * 根据路径获取文档
   */
  static async getDocumentByPath(path: string): Promise<Document | undefined> {
    const allDocs = await DocumentStore.getAll()
    return allDocs.find(doc => doc.path === path)
  }

  /**
   * 获取所有文档
   */
  static async getAllDocuments(): Promise<Document[]> {
    return DocumentStore.getAll()
  }

  /**
   * 删除文档
   */
  static async deleteDocument(id: string): Promise<void> {
    await DocumentStore.delete(id)
  }

  /**
   * 搜索文档
   */
  static async searchDocuments(query: string): Promise<Document[]> {
    return DocumentStore.search(query)
  }

  /**
   * 添加AI建议
   */
  static async addAISuggestion(
    documentId: string,
    suggestedContent: string,
    aiModel: string
  ): Promise<AISuggestion> {
    const suggestion: AISuggestion = {
      id: this.generateId(),
      documentId,
      suggestedContent,
      suggestionTime: Date.now(),
      aiModel,
      status: 'pending',
    }

    await AISuggestionStore.add(suggestion)
    return suggestion
  }

  /**
   * 更新AI建议状态
   */
  static async updateAISuggestionStatus(
    suggestionId: string,
    status: AISuggestion['status'],
    finalContent?: string
  ): Promise<void> {
    const db = await AISuggestionStore.getByDocument('-') // 这里需要从存储获取完整对象
    // 简化实现：直接获取所有并更新
    const allDocs = await DocumentStore.getAll()
    for (const doc of allDocs) {
      const suggestions = await AISuggestionStore.getByDocument(doc.id)
      const suggestion = suggestions.find(s => s.id === suggestionId)
      if (suggestion) {
        suggestion.status = status
        if (finalContent) {
          suggestion.finalContent = finalContent
        }
        await AISuggestionStore.update(suggestion)
        break
      }
    }
  }

  /**
   * 获取文档的AI建议
   */
  static async getDocumentSuggestions(documentId: string): Promise<AISuggestion[]> {
    return AISuggestionStore.getByDocument(documentId)
  }

  /**
   * 保存文档历史版本
   */
  private static async saveVersion(document: Document): Promise<void> {
    const version = {
      id: this.generateId(),
      documentId: document.id,
      content: document.content,
      timestamp: document.lastModified,
      author: document.modifiedBy,
    }

    await DocumentVersionStore.add(version)
  }

  /**
   * 获取文档历史版本
   */
  static async getDocumentVersions(documentId: string, limit = 10) {
    return DocumentVersionStore.getByDocument(documentId, limit)
  }

  /**
   * 从内容中提取标签（#tag 格式）
   */
  private static extractTags(content: string): string[] {
    const tagRegex = /#(\w+)/g
    const tags: string[] = []
    let match

    while ((match = tagRegex.exec(content)) !== null) {
      tags.push(match[1])
    }

    return tags
  }

  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 初始化示例文档（用于首次使用）
   */
  static async initSampleDocs(): Promise<void> {
    const existingDocs = await this.getAllDocuments()
    if (existingDocs.length > 0) return

    // 创建项目概览文档
    await this.createDocument(
      '00-project-overview',
      '项目概览',
      `# 项目概览\n\n这是一个AI文档驱动的开发示例项目。\n\n## 核心特性\n- 文档优先的协作模式\n- AI智能建议\n- 版本管理\n`
    )
  }
}
