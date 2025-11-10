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
    <div className="max-w-4xl mx-auto p-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 自定义组件样式
          h1: ({ ...props }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 border-b border-gray-200 pb-2" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl font-bold mt-5 mb-3 border-b border-gray-200 pb-1" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
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
