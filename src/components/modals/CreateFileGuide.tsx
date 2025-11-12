import React, { useState } from 'react'
import { X, Download, Copy, Terminal } from 'lucide-react'

interface CreateFileGuideProps {
  isOpen: boolean
  onClose: () => void
  directory: string
  fileName: string
  fileContent: string
  type: 'directory' | 'document'
}

export function CreateFileGuide({
  isOpen,
  onClose,
  directory,
  fileName,
  fileContent,
  type
}: CreateFileGuideProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // 生成创建文件的命令
  const generateCommand = () => {
    if (type === 'directory') {
      return `mkdir -p "project-docs/${directory}"`
    } else {
      const filePath = `project-docs/${directory}/${fileName}.md`
      return `touch "${filePath}" && echo '${fileContent.replace(/'/g, "'\"'\"'")}' > "${filePath}"`
    }
  }

  const command = generateCommand()

  // 复制命令到剪贴板
  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  // 下载文件
  const handleDownloadFile = () => {
    if (type === 'document') {
      const blob = new Blob([fileContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Terminal size={16} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              创建{type === 'directory' ? '目录' : '文档'}指导
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* 文件信息 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">要创建的{type === 'directory' ? '目录' : '文档'}:</h3>
            <p className="text-sm text-blue-800 font-mono">
              {type === 'directory' ? `project-docs/${directory}` : `project-docs/${directory}/${fileName}.md`}
            </p>
          </div>

          {type === 'document' && (
            /* 文件内容预览 */
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">文件内容预览:</h3>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {fileContent}
                </pre>
              </div>
            </div>
          )}

          {/* 创建方法说明 */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">创建方法:</h3>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>由于浏览器安全限制，前端无法直接创建文件。请选择以下方法之一：</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>使用下面的命令在终端中创建</li>
                {type === 'document' && <li>点击"下载文件"按钮下载，然后移动到正确位置</li>}
                <li>手动在文件管理器中创建</li>
              </ol>
            </div>
          </div>

          {/* 命令 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">终端命令:</h3>
              <button
                onClick={handleCopyCommand}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Copy size={14} />
                <span>{copied ? '已复制!' : '复制命令'}</span>
              </button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm">
              {command}
            </div>
          </div>

          {type === 'document' && (
            /* 下载按钮 */
            <div>
              <button
                onClick={handleDownloadFile}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <Download size={16} />
                <span>下载 {fileName}.md</span>
              </button>
            </div>
          )}

          {/* 操作提示 */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p><strong>提示：</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>创建文件后，点击"刷新"按钮可以看到新创建的{type === 'directory' ? '目录' : '文档'}</li>
              <li>创建目录后，需要在目录中创建文档才能看到内容</li>
              <li>确保在项目根目录下执行命令</li>
            </ul>
          </div>

          {/* 关闭按钮 */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}