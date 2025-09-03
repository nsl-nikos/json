import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { CollaborationCursor, RealTimeEvent, JsonEdit } from '@/types'

interface CollaborationState {
  // Room state
  roomId: string | null
  isConnected: boolean
  
  // Users and cursors
  participants: Record<string, CollaborationCursor>
  currentUserId: string | null
  
  // Document edits
  recentEdits: JsonEdit[]
  
  // Real-time events
  events: RealTimeEvent[]
  
  // Actions
  joinRoom: (roomId: string, userId: string, userName: string) => void
  leaveRoom: () => void
  setConnected: (connected: boolean) => void
  
  updateCursor: (userId: string, cursor: CollaborationCursor) => void
  removeCursor: (userId: string) => void
  
  addEdit: (edit: JsonEdit) => void
  addEvent: (event: RealTimeEvent) => void
  
  // Cleanup
  clearOldEvents: () => void
}

const generateUserColor = (userId: string): string => {
  const colors = [
    '#ef4444', // red
    '#f97316', // orange  
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
  ]
  
  // Generate consistent color based on userId
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

export const useCollaborationStore = create<CollaborationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    roomId: null,
    isConnected: false,
    participants: {},
    currentUserId: null,
    recentEdits: [],
    events: [],

    // Actions
    joinRoom: (roomId: string, userId: string, userName: string) => {
      const color = generateUserColor(userId)
      
      set({
        roomId,
        currentUserId: userId,
        participants: {
          [userId]: {
            userId,
            userName,
            color,
            position: { path: [] },
            lastSeen: new Date()
          }
        }
      })

      // Add join event
      const joinEvent: RealTimeEvent = {
        type: 'user_join',
        userId,
        payload: { userName },
        timestamp: new Date()
      }
      
      set(state => ({
        events: [...state.events, joinEvent].slice(-100) // Keep last 100 events
      }))
    },

    leaveRoom: () => {
      const { currentUserId, participants } = get()
      
      if (currentUserId) {
        // Add leave event
        const leaveEvent: RealTimeEvent = {
          type: 'user_leave',
          userId: currentUserId,
          payload: { userName: participants[currentUserId]?.userName },
          timestamp: new Date()
        }
        
        set(state => ({
          events: [...state.events, leaveEvent].slice(-100)
        }))
      }

      set({
        roomId: null,
        isConnected: false,
        participants: {},
        currentUserId: null,
        recentEdits: [],
      })
    },

    setConnected: (connected: boolean) => {
      set({ isConnected: connected })
    },

    updateCursor: (userId: string, cursor: CollaborationCursor) => {
      set(state => ({
        participants: {
          ...state.participants,
          [userId]: {
            ...cursor,
            lastSeen: new Date()
          }
        }
      }))

      // Add cursor move event (throttled)
      const cursorEvent: RealTimeEvent = {
        type: 'cursor_move',
        userId,
        payload: { position: cursor.position },
        timestamp: new Date()
      }
      
      set(state => ({
        events: [...state.events, cursorEvent].slice(-100)
      }))
    },

    removeCursor: (userId: string) => {
      set(state => {
        const { [userId]: removed, ...rest } = state.participants
        return { participants: rest }
      })
    },

    addEdit: (edit: JsonEdit) => {
      set(state => ({
        recentEdits: [...state.recentEdits, edit].slice(-50) // Keep last 50 edits
      }))

      // Add content change event
      const changeEvent: RealTimeEvent = {
        type: 'content_change',
        userId: edit.userId,
        payload: { 
          type: edit.type, 
          path: edit.path,
          oldValue: edit.oldValue,
          newValue: edit.newValue
        },
        timestamp: new Date()
      }
      
      set(state => ({
        events: [...state.events, changeEvent].slice(-100)
      }))
    },

    addEvent: (event: RealTimeEvent) => {
      set(state => ({
        events: [...state.events, event].slice(-100)
      }))
    },

    clearOldEvents: () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      
      set(state => ({
        events: state.events.filter(event => event.timestamp > fiveMinutesAgo),
        recentEdits: state.recentEdits.filter(edit => edit.timestamp > fiveMinutesAgo)
      }))
    }
  }))
)

// Selectors
export const useIsInRoom = () => useCollaborationStore(state => !!state.roomId)
export const useParticipants = () => useCollaborationStore(state => state.participants)
export const useCurrentUserId = () => useCollaborationStore(state => state.currentUserId)
export const useRecentEdits = () => useCollaborationStore(state => state.recentEdits)
export const useCollaborationEvents = () => useCollaborationStore(state => state.events)
export const useIsConnected = () => useCollaborationStore(state => state.isConnected)