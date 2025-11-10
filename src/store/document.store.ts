import { create } from 'zustand'
import { Document } from '@/types'
import { DocumentService } from '@/services/document.service'

interface DocumentState {
  documents: Document[]
  currentDocument: Document | null
  loading: boolean
  error: string | null

  // Actions
  loadDocuments: () => Promise<void>
  loadDocument: (id: string) => Promise<void>
  saveDocument: (title: string, content: string) => Promise<void>
  createDocument: (path: string, title: string, content: string) => Promise<void>
  setCurrentDocument: (doc: Document | null) => void
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  loading: false,
  error: null,

  // 加载所有文档列表
  loadDocuments: async () => {
    set({ loading: true, error: null })
    try {
      const docs = await DocumentService.getAllDocuments()
      set({ documents: docs, loading: false })
    } catch (error) {
      set({ error: '加载文档失败', loading: false })
      console.error('Failed to load documents:', error)
    }
  },

  // 加载单个文档
  loadDocument: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const doc = await DocumentService.getDocument(id)
      if (doc) {
        set({ currentDocument: doc, loading: false })
      } else {
        set({ error: '文档不存在', loading: false })
      }
    } catch (error) {
      set({ error: '加载文档失败', loading: false })
      console.error('Failed to load document:', error)
    }
  },

  // 保存当前文档（如果不存在则创建）
  saveDocument: async (title: string, content: string) => {
    const { currentDocument } = get()
    set({ loading: true, error: null })

    try {
      if (currentDocument) {
        // 更新现有文档
        const updated = await DocumentService.updateDocument(currentDocument.id, {
          title,
          content,
        })
        set({ currentDocument: updated, loading: false })
      } else {
        // 创建新文档
        const newDoc = await DocumentService.createDocument(
          `${Date.now()}`,
          title,
          content
        )
        set({ currentDocument: newDoc, loading: false })
      }
    } catch (error) {
      set({ error: '保存文档失败', loading: false })
      console.error('Failed to save document:', error)
    }
  },

  // 创建新文档
  createDocument: async (path: string, title: string, content: string) => {
    set({ loading: true, error: null })
    try {
      const newDoc = await DocumentService.createDocument(path, title, content)
      set({
        currentDocument: newDoc,
        documents: [...get().documents, newDoc],
        loading: false,
      })
    } catch (error) {
      set({ error: '创建文档失败', loading: false })
      console.error('Failed to create document:', error)
    }
  },

  // 设置当前文档
  setCurrentDocument: (doc: Document | null) => {
    set({ currentDocument: doc })
  },
}))
