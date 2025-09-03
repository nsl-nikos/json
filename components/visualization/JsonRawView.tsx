'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Copy, 
  Download, 
  Search, 
  Minimize2, 
  Maximize2,
  Eye,
  EyeOff
} from 'lucide-react'
import { JsonStats } from '@/types'
import { JsonAnalyzer } from '@/lib/json-analyzer'
import { toast } from 'react-hot-toast'

interface JsonRawViewProps {
  data: any
  className?: string
  maxHeight?: string
}

export default function JsonRawView({ data, className, maxHeight = '600px' }: JsonRawViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isMinified, setIsMinified] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(true)

  const stats = useMemo(() => JsonAnalyzer.getStats(data), [data])
  
  const formattedJson = useMemo(() => {
    return isMinified 
      ? JSON.stringify(data) 
      : JSON.stringify(data, null, 2)
  }, [data, isMinified])

  const highlightedJson = useMemo(() => {
    if (!searchTerm) return formattedJson

    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escapedTerm})`, 'gi')
    
    return formattedJson.replace(regex, (match) => 
      `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match}</mark>`
    )
  }, [formattedJson, searchTerm])

  const lines = formattedJson.split('\n')

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJson)
    toast.success('JSON copied to clipboard')
  }

  const downloadAsFile = () => {
    const blob = new Blob([formattedJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('JSON downloaded')
  }

  const getFileSize = (content: string): string => {
    const bytes = new Blob([content]).size
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const StatItem = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="text-center">
      <div className={`text-lg font-bold ${color}`}>{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )

  return (
    <div className={className}>
      {/* Controls */}
      <div className="space-y-3 mb-4 p-3 border rounded-lg bg-muted/30">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search in JSON content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMinified(!isMinified)}
          >
            {isMinified ? (
              <>
                <Maximize2 className="w-4 h-4 mr-1" />
                Pretty
              </>
            ) : (
              <>
                <Minimize2 className="w-4 h-4 mr-1" />
                Minify
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
          >
            {showLineNumbers ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Hide Lines
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Show Lines
              </>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>

          <Button variant="outline" size="sm" onClick={downloadAsFile}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-4 p-3 bg-background rounded border">
          <StatItem label="Objects" value={stats.objectCount} color="text-blue-600 dark:text-blue-400" />
          <StatItem label="Arrays" value={stats.arrayCount} color="text-green-600 dark:text-green-400" />
          <StatItem label="Keys" value={stats.totalKeys} color="text-purple-600 dark:text-purple-400" />
          <StatItem label="Values" value={stats.totalValues} color="text-orange-600 dark:text-orange-400" />
          <StatItem label="Depth" value={stats.maxDepth} color="text-cyan-600 dark:text-cyan-400" />
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{getFileSize(formattedJson)}</div>
            <div className="text-xs text-muted-foreground">Size</div>
          </div>
        </div>

        {/* Type Distribution */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Types:</span>
          {Object.entries(stats.dataTypes).map(([type, count]) => {
            if (count === 0) return null
            
            const colors: Record<string, string> = {
              object: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
              array: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
              string: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
              number: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
              boolean: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
              null: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }

            return (
              <Badge key={type} className={`text-xs ${colors[type] || ''}`}>
                {type}: {count}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* JSON Display */}
      <div 
        className="border rounded-lg bg-background overflow-auto font-mono text-sm"
        style={{ maxHeight }}
      >
        <div className="relative">
          {showLineNumbers && !isMinified ? (
            <div className="flex">
              {/* Line Numbers */}
              <div className="bg-muted/50 px-3 py-4 text-muted-foreground text-right border-r select-none min-w-[3rem]">
                {lines.map((_, index) => (
                  <div key={index} className="leading-6">
                    {index + 1}
                  </div>
                ))}
              </div>
              
              {/* Content */}
              <div className="flex-1 p-4 overflow-x-auto">
                <pre 
                  className="whitespace-pre-wrap leading-6"
                  dangerouslySetInnerHTML={{ __html: highlightedJson }}
                />
              </div>
            </div>
          ) : (
            <div className="p-4">
              <pre 
                className="whitespace-pre-wrap leading-6"
                dangerouslySetInnerHTML={{ __html: highlightedJson }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className="mt-2 text-sm text-muted-foreground">
          {formattedJson.toLowerCase().includes(searchTerm.toLowerCase()) 
            ? `Found "${searchTerm}" in JSON content`
            : `No matches found for "${searchTerm}"`
          }
        </div>
      )}
    </div>
  )
}