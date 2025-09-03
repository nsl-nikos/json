import { JsonNode, JsonStats, JsonFilter } from '@/types'

export class JsonAnalyzer {
  static parseToTree(data: any, rootKey: string = 'root'): JsonNode {
    return this.buildNode(rootKey, data, [], 0)
  }

  private static buildNode(key: string, value: any, path: string[], depth: number): JsonNode {
    const nodeType = this.getValueType(value)
    const currentPath = [...path, key]
    
    const node: JsonNode = {
      key,
      value,
      type: nodeType,
      path: currentPath,
      depth,
      isExpanded: depth < 2 // Auto-expand first 2 levels
    }

    if (nodeType === 'object' && value !== null) {
      node.children = Object.entries(value).map(([childKey, childValue]) =>
        this.buildNode(childKey, childValue, currentPath, depth + 1)
      )
    } else if (nodeType === 'array') {
      node.children = value.map((item: any, index: number) =>
        this.buildNode(`[${index}]`, item, currentPath, depth + 1)
      )
    }

    return node
  }

  private static getValueType(value: any): JsonNode['type'] {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    
    const type = typeof value
    switch (type) {
      case 'object': return 'object'
      case 'string': return 'string'
      case 'number': return 'number'
      case 'boolean': return 'boolean'
      default: return 'string' // fallback
    }
  }

  static getStats(data: any): JsonStats {
    const stats: JsonStats = {
      totalKeys: 0,
      totalValues: 0,
      maxDepth: 0,
      dataTypes: {
        object: 0,
        array: 0,
        string: 0,
        number: 0,
        boolean: 0,
        null: 0
      },
      arrayCount: 0,
      objectCount: 0
    }

    this.analyzeValue(data, 0, stats)
    return stats
  }

  private static analyzeValue(value: any, depth: number, stats: JsonStats): void {
    stats.maxDepth = Math.max(stats.maxDepth, depth)
    stats.totalValues++

    const type = this.getValueType(value)
    stats.dataTypes[type]++

    if (type === 'array') {
      stats.arrayCount++
      value.forEach((item: any) => {
        this.analyzeValue(item, depth + 1, stats)
      })
    } else if (type === 'object' && value !== null) {
      stats.objectCount++
      stats.totalKeys += Object.keys(value).length
      
      Object.entries(value).forEach(([_, childValue]) => {
        this.analyzeValue(childValue, depth + 1, stats)
      })
    }
  }

  static filterTree(node: JsonNode, filter: JsonFilter): JsonNode | null {
    // Create a copy of the node
    const filteredNode: JsonNode = { ...node }
    
    // Apply filters
    const matchesSearch = !filter.searchTerm || 
      this.nodeMatchesSearch(node, filter.searchTerm.toLowerCase())
    
    const matchesKeyFilter = !filter.keyFilter || 
      node.key.toLowerCase().includes(filter.keyFilter.toLowerCase())
    
    const matchesTypeFilter = filter.typeFilter === 'all' || 
      node.type === filter.typeFilter
    
    const matchesPathFilter = !filter.pathFilter || 
      node.path.join('.').toLowerCase().includes(filter.pathFilter.toLowerCase())

    // Filter children recursively
    if (node.children) {
      const filteredChildren = node.children
        .map(child => this.filterTree(child, filter))
        .filter(child => child !== null) as JsonNode[]
      
      filteredNode.children = filteredChildren.length > 0 ? filteredChildren : undefined
    }

    // Include node if it matches filters OR has matching children
    const hasMatchingChildren = filteredNode.children && filteredNode.children.length > 0
    const nodeMatches = matchesSearch && matchesKeyFilter && matchesTypeFilter && matchesPathFilter

    if (nodeMatches || hasMatchingChildren) {
      return filteredNode
    }

    return null
  }

  private static nodeMatchesSearch(node: JsonNode, searchTerm: string): boolean {
    // Search in key
    if (node.key.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Search in string values
    if (node.type === 'string' && 
        String(node.value).toLowerCase().includes(searchTerm)) {
      return true
    }

    // Search in number values (convert to string)
    if (node.type === 'number' && 
        String(node.value).includes(searchTerm)) {
      return true
    }

    return false
  }

  static flattenTree(node: JsonNode): JsonNode[] {
    const result: JsonNode[] = [node]
    
    if (node.children) {
      node.children.forEach(child => {
        result.push(...this.flattenTree(child))
      })
    }

    return result
  }

  static findNodeByPath(root: JsonNode, path: string[]): JsonNode | null {
    if (path.length === 0) return root
    if (path[0] !== root.key) return null
    
    if (path.length === 1) return root
    
    if (!root.children) return null
    
    const nextKey = path[1]
    const nextChild = root.children.find(child => child.key === nextKey)
    
    if (!nextChild) return null
    
    return this.findNodeByPath(nextChild, path.slice(1))
  }

  static getNodeValue(node: JsonNode): string {
    switch (node.type) {
      case 'string':
        return `"${node.value}"`
      case 'number':
      case 'boolean':
        return String(node.value)
      case 'null':
        return 'null'
      case 'array':
        return `Array[${node.children?.length || 0}]`
      case 'object':
        const keyCount = node.children?.length || 0
        return keyCount === 1 ? '1 property' : `${keyCount} properties`
      default:
        return String(node.value)
    }
  }

  static getPathString(path: string[]): string {
    return path.join('.')
  }

  static copyPath(path: string[]): string {
    // Generate JSONPath format for copying
    return '$.' + path.slice(1).map(key => 
      key.startsWith('[') ? key : key
    ).join('.')
  }
}