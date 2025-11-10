# 项目初始化与技术栈配置

## 当前项目状态（2025-11-10）
- ✓ React + TypeScript + Vite 项目已创建
- ✓ 开发文档框架已建立
- ⏳ 待配置：Tailwind CSS、状态管理、路由等

## 待安装依赖

### 核心依赖
```bash
# UI & Styling
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/typography  # Markdown排版优化

# State Management
npm install zustand

# Routing
npm install react-router-dom

# Markdown & Editor
npm install @markdoc/markdoc @markdoc/react
npm install @monaco-editor/react  # 代码编辑器（Markdown编辑）

# IndexedDB Wrapper
npm install idb  # 简化IndexedDB操作

# Utils
npm install clsx  # className拼接
npm install lucide-react  # 图标库（轻量）
```

### 开发依赖
```bash
npm install -D @types/node  # Node.js类型定义
```

---

## 配置文件清单

### 1. Tailwind CSS 配置
**文件**：`tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

**文件**：`postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**文件**：`src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### 2. TypeScript 配置优化
**文件**：`tsconfig.json`（优化配置）
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
