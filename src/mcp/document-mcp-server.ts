#!/usr/bin/env node

/**
 * DocDD MCP Server
 * Model Context Protocol server for document-driven AI development
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { promises as fs } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 文档MCP服务器
 */
class DocumentMCPServer {
  private server: Server
  private docBasePath: string

  constructor() {
    this.server = new Server(
      {
        name: 'docDD-mcp-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          resources: {},
          tools: {}
        }
      }
    )

    // 从环境变量获取文档路径，默认使用 project-docs
    this.docBasePath = process.env.DOC_PATH || join(__dirname, '../../project-docs')

    this.setupHandlers()
  }

  /**
   * 设置请求处理器
   */
  private setupHandlers(): void {
    // 资源列表
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      try {
        const resources = await this.listAllDocuments()
        return {
          resources: resources.map(doc => ({
            uri: `doc://${doc.path}`,
            name: doc.name,
            description: `项目文档: ${doc.name}`,
            mimeType: 'text/markdown'
          }))
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to list documents: ${error}`
        )
      }
    })

    // 读取资源
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      try {
        const uri = request.params.uri
        if (!uri.startsWith('doc://')) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Invalid URI scheme: ${uri}`
          )
        }

        const docPath = uri.replace('doc://', '')
        const content = await this.readDocument(docPath)

        return {
          contents: [{
            uri,
            mimeType: 'text/markdown',
            text: content
          }]
        }
      } catch (error) {
        if (error instanceof McpError) throw error
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to read document: ${error}`
        )
      }
    })

    // 工具列表
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_documents',
            description: '搜索项目中的相关文档',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: '搜索关键词'
                },
                limit: {
                  type: 'number',
                  description: '返回结果数量限制',
                  default: 10
                }
              },
              required: ['query']
            }
          },
          {
            name: 'generate_task_context',
            description: '为开发任务生成上下文信息',
            inputSchema: {
              type: 'object',
              properties: {
                task: {
                  type: 'string',
                  description: '开发任务描述'
                },
                includeTechDesign: {
                  type: 'boolean',
                  description: '是否包含技术设计文档',
                  default: true
                },
                includeBusinessModules: {
                  type: 'boolean',
                  description: '是否包含业务模块文档',
                  default: true
                }
              },
              required: ['task']
            }
          },
          {
            name: 'get_document_structure',
            description: '获取项目文档的树形结构，了解文档组织方式',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'analyze_code_impact',
            description: '分析代码变更对文档的影响，提供文档更新建议',
            inputSchema: {
              type: 'object',
              properties: {
                changedFiles: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '变更的文件路径列表'
                },
                changeDescription: {
                  type: 'string',
                  description: '变更描述'
                }
              },
              required: ['changedFiles']
            }
          }
        ]
      }
    })

    // 调用工具
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params

        switch (name) {
          case 'search_documents':
            return await this.searchDocuments(args)
          case 'generate_task_context':
            return await this.generateTaskContext(args)
          case 'get_document_structure':
            return await this.getDocumentStructure()
          case 'analyze_code_impact':
            return await this.analyzeCodeImpact(args)
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            )
        }
      } catch (error) {
        if (error instanceof McpError) throw error
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error}`
        )
      }
    })
  }

  /**
   * 列出所有文档
   */
  private async listAllDocuments(): Promise<Array<{path: string, name: string}>> {
    const docs: Array<{path: string, name: string}> = []

    async function traverseDir(dir: string, basePath: string): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = join(dir, entry.name)
          const relativePath = fullPath.replace(basePath + '/', '')

          if (entry.isDirectory()) {
            await traverseDir(fullPath, basePath)
          } else if (entry.isFile() && entry.name.endsWith('.md')) {
            docs.push({
              path: relativePath,
              name: entry.name.replace('.md', '')
            })
          }
        }
      } catch (error) {
        console.error(`Error traversing directory ${dir}:`, error)
      }
    }

    await traverseDir(this.docBasePath, this.docBasePath)
    return docs
  }

  /**
   * 读取文档内容
   */
  private async readDocument(path: string): Promise<string> {
    const fullPath = join(this.docBasePath, path)
    return await fs.readFile(fullPath, 'utf-8')
  }

  /**
   * 搜索文档
   */
  private async searchDocuments(args: any) {
    const { query, limit = 10 } = args

    const allDocs = await this.listAllDocuments()
    const results: Array<{path: string, name: string, content: string, relevance: number}> = []

    for (const doc of allDocs) {
      const content = await this.readDocument(doc.path)
      const lowerQuery = query.toLowerCase()
      const lowerContent = content.toLowerCase()
      const lowerName = doc.name.toLowerCase()

      let relevance = 0
      if (lowerName.includes(lowerQuery)) relevance += 3
      if (lowerContent.includes(lowerQuery)) {
        const count = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length
        relevance += count
      }

      if (relevance > 0) {
        results.push({
          ...doc,
          content,
          relevance
        })
      }
    }

    results.sort((a, b) => b.relevance - a.relevance)

    return {
      content: [{
        type: 'text' as const,
        text: `找到 ${results.length} 个相关文档（显示前${limit}个）：\n\n` +
          results.slice(0, limit).map(doc =>
            `## ${doc.name}\n\n路径: ${doc.path}\n\n${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}\n`
          ).join('\n---\n\n')
      }]
    }
  }

  /**
   * 生成任务上下文
   */
  private async generateTaskContext(args: any) {
    const { task, includeTechDesign = true, includeBusinessModules = true } = args

    let context = `# 任务上下文\n\n## 任务描述\n${task}\n\n`

    // 搜索相关文档
    const searchResults = await this.searchDocuments({
      query: task,
      limit: 5
    })

    context += `## 相关文档\n\n${searchResults.content[0].text}\n\n`

    // 添加项目背景
    context += `## 项目背景\n\n- 项目名称: docDD（面向文档规范的AI开发系统）\n- 核心理念: 通过文档管理项目上下文，提升AI编程协作效率\n- 技术栈: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + IndexedDB\n\n`

    // 添加技术规范
    context += `## 技术规范\n\n1. 使用 TypeScript，严格类型检查（noImplicitAny: true）\n2. 函数组件 + Hooks，避免类组件\n3. 状态管理使用 Zustand\n4. 本地存储使用 IndexedDB\n5. 样式使用 Tailwind CSS v4\n6. 文档优先，代码与文档同步更新\n7. 中文环境优化，所有文档和界面使用中文\n\n`

    context += `## 开发建议\n\n在实现上述任务时，请先：\n1. 阅读相关文档了解现有架构\n2. 如果需要新增模块，更新业务模块文档\n3. 如果需要技术决策，更新技术设计文档\n4. 保持代码与文档的一致性\n`

    return {
      content: [{
        type: 'text' as const,
        text: context
      }]
    }
  }

  /**
   * 获取文档结构
   */
  private async getDocumentStructure() {
    const structure: any = {
      name: 'project-docs',
      type: 'directory',
      children: []
    }

    async function buildTree(dir: string, node: any): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          const childNode = {
            name: entry.name,
            type: 'directory',
            children: []
          }
          node.children.push(childNode)
          await buildTree(fullPath, childNode)
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          node.children.push({
            name: entry.name.replace('.md', ''),
            type: 'file',
            path: fullPath
          })
        }
      }
    }

    await buildTree(this.docBasePath, structure)

    return {
      content: [{
        type: 'text' as const,
        text: `项目文档结构：\n\n${JSON.stringify(structure, null, 2)}`
      }]
    }
  }

  /**
   * 分析代码变更对文档的影响
   */
  private async analyzeCodeImpact(args: any) {
    const { changedFiles, changeDescription = '' } = args

    let analysis = `# 代码变更影响分析\n\n## 变更文件\n${changedFiles.map((f: string) => `- ${f}`).join('\n')}\n\n`

    if (changeDescription) {
      analysis += `## 变更描述\n${changeDescription}\n\n`
    }

    // 根据文件路径推荐需要更新的文档
    const recommendations: Array<{doc: string, reason: string, priority: string}> = []

    for (const file of changedFiles) {
      if (file.startsWith('src/components/')) {
        recommendations.push({
          doc: '02-技术设计/01-架构设计.md',
          reason: '组件变更可能影响架构文档',
          priority: '中'
        })
      } else if (file.startsWith('src/services/')) {
        recommendations.push({
          doc: '01-业务模块/01-核心模块.md',
          reason: '服务层变更需要更新业务模块文档',
          priority: '高'
        })
      } else if (file.startsWith('src/lib/storage/')) {
        recommendations.push({
          doc: '02-技术设计/02-项目配置.md',
          reason: '存储层变更需要更新技术配置',
          priority: '高'
        })
      }
    }

    analysis += `## 文档更新建议\n\n`

    if (recommendations.length > 0) {
      recommendations.forEach(rec => {
        analysis += `- **${rec.doc}** (优先级: ${rec.priority})\n`
        analysis += `  - 原因: ${rec.reason}\n`
      })
    } else {
      analysis += '暂无明确的文档更新建议。请检查变更是否影响：\n'
      analysis += '- 业务逻辑（需更新业务模块文档）\n'
      analysis += '- 技术架构（需更新技术设计文档）\n'
      analysis += '- API接口（需更新API规范文档）\n'
    }

    return {
      content: [{
        type: 'text' as const,
        text: analysis
      }]
    }
  }

  /**
   * 启动服务器
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('DocDD MCP Server running on stdio')
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  const server = new DocumentMCPServer()
  await server.run()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

export { DocumentMCPServer }
