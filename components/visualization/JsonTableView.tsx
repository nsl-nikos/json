'use client'

import { useMemo, useState } from 'react'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Copy, Search, ArrowUpDown, Filter } from 'lucide-react'
import { JsonNode } from '@/types'
import { JsonAnalyzer } from '@/lib/json-analyzer'
import { toast } from 'react-hot-toast'

interface JsonTableViewProps {
  data: any
  className?: string
  maxHeight?: string
}

interface FlattenedRow {
  path: string
  key: string
  value: any
  type: JsonNode['type']
  depth: number
  fullPath: string[]
}

type SortField = 'path' | 'key' | 'value' | 'type' | 'depth'
type SortDirection = 'asc' | 'desc'

export default function JsonTableView({ data, className, maxHeight = '600px' }: JsonTableViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('path')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [typeFilter, setTypeFilter] = useState<JsonNode['type'] | 'all'>('all')

  const flattenedData = useMemo(() => {
    const rootNode = JsonAnalyzer.parseToTree(data, 'root')
    const flatNodes = JsonAnalyzer.flattenTree(rootNode)
    
    return flatNodes.map((node): FlattenedRow => ({
      path: JsonAnalyzer.getPathString(node.path),
      key: node.key,
      value: node.value,
      type: node.type,
      depth: node.depth,
      fullPath: node.path
    }))
  }, [data])

  const filteredAndSortedData = useMemo(() => {
    let filtered = flattenedData

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(row => 
        row.path.toLowerCase().includes(term) ||
        row.key.toLowerCase().includes(term) ||
        (row.type === 'string' && String(row.value).toLowerCase().includes(term))
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(row => row.type === typeFilter)
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'value') {
        aValue = String(aValue)
        bValue = String(bValue)
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortDirection === 'asc' ? comparison : -comparison
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [flattenedData, searchTerm, sortField, sortDirection, typeFilter])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const copyValue = (value: any) => {
    const textValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    navigator.clipboard.writeText(textValue)
    toast.success('Value copied to clipboard')
  }

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(`$.${path.split('.').slice(1).join('.')}`)
    toast.success('Path copied to clipboard')
  }

  const getValueDisplay = (row: FlattenedRow): string => {
    if (row.type === 'object' || row.type === 'array') {
      return JsonAnalyzer.getNodeValue({
        key: row.key,
        value: row.value,
        type: row.type,
        path: row.fullPath,
        depth: row.depth,
        children: row.type === 'array' ? row.value : undefined
      })
    }
    
    if (row.type === 'string') {
      return `"${row.value}"`
    }
    
    return String(row.value)
  }

  const getTypeColor = (type: JsonNode['type']) => {
    switch (type) {
      case 'object': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'array': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'string': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'number': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'boolean': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
      case 'null': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const uniqueTypes = Array.from(new Set(flattenedData.map(row => row.type)))

  const SortableHeader = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="w-3 h-3" />
        {sortField === field && (
          <span className="text-xs">
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </TableHead>
  )

  return (
    <div className={className}>
      {/* Controls */}
      <div className="flex items-center space-x-4 mb-4 p-3 border rounded-lg bg-muted/30">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search paths, keys, and values..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as JsonNode['type'] | 'all')}
            className="px-3 py-1 border rounded-md bg-background text-sm"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <Badge variant="outline" className="text-xs">
          {filteredAndSortedData.length} rows
        </Badge>
      </div>

      {/* Table */}
      <div 
        className="border rounded-lg bg-background overflow-auto"
        style={{ maxHeight }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="path">Path</SortableHeader>
              <SortableHeader field="key">Key</SortableHeader>
              <SortableHeader field="value">Value</SortableHeader>
              <SortableHeader field="type">Type</SortableHeader>
              <SortableHeader field="depth">Depth</SortableHeader>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((row, index) => (
              <TableRow key={`${row.path}-${index}`} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs">
                  <code className="bg-muted px-2 py-1 rounded">
                    {row.path}
                  </code>
                </TableCell>
                <TableCell className="font-medium">
                  {row.key}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={getValueDisplay(row)}>
                    {getValueDisplay(row)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs ${getTypeColor(row.type)}`}>
                    {row.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 bg-muted rounded mr-2"
                      style={{ marginLeft: `${row.depth * 8}px` }}
                    />
                    {row.depth}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => copyPath(row.path)}
                      title="Copy path"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => copyValue(row.value)}
                      title="Copy value"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAndSortedData.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No data matches the current filters
          </div>
        )}
      </div>
    </div>
  )
}