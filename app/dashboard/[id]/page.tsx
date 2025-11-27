'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileJson, 
  Users, 
  Zap,
  ArrowRight,
  Play,
  Plus,
  TreePine,
  BarChart3,
  Save,
  FolderOpen,
  Trash2,
  Edit3,
  Upload,
  Globe,
  ArrowLeft,
  Settings,
  Share2

} from 'lucide-react'
import { JsonInput } from '@/components/json-input'
import { JsonVisualizer, JsonCanvasView } from '@/components/visualization'
import { CollaborationPanel, UserCursors } from '@/components/collaboration'
import { JsonDocument, JsonInputMethod, Workspace, WorkspaceDocument } from '@/types'
import { useRealtime } from '@/hooks/use-realtime'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface WindowWithCanvasControls extends Window {
  canvasControls?: {
    resetZoom: () => void
    fitToScreen: () => void
    reheat: () => void
  }
}

export default function WorkspaceDashboard() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params?.id as string
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([])
  const [currentDocument, setCurrentDocument] = useState<JsonDocument | null>(null)
  const [documentMethod, setDocumentMethod] = useState<JsonInputMethod | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string } } | null>(null)
  const [activeViewMode, setActiveViewMode] = useState<'tree' | 'table' | 'raw' | 'canvas'>('canvas')
  const [selectedCanvasNode, setSelectedCanvasNode] = useState<{ color?: string; label?: string; type?: string; path?: string[]; depth?: number; value?: unknown; children?: unknown[] } | null>(null)
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true)
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)

  const supabase = createClient()
  
  const loadWorkspace = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single()

      if (error) throw error
      
      const mappedWorkspace = {
        id: data.id,
        name: data.name,
        description: data.description,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        isShared: data.is_shared,
        lastAccessedAt: data.last_accessed_at ? new Date(data.last_accessed_at) : undefined
      }
      
      setWorkspace(mappedWorkspace)
    } catch (error) {
      console.error('Error loading workspace:', error)
      toast.error('Workspace not found')
      router.push('/dashboard')
    }
  }, [workspaceId, supabase, router])

  const loadDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      
      const mappedDocuments = data?.map(doc => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        workspaceId: doc.workspace_id,
        userId: doc.user_id,
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at),
        isPublic: doc.is_public,
        fileSize: doc.file_size,
        inputMethod: doc.input_method,
        roomId: doc.room_id
      })) || []
      
      setDocuments(mappedDocuments)
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    }
  }, [workspaceId, supabase])

  useEffect(() => {
    const initialize = async () => {
      setIsLoadingWorkspace(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user && workspaceId) {
        await Promise.all([loadWorkspace(), loadDocuments()])
      }
      setIsLoadingWorkspace(false)
    }
    initialize()
  }, [workspaceId, loadWorkspace, loadDocuments, supabase.auth])

  // Initialize realtime collaboration (has side effects)
  useRealtime({
    roomId: roomId || '',
    userId: user?.id || '',
    userName: user?.user_metadata?.name || user?.email || 'Anonymous'
  })

  const handleDocumentLoad = (document: JsonDocument, method: JsonInputMethod) => {
    setCurrentDocument(document)
    setDocumentMethod(method)
    
    if (document.isValid) {
      toast.success(`JSON loaded successfully (${(document.size / 1024).toFixed(1)} KB)`)
    } else {
      toast.error(`Failed to load JSON: ${document.errorMessage}`)
    }
  }

  const startCollaboration = async () => {
    if (!currentDocument || !user) {
      toast.error('Please load a JSON document and sign in first')
      return
    }

    const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setRoomId(newRoomId)
    toast.success('Collaboration session started!')
  }

  const clearDocument = () => {
    setCurrentDocument(null)
    setDocumentMethod(null)
    setRoomId(null)
  }

  const saveDocument = async () => {
    if (!currentDocument || !user || !workspace) {
      toast.error('Cannot save: missing document, user, or workspace')
      return
    }

    try {
      const documentData = {
        title: currentDocument.title,
        content: currentDocument.content,
        workspace_id: workspaceId,
        user_id: user.id,
        file_size: currentDocument.size,
        input_method: documentMethod?.type || 'manual',
        is_public: false
      }

      if (currentDocument.workspaceId && currentDocument.id) {
        const { error } = await supabase
          .from('documents')
          .update({
            ...documentData,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentDocument.id)

        if (error) throw error
        toast.success('Document updated!')
      } else {
        const { data, error } = await supabase
          .from('documents')
          .insert(documentData)
          .select()
          .single()

        if (error) throw error
        
        setCurrentDocument(prev => prev ? {
          ...prev,
          id: data.id,
          workspaceId: workspaceId,
          isSaved: true
        } : null)
        
        toast.success('Document saved!')
      }

      loadDocuments() // Refresh document list
    } catch (error) {
      console.error('Error saving document:', error)
      toast.error('Failed to save document')
    }
  }

  const loadDocumentFromList = async (doc: WorkspaceDocument) => {
    try {
      setIsLoadingDocument(true)
      
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const jsonDocument: JsonDocument = {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        lastModified: new Date(doc.updatedAt),
        size: doc.fileSize,
        isValid: true,
        workspaceId: doc.workspaceId,
        isSaved: true
      }

      const method: JsonInputMethod = {
        type: (doc.inputMethod as JsonInputMethod['type']) || 'file'
      }

      setCurrentDocument(jsonDocument)
      setDocumentMethod(method)
      toast.success('Document loaded')
    } catch (error) {
      console.error('Error loading document:', error)
      toast.error('Failed to load document')
    } finally {
      setIsLoadingDocument(false)
    }
  }

  const deleteDocument = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)

      if (error) throw error
      
      toast.success('Document deleted')
      loadDocuments()
      
      if (currentDocument?.id === docId) {
        clearDocument()
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }


  const LoadingSkeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-muted/50 rounded-md ${className}`} />
  )

  return (
    <div className="h-screen bg-background flex flex-col">
 <header className="relative border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Back button and workspace info */}
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="h-6 w-px bg-white/10" />
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 blur-md rounded-lg" />
                  <div className="relative bg-gradient-to-br from-white to-white/70 p-2 rounded-lg">
                    <FileJson className="w-5 h-5 text-black" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{workspace?.name || 'Loading...'}</h1>
                  <p className="text-xs text-white/40">{documents.length} documents</p>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {(currentDocument || documents.length > 0) ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-56 border-r bg-background/50 backdrop-blur-sm flex flex-col">
              
              <div className="p-4 border-b border-border/50">
                <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
                  <Button 
                    variant={activeViewMode === 'canvas' ? 'default' : 'ghost'}
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => setActiveViewMode('canvas')}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Canvas
                  </Button>
                  <Button 
                    variant={activeViewMode !== 'canvas' ? 'default' : 'ghost'}
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => {
                      if (activeViewMode === 'canvas') {
                        setActiveViewMode('tree')
                      }
                    }}
                  >
                    <TreePine className="w-3 h-3 mr-1" />
                    Data
                  </Button>
                </div>
                
                {activeViewMode !== 'canvas' && (
                  <div className="mt-3 flex gap-1">
                    <Button 
                      variant={activeViewMode === 'tree' ? 'secondary' : 'ghost'}
                      size="sm" 
                      className="flex-1 h-7 text-xs px-2"
                      onClick={() => setActiveViewMode('tree')}
                    >
                      Tree
                    </Button>
                    <Button 
                      variant={activeViewMode === 'table' ? 'secondary' : 'ghost'}
                      size="sm" 
                      className="flex-1 h-7 text-xs px-2"
                      onClick={() => setActiveViewMode('table')}
                    >
                      Table
                    </Button>
                    <Button 
                      variant={activeViewMode === 'raw' ? 'secondary' : 'ghost'}
                      size="sm" 
                      className="flex-1 h-7 text-xs px-2"
                      onClick={() => setActiveViewMode('raw')}
                    >
                      Raw
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground/80">Documents</h3>
                    <Badge variant="secondary" className="text-xs h-5">
                      {documents.length}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 px-4 pb-4 overflow-y-auto">
                  {isLoadingWorkspace ? (
                    <div className="space-y-2 py-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <LoadingSkeleton className="w-2 h-2 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <LoadingSkeleton className="h-3 w-full" />
                            <LoadingSkeleton className="h-2 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 animate-fade-in">
                      <FileJson className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">No documents yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1 animate-fade-in">
                      {documents.map((doc, index) => (
                        <div 
                          key={doc.id}
                          className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:scale-[1.02] hover:shadow-sm ${
                            currentDocument?.id === doc.id ? 'bg-muted border border-border' : ''
                          } ${isLoadingDocument && currentDocument?.id === doc.id ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={() => loadDocumentFromList(doc)}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {isLoadingDocument && currentDocument?.id === doc.id ? (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-primary/60 group-hover:bg-primary transition-colors" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteDocument(doc.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t border-border/50 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground/60">Load Data</p>
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 text-xs px-1 flex flex-col gap-0.5 transition-all duration-200 hover:scale-105"
                      disabled={isLoadingData}
                      onClick={async () => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.json'
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) {
                            setIsLoadingData(true)
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              try {
                                const content = JSON.parse(event.target?.result as string)
                                handleDocumentLoad({
                                  id: `temp_${Date.now()}`,
                                  title: file.name,
                                  content,
                                  lastModified: new Date(),
                                  size: file.size,
                                  isValid: true
                                }, { type: 'file', source: file.name })
                              } catch {
                                toast.error('Invalid JSON file')
                              } finally {
                                setIsLoadingData(false)
                              }
                            }
                            reader.readAsText(file)
                          }
                        }
                        input.click()
                      }}
                    >
                      {isLoadingData ? (
                        <div className="w-2.5 h-2.5 animate-spin rounded-full border border-current border-t-transparent" />
                      ) : (
                        <Upload className="w-2.5 h-2.5" />
                      )}
                      <span className="text-[10px] leading-none">File</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 text-xs px-1 flex flex-col gap-0.5 transition-all duration-200 hover:scale-105"
                      disabled={isLoadingData}
                      onClick={async () => {
                        const url = prompt('Enter JSON URL:')
                        if (url) {
                          setIsLoadingData(true)
                          try {
                            const response = await fetch(url)
                            const content = await response.json()
                            handleDocumentLoad({
                              id: `temp_${Date.now()}`,
                              title: url.split('/').pop() || 'URL Data',
                              content,
                              lastModified: new Date(),
                              size: JSON.stringify(content).length,
                              isValid: true
                            }, { type: 'url', source: url })
                          } catch {
                            toast.error('Failed to fetch JSON')
                          } finally {
                            setIsLoadingData(false)
                          }
                        }
                      }}
                    >
                      {isLoadingData ? (
                        <div className="w-2.5 h-2.5 animate-spin rounded-full border border-current border-t-transparent" />
                      ) : (
                        <Globe className="w-2.5 h-2.5" />
                      )}
                      <span className="text-[10px] leading-none">URL</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 text-xs px-1 flex flex-col gap-0.5 transition-all duration-200 hover:scale-105"
                      disabled={isLoadingData}
                      onClick={async () => {
                        const jsonText = prompt('Paste JSON:')
                        if (jsonText) {
                          setIsLoadingData(true)
                          await new Promise(resolve => setTimeout(resolve, 200))
                          try {
                            const content = JSON.parse(jsonText)
                            handleDocumentLoad({
                              id: `temp_${Date.now()}`,
                              title: 'Manual Input',
                              content,
                              lastModified: new Date(),
                              size: jsonText.length,
                              isValid: true
                            }, { type: 'manual' })
                          } catch {
                            toast.error('Invalid JSON format')
                          } finally {
                            setIsLoadingData(false)
                          }
                        }
                      }}
                    >
                      {isLoadingData ? (
                        <div className="w-2.5 h-2.5 animate-spin rounded-full border border-current border-t-transparent" />
                      ) : (
                        <Edit3 className="w-2.5 h-2.5" />
                      )}
                      <span className="text-[10px] leading-none">Text</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background to-muted/20">
              <div className="flex-1 relative">
                {currentDocument ? (
                  <>
                    <div className="absolute inset-0">
                      <div key={activeViewMode} className="w-full h-full animate-fade-in">
                        {activeViewMode === 'canvas' ? (
                          <JsonCanvasView 
                            data={currentDocument.content}
                            onNodeSelect={setSelectedCanvasNode}
                            className="w-full h-full"
                          />
                        ) : activeViewMode === 'raw' ? (
                          <div className="p-6 h-full">
                            <div className="h-full bg-muted/20 rounded-lg p-4 overflow-auto transition-all duration-300">
                              <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
                                {JSON.stringify(currentDocument.content, null, 2)}
                              </pre>
                            </div>
                          </div>
                        ) : activeViewMode === 'tree' ? (
                          <div className="p-6 h-full">
                            <JsonVisualizer 
                              document={currentDocument}
                              className="h-full"
                              viewMode="tree"
                              hideControls={true}
                            />
                          </div>
                        ) : (
                          <div className="p-6 h-full">
                            <JsonVisualizer 
                              document={currentDocument}
                              className="h-full"
                              viewMode="table"
                              hideControls={true}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`absolute top-4 left-4 z-10 transition-all duration-300 ${
                      activeViewMode === 'canvas' 
                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}>
                      <Card className="p-3 bg-background/80 backdrop-blur-md border border-border/50 shadow-lg">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 text-xs transition-all hover:scale-105"
                            onClick={() => {
                              const win = window as WindowWithCanvasControls
                              if (win.canvasControls) {
                                win.canvasControls.resetZoom()
                              }
                            }}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 text-xs transition-all hover:scale-105"
                            onClick={() => {
                              const win = window as WindowWithCanvasControls
                              if (win.canvasControls) {
                                win.canvasControls.fitToScreen()
                              }
                            }}
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Fit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-3 text-xs transition-all hover:scale-105"
                            onClick={() => {
                              const win = window as WindowWithCanvasControls
                              if (win.canvasControls) {
                                win.canvasControls.reheat()
                              }
                            }}
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Layout
                          </Button>
                        </div>
                      </Card>
                    </div>

                    <div className="absolute bottom-4 right-4 z-10 animate-slide-in-right">
                      <Card className="px-3 py-2 bg-background/90 backdrop-blur-md border border-border/50 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105">
                        <div className="flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            currentDocument.isValid ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                          }`} />
                          <span className="font-medium">{currentDocument.title}</span>
                          <span className="text-muted-foreground">
                            · {(currentDocument.size / 1024).toFixed(1)} KB
                          </span>
                          <span className="text-muted-foreground capitalize">
                            · {documentMethod?.type}
                          </span>
                        </div>
                      </Card>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                    <div className="text-center max-w-md mx-auto p-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center animate-bounce-slow">
                        <FolderOpen className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{workspace?.name}</h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        {documents.length > 0 
                          ? "Select a document from the sidebar or load new data" 
                          : "Load your first JSON document to get started"
                        }
                      </p>
                      {documents.length > 0 && (
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 animate-slide-in-up">
                          <FileJson className="w-3 h-3" />
                          <span>{documents.length} document{documents.length !== 1 ? 's' : ''} saved</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(currentDocument && (selectedCanvasNode || activeViewMode === 'canvas')) && (
              <div className="w-72 border-l border-border/50 bg-background/30 backdrop-blur-sm flex flex-col">
                
                <div className="p-4 border-b border-border/50">
                  <h2 className="text-sm font-medium text-foreground/80">
                    {selectedCanvasNode ? 'Selection Details' : 'Canvas Inspector'}
                  </h2>
                </div>
                
                <div className="flex-1 p-4 overflow-auto">
                  {selectedCanvasNode ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedCanvasNode.color }}
                          />
                          <span className="font-medium text-sm">{selectedCanvasNode.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {selectedCanvasNode.type}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          {selectedCanvasNode.path && (
                            <div>Path: <code className="bg-background px-1 rounded">{selectedCanvasNode.path.join('.')}</code></div>
                          )}
                          {selectedCanvasNode.depth !== undefined && (
                            <div>Depth: {selectedCanvasNode.depth}</div>
                          )}
                        </div>
                      </div>

                      {selectedCanvasNode.type !== 'object' && selectedCanvasNode.type !== 'array' && (
                        <div>
                          <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Value</h4>
                          <div className="text-xs font-mono bg-muted p-3 rounded-lg max-h-24 overflow-auto">
                            {JSON.stringify(selectedCanvasNode.value, null, 2)}
                          </div>
                        </div>
                      )}

                      {(selectedCanvasNode.type === 'object' || selectedCanvasNode.type === 'array') && (
                        <div>
                          <h4 className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">Structure</h4>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Contains:</span>
                              <span className="ml-2 font-medium">{selectedCanvasNode.children?.length || 0} items</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-muted/50 flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Click on elements in the canvas to inspect their details
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="p-12 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <FileJson className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Welcome to Canvas Mode</h3>
                <p className="text-muted-foreground mb-6">
                  Load JSON data to explore it in our new interactive canvas visualization
                </p>
                <JsonInput 
                  onDocumentLoad={handleDocumentLoad}
                  className="h-full"
                />
              </div>
            </Card>
          </div>
        )}
      </main>

      {roomId && (
        <>
          <CollaborationPanel roomId={roomId} />
          <UserCursors />
        </>
      )}

      {!currentDocument && (
        <div className="fixed bottom-4 left-4 max-w-sm">
          <Card className="p-4 bg-primary text-primary-foreground">
            <div className="flex items-start space-x-2">
              <Play className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Welcome to JSON Visualizer!</h4>
                <p className="text-sm opacity-90">
                  Start by loading JSON data from the left panel. You can upload files, fetch from URLs, or create JSON manually.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
       
      {/* <footer className="relative border-t border-white/5 mt-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/40">
              <span>Workspace created</span>
              <span className="text-white/60">
                {workspace?.createdAt && new Date(workspace.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="text-sm text-white/40">
              Made with <span className="text-white">🤍</span> by{' '}
              <a 
                href="https://github.com/nsl-nikos" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white transition-colors"
              >
                nsl-nikos
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  )
}