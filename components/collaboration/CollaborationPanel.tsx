'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  Activity, 
  Wifi, 
  WifiOff, 
  Copy, 
  Share,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  UserPlus,
  UserMinus
} from 'lucide-react'
import { 
  useParticipants, 
  useCollaborationEvents, 
  useIsConnected,
  useCurrentUserId 
} from '@/stores/collaboration-store'
import { RealTimeEvent } from '@/types'
import { toast } from 'react-hot-toast'

interface CollaborationPanelProps {
  roomId: string | null
  className?: string
}

export default function CollaborationPanel({ roomId, className }: CollaborationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users')
  
  const participants = useParticipants()
  const events = useCollaborationEvents()
  const isConnected = useIsConnected()
  const currentUserId = useCurrentUserId()

  const participantsList = Object.values(participants)
  const recentEvents = events.slice(-10).reverse()

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const copyRoomLink = () => {
    if (roomId) {
      const url = `${window.location.origin}/room/${roomId}`
      navigator.clipboard.writeText(url)
      toast.success('Room link copied to clipboard')
    }
  }

  const shareRoom = async () => {
    if (roomId && navigator.share) {
      try {
        await navigator.share({
          title: 'JSON Visualizer Collaboration',
          text: 'Join me in this JSON visualization session',
          url: `${window.location.origin}/room/${roomId}`
        })
      } catch {
        copyRoomLink() // Fallback to copy
      }
    } else {
      copyRoomLink()
    }
  }

  const getEventIcon = (event: RealTimeEvent) => {
    switch (event.type) {
      case 'user_join': return <UserPlus className="w-3 h-3 text-green-500" />
      case 'user_leave': return <UserMinus className="w-3 h-3 text-red-500" />
      case 'content_change': return <Edit3 className="w-3 h-3 text-blue-500" />
      case 'cursor_move': return <Activity className="w-3 h-3 text-yellow-500" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  const getEventDescription = (event: RealTimeEvent): string => {
    const userName = participants[event.userId]?.userName || 'Unknown User'
    
    switch (event.type) {
      case 'user_join':
        return `${userName} joined the session`
      case 'user_leave':
        return `${userName} left the session`
      case 'content_change':
        const { type, path } = event.payload
        return `${userName} ${type}d at ${path?.join('.')}`
      case 'cursor_move':
        return `${userName} moved cursor`
      default:
        return `${userName} performed an action`
    }
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 1000) return 'just now'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
  }

  if (!roomId) {
    return null
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-80 bg-background/95 backdrop-blur-sm border shadow-lg z-40 ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer border-b"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="font-medium text-sm">Collaboration</span>
          </div>
          
          <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
            {participantsList.length} {participantsList.length === 1 ? 'user' : 'users'}
          </Badge>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={(e) => {
              e.stopPropagation()
              shareRoom()
            }}
          >
            <Share className="w-3 h-3" />
          </Button>
          
          <Button variant="ghost" size="icon" className="w-6 h-6">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-3">
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-3 h-3 mr-1" />
              Users ({participantsList.length})
            </Button>
            <Button
              variant={activeTab === 'activity' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => setActiveTab('activity')}
            >
              <Activity className="w-3 h-3 mr-1" />
              Activity
            </Button>
          </div>

          <ScrollArea className="h-48">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-2">
                {participantsList.map((participant) => {
                  const isCurrentUser = participant.userId === currentUserId
                  const isActive = Date.now() - participant.lastSeen.getTime() < 10000
                  
                  return (
                    <div
                      key={participant.userId}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback 
                            className="text-xs font-bold"
                            style={{ 
                              backgroundColor: participant.color + '20', 
                              color: participant.color 
                            }}
                          >
                            {getInitials(participant.userName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-medium truncate">
                              {participant.userName}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {getTimeAgo(participant.lastSeen)}
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  )
                })}

                {participantsList.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No users in this session
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-2">
                {recentEvents.map((event, index) => (
                  <div
                    key={`${event.userId}-${event.timestamp.getTime()}-${index}`}
                    className="flex items-start space-x-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getEventIcon(event)}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">
                        {getEventDescription(event)}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(event.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {recentEvents.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No recent activity
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Room Info */}
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Room ID: {roomId.slice(-8)}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={copyRoomLink}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}