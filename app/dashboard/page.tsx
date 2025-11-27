'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileJson, 
  Plus, 
  FolderOpen, 
  Users, 
  Clock,
  MoreHorizontal,
  ArrowRight,
  LogOut,
  Settings,
  Search
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import { Workspace } from '@/types'

export default function Dashboard() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [user, setUser] = useState<{ id: string, email?: string } | null>(null)
  // const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const loadWorkspaces = useCallback(async (userId: string) => {
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
    } 
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        loadWorkspaces(user.id)
      } else {
        // setLoading(false)
        router.push('/auth/login')
      }
    }
    getUser()
  }, [loadWorkspaces, supabase.auth, router])

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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }


  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Subtle background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-md rounded-lg group-hover:bg-white/30 transition-all" />
                <div className="relative bg-gradient-to-br from-white to-white/70 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <FileJson className="w-5 h-5 text-black" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold">JSON Visualizer</h1>
                <p className="text-xs text-white/40">Dashboard</p>
              </div>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <Button 
                onClick={createWorkspace}
                className="bg-white text-black hover:bg-white/90 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Workspace
              </Button>

              <div className="h-8 w-px bg-white/10" />

              <Button 
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Button 
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-6 py-12 flex-1">
        {workspaces.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-flex p-8 rounded-3xl bg-white/5 border border-white/10 mb-8">
              <FolderOpen className="w-16 h-16 text-white/60" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Create Your First Workspace</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto text-lg">
              Workspaces help you organize your JSON documents and collaborate with others
            </p>
            <Button 
              onClick={createWorkspace}
              size="lg"
              className="bg-white text-black hover:bg-white/90 font-medium px-8 h-12"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Workspace
            </Button>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Your Workspaces</h2>
                  <p className="text-white/60">
                    {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} • Select one to get started
                  </p>
                </div>

                {/* Search bar */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 min-w-[300px]">
                  <Search className="w-4 h-4 text-white/40" />
                  <input 
                    type="text"
                    placeholder="Search workspaces..."
                    className="bg-transparent border-none outline-none text-white placeholder:text-white/40 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Workspace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {workspaces.map((workspace) => (
                <Card 
                  key={workspace.id}
                  className="group relative bg-white/5 border-white/10 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => openWorkspace(workspace.id)}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/15 transition-colors">
                          <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-white transition-colors">
                            {workspace.name}
                          </h3>
                          {workspace.description && (
                            <p className="text-sm text-white/60 mt-0.5">
                              {workspace.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle menu
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Documents</span>
                        <Badge className="bg-white/10 text-white border-white/20">
                          {workspace.documentCount || 0}
                        </Badge>
                      </div>

                      {workspace.lastAccessedAt && (
                        <div className="flex items-center gap-2 text-sm text-white/40">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {new Date(workspace.lastAccessedAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}

                      {workspace.isShared && (
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>Shared workspace</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm text-white/60 group-hover:text-white transition-colors">
                        <span>Open workspace</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Create New Card */}
              <Card 
                className="group relative bg-transparent border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={createWorkspace}
              >
                <div className="relative p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex pb-7 items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-all duration-300 group-hover:scale-110">
                        <Plus className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-white transition-colors">
                          Create New Workspace
                        </h3>
                        <p className="text-sm text-white/60 mt-0.5 group-hover:text-white/80 transition-colors">
                          Start a fresh project
                        </p>
                      </div>
                    </div>
                  </div>

              

                  {/* Footer */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm text-white/60 group-hover:text-white transition-colors">
                      <span>Click to create</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 mt-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/40">
              <span>Signed in as</span>
              <span className="text-white/60 font-medium">{user.email}</span>
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
      </footer>
    </div>
  )
}