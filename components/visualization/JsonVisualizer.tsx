'use client'

import { useState, useMemo, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  TreePine, 
  Table2, 
  FileText, 
  BarChart3,
  Clock,
  Zap
} from 'lucide-react'
import { JsonDocument, JsonStats, VisualizationMode } from '@/types'
import { JsonAnalyzer } from '@/lib/json-analyzer'
import JsonTreeView from './JsonTreeView'
import JsonTableView from './JsonTableView'
import JsonRawView from './JsonRawView'

interface JsonVisualizerProps {
  document: JsonDocument
  className?: string
  viewMode?: 'tree' | 'table' | 'raw'
  hideControls?: boolean
}

export default function JsonVisualizer({ 
  document, 
  className, 
  viewMode = 'tree', 
  hideControls = false 
}: JsonVisualizerProps) {
  const [activeView, setActiveView] = useState(viewMode)
  
  useEffect(() => {
    setActiveView(viewMode)
  }, [viewMode])
  
  const [visualizationMode] = useState<VisualizationMode>({
    type: 'tree',
    settings: {
      showTypes: true,
      showPath: true,
      maxDepth: 10,
      collapseLargeArrays: true,
      arrayThreshold: 50
    }
  })

  const stats = useMemo(() => {
    if (!document.content || !document.isValid) return null
    return JsonAnalyzer.getStats(document.content)
  }, [document.content, document.isValid])

  const parseTime = useMemo(() => {
    const start = performance.now()
    if (document.content && document.isValid) {
      JsonAnalyzer.parseToTree(document.content)
    }
    const end = performance.now()
    return Math.round((end - start) * 100) / 100
  }, [document.content, document.isValid])

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'tree': return <TreePine className="w-4 h-4" />
      case 'table': return <Table2 className="w-4 h-4" />
      case 'raw': return <FileText className="w-4 h-4" />
      default: return null
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getComplexityLevel = (stats: JsonStats): { level: string; color: string } => {
    const complexity = stats.maxDepth * 2 + stats.totalValues / 100
    
    if (complexity < 5) return { level: 'Simple', color: 'text-green-600 dark:text-green-400' }
    if (complexity < 15) return { level: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' }
    if (complexity < 30) return { level: 'Complex', color: 'text-orange-600 dark:text-orange-400' }
    return { level: 'Very Complex', color: 'text-red-600 dark:text-red-400' }
  }

  if (!document.isValid) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">JSON Parse Error</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            {document.errorMessage || 'The JSON data could not be parsed.'}
          </p>
          
          <div className="space-y-2 mb-4">
            <Badge variant="destructive">Parse Failed</Badge>
            <div className="text-xs text-muted-foreground">
              File: {document.title} ({formatFileSize(document.size)})
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <h4 className="font-medium mb-2">Common fixes:</h4>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Remove trailing commas in objects/arrays</li>
              <li>Ensure all strings are properly quoted</li>
              <li>Check for extra content after valid JSON</li>
              <li>Verify the file contains valid JSON data</li>
            </ul>
          </div>
        </div>
      </Card>
    )
  }

  if (!document.content) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Content</h3>
          <p className="text-muted-foreground">
            No JSON content to display.
          </p>
        </div>
      </Card>
    )
  }

  const complexity = stats ? getComplexityLevel(stats) : { level: 'Unknown', color: 'text-muted-foreground' }

  return (
    <div className={className}>
      {/* Header with Document Info */}
      <Card className="p-4 mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate mb-2">{document.title}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Modified: {document.lastModified.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-4 h-4" />
                <span>Size: {formatFileSize(document.size)}</span>
              </div>

              {stats && (
                <>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Parse: {parseTime}ms</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span>Complexity:</span>
                    <span className={complexity.color}>{complexity.level}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Badge variant="default">Valid JSON</Badge>
            {document.errorMessage && (
              <Badge variant="secondary" className="text-xs">
                {document.errorMessage.includes('JSONL') ? 'JSONL' : 'Warning'}
              </Badge>
            )}
            {stats && (
              <Badge variant="outline">
                {stats.totalValues} values
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {stats.objectCount}
              </div>
              <div className="text-xs text-muted-foreground">Objects</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {stats.arrayCount}
              </div>
              <div className="text-xs text-muted-foreground">Arrays</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {stats.totalKeys}
              </div>
              <div className="text-xs text-muted-foreground">Keys</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {stats.maxDepth}
              </div>
              <div className="text-xs text-muted-foreground">Max Depth</div>
            </div>
          </div>
        )}
      </Card>

      {/* Visualization Tabs */}
      <Card className="p-4">
        <Tabs value={activeView} onValueChange={setActiveView}>
          {!hideControls && (
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="tree" className="flex items-center space-x-2">
                {getViewIcon('tree')}
                <span>Tree View</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center space-x-2">
                {getViewIcon('table')}
                <span>Table View</span>
              </TabsTrigger>
              <TabsTrigger value="raw" className="flex items-center space-x-2">
                {getViewIcon('raw')}
                <span>Raw JSON</span>
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="tree" className="mt-0">
            <JsonTreeView 
              data={document.content}
              maxHeight="calc(100vh - 400px)"
            />
          </TabsContent>

          <TabsContent value="table" className="mt-0">
            <JsonTableView 
              data={document.content}
              maxHeight="calc(100vh - 400px)"
            />
          </TabsContent>

          <TabsContent value="raw" className="mt-0">
            <JsonRawView 
              data={document.content}
              maxHeight="calc(100vh - 400px)"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}