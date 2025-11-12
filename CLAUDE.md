# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DocDDD** (面向文档规范的AI开发系统) is a document-driven AI development collaboration platform that manages project context to improve AI programming tool collaboration efficiency. This is a React + TypeScript single-page application with Chinese-localized interface.

## Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5175)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
No testing/linting is currently configured in this project.

## Architecture

### Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS v4 (via PostCSS) for styling
- Zustand for state management
- IndexedDB for local storage via `idb` library
- React Markdown for markdown rendering
- Lucide React for icons

### Project Structure
```
src/
├── components/               # React components
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── editor/          # Document editor components
├── lib/               # Utilities
│   └── storage/       # IndexedDB implementation
├── services/            # Business logic layer
│   ├── document.service.ts    # Document CRUD operations
│   ├── ai-context.service.ts  # AI context generation
│   └── consensus.service.ts   # Consensus tracking
├── store/             # Zustand state stores
│   └── document.store.ts  # Document state management
├── types/               # TypeScript type definitions
├── App.tsx            # Main app component
├── main.tsx           # App entry
└── index.css        # Global styles
```

### Core Patterns

1. **Three-Layer Architecture**:
   - **Presentation Layer** (`components/`): UI components, pure display
   - **Business Logic Layer** (`services/`): Core business logic
   - **Data Access Layer** (`lib/storage/`): IndexedDB operations

2. **State Management**: All state managed through Zustand stores
   - Document state in `store/document.store.ts`
   - Services interact with stores for data flow

3. **Storage**: Pure frontend app using IndexedDB
   - All data stored locally in browser
   - No backend server required
   - See `lib/storage/idb.ts` for DB schema

### Key Services

- **DocumentService**: CRUD operations for documents in IndexedDB
- **AIContextService**: Generate AI context from documents (planned)
- **ConsensusService**: Track AI suggestions and consensus (planned)
- All services are imported and used by components/stores

### Build Configuration

- **Vite Config**: `vite.config.ts` - standard React setup
- **TypeScript**: `tsconfig.json` with path alias `@/*` → `src/*`
- **PostCSS**: `postcss.config.js` with Tailwind v4
- **Tailwind**: Configured via CSS in `src/index.css`

All documentation is in Chinese (`project-docs/` directory), matching the codebase's Chinese interface.

## Development Guidelines

### Document-First Development
在开发本项目时，请遵循以下重要原则：

1. **首先检索project-docs目录下的文档** - 在进行任何开发工作前，先查看project-docs/目录下的相关文档，了解项目需求、设计决策和技术规范。

2. **实时更新文档** - 开发过程中要及时更新相应的文档，确保文档与代码实现保持同步。

3. **使用中文** - 尽量使用中文进行文档编写和代码注释，保持项目的中文本地化特性。