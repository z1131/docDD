# DocDDD - 面向文档规范的AI开发系统

**DocDDD**（面向文档规范的AI开发系统）是一个文档优先的AI编程协作平台，旨在通过文档管理项目上下文，提升AI编程工具（如Claude Code、Cursor等）的协作效率。

## 核心特性

- 📄 **文档即契约** - 文档成为人与AI的协作协议
- 🤖 **AI上下文智能管理** - 自动索引和关联项目文档
- ✍️ **双栏编辑器** - 左侧Markdown编辑，右侧实时预览
- 💾 **本地数据存储** - 使用IndexedDB持久化保存
- 🚀 **中文优化** - 针对中文开发场景量身定制
- 🔧 **轻量易用** - 基于React + TypeScript，开箱即用

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5175 开始使用

### 构建生产版本

```bash
npm run build
```

## 文档结构

项目采用分层文档结构，开发文档位于 `project-docs/` 目录：

```
project-docs/                   # 开发文档（面向开发者）
├── 00-project-overview.md      # 项目概览与愿景
├── 01-business-modules/        # 业务模块设计
├── 02-technical-design/        # 技术架构设计
│   ├── 01-architecture.md      # 系统架构
│   └── 02-project-setup.md     # 项目配置
├── 03-api-specs/               # API接口规范
└── 04-tasks/                   # 任务列表
```

**说明**：
- `README.md` - 面向开源用户的使用文档
- `project-docs/` - 面向开发者的开发过程文档（践行文档驱动开发思想）

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS v4
- **状态管理**: Zustand
- **数据存储**: IndexedDB (浏览器本地存储)
- **图标库**: Lucide React

## 核心理念

### 1. 文档驱动开发

在智能体基座能力由大厂开发好的时代，任务实际表现与上下文管理和提示词强相关。文档是管理项目上下文的最佳形式。

### 2. 共识机制

- AI生成方案文档
- 开发者审阅并修改文档
- 双方达成共识后生成代码
- 维护"共识版本"，减少理解偏差

### 3. 中文环境优化

针对中文开发场景，从界面到文档都采用中文，降低使用门槛。

## 核心模块

### 文档管理模块
- 文档CRUD操作
- 全文搜索
- 标签系统
- 版本历史

### AI上下文生成模块
- 智能文档推荐
- Prompt模板管理
- Token使用量优化

### 共识管理模块
- AI建议记录
- 版本对比
- 变更追踪

## 开发状态

- ✅ 项目初始化
- ✅ 文档系统核心架构
- ✅ Web UI界面原型
- 🔄 文档编辑器增强
- ⏳ Claude Code集成
- ⏳ AI建议功能

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 联系方式

- 项目地址: [https://github.com/z1131/docDD](https://github.com/z1131/docDD)
- Issue: [项目Issue](https://github.com/z1131/docDD/issues)

## License

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 致谢

感谢Anthropic开发的Claude Code，为AI编程工具奠定基础。

---

**让文档成为人类与AI的协作桥梁** 🌉
