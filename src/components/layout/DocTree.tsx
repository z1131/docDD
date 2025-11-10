import { FileText, Folder, FolderOpen, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { FileNode } from '@/services/file.service'

interface DocTreeProps {
  nodes: FileNode[]
  onFileClick: (node: FileNode) => void
  level?: number
}

export function DocTree({ nodes, onFileClick, level = 0 }: DocTreeProps) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <DocTreeNode key={node.path} node={node} onFileClick={onFileClick} level={level} />
      ))}
    </div>
  )
}

interface DocTreeNodeProps {
  node: FileNode
  onFileClick: (node: FileNode) => void
  level?: number
}

function DocTreeNode({ node, onFileClick, level = 0 }: DocTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 1) // 第一层默认展开

  const handleClick = () => {
    if (node.type === 'file') {
      onFileClick(node)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div>
      <div
        className={`
          flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors
          ${node.type === 'file' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-gray-100'}
        `}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={handleClick}
        title={node.name}
      >
        {node.type === 'dir' ? (
          <>
            <ChevronRight
              size={14}
              className={`mr-1 text-gray-400 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
            {isExpanded ? (
              <FolderOpen size={16} className="mr-2 text-blue-500" />
            ) : (
              <Folder size={16} className="mr-2 text-gray-500" />
            )}
            <span className="font-medium text-gray-700">{node.name}</span>
          </>
        ) : (
          <>
            <div style={{ width: 14 }} className="mr-1" />
            <FileText size={16} className="mr-2 text-gray-500" />
            <span className="text-gray-700">{node.name}</span>
          </>
        )}
      </div>

      {node.type === 'dir' && isExpanded && node.children && (
        <div className="mt-1">
          <DocTree nodes={node.children} onFileClick={onFileClick} level={level + 1} />
        </div>
      )}
    </div>
  )
}
