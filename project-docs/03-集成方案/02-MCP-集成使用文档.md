# MCP 集成使用文档

## 概述

DocDD MCP Server 实现了 Model Context Protocol，允许 Claude Code 直接访问项目文档，实现智能上下文管理和文档驱动的AI开发。

## 架构

```
Claude Code ←→ MCP Client ←→ DocDD MCP Server ←→ project-docs/
```

- **Claude Code**: AI编程工具（请求方）
- **MCP Client**: Claude Code内置的MCP客户端
- **DocDD MCP Server**: 文档MCP服务器（本实现）
- **project-docs/**: 项目文档存储

## 前置条件

- Node.js 18+
- npm 或 pnpm
- Claude Code CLI

## 安装和配置

### 1. 安装依赖

项目已经自动安装了 `@modelcontextprotocol/sdk`。

### 2. 配置 Claude Code

在项目根目录创建 `.claude.json` 文件（已创建）：

```json
{
  "mcpServers": {
    "docDD": {
      "command": "npm",
      "args": ["run", "mcp"],
      "env": {
        "DOC_PATH": "project-docs"
      }
    }
  }
}
```

### 3. 启动 MCP Server

可以通过以下方式启动MCP Server：

```bash
# 方式1：使用npm脚本（推荐）
npm run mcp

# 方式2：直接运行（测试）
node src/mcp/index.ts

# 方式3：使用tsx（开发）
cd src/mcp && tsx index.ts
```

## 提供的功能

### 1. 资源（Resources）

MCP Server 将文档暴露为资源，Claude Code 可以直接读取。

**资源URI格式**：
```
doc://<文档路径>
```

**示例**：
- `doc://00-项目概览.md`
- `doc://01-业务模块/01-核心模块.md`
- `doc://02-技术设计/01-架构设计.md`

### 2. 工具（Tools）

#### 2.1 search_documents - 搜索文档

根据关键词搜索相关文档。

**参数**：
```typescript
{
  query: string,     // 搜索关键词
  limit?: number     // 返回数量限制（默认10）
}
```

**使用示例**：
```bash
# 在Claude Code中
> 搜索关于"架构设计"的文档

Claude will call:
search_documents({
  query: "架构设计",
  limit: 5
})
```

#### 2.2 generate_task_context - 生成任务上下文

为开发任务生成完整的上下文信息，包括相关文档、项目背景和技术规范。

**参数**：
```typescript
{
  task: string,                          // 任务描述
  includeTechDesign?: boolean,          // 是否包含技术设计文档
  includeBusinessModules?: boolean      // 是否包含业务模块文档
}
```

**使用示例**：
```bash
# 在 Claude Code 中
> 帮我实现用户认证功能

Claude 将调用：
generate_task_context({
  task: "实现用户认证功能",
  includeTechDesign: true,
  includeBusinessModules: true
})
```

**返回内容**：
```markdown
# 任务上下文

## 任务描述
实现用户认证功能

## 相关文档
[自动搜索并包含相关文档内容]

## 项目背景
- 项目名称: docDD
- 技术栈: React 18 + TypeScript + Vite + Tailwind CSS + Zustand

## 技术规范
1. 使用 TypeScript，严格类型检查
2. 函数组件 + Hooks
3. 状态管理使用 Zustand
4. ...

## 开发建议
在实现上述任务时，请先：
1. 阅读相关文档了解现有架构
2. 如果需要新增模块，更新业务模块文档
3. ...
```

#### 2.3 get_document_structure - 获取文档结构

获取项目文档的树形结构，了解文档组织方式。

**参数**：无

**返回**：文档树形结构的JSON表示

#### 2.4 analyze_code_impact - 分析代码变更影响

分析代码变更对文档的影响，提供文档更新建议。

**参数**：
```typescript
{
  changedFiles: string[],      // 变更的文件路径列表
  changeDescription?: string  // 变更描述（可选）
}
```

**使用示例**：
```bash
# 在 Claude Code 中
> 我修改了 src/services/document.service.ts，需要更新哪些文档？

Claude 将调用：
analyze_code_impact({
  changedFiles: ["src/services/document.service.ts"],
  changeDescription: "添加了文档搜索功能"
})
```

## 在 Claude Code 中使用

### 场景1：获取全局上下文

当开始一个新任务时，让 Claude 了解项目背景：

```bash
# 在终端中
claude

> 请读取项目文档，了解这是一个什么项目

# Claude 会自动：
# 1. 获取文档结构
# 2. 读取项目概览文档
# 3. 了解技术架构
# 4. 给出项目总结
```

### 场景2：任务驱动开发

```bash
> 我想实现 Markdown 预览功能，需要哪些文档作为参考？

# Claude 会：
# 1. 搜索相关文档
# 2. 生成任务上下文
# 3. 根据文档规范给出实现方案
```

### 场景3：文档-代码同步

```bash
> 我修改了文档服务，需要更新哪些文档？

# Claude 会：
# 1. 分析代码变更
# 2. 推荐需要更新的文档
# 3. 提供更新建议
```

## 环境变量

- `DOC_PATH`: 文档目录路径，默认为 `project-docs`

## 调试

### 测试 MCP Server

```bash
# 手动启动 MCP Server
npm run mcp

# 检查输出是否正确
# 应该显示：
# "DocDD MCP Server running on stdio"
```

### 查看 MCP 通信日志

在 Claude Code 中启用调试模式：

```bash
claude --debug
```

可以看到 MCP 请求和响应的详细日志。

## 故障排除

### 问题1：MCP Server 无法启动

**现象**：
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**解决**：
```bash
npm install
```

### 问题2：文档找不到

**现象**：
```
Failed to read document: ENOENT: no such file or directory
```

**解决**：
检查 `DOC_PATH` 环境变量是否正确：
```bash
cd src/mcp && DOC_PATH=../../project-docs tsx index.ts
```

### 问题3：Claude Code 无法连接 MCP

**现象**：
```
MCP connection failed
```

**解决**：
1. 检查 `.claude.json` 配置是否正确
2. 确保可以手动运行 `npm run mcp`
3. 检查 Node.js 版本（需 18+）

## 扩展开发

### 添加新工具

编辑 `src/mcp/document-mcp-server.ts`，在 `ListToolsRequestSchema` 处理器中添加新工具：

```typescript
{
  name: 'your_tool_name',
  description: '工具描述',
  inputSchema: {
    type: 'object',
    properties: {
      param1: { type: 'string' }
    },
    required: ['param1']
  }
}
```

然后在 `CallToolRequestSchema` 中添加实现：

```typescript
case 'your_tool_name':
  return await this.yourToolImplementation(args)
```

### 添加新资源

在 `ListResourcesRequestSchema` 中添加新的资源类型。

## 与其他方案对比

### vs .claude-context.md

- **MCP**: 动态查询，实时响应，更灵活
- **.claude-context.md**: 静态文件，需要手动更新

### vs Prompt生成器

- **MCP**: 集成在 Claude Code 中，无缝体验
- **Prompt生成器**: 需要手动复制粘贴

## 最佳实践

1. **保持文档更新**：代码变更后及时更新文档，MCP才能提供准确的上下文
2. **合理组织文档**：清晰的文档结构有助于MCP更好地理解和检索
3. **使用描述性命名**：文档文件名和标题要清晰，便于搜索
4. **定期测试**：定期验证MCP功能是否正常工作

## 版本信息

- **MCP Protocol**: 1.0
- **SDK Version**: 1.21.1
- **DocDD MCP Server**: 1.0.0

## 参考资料

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/introduction)
