'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Hash, 
  Braces, 
  Brackets,
  Type,
  Eye,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { JsonNode, JsonFilter } from '@/types'
import { JsonAnalyzer } from '@/lib/json-analyzer'
import { toast } from 'react-hot-toast'

interface JsonTreeViewProps {
  data: any
  className?: string
  maxHeight?: string
}

interface TreeNodeProps {
  node: JsonNode
  onToggle: (path: string[]) => void
  onHighlight: (path: string[]) => void
  highlightedPath?: string[]
  searchTerm?: string
}

const TreeNode = ({ 
  node, 
  onToggle, 
  onHighlight,
  highlightedPath,
  searchTerm 
}: TreeNodeProps) => {
  const isHighlighted = highlightedPath && 
    JSON.stringify(highlightedPath) === JSON.stringify(node.path)

  const hasChildren = node.children && node.children.length > 0
  const isExpanded = node.isExpanded

  const getTypeIcon = (type: JsonNode['type']) => {
    switch (type) {
      case 'object': return <Braces className="w-3 h-3 text-blue-500" />
      case 'array': return <Brackets className="w-3 h-3 text-green-500" />
      case 'string': return <Type className="w-3 h-3 text-purple-500" />
      case 'number': return <Hash className="w-3 h-3 text-orange-500" />
      case 'boolean': return <Eye className="w-3 h-3 text-cyan-500" />
      case 'null': return <div className="w-3 h-3 rounded-full bg-gray-400" />
      default: return null
    }
  }

  const getValuePreview = (node: JsonNode): string => {
    if (hasChildren) {
      return JsonAnalyzer.getNodeValue(node)
    }
    return JsonAnalyzer.getNodeValue(node)
  }

  const copyPath = () => {
    const path = JsonAnalyzer.copyPath(node.path)
    navigator.clipboard.writeText(path)
    toast.success('Path copied to clipboard')
  }

  const copyValue = () => {
    const value = node.type === 'string' ? node.value : JSON.stringify(node.value, null, 2)
    navigator.clipboard.writeText(value)
    toast.success('Value copied to clipboard')
  }

  const highlightSearchTerm = (text: string, searchTerm?: string) => {
    if (!searchTerm || !text) return text
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </span>
      ) : part
    )
  }

  return (
    <div className="select-none">
      <div 
        className={cn(
          'flex items-center space-x-2 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer group',
          isHighlighted && 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
        )}
        onClick={() => onHighlight(node.path)}
        style={{ paddingLeft: `${(node.depth * 20) + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="w-4 h-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.path)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
        ) : (
          <div className="w-4" />
        )}

        {/* Type Icon */}
        <div className="flex-shrink-0">
          {getTypeIcon(node.type)}
        </div>

        {/* Key */}
        <span className="font-medium text-foreground">
          {highlightSearchTerm(node.key, searchTerm)}
        </span>

        {/* Separator */}
        <span className="text-muted-foreground">:</span>

        {/* Value */}
        <span className={cn(
          'flex-1 truncate',
          node.type === 'string' && 'text-green-600 dark:text-green-400',
          node.type === 'number' && 'text-blue-600 dark:text-blue-400',
          node.type === 'boolean' && 'text-purple-600 dark:text-purple-400',
          node.type === 'null' && 'text-gray-500 italic'
        )}>
          {highlightSearchTerm(getValuePreview(node), searchTerm)}
        </span>

        {/* Type Badge */}
        <Badge variant="outline" className="text-xs opacity-60 group-hover:opacity-100">
          {node.type}
        </Badge>

        {/* Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={(e) => {
              e.stopPropagation()
              copyPath()
            }}
            title="Copy path"
          >
            <Copy className="w-3 h-3" />
          </Button>
          {!hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={(e) => {
                e.stopPropagation()
                copyValue()
              }}
              title="Copy value"
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNode
              key={`${child.key}-${index}`}
              node={child}
              onToggle={onToggle}
              onHighlight={onHighlight}
              highlightedPath={highlightedPath}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function JsonTreeView({ data, className, maxHeight = '600px' }: JsonTreeViewProps) {
  const [filter, setFilter] = useState<JsonFilter>({
    searchTerm: '',
    keyFilter: '',
    typeFilter: 'all',
    pathFilter: ''
  })
  const [highlightedPath, setHighlightedPath] = useState<string[]>()
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const rootNode = useMemo(() => {
    return JsonAnalyzer.parseToTree(data, 'root')
  }, [data])

  const filteredTree = useMemo(() => {
    if (!filter.searchTerm && !filter.keyFilter && filter.typeFilter === 'all' && !filter.pathFilter) {
      return rootNode
    }
    return JsonAnalyzer.filterTree(rootNode, filter)
  }, [rootNode, filter])

  const handleToggle = (path: string[]) => {
    const pathKey = path.join('.')
    const newExpanded = new Set(expandedNodes)
    
    if (newExpanded.has(pathKey)) {
      newExpanded.delete(pathKey)
    } else {
      newExpanded.add(pathKey)
    }
    
    setExpandedNodes(newExpanded)
    
    const node = JsonAnalyzer.findNodeByPath(rootNode, path)
    if (node) {
      node.isExpanded = !node.isExpanded
    }
  }

  const handleHighlight = (path: string[]) => {
    setHighlightedPath(path)
  }

  const expandAll = () => {
    const allNodes = JsonAnalyzer.flattenTree(rootNode)
    const allPaths = allNodes
      .filter(node => node.children && node.children.length > 0)
      .map(node => node.path.join('.'))
    
    setExpandedNodes(new Set(allPaths))
    
    allNodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.isExpanded = true
      }
    })
  }

  const collapseAll = () => {
    setExpandedNodes(new Set())
    
    const allNodes = JsonAnalyzer.flattenTree(rootNode)
    allNodes.forEach(node => {
      node.isExpanded = false
    })
  }

  if (!filteredTree) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No items match the current filter
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Search and Controls */}
      <div className="flex items-center space-x-2 mb-4 p-3 border rounded-lg bg-muted/30">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search keys and values..."
            value={filter.searchTerm}
            onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="pl-10"
          />
        </div>
        
        <Button variant="outline" size="sm" onClick={expandAll}>
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          Collapse All
        </Button>
      </div>

      {/* Tree */}
      <div 
        className="border rounded-lg bg-background overflow-auto"
        style={{ maxHeight }}
      >
        <TreeNode
          node={filteredTree}
          onToggle={handleToggle}
          onHighlight={handleHighlight}
          highlightedPath={highlightedPath}
          searchTerm={filter.searchTerm}
        />
      </div>

      {/* Path Display */}
      {highlightedPath && (
        <div className="mt-2 p-2 bg-muted rounded text-sm">
          <span className="font-medium">Path: </span>
          <code className="bg-background px-2 py-1 rounded">
            {JsonAnalyzer.copyPath(highlightedPath)}
          </code>
        </div>
      )}
    </div>
  )
}