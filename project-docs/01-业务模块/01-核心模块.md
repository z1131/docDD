# 核心业务模块设计

## 模块划分

### 1. 文档管理模块
**职责**：项目文档的CRUD、版本管理、索引构建

**功能点**：
- 文档分层结构管理（概览、业务、技术、API、任务）
- Markdown编辑器（支持可视化与源码模式）
- 文档标签与分类系统
- 文档版本历史与对比
- 全文搜索与智能推荐

**关键设计**：
```typescript
interface Document {
  id: string
  path: string           // 文档路径，如 "01-business-modules/user-system"
  title: string
  content: string        // Markdown内容
  tags: string[]         // 标签：如 ["认证", "核心业务"]
  aiSuggestions: AISuggestion[]  // AI建议记录
  consensusVersion: string        // 共识版本内容
  lastModified: Date
  modifiedBy: 'ai' | 'human'
}
```

---

### 2. AI上下文生成模块
**职责**：根据当前任务智能组合文档，生成最优prompt

**功能点**：
- 任务上下文感知
- 相关文档智能推荐
- Prompt模板管理
- Token使用量优化
- 一键复制到Claude Code

**关键设计**：
```typescript
interface AIContext {
  task: string              // 当前任务描述
  relevantDocs: Document[]  // 推荐的相关文档
  prompt: string            // 生成的完整prompt
  estimatedTokens: number   // 预估token数
}
```

---

### 3. 共识管理模块
**职责**：追踪AI建议与人工修改，维护共识版本

**功能点**：
- AI建议记录与展示
- 人工修改高亮对比
- 共识版本标记
- 变更历史追踪

**关键设计**：
```typescript
interface AISuggestion {
  id: string
  docId: string
  suggestedContent: string
  suggestionTime: Date
  aiModel: string          // 如 "claude-3.5-sonnet"
  status: 'pending' | 'accepted' | 'rejected' | 'modified'
  finalContent?: string
}
```

---

### 4. Web UI展示模块
**职责**：提供友好的可视化界面

**功能点**：
- 文档树形导航
- 双栏编辑预览（左编辑右预览）
- AI建议侧边栏
- Prompt生成器界面
- 任务看板视图

**页面规划**：
1. **Dashboard**：项目概览、最近文档、活跃任务
2. **文档编辑器**：核心工作界面
3. **Prompt实验室**：测试和优化prompt
4. **任务管理**：任务列表与状态

---

### 5. 集成模块（MVP后期）
**职责**：与AI编程工具集成（Claude Code、Cursor等）

**功能点**：
- MCP协议服务端实现
- Claude Code插件
- 文档变更 webhook
- API接口

## 模块依赖关系
```
Web UI → 文档管理 ← AI上下文生成
            ↓
        共识管理
            ↓
        集成模块
```

## 数据流向
1. 用户在Web UI创建/编辑文档
2. 文档管理模块存储并索引
3. AI上下文生成模块分析任务，推荐相关文档
4. 用户基于AI建议修改文档，达成共识
5. 集成模块将共识文档同步给AI编程工具
