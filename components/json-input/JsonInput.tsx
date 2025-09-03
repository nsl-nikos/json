'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Globe, 
  Code, 
  FileText,
  History,
  Trash2
} from 'lucide-react'
import { JsonDocument, JsonInputMethod } from '@/types'
import FileUpload from './FileUpload'
import UrlFetch from './UrlFetch'
import JsonEditor from './JsonEditor'

interface JsonInputProps {
  onDocumentLoad: (document: JsonDocument, method: JsonInputMethod) => void
  className?: string
}

interface RecentDocument extends JsonDocument {
  method: JsonInputMethod
  loadedAt: Date
}

export default function JsonInput({ onDocumentLoad, className }: JsonInputProps) {
  const [activeTab, setActiveTab] = useState('upload')
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([])

  const handleDocumentLoad = (document: JsonDocument, method: JsonInputMethod) => {
    const recentDoc: RecentDocument = {
      ...document,
      method,
      loadedAt: new Date()
    }
    
    setRecentDocs(prev => {
      const filtered = prev.filter(doc => doc.id !== document.id)
      return [recentDoc, ...filtered].slice(0, 10) // Keep last 10
    })

    onDocumentLoad(document, method)
  }

  const loadRecentDocument = (doc: RecentDocument) => {
    onDocumentLoad(doc, doc.method)
  }

  const clearRecentDocs = () => {
    setRecentDocs([])
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getMethodIcon = (method: JsonInputMethod['type']) => {
    switch (method) {
      case 'file': return <Upload className="w-3 h-3" />
      case 'url': return <Globe className="w-3 h-3" />
      case 'manual': return <Code className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>URL</span>
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center space-x-2">
            <Code className="w-4 h-4" />
            <span>Editor</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 space-y-4">
          <TabsContent value="upload" className="mt-0">
            <FileUpload 
              onFileLoad={(doc) => handleDocumentLoad(doc, { type: 'file' })}
            />
          </TabsContent>

          <TabsContent value="url" className="mt-0">
            <UrlFetch 
              onJsonLoad={(doc) => handleDocumentLoad(doc, { type: 'url' })}
            />
          </TabsContent>

          <TabsContent value="editor" className="mt-0">
            <JsonEditor 
              onJsonLoad={(doc) => handleDocumentLoad(doc, { type: 'manual' })}
            />
          </TabsContent>

          {/* Recent Documents */}
          {recentDocs.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Recent Documents</h4>
                  <Badge variant="secondary" className="text-xs">
                    {recentDocs.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentDocs}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recentDocs.map((doc) => (
                  <div
                    key={`${doc.id}-${doc.loadedAt.getTime()}`}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => loadRecentDocument(doc)}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getMethodIcon(doc.method.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <span>{doc.loadedAt.toLocaleTimeString()}</span>
                          {doc.method.source && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-32">{doc.method.source}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={doc.isValid ? "default" : "destructive"}
                      className="text-xs ml-2 flex-shrink-0"
                    >
                      {doc.isValid ? "Valid" : "Error"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}