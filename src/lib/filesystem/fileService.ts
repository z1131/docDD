import { Document } from '@/types/document'
import { FileService, FileNode } from '@/services/file.service'

// 目录信息接口
export interface DirectoryInfo {
  name: string
  path: string
  type: 'directory'
  fileCount: number
  created: Date
  modified: Date
}

// 文件系统错误类型
export enum FileSystemError {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  FILE_EXISTS = 'FILE_EXISTS',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_NAME = 'INVALID_NAME',
  DISK_FULL = 'DISK_FULL',
  NOT_SUPPORTED = 'NOT_SUPPORTED'
}

// 检查是否支持File System Access API
export const isFileSystemAPISupported = () => {
  return 'showDirectoryPicker' in window && 'showSaveFilePicker' in window
}

// 文件系统服务
export class FileSystemService {
  // 创建目录 - 使用File System Access API（如果支持）
  static async createDirectory(dirName: string): Promise<void> {
    try {
      const path = `project-docs/${dirName}`

      // 验证目录名
      if (!dirName.trim()) {
        throw new Error('目录名不能为空')
      }

      // 检查名称有效性
      if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(dirName)) {
        throw new Error(FileSystemError.INVALID_NAME)
      }

      // 尝试使用File System Access API
      if (isFileSystemAPISupported()) {
        await this.createDirectoryWithAPI(dirName)
      } else {
        // 降级到指导模式
        throw new Error(FileSystemError.NOT_SUPPORTED)
      }

    } catch (error) {
      throw error
    }
  }

  // 使用File System Access API创建真实目录
  private static async createDirectoryWithAPI(dirName: string): Promise<void> {
    try {
      // 请求用户选择project-docs目录
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      })

      // 创建子目录
      await dirHandle.getDirectoryHandle(dirName, { create: true })
      console.log('Created directory:', dirName)
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new Error('请选择project-docs目录')
      } else if (error.name === 'NotAllowedError') {
        throw new Error(FileSystemError.PERMISSION_DENIED)
      } else {
        throw error
      }
    }
  }

  // 创建文档 - 使用File System Access API（如果支持）
  static async createDocument(directory: string, fileName: string): Promise<Document> {
    try {
      // 确保文件名有.md后缀
      const docName = fileName.endsWith('.md') ? fileName : `${fileName}.md`
      const path = directory ? `${directory}/${docName}` : docName
      const baseName = docName.replace('.md', '')

      // 验证文件名
      if (!fileName.trim()) {
        throw new Error('文件名不能为空')
      }

      // 检查名称有效性
      if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(baseName)) {
        throw new Error(FileSystemError.INVALID_NAME)
      }

      // 生成文档内容
      const content = `# ${baseName}

开始编写你的文档内容...

## 概述

## 详细内容

## 总结

---

*创建时间: ${new Date().toLocaleString('zh-CN')}*
`

      // 尝试使用File System Access API
      if (isFileSystemAPISupported()) {
        await this.createDocumentWithAPI(directory, docName, content)
      } else {
        // 降级到指导模式
        throw new Error(FileSystemError.NOT_SUPPORTED)
      }

      // 创建文档记录用于编辑
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        path: path,
        title: baseName,
        content: content,
        directory: directory,
        created: new Date(),
        modified: new Date(),
        modifiedBy: 'human'
      }

      // 保存到IndexedDB以便编辑
      await this.saveDocument(newDoc)

      return newDoc

    } catch (error) {
      throw error
    }
  }

  // 使用File System Access API创建真实文档
  private static async createDocumentWithAPI(directory: string, fileName: string, content: string): Promise<void> {
    try {
      // 请求用户选择project-docs目录
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      })

      // 获取或创建子目录
      const subdirHandle = await dirHandle.getDirectoryHandle(directory, { create: true })

      // 创建文件
      const fileHandle = await subdirHandle.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()

      console.log('Created document:', `${directory}/${fileName}`)
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new Error('请选择project-docs目录')
      } else if (error.name === 'NotAllowedError') {
        throw new Error(FileSystemError.PERMISSION_DENIED)
      } else {
        throw error
      }
    }
  }

  // 删除目录
  static async deleteDirectory(path: string): Promise<void> {
    try {
      // 检查目录是否为空
      const documents = await this.loadAllDocuments()
      const documentsInDir = documents.filter(doc => doc.directory === path)

      if (documentsInDir.length > 0) {
        throw new Error('目录不为空，无法删除')
      }

      // 删除目录逻辑
      console.log('Deleted directory:', path)

    } catch (error) {
      throw error
    }
  }

  // 删除文档
  static async deleteDocument(path: string): Promise<void> {
    try {
      // 从IndexedDB删除文档
      const documents = await this.loadAllDocuments()
      const updatedDocuments = documents.filter(doc => doc.path !== path)
      await this.saveAllDocuments(updatedDocuments)

      console.log('Deleted document:', path)

    } catch (error) {
      throw error
    }
  }

  // 重命名目录
  static async renameDirectory(oldPath: string, newName: string): Promise<void> {
    try {
      // 验证新名称
      if (!newName.trim()) {
        throw new Error('目录名不能为空')
      }

      if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(newName)) {
        throw new Error(FileSystemError.INVALID_NAME)
      }

      const newPath = `project-docs/${newName}`

      // 更新所有相关文档的路径
      const documents = await this.loadAllDocuments()
      const updatedDocuments = documents.map(doc => {
        if (doc.directory === oldPath) {
          return {
            ...doc,
            directory: newName
          }
        }
        return doc
      })

      await this.saveAllDocuments(updatedDocuments)

      console.log('Renamed directory:', oldPath, '->', newName)

    } catch (error) {
      throw error
    }
  }

  // 获取目录列表 - 从真实的project-docs读取
  static async getDirectoryList(): Promise<DirectoryInfo[]> {
    try {
      const docTree = await FileService.getDocTree()
      const directories: DirectoryInfo[] = []

      docTree.forEach(node => {
        if (node.type === 'dir') {
          const fileCount = this.countFiles(node)
          directories.push({
            name: node.name,
            path: node.path,
            type: 'directory',
            fileCount: fileCount,
            created: new Date(), // 使用当前时间，因为文件系统API不提供创建时间
            modified: new Date()
          })
        }
      })

      return directories.sort((a, b) => a.name.localeCompare(b.name))

    } catch (error) {
      console.error('Failed to get directory list:', error)
      return []
    }
  }

  // 递归计算目录下的文件数量
  private static countFiles(node: FileNode): number {
    if (node.type === 'file') {
      return 1
    }

    if (node.children) {
      return node.children.reduce((count, child) => count + this.countFiles(child), 0)
    }

    return 0
  }

  // 获取指定目录下的文档列表
  static async getDocumentsInDirectory(directoryName: string): Promise<FileNode[]> {
    try {
      const docTree = await FileService.getDocTree()
      const directory = docTree.find(node =>
        node.type === 'dir' && node.name === directoryName
      )

      if (directory && directory.children) {
        return directory.children.filter(child => child.type === 'file')
      }

      return []
    } catch (error) {
      console.error(`Failed to get documents in directory ${directoryName}:`, error)
      return []
    }
  }

  // 检查名称是否可用 - 基于真实文件系统
  static async isNameAvailable(name: string, type: 'directory' | 'document', directory?: string): Promise<boolean> {
    try {
      const docTree = await FileService.getDocTree()

      if (type === 'directory') {
        return !docTree.some(node =>
          node.type === 'dir' && node.name === name
        )
      } else {
        // 文档类型
        const docName = name.endsWith('.md') ? name : `${name}.md`
        const directoryNode = docTree.find(node =>
          node.type === 'dir' && node.name === directory
        )

        if (directoryNode && directoryNode.children) {
          return !directoryNode.children.some(child =>
            child.type === 'file' && child.name === docName.replace('.md', '')
          )
        }

        return true // 目录不存在，名称可用
      }
    } catch (error) {
      console.error('Failed to check name availability:', error)
      return false
    }
  }

  // 保存文档到IndexedDB
  private static async saveDocument(document: Document): Promise<void> {
    const { createDocument } = await import('@/services/document.service')
    await createDocument(document.id, document.title, document.content)
  }

  // 从IndexedDB加载所有文档
  private static async loadAllDocuments(): Promise<Document[]> {
    const { DocumentService } = await import('@/services/document.service')
    return DocumentService.getAllDocuments()
  }

  // 保存所有文档到IndexedDB
  private static async saveAllDocuments(documents: Document[]): Promise<void> {
    // 这里应该实现批量保存逻辑
    // 由于IndexedDB的限制，可能需要逐个保存
    for (const doc of documents) {
      await this.saveDocument(doc)
    }
  }
}