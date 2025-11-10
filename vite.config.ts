import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // 配置代理，让project-docs可以通过HTTP访问
    fs: {
      allow: ['..'] // 允许访问上级目录（用于访问project-docs）
    }
  }
})
