/**
 * 文档实体
 */
export interface Document {
  id: string
  path: string           // 文档路径，如 "01-business-modules/user-system"
  title: string
  content: string        // Markdown内容
  tags: string[]         // 标签
  isAIProposal: boolean  // 是否为AI建议版本
  consensusVersion?: string  // 共识版本内容
  lastModified: number   // 时间戳（Unix timestamp）
  modifiedBy: 'ai' | 'human'
}

/**
 * AI建议记录
 */
export interface AISuggestion {
  id: string
  documentId: string
  suggestedContent: string
  suggestionTime: number
  aiModel: string          // 如 "claude-3.5-sonnet"
  status: 'pending' | 'accepted' | 'rejected' | 'modified'
  finalContent?: string
}

/**
 * AI上下文
 */
export interface AIContext {
  task: string              // 当前任务描述
  relevantDocs: Document[]  // 推荐的相关文档
  prompt: string            // 生成的完整prompt
  estimatedTokens: number   // 预估token数
}

/**
 * 文档目录结构（树形）
 */
export interface DocTreeNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: DocTreeNode[]
}

/**
 * 文档版本（用于对比）
 */
export interface DocumentVersion {
  id: string
  documentId: string
  content: string
  timestamp: number
  author: 'ai' | 'human'
  message?: string  // 版本说明
}
