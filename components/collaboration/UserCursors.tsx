'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useParticipants, useCurrentUserId } from '@/stores/collaboration-store'
import { CollaborationCursor } from '@/types'

interface UserCursorsProps {
  className?: string
}

interface CursorDisplayProps {
  cursor: CollaborationCursor
  isActive: boolean
}

const CursorDisplay = ({ cursor, isActive }: CursorDisplayProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    const timer = setTimeout(() => {
      if (!isActive) setIsVisible(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [cursor.position, isActive])

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getTimeSince = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 1000) return 'now'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return `${Math.floor(diff / 3600000)}h ago`
  }

  return (
    <div 
      className={`
        fixed pointer-events-none transition-all duration-200 z-50
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
      style={{
        left: '50%', // This would be calculated based on actual cursor position
        top: '50%',  // In a real implementation, you'd track DOM positions
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Cursor pointer */}
      <div className="relative">
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none"
          className="drop-shadow-lg"
        >
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
            fill={cursor.color}
            stroke="white"
            strokeWidth="1"
          />
        </svg>
        
        {/* User info tooltip */}
        <div 
          className="absolute left-6 top-0 flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 shadow-lg text-xs whitespace-nowrap"
          style={{ borderColor: cursor.color }}
        >
          <Avatar className="w-4 h-4">
            <AvatarFallback 
              className="text-[10px] font-bold"
              style={{ backgroundColor: cursor.color + '20', color: cursor.color }}
            >
              {getInitials(cursor.userName)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{cursor.userName}</span>
          <span className="text-muted-foreground">
            {getTimeSince(cursor.lastSeen)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function UserCursors({ className }: UserCursorsProps) {
  const participants = useParticipants()
  const currentUserId = useCurrentUserId()

  const otherUsers = Object.values(participants).filter(
    cursor => cursor.userId !== currentUserId
  )

  if (otherUsers.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {otherUsers.map(cursor => {
        const isActive = Date.now() - cursor.lastSeen.getTime() < 10000
        
        return (
          <CursorDisplay
            key={cursor.userId}
            cursor={cursor}
            isActive={isActive}
          />
        )
      })}
    </div>
  )
}