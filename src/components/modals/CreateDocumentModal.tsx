import React, { useState, useEffect } from 'react'
import { X, FileText, CheckCircle } from 'lucide-react'
import { CreateFileGuide } from './CreateFileGuide'
import { isFileSystemAPISupported } from '@/lib/filesystem/fileService'

interface CreateDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => void
  existingNames: string[]
  directory: string
}

export function CreateDocumentModal({ isOpen, onClose, onCreate, existingNames, directory }: CreateDocumentModalProps) {
  const [documentName, setDocumentName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [createdDocument, setCreatedDocument] = useState('')
  const [apiSupported, setApiSupported] = useState(false)

  // 重置表单
  const resetForm = () => {
    setDocumentName('')
    setError('')
    setCreatedDocument('')
  }

  // 检测API支持
  useEffect(() => {
    setApiSupported(isFileSystemAPISupported())
  }, [])

  // 关闭时重置
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  // 验证文档名
  const validateName = (name: string): string => {
    if (!name.trim()) {
      return '文档名不能为空'
    }

    if (name.length < 1) {
      return '文档名至少需要1个字符'
    }

    if (name.length > 100) {
      return '文档名不能超过100个字符'
    }

    // 检查特殊字符
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(name)) {
      return '文档名只能包含字母、数字、中文、下划线和点'
    }

    // 检查是否已存在（自动添加.md后缀进行比较）
    const fileName = name.endsWith('.md') ? name : `${name}.md`
    const isTaken = existingNames.some(existing =>
      existing.toLowerCase() === fileName.toLowerCase()
    )

    if (isTaken) {
      return '该文档名已存在'
    }

    return ''
  }

  // 生成文档内容
  const generateDocumentContent = (fileName: string): string => {
    return `# ${fileName}

开始编写你的文档内容...

## 概述

## 详细内容

## 总结

---

*创建时间: ${new Date().toLocaleString('zh-CN')}*
`
  }

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateName(documentName)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const docName = documentName.trim()
      setCreatedDocument(docName)

      // 尝试直接创建
      await onCreate(directory, docName)

      // 如果成功，关闭模态框
      resetForm()
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建失败'

      // 如果是不支持API，显示指导
      if (errorMessage === 'NOT_SUPPORTED') {
        setShowGuide(true)
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理指导关闭
  const handleGuideClose = () => {
    setShowGuide(false)
    resetForm()
    onClose()
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDocumentName(value)

    // 实时验证
    if (value.trim()) {
      const validationError = validateName(value)
      setError(validationError)
    } else {
      setError('')
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText size={16} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">创建新文档</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="documentName" className="block text-sm font-medium text-gray-700 mb-1">
              文档名称
            </label>
            <input
              id="documentName"
              type="text"
              value={documentName}
              onChange={handleInputChange}
              placeholder="输入文档名称（不含.md后缀）"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              autoFocus
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="text-xs text-gray-500">
            <p>文档将在 "{directory}" 目录下创建</p>
            <p>将自动添加.md后缀，支持中英文、数字、下划线和点</p>
            {apiSupported ? (
              <p className="text-green-600 mt-1 flex items-center">
                <CheckCircle size={12} className="mr-1" />
                支持直接创建文件
              </p>
            ) : (
              <p className="text-amber-600 mt-1">⚠️ 浏览器不支持直接创建，将提供操作指导</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!documentName.trim() || !!error || isSubmitting}
              className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{apiSupported ? '创建中...' : '生成指导...'}</span>
                </span>
              ) : (
                apiSupported ? '创建文档' : '获取创建指导'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 创建指导 */}
      <CreateFileGuide
        isOpen={showGuide}
        onClose={handleGuideClose}
        directory={directory}
        fileName={createdDocument}
        fileContent={generateDocumentContent(createdDocument)}
        type="document"
      />
    </div>
  )
}