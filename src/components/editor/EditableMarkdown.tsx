import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import { CodeProps } from 'react-markdown/lib/ast-to-react'
import { ComponentPropsWithoutRef } from 'react'
import { Edit3, Check, X } from 'lucide-react'

// 定义类型声明
type CodeComponentProps = CodeProps & ComponentPropsWithoutRef<'code'> & {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

interface EditableMarkdownProps {
  content: string
  onChange: (content: string) => void
  onSave?: () => void
  isEditable?: boolean
}

export function EditableMarkdown({ content, onChange, onSave, isEditable = true }: EditableMarkdownProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [editingElement, setEditingElement] = useState<HTMLElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditContent(content)
  }, [content])

  // 双击开始编辑
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isEditable) return

    const target = e.target as HTMLElement
    if (target.tagName === 'A' || target.tagName === 'CODE' || target.tagName === 'PRE') {
      return // 链接和代码块不支持双击编辑
    }

    setIsEditing(true)
    setEditingElement(target)
  }

  // 保存编辑
  const handleSave = () => {
    onChange(editContent)
    setIsEditing(false)
    setEditingElement(null)
    onSave?.()
  }

  // 取消编辑
  const handleCancel = () => {
    setEditContent(content)
    setIsEditing(false)
    setEditingElement(null)
  }

  // 键盘快捷键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editContent, isEditing])

  // 编辑模式下的textarea
  if (isEditing && editingElement) {
    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-4 font-mono text-sm border-2 border-blue-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[200px]"
          autoFocus
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={handleSave}
            className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            title="保存 (Ctrl+Enter)"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            title="取消 (Esc)"
          >
            <X size={16} />
          </button>
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          Ctrl+Enter 保存 | Esc 取消
        </div>
      </div>
    )
  }

  // 预览模式
  return (
    <div className="prose prose-gray max-w-none prose-h1:text-3xl prose-h1:font-bold prose-h2:text-2xl prose-h2:font-bold prose-h3:text-xl prose-h3:font-semibold prose-p:text-gray-700 prose-li:text-gray-700 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded relative hover:bg-blue-50">
      {isEditable && (
        <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
            title="双击文本或点击编辑 (双击任意段落开始编辑)"
          >
            <Edit3 size={16} />
          </button>
        </div>
      )}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 段落支持双击编辑
          p: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <p>{children}</p>
            </div>
          ),

          // 标题支持双击编辑
          h1: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <h1>{children}</h1>
            </div>
          ),

          h2: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <h2>{children}</h2>
            </div>
          ),

          h3: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <h3>{children}</h3>
            </div>
          ),

          h4: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <h4>{children}</h4>
            </div>
          ),

          h5: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <h5>{children}</h5>
            </div>
          ),

          h6: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <h6>{children}</h6>
            </div>
          ),

          // 列表支持双击编辑
          ul: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <ul>{children}</ul>
            </div>
          ),

          ol: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <ol>{children}</ol>
            </div>
          ),

          li: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <li>{children}</li>
            </div>
          ),

          // 引用块支持双击编辑
          blockquote: ({ children, ...props }) => (
            <div
              {...props}
              onDoubleClick={handleDoubleClick}
              className={`${props.className || ''} ${!isEditing ? 'cursor-text' : ''} transition-colors`}
            >
              <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic">
                {children}
              </blockquote>
            </div>
          ),

          // 表格保持原有样式，不支持编辑
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-gray-300" {...props} />
            </div>
          ),

          th: ({ ...props }) => (
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold" {...props} />
          ),

          td: ({ ...props }) => (
            <td className="border border-gray-300 px-4 py-2" {...props} />
          ),

          // 代码块保持原有样式，不支持编辑
          pre: ({ ...props }) => (
            <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto" {...props} />
          ),

          code: ({ inline, className, children, ...props }: CodeComponentProps) => {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <code className={`${className || ''}`} {...props}>
                {children}
              </code>
            ) : (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },

          // 链接保持原有样式，不支持编辑
          a: ({ ...props }) => (
            <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
          ),
        }}
      >
        {editContent}
      </ReactMarkdown>
    </div>
  )
}