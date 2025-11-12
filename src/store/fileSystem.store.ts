import { create } from 'zustand'
import { FileSystemService, DirectoryInfo } from '@/lib/filesystem/fileService'
import { Document } from '@/types/document'

interface FileSystemState {
  // 当前目录列表
  directories: DirectoryInfo[]

  // 当前选中的目录
  selectedDirectory: string | null

  // 加载状态
  loading: boolean

  // 错误信息
  error: string | null

  // 操作
  loadDirectories: () => Promise<void>
  createDirectory: (name: string) => Promise<void>
  createDocument: (directory: string, name: string) => Promise<Document>
  deleteDirectory: (path: string) => Promise<void>
  deleteDocument: (path: string) => Promise<void>
  renameDirectory: (oldPath: string, newName: string) => Promise<void>
  selectDirectory: (path: string) => void
  clearError: () => void
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  directories: [],
  selectedDirectory: null,
  loading: false,
  error: null,

  // 加载目录列表
  loadDirectories: async () => {
    set({ loading: true, error: null })

    try {
      const directories = await FileSystemService.getDirectoryList()
      set({ directories, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载目录失败',
        loading: false
      })
    }
  },

  // 创建目录
  createDirectory: async (name: string) => {
    set({ loading: true, error: null })

    try {
      await FileSystemService.createDirectory(name)
      await FileSystemService.getDirectoryList()
      // 更新目录列表
      get().loadDirectories()

      set({ loading: false, error: null })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '创建目录失败',
        loading: false
      })
      throw error
    }
  },

  // 创建文档
  createDocument: async (directory: string, name: string) => {
    set({ loading: true, error: null })

    try {
      const newDocument = await FileSystemService.createDocument(directory, name)
      // 更新目录列表
      get().loadDirectories()

      set({ loading: false, error: null })
      return newDocument
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '创建文档失败',
        loading: false
      })
      throw error
    }
  },

  // 删除目录
  deleteDirectory: async (path: string) => {
    set({ loading: true, error: null })

    try {
      await FileSystemService.deleteDirectory(path)
      // 更新目录列表
      get().loadDirectories()

      // 如果删除的是当前选中的目录，清除选择
      if (get().selectedDirectory === path) {
        set({ selectedDirectory: null })
      }

      set({ loading: false, error: null })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除目录失败',
        loading: false
      })
      throw error
    }
  },

  // 删除文档
  deleteDocument: async (path: string) => {
    set({ loading: true, error: null })

    try {
      await FileSystemService.deleteDocument(path)
      // 更新目录列表
      get().loadDirectories()

      set({ loading: false, error: null })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '删除文档失败',
        loading: false
      })
      throw error
    }
  },

  // 重命名目录
  renameDirectory: async (oldPath: string, newName: string) => {
    set({ loading: true, error: null })

    try {
      await FileSystemService.renameDirectory(oldPath, newName)

      // 如果重命名的是当前选中的目录，更新选择
      if (get().selectedDirectory === oldPath) {
        set({ selectedDirectory: newName })
      }

      // 更新目录列表
      get().loadDirectories()

      set({ loading: false, error: null })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '重命名目录失败',
        loading: false
      })
      throw error
    }
  },

  // 选择目录
  selectDirectory: (path: string) => {
    set({ selectedDirectory: path })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  }
}))

// 便捷的hook函数
export const useFileSystem = () => {
  const store = useFileSystemStore()

  return {
    // 状态
    ...store,
    // 检查名称是否可用
    isNameAvailable: FileSystemService.isNameAvailable
  }
}