import React from 'react'
import { Save, RotateCcw, Settings } from 'lucide-react'

interface HeaderProps {
  currentDocument?: {
    title: string
    hasChanges?: boolean
  }
  onSave?: () => void
  onReset?: () => void
}

export function Header({ currentDocument, onSave, onReset }: HeaderProps) {
  return (
    <div className="px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">Dodo</h1>
        {currentDocument && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">当前文档:</span>
            <span className="text-sm font-medium text-gray-900">
              {currentDocument.title}
            </span>
            {currentDocument.hasChanges && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                有未保存的更改
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {currentDocument && (
          <>
            <button
              onClick={onSave}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!currentDocument.hasChanges}
            >
              <Save size={16} />
              <span>保存</span>
            </button>
            <button
              onClick={onReset}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              <span>重置</span>
            </button>
          </>
        )}
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings size={18} />
        </button>
      </div>
    </div>
  )
}