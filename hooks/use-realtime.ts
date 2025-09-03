import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCollaborationStore } from '@/stores/collaboration-store'
import { CollaborationCursor, RealTimeEvent, JsonEdit } from '@/types'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeProps {
  roomId: string
  userId: string
  userName: string
}

export function useRealtime({ roomId, userId, userName }: UseRealtimeProps) {
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const { 
    joinRoom, 
    leaveRoom, 
    setConnected, 
    updateCursor, 
    removeCursor, 
    addEdit, 
    addEvent 
  } = useCollaborationStore()

  const broadcastCursor = useCallback((cursor: CollaborationCursor) => {
    if (channelRef.current && cursor.userId === userId) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'cursor_update',
        payload: cursor
      })
    }
  }, [userId])

  const broadcastEdit = useCallback((edit: JsonEdit) => {
    if (channelRef.current && edit.userId === userId) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'content_edit',
        payload: edit
      })
    }
  }, [userId])

  useEffect(() => {
    if (!roomId || !userId) return

    // Join the collaboration room
    joinRoom(roomId, userId, userName)

    // Create realtime channel
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: false }, // Don't receive our own broadcasts
        presence: { key: userId }
      }
    })

    channelRef.current = channel

    // Handle presence (users joining/leaving)
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('Presence sync:', state)
        setConnected(true)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
        
        newPresences.forEach((presence: any) => {
          if (presence.user_id !== userId) {
            const joinEvent: RealTimeEvent = {
              type: 'user_join',
              userId: presence.user_id,
              payload: { userName: presence.user_name },
              timestamp: new Date()
            }
            addEvent(joinEvent)
          }
        })
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
        
        leftPresences.forEach((presence: any) => {
          removeCursor(presence.user_id)
          
          const leaveEvent: RealTimeEvent = {
            type: 'user_leave',
            userId: presence.user_id,
            payload: { userName: presence.user_name },
            timestamp: new Date()
          }
          addEvent(leaveEvent)
        })
      })

    // Handle broadcasts (cursor movements, content edits)
    channel
      .on('broadcast', { event: 'cursor_update' }, ({ payload }) => {
        const cursor = payload as CollaborationCursor
        if (cursor.userId !== userId) {
          updateCursor(cursor.userId, cursor)
        }
      })
      .on('broadcast', { event: 'content_edit' }, ({ payload }) => {
        const edit = payload as JsonEdit
        if (edit.userId !== userId) {
          addEdit(edit)
        }
      })

    // Subscribe and track presence
    channel
      .subscribe(async (status) => {
        console.log('Realtime subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          // Track presence
          await channel.track({
            user_id: userId,
            user_name: userName,
            online_at: new Date().toISOString(),
          })
          setConnected(true)
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnected(false)
        }
      })

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up realtime connection')
      
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
      
      leaveRoom()
    }
  }, [roomId, userId, userName, joinRoom, leaveRoom, setConnected, updateCursor, removeCursor, addEdit, addEvent])

  return {
    broadcastCursor,
    broadcastEdit,
    isConnected: useCollaborationStore(state => state.isConnected)
  }
}

// Throttled cursor updates
export function useThrottledCursor() {
  const lastBroadcastRef = useRef<number>(0)
  const THROTTLE_MS = 100 // Broadcast at most every 100ms

  return useCallback((broadcastFn: (cursor: CollaborationCursor) => void, cursor: CollaborationCursor) => {
    const now = Date.now()
    if (now - lastBroadcastRef.current >= THROTTLE_MS) {
      broadcastFn(cursor)
      lastBroadcastRef.current = now
    }
  }, [])
}

// Debounced content edits
export function useDebouncedEdit() {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const DEBOUNCE_MS = 500 // Wait 500ms after last edit before broadcasting

  return useCallback((broadcastFn: (edit: JsonEdit) => void, edit: JsonEdit) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      broadcastFn(edit)
    }, DEBOUNCE_MS)
  }, [])
}