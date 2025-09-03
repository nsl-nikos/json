'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileJson, 
  Plus, 
  FolderOpen, 
  Users, 
  Settings,
  Clock,
  MoreHorizontal,
  Search,
  ArrowRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Workspace } from '@/types'

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        loadWorkspaces(user.id)
      } else {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  const loadWorkspaces = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          documents(count)
        `)
        .eq('user_id', userId)
        .order('last_accessed_at', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false })

      if (error) throw error

      const workspacesWithCounts = data?.map(workspace => ({
        ...workspace,
        documentCount: workspace.documents?.[0]?.count || 0
      })) || []

      setWorkspaces(workspacesWithCounts)
    } catch (error) {
      console.error('Error loading workspaces:', error)
      toast.error('Failed to load workspaces')
    } finally {
      setLoading(false)
    }
  }

  const createWorkspace = async () => {
    if (!user) return

    const name = `Workspace ${workspaces.length + 1}`
    
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name,
          user_id: user.id,
          is_shared: false
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Workspace created!')
      router.push(`/dashboard/${data.id}`)
    } catch (error) {
      console.error('Error creating workspace:', error)
      toast.error('Failed to create workspace')
    }
  }

  const openWorkspace = async (workspaceId: string) => {
    await supabase
      .from('workspaces')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', workspaceId)
    
    router.push(`/dashboard/${workspaceId}`)
  }

  if (!user) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <FileJson className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
          <p className="text-muted-foreground mb-4">
            You need to sign in to access your workspaces
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileJson className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold">JSON Visualizer</h1>
              </div>
              <Badge variant="secondary" className="text-xs">
                {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={createWorkspace} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>New Workspace</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading workspaces...</p>
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <FolderOpen className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Create Your First Workspace</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Workspaces help you organize and manage your JSON documents. Create one to get started with your data visualization projects.
            </p>
            <Button onClick={createWorkspace} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Workspace
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Your Workspaces</h2>
              <p className="text-muted-foreground">
                Select a workspace to start visualizing and collaborating on JSON data
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <Card 
                  key={workspace.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => openWorkspace(workspace.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {workspace.name}
                        </h3>
                        {workspace.description && (
                          <p className="text-sm text-muted-foreground">
                            {workspace.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Documents:</span>
                      <Badge variant="outline">
                        {workspace.documentCount || 0}
                      </Badge>
                    </div>

                    {workspace.lastAccessedAt && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          Last accessed {new Date(workspace.lastAccessedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {workspace.isShared && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-500">Shared workspace</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      Open Workspace
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              <Card 
                className="p-6 border-dashed hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={createWorkspace}
              >
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    Create New Workspace
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start a new project with organized JSON documents
                  </p>
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}