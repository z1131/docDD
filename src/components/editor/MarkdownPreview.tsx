import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'
import { CodeProps } from 'react-markdown/lib/ast-to-react'
import { ComponentPropsWithoutRef } from 'react'

// 定义类型声明
type CodeComponentProps = CodeProps & ComponentPropsWithoutRef<'code'> & {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-gray max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-li:text-gray-700 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 自定义组件样式
          h1: ({ ...props }) => (
            <h1 className="border-b border-gray-200 pb-2 mb-4" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="border-b border-gray-200 pb-1 mb-3 mt-6" {...props} />
          ),
          a: ({ ...props }) => (
            <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 my-4 text-gray-600 italic" {...props} />
          ),
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
