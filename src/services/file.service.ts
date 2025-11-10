/**
 * 文件系统服务
 * 读取项目中的文档文件
 */

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'dir'
  children?: FileNode[]
  content?: string // 文件内容（预加载）
}

// 在构建时加载所有markdown文件
const docModules = import.meta.glob('/project-docs/**/*.md', { as: 'raw', eager: false })

export class FileService {
  private static readonly DOC_BASE_PATH = '/project-docs'

  /**
   * 获取文档目录树形结构
   */
  static async getDocTree(): Promise<FileNode[]> {
    try {
      const tree: FileNode[] = []
      const pathMap = new Map<string, FileNode>()

      for (const fullPath in docModules) {
        const relativePath = fullPath.replace('/project-docs/', '')
        const parts = relativePath.split('/')

        let currentLevel = tree
        let currentPath = ''

        parts.forEach((part, index) => {
          const isFile = index === parts.length - 1
          const pathSoFar = currentPath ? `${currentPath}/${part}` : part
          const nodePath = `/project-docs/${pathSoFar}`

          let node = pathMap.get(nodePath)

          if (!node) {
            node = {
              name: isFile ? part.replace('.md', '') : part,
              path: nodePath,
              type: isFile ? 'file' : 'dir',
              children: isFile ? undefined : [],
            }

            pathMap.set(nodePath, node)
            currentLevel.push(node)
          }

          if (!isFile && node.children) {
            currentLevel = node.children
            currentPath = pathSoFar
          }
        })
      }

      return this.sortTree(tree)
    } catch (error) {
      console.error('加载文档目录失败:', error)
      return []
    }
  }

  /**
   * 读取文档内容
   */
  static async readDocument(path: string): Promise<string> {
    try {
      // 确保路径格式正确
      const normalizedPath = path.startsWith('/') ? path : `/${path}`

      // 从预加载的模块中读取
      const loader = docModules[normalizedPath]

      if (!loader) {
        throw new Error(`找不到文档: ${path}`)
      }

      return await loader()
    } catch (error) {
      console.error('读取文档失败:', error)
      throw error
    }
  }

  /**
   * 对树形结构排序（目录在前，文件在后，按名称排序）
   */
  private static sortTree(nodes: FileNode[]): FileNode[] {
    return nodes
      .sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(a.name)
        }
        return a.type === 'dir' ? -1 : 1
      })
      .map(node => {
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: this.sortTree(node.children),
          }
        }
        return node
      })
  }
}
