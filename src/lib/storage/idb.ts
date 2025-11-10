import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Document, AISuggestion, DocumentVersion } from '@/types'

interface AIHelperDB extends DBSchema {
  documents: {
    key: string
    value: Document
    indexes: { 'by-path': string; 'by-modified': number }
  }
  ai_suggestions: {
    key: string
    value: AISuggestion
    indexes: { 'by-document': string; 'by-time': number }
  }
  document_versions: {
    key: string
    value: DocumentVersion
    indexes: { 'by-document': string; 'by-timestamp': number }
  }
}

let db: IDBPDatabase<AIHelperDB>

const DB_NAME = 'ai-helper-db'
const DB_VERSION = 1

/**
 * 初始化或获取数据库实例
 */
export async function getDB(): Promise<IDBPDatabase<AIHelperDB>> {
  if (!db) {
    db = await openDB<AIHelperDB>(DB_NAME, DB_VERSION, {
      upgrade(upgradeDb) {
        // 文档表
        const documentStore = upgradeDb.createObjectStore('documents', {
          keyPath: 'id',
        })
        documentStore.createIndex('by-path', 'path')
        documentStore.createIndex('by-modified', 'lastModified')

        // AI建议表
        const suggestionStore = upgradeDb.createObjectStore('ai_suggestions', {
          keyPath: 'id',
        })
        suggestionStore.createIndex('by-document', 'documentId')
        suggestionStore.createIndex('by-time', 'suggestionTime')

        // 文档版本表
        const versionStore = upgradeDb.createObjectStore('document_versions', {
          keyPath: 'id',
        })
        versionStore.createIndex('by-document', 'documentId')
        versionStore.createIndex('by-timestamp', 'timestamp')
      },
    })
  }
  return db
}

/**
 * 文档相关操作
 */
export class DocumentStore {
  static async add(doc: Document): Promise<void> {
    const db = await getDB()
    await db.add('documents', doc)
  }

  static async update(doc: Document): Promise<void> {
    const db = await getDB()
    await db.put('documents', doc)
  }

  static async get(id: string): Promise<Document | undefined> {
    const db = await getDB()
    return db.get('documents', id)
  }

  static async getByPath(path: string): Promise<Document | undefined> {
    const db = await getDB()
    return db.getFromIndex('documents', 'by-path', path)
  }

  static async getAll(): Promise<Document[]> {
    const db = await getDB()
    return db.getAll('documents')
  }

  static async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('documents', id)
  }

  static async search(query: string): Promise<Document[]> {
    const db = await getDB()
    const allDocs = await this.getAll()

    if (!query.trim()) return allDocs

    const lowercaseQuery = query.toLowerCase()
    return allDocs.filter(
      (doc) =>
        doc.title.toLowerCase().includes(lowercaseQuery) ||
        doc.content.toLowerCase().includes(lowercaseQuery) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    )
  }
}

/**
 * AI建议相关操作
 */
export class AISuggestionStore {
  static async add(suggestion: AISuggestion): Promise<void> {
    const db = await getDB()
    await db.add('ai_suggestions', suggestion)
  }

  static async update(suggestion: AISuggestion): Promise<void> {
    const db = await getDB()
    await db.put('ai_suggestions', suggestion)
  }

  static async getByDocument(documentId: string): Promise<AISuggestion[]> {
    const db = await getDB()
    return db.getAllFromIndex('ai_suggestions', 'by-document', documentId)
  }
}

/**
 * 文档版本相关操作
 */
export class DocumentVersionStore {
  static async add(version: DocumentVersion): Promise<void> {
    const db = await getDB()
    await db.add('document_versions', version)
  }

  static async getByDocument(documentId: string, limit = 10): Promise<DocumentVersion[]> {
    const db = await getDB()
    const versions = await db.getAllFromIndex('document_versions', 'by-document', documentId)

    return versions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }
}
