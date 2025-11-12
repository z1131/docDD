# Claude Code 集成方案设计

## 设计目标

实现 docDD 系统与 Claude Code 的深度集成，让 AI 能够智能地使用项目文档作为上下文，提升 AI 编程的准确性和效率。

## 用户场景

### 场景1：获取项目全局上下文
**用户**：在 Claude Code 中输入 "帮我实现用户管理功能"

**当前问题**：
- Claude 不了解项目的整体架构
- 不知道技术栈和设计规范
- 可能给出不符合项目规范的代码

**期望效果**：
- Claude 自动读取 project-docs/01-业务模块/01-核心模块.md
- 了解项目分层架构（DocumentService、FileService等）
- 按照既定规范生成代码

### 场景2：维护文档-代码一致性
**用户**：修改了核心模块的实现，需要同步更新文档

**当前问题**：
- 手动更新文档容易遗漏
- 不知道哪些文档需要更新
- 文档与代码容易脱节

**期望效果**：
- AI 自动识别受影响的文档
- 给出文档更新建议
- 保持文档与代码同步

---

## 集成方案对比

### 方案 A：MCP 协议（Model Context Protocol）

**实现方式**：
```typescript
// 开发 MCP Server
import { Server } from '@modelcontextprotocol/sdk'

const server = new Server({
  name: 'docDD-mcp',
  version: '1.0.0'
}, {
  capabilities: {
    resources: {},
    tools: {}
  }
})

// 提供文档查询工具
server.setRequestHandler('tools/list', async () => ({
  tools: [{
    name: 'query_documents',
    description: '查询项目相关文档',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      }
    }
  }]
}))
```n
**优点**：✅
- 标准化协议，未来可支持多种 AI 工具
- 实时响应，AI 可以动态查询文档
- 双向通信，AI 可以主动请求上下文

**缺点**：❌
- 需要学习 MCP 协议规范
- 开发复杂度较高
- 需要 Claude Code 配置 MCP 客户端

**适用场景**：
- 大型项目，需要频繁与 AI 交互
- 团队协作，多人使用 AI 编程
- 长期项目，需要维护文档-代码一致性

---

### 方案 B：.claude-context.md 生成

**实现方式**：
```typescript
// 在 docDD 中选择相关文档
const selectedDocs = [
  'project-docs/01-业务模块/01-核心模块.md',
  'project-docs/02-技术设计/01-架构设计.md'
]

// 生成 .claude-context.md
function generateContext() {
  const context = `# 项目上下文

## 当前任务
实现用户认证功能

## 相关文档

${selectedDocs.map(doc => `### ${doc.title}\n\n${doc.content}`).join('\n\n')}

## 技术规范
- 使用 React 18 + TypeScript
- 状态管理：Zustand
- 存储：IndexedDB
`
  fs.writeFileSync('.claude-context.md', context)
}
```

**优点**：✅
- 实现简单，无需额外协议
- Claude Code 原生支持
- 可以手动编辑和调整

**缺点**：❌
- 需要手动生成和更新
- 文件可能过时
- 无法动态响应 AI 查询

**适用场景**：
- 个人项目，开发节奏可控
- MVP 阶段，快速验证想法
- 作为过渡到 MCP 的临时方案

---

### 方案 C：Prompt 工程 + 复制粘贴

**实现方式**：
```typescript
// 生成 AI 友好的 prompt
generateAIPrompt(task: string) {
  const relevantDocs = this.findRelevantDocs(task)

  return `你是一名资深的 React + TypeScript 开发工程师。

## 任务
${task}

## 项目背景
这是"面向文档规范的 AI 开发系统"，核心理念是通过文档管理项目上下文。

## 相关文档
${relevantDocs.map(doc => `### ${doc.title}\n${doc.content}`).join('\n\n')}

## 技术栈
- React 18 + TypeScript
- Tailwind CSS v4
- Zustand 状态管理
- IndexedDB 本地存储

## 代码规范
1. 使用函数组件 + Hooks
2. 类型安全，避免 any
3. 组件职责单一
4. 添加必要的注释

请根据以上信息，完成任务并提供：
1. 完整的代码实现
2. 简要的实现说明
3. 需要更新的文档建议
`}
}
```

**优点**：✅
- 实现最简单
- 完全控制 prompt 内容
- 可灵活调整文档选择策略

**缺点**：❌
- 手动操作，效率较低
- 上下文长度限制（token 限制）
- 容易遗漏重要文档

**适用场景**：
- 学习和探索阶段
- 复杂任务需要精细控制
- 作为其他方案的回退方案

---

## 推荐方案：渐进式实现

### 阶段 1：Prompt 生成器（立即实施）

**目标**：1-2 小时内可用

**实现**：
1. 在 Web UI 中添加"生成 AI Prompt"按钮
2. 选择相关文档（支持搜索和多选）
3. 生成结构化的 prompt
4. 一键复制到剪贴板
5. 粘贴到 Claude Code 使用

**界面位置**：Sidebar 底部"生成AI上下文"按钮

**核心代码**：
```typescript
// src/services/ai-prompt.service.ts
export class AIPromptService {
  static generatePrompt(task: string, docs: Document[]): string {
    return `## 任务描述
${task}

## 项目上下文
${this.getProjectContext()}

## 相关文档
${docs.map(doc => `### ${doc.title}\n${doc.content}`).join('\n\n')}

## 开发规范
${this.getCodingStandards()}
`
  }

  private static getProjectContext(): string {
    return `- 项目名称：docDD（面向文档规范的AI开发系统）
- 技术栈：React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- `  }

  private static getCodingStandards(): string {
    return `1. 使用 TypeScript，严格类型检查 2. 组件化开发，职责单一...`  }
}
```

**开发任务**：
- [ ] 创建 AIPromptService
- [ ] 添加 Prompt 生成器 UI
- [ ] 支持文档多选
- [ ] 优化 prompt 模板

---

### 阶段 2：.claude-context.md 自动生成

**目标**：1-2 天内实施

**改进**：
1. 监听文档变更（使用 git hook 或文件监听）
2. 自动识别相关文档（基于修改的文件路径）
3. 自动生成或更新 .claude-context.md
4. 提供手动调整界面

**触发时机**：
- 用户点击"同步到 Claude Code"按钮
- 保存文档时自动触发
- Git commit 前自动检查

**核心代码**：
```typescript
// src/services/context-sync.service.ts
export class ContextSyncService {
  static async syncToClaudeCode(): Promise<void> {
    // 1. 获取当前任务（从 04-任务列表/）
    const activeTask = await TaskService.getActiveTasks()

    // 2. 分析相关文档
    const relevantDocs = await this.findRelevantDocs(activeTask)

    // 3. 生成上下文
    const context = await AIPromptService.generateTaskContext(activeTask, relevantDocs)

    // 4. 写入 .claude-context.md
    await this.writeContextFile(context)

    // 5. 通知用户
    toast.success('上下文已同步到 .claude-context.md')
  }

  private static async findRelevantDocs(task: Task): Promise<Document[]> {
    // 基于任务标签和路径匹配相关文档
    const allDocs = await DocumentService.getAllDocuments()

    return allDocs.filter(doc =>
      task.tags.some(tag =>
        doc.path.includes(tag) || doc.content.includes(tag)
      )
    )
  }
}
```

**开发任务**：
- [ ] 实现自动文档关联算法
- [ ] 创建 context sync 界面
- [ ] 添加 git hook 支持
- [ ] 实现智能推荐系统

---

### 阶段 3：MCP 协议支持

**目标**：1-2 周内实施

**完整实现**：
1. 开发 docDD MCP Server
2. 支持 Claude Code 动态查询
3. 提供工具和资源配置
4. 实现双向通信

**MCP Server 功能**：
- `list_documents`: 列出所有文档
- `get_document`: 获取文档内容
- `search_documents`: 搜索相关文档
- `update_document`: 更新文档（AI 建议后）
- `generate_context`: 生成任务上下文

**Claude Code 配置**：
```json
{
  "mcpServers": {
    "docDD": {
      "command": "npx",
      "args": ["docdd-mcp-server"],
      "env": {
        "DOC_PATH": "./project-docs"
      }
    }
  }
}
```

**开发任务**：
- [ ] 学习 MCP 协议规范
- [ ] 实现 MCP Server
- [ ] 测试 Claude Code 集成
- [ ] 编写配置文档

---

## 开发流程中的文档更新机制

### 核心原则

**文档驱动开发循环**：
```
修改代码 → 识别影响 → 更新文档 → AI 审阅 → 合并变更
```

### 实现机制

#### 1. 代码变更检测

**使用 Git Hook**（`.git/hooks/post-commit`）：
```bash
#!/bin/bash
# 检测修改的文件类型
CHANGED_FILES=$(git diff HEAD~1 HEAD --name-only)

# 如果修改了 src/ 下的文件，检查是否需要更新文档
if echo "$CHANGED_FILES" | grep -q "^src/"; then
  node scripts/check-doc-update.js
fi
```

**自动分析变更**：
```typescript
// scripts/check-doc-update.ts
import { execSync } from 'child_process'

function checkDocUpdate() {
  const changedFiles = execSync('git diff HEAD~1 HEAD --name-only')
    .toString()
    .split('\n')

  const srcChanges = changedFiles.filter(f => f.startsWith('src/'))

  if (srcChanges.length > 0) {
    console.log('检测到源代码变更：')
    console.log(srcChanges)

    // 分析影响范围
    const affectedModules = analyzeImpact(srcChanges)

    // 推荐更新的文档
    const docsToUpdate = recommendDocs(affectedModules)

    console.log('\n建议更新的文档：')
    docsToUpdate.forEach(doc => console.log(`- ${doc}`))

    console.log('\n请运行: npm run docs:update')
  }
}
```

#### 2. AI 辅助文档更新

**生成更新建议**：
```typescript
// src/services/doc-update-assistant.service.ts
export class DocUpdateAssistant {
  static async generateUpdateSuggestion(
    codeChanges: CodeChange[],
    affectedDocs: Document[]
  ): Promise<UpdateSuggestion> {
    const prompt = `作为项目文档维护助手，请分析代码变更并提供文档更新建议。

## 代码变更
${codeChanges.map(change =>
  `文件: ${change.file}\n变更: ${change.diff}`
).join('\n\n')}

## 受影响的文档
${affectedDocs.map(doc =>
  `文档: ${doc.path}\n当前内容: ${doc.content}`
).join('\n\n')}

请提供：
1. 每个文档需要更新的部分
2. 具体的修改建议
3. 新增内容的建议
4. 需要删除的过时内容
`

    // 调用 Claude API 生成建议
    const suggestion = await callClaudeAPI(prompt)

    return {
      docs: affectedDocs,
      suggestions: suggestion,
      confidence: this.calculateConfidence(suggestion)
    }
  }
}
```

#### 3. 文档更新工作流

**UI 界面**：
```typescript
// 在文档编辑器中添加"AI 更新建议"面板
function DocUpdatePanel() {
  const [suggestions, setSuggestions] = useState<UpdateSuggestion[]>([])

  useEffect(() => {
    // 监听 git 变更
    const unlisten = listenGitChanges(async (changes) => {
      const suggestion = await DocUpdateAssistant.generateUpdateSuggestion(changes)
      setSuggestions(suggestion)
    })

    return unlisten
  }, [])

  return (
    <div className="ai-suggestions-panel">
      <h3>📋 AI 文档更新建议</h3>
      {suggestions.map(suggestion => (
        <div key={suggestion.docId}>
          <h4>{suggestion.docTitle}</h4>
          <div className="suggestion-content">
            {suggestion.recommendedChanges}
          </div>
          <button onClick={() => applyChanges(suggestion)}>
            应用建议
          </button>
        </div>
      ))}
    </div>
  )
}
```

---

## 实施路线图

### 即刻开始（今天）

1. **完善设计方案**
   - 评审本设计文档
   - 收集反馈
   - 确定优先级

2. **实现阶段 1：Prompt 生成器**
   - 创建 AIPromptService
   - 添加"生成 AI Prompt"按钮
   - 支持选择文档生成上下文

### 短期目标（本周）

1. **测试 Prompt 生成器**
   - 实际项目中使用
   - 收集使用反馈
   - 优化 prompt 模板

2. **文档更新机制**
   - 实现 git hook 检测
   - 添加变更分析功能
   - 创建 AI 更新建议面板

### 中期目标（本月）

1. **实现 .claude-context.md 自动生成**
   - 智能文档关联
   - 自动同步机制
   - 手动调整界面

2. **集成测试**
   - 与 Claude Code 实际集成测试
   - 性能优化
   - 用户体验改进

### 长期目标（下月）

1. **MCP 协议支持**
   - 开发 MCP Server
   - 完整文档生命周期管理
   - 发布插件

---

## 关键决策点

### 问题 1：MCP vs .claude-context.md？

**建议**：先实现 .claude-context.md，因为：
- 实现简单，1-2 天可用
- Claude Code 原生支持
- 可以立即验证价值
- 为 MCP 积累经验

### 问题 2：自动更新 vs 手动更新？

**建议**：混合模式
- 自动检测变更（git hook）
- AI 生成建议
- 人工确认后应用
- 避免 AI 误操作

### 问题 3：文档粒度？

**建议**：
- 业务模块级：module.md（如用户管理、支付）
- 技术决策级：decision.md（如为什么选 Zustand）
- API 级：api.md（接口定义）
- 任务级：task.md（开发任务追踪）

---

## 补充说明

本设计文档本身就践行了"文档驱动开发"的理念：
1. 在编码前先设计交互方案
2. 思考用户场景和痛点
3. 对比多种方案
4. 制定实施路线图

下一步可以根据本设计实现具体功能。
