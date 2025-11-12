import React, { useState, useEffect } from 'react'
import { X, FolderPlus, RefreshCw, CheckCircle } from 'lucide-react'
import { CreateFileGuide } from './CreateFileGuide'
import { isFileSystemAPISupported } from '@/lib/filesystem/fileService'

interface CreateDirectoryModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string) => void
  existingNames: string[]
}

export function CreateDirectoryModal({ isOpen, onClose, onCreate, existingNames }: CreateDirectoryModalProps) {
  const [directoryName, setDirectoryName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [createdDirectory, setCreatedDirectory] = useState('')
  const [apiSupported, setApiSupported] = useState(false)

  // 重置表单
  const resetForm = () => {
    setDirectoryName('')
    setError('')
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

  // 验证目录名
  const validateName = (name: string): string => {
    if (!name.trim()) {
      return '目录名不能为空'
    }

    if (name.length < 1) {
      return '目录名至少需要1个字符'
    }

    if (name.length > 50) {
      return '目录名不能超过50个字符'
    }

    // 检查特殊字符
    if (!/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(name)) {
      return '目录名只能包含字母、数字、中文、下划线和点'
    }

    // 检查是否已存在
    const normalizedName = name.toLowerCase()
    const isTaken = existingNames.some(existing =>
      existing.toLowerCase() === normalizedName
    )

    if (isTaken) {
      return '该目录名已存在'
    }

    return ''
  }

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateName(directoryName)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const dirName = directoryName.trim()
      setCreatedDirectory(dirName)

      // 尝试直接创建
      await onCreate(dirName)

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
    setDirectoryName(value)

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
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderPlus size={16} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">创建新目录</h2>
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
            <label htmlFor="directoryName" className="block text-sm font-medium text-gray-700 mb-1">
              目录名称
            </label>
            <input
              id="directoryName"
              type="text"
              value={directoryName}
              onChange={handleInputChange}
              placeholder="输入目录名称"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            <p>目录将在 project-docs 目录下创建</p>
            <p>支持中英文、数字、下划线和点</p>
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
              disabled={!directoryName.trim() || !!error || isSubmitting}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{apiSupported ? '创建中...' : '生成指导...'}</span>
                </span>
              ) : (
                apiSupported ? '创建目录' : '获取创建指导'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 创建指导 */}
      <CreateFileGuide
        isOpen={showGuide}
        onClose={handleGuideClose}
        directory={createdDirectory}
        fileName=""
        fileContent=""
        type="directory"
      />
    </div>
  )
}