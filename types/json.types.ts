// JSON Visualization Types
export interface JsonNode {
  key: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  path: string[]
  depth: number
  children?: JsonNode[]
  isExpanded?: boolean
  isHighlighted?: boolean
}

export interface JsonDocument {
  id: string
  title: string
  content: any
  lastModified: Date
  size: number
  isValid: boolean
  errorMessage?: string
  workspaceId?: string
  isSaved?: boolean
}

export interface JsonInputMethod {
  type: 'file' | 'url' | 'manual' | 'paste'
  source?: string // file name or URL
}

export interface VisualizationMode {
  type: 'tree' | 'table' | 'graph' | 'raw' | 'formatted'
  settings: {
    showTypes: boolean
    showPath: boolean
    maxDepth: number
    collapseLargeArrays: boolean
    arrayThreshold: number
  }
}

export interface JsonFilter {
  searchTerm: string
  keyFilter: string
  typeFilter: JsonNode['type'] | 'all'
  pathFilter: string
}

export interface JsonStats {
  totalKeys: number
  totalValues: number
  maxDepth: number
  dataTypes: Record<JsonNode['type'], number>
  arrayCount: number
  objectCount: number
}

// Collaboration Types
export interface CollaborationCursor {
  userId: string
  userName: string
  color: string
  position: {
    path: string[]
    offset?: number
  }
  lastSeen: Date
}

export interface JsonEdit {
  id: string
  type: 'insert' | 'update' | 'delete'
  path: string[]
  oldValue?: any
  newValue?: any
  userId: string
  timestamp: Date
}

export interface RealTimeEvent {
  type: 'cursor_move' | 'content_change' | 'user_join' | 'user_leave'
  userId: string
  payload: any
  timestamp: Date
}

// Workspace Types
export interface Workspace {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: Date
  updatedAt: Date
  isShared: boolean
  lastAccessedAt?: Date
  documentCount?: number
}

export interface WorkspaceDocument {
  id: string
  title: string
  content: any
  workspaceId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  isPublic: boolean
  fileSize: number
  inputMethod: string
  roomId?: string
}