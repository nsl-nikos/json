'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'

interface SimpleCanvasProps {
  data: any
  onNodeSelect?: (node: any) => void
  className?: string
}

export default function JsonCanvasView({ data, onNodeSelect, className }: SimpleCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processData = useCallback((jsonData: any) => {
    console.log('Processing data:', jsonData)
    
    if (!jsonData) return { nodes: [], links: [] }
    
    const nodes: any[] = []
    const links: any[] = []
    
    const getNodeColor = (type: string): string => {
      const colors = {
        object: '#18181b',    // zinc-900
        array: '#27272a',     // zinc-800
        string: '#3f3f46',    // zinc-700
        number: '#52525b',    // zinc-600
        boolean: '#71717a',   // zinc-500
        null: '#a1a1aa'       // zinc-400
      }
      return colors[type as keyof typeof colors] || colors.null
    }
    
    const getNodeSize = (value: any, type: string): number => {
      if (type === 'object') return Math.min(25 + Object.keys(value || {}).length * 2, 50)
      if (type === 'array') return Math.min(25 + (value?.length || 0) * 1.5, 45)
      return 20 // Base size for primitives
    }
    
    const addNode = (key: string, value: any, depth: number = 0, parentId?: string, parentPath: string[] = []) => {
      const nodeId = `${key}_${nodes.length}`
      const type = Array.isArray(value) ? 'array' : (value === null ? 'null' : typeof value)
      const currentPath = [...parentPath, key]
      
      const node = {
        id: nodeId,
        label: key,
        value: value,
        type: type,
        depth: depth,
        size: getNodeSize(value, type),
        color: getNodeColor(type),
        path: currentPath,
        x: 100 + depth * 150 + Math.random() * 100,
        y: 100 + nodes.length * 60 + Math.random() * 50,
        parentId: parentId
      }
      
      nodes.push(node)
      
      if (parentId) {
        links.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId
        })
      }
      
      if (depth < 3) {
        if (type === 'object' && value && typeof value === 'object') {
          Object.entries(value).forEach(([childKey, childValue]) => {
            addNode(childKey, childValue, depth + 1, nodeId, currentPath)
          })
        } else if (type === 'array' && Array.isArray(value)) {
          value.slice(0, 5).forEach((item, index) => { // Limit to first 5 array items
            addNode(`[${index}]`, item, depth + 1, nodeId, currentPath)
          })
          
          if (value.length > 5) {
            addNode(`... +${value.length - 5} more`, null, depth + 1, nodeId, currentPath)
          }
        }
      }
      
      return nodeId
    }
    
    if (typeof jsonData === 'object' && jsonData !== null && !Array.isArray(jsonData)) {
      Object.entries(jsonData).forEach(([key, value]) => {
        addNode(key, value, 0, undefined, [])
      })
    } else {
      addNode('root', jsonData, 0, undefined, [])
    }
    
    console.log('Generated nodes:', nodes.length)
    console.log('Generated links:', links.length)
    return { nodes, links }
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const initialize = () => {
      try {
        console.log('Starting canvas initialization...')
        
        if (!svgRef.current || !data) {
          console.log('Missing ref or data, skipping initialization')
          return
        }

        const svg = d3.select(svgRef.current)
        console.log('SVG selected:', svg.node())
        
        svg.selectAll('*').remove()
        
        const rect = svgRef.current.getBoundingClientRect()
        const width = rect.width || 800
        const height = rect.height || 600
        
        console.log('Canvas dimensions:', width, height)

        const { nodes, links } = processData(data)
        
        if (nodes.length === 0) {
          throw new Error('No nodes generated from data')
        }

        const defs = svg.append('defs')
        
        const pattern = defs.append('pattern')
          .attr('id', 'dot-grid')
          .attr('width', 20)
          .attr('height', 20)
          .attr('patternUnits', 'userSpaceOnUse')
        
        pattern.append('circle')
          .attr('cx', 10)
          .attr('cy', 10)
          .attr('r', 1)
          .attr('fill', '#475569') // slate-600 - lighter than background
          .attr('opacity', 0.5)
        
        svg.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', width)
          .attr('height', height)
          .attr('fill', 'url(#dot-grid)')
          .style('pointer-events', 'none')


        const g = svg.append('g')


        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 4])
          .on('zoom', (event) => {
            g.attr('transform', event.transform)
          })


        zoomRef.current = zoom


        svg.call(zoom)
        
        const simulation = d3.forceSimulation<any>(nodes)
          .force('link', d3.forceLink<any, any>(links)
            .id((d: any) => d.id)
            .distance(100)
            .strength(0.3)
          )
          .force('charge', d3.forceManyBody()
            .strength(-300)
            .distanceMax(200)
          )
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide()
            .radius((d: any) => d.size + 5)
            .strength(0.7)
          )
        
        simulationRef.current = simulation
        
        const linkElements = g.selectAll('line')
          .data(links)
          .enter()
          .append('line')
          .attr('stroke', '#e4e4e7')
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.6)
        
        const nodeGroups = g.selectAll('.node')
          .data(nodes)
          .enter()
          .append('g')
          .attr('class', 'node')
          .style('cursor', 'grab')
          .on('click', (event: any, d: any) => {
            console.log('Node clicked:', d)
            onNodeSelect?.(d)
          })
          .call(d3.drag<SVGGElement, any>()
            .on('start', function(event, d) {
              if (!event.active) simulation.alphaTarget(0.3).restart()
              d.fx = d.x
              d.fy = d.y
              d3.select(this).style('cursor', 'grabbing')
              d3.select(this).raise()
            })
            .on('drag', function(event, d) {
              d.fx = event.x
              d.fy = event.y
            })
            .on('end', function(event, d) {
              if (!event.active) simulation.alphaTarget(0)
              d.fx = null
              d.fy = null
              d3.select(this).style('cursor', 'grab')
            })
          )
        
        simulation.on('tick', () => {
          linkElements
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y)
          
          nodeGroups
            .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
        })


        nodeGroups.append('circle')
          .attr('r', (d: any) => d.size)
          .attr('fill', (d: any) => d.color)
          .attr('stroke', 'rgba(255, 255, 255, 0.5)') // 50% opacity white
          .attr('stroke-width', 1)


        nodeGroups.append('text')
          .attr('dy', '.35em')
          .attr('text-anchor', 'middle')
          .style('fill', 'white')
          .style('font-size', '10px')
          .style('font-weight', '500')
          .style('pointer-events', 'none')
          .text((d: any) => {
            const maxLength = Math.max(6, Math.floor(d.size / 3))
            if (d.label.length > maxLength) {
              return d.label.substring(0, maxLength - 2) + '..'
            }
            return d.label
          })
          .each(function(d: any) {
            const textElement = d3.select(this)
            const bbox = (this as SVGTextElement).getBBox()
            const maxWidth = d.size * 1.8 // Allow text to be slightly wider than circle
            
            if (bbox.width > maxWidth) {
              const text = textElement.text()
              const avgCharWidth = bbox.width / text.length
              const maxChars = Math.floor(maxWidth / avgCharWidth) - 2
              if (maxChars > 2) {
                textElement.text(text.substring(0, maxChars) + '..')
              } else {
                textElement.text('..')
              }
            }
          })


        nodeGroups.append('text')
          .attr('dy', (d: any) => d.size + 15)
          .attr('text-anchor', 'middle')
          .style('fill', '#71717a')
          .style('font-size', '9px')
          .style('font-weight', '400')
          .style('pointer-events', 'none')
          .text((d: any) => d.type)

        setIsReady(true)
        setError(null)
        console.log('Canvas initialization completed')

      } catch (err) {
        console.error('Canvas initialization error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsReady(false)
      }
    }

    timeoutId = setTimeout(initialize, 100)

    return () => {
      clearTimeout(timeoutId)
      setIsReady(false)
    }
  }, [data, processData, onNodeSelect])


  const resetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current) return
    
    const svg = d3.select(svgRef.current)
    
    svg.transition()
      .duration(750)
      .call(zoomRef.current.transform, d3.zoomIdentity)
      
    console.log('Zoom reset')
  }, [])

  const fitToScreen = useCallback(() => {
    if (!svgRef.current || !zoomRef.current || !data) return
    
    const svg = d3.select(svgRef.current)
    const rect = svgRef.current.getBoundingClientRect()
    const { nodes } = processData(data)
    
    if (nodes.length === 0) return
    
    const xExtent = d3.extent(nodes, (d: any) => d.x) as [number, number]
    const yExtent = d3.extent(nodes, (d: any) => d.y) as [number, number]
    
    const width = rect.width
    const height = rect.height
    const nodeWidth = xExtent[1] - xExtent[0] + 100
    const nodeHeight = yExtent[1] - yExtent[0] + 100
    
    const scale = Math.min(width / nodeWidth, height / nodeHeight, 1)
    const centerX = width / 2 - (xExtent[0] + xExtent[1]) / 2 * scale
    const centerY = height / 2 - (yExtent[0] + yExtent[1]) / 2 * scale
    
    svg.transition()
      .duration(750)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(centerX, centerY).scale(scale))
      
    console.log('Fitted to screen')
  }, [data, processData])

  const reheatSimulation = useCallback(() => {
    if (!simulationRef.current) return
    
    simulationRef.current
      .alpha(1)
      .alphaTarget(0)
      .restart()
      
    console.log('Simulation reheated')
  }, [])

  useEffect(() => {
    (window as any).canvasControls = {
      resetZoom,
      fitToScreen,
      reheat: reheatSimulation
    }
  }, [resetZoom, fitToScreen, reheatSimulation])

  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop()
      }
    }
  }, [])

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-lg font-semibold text-red-600 mb-2">Canvas Error</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setError(null)}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Initializing canvas...</div>
          </div>
        </div>
      )}
      
      <svg 
        ref={svgRef}
        width="100%" 
        height="100%"
        className="rounded-lg"
        style={{ 
          opacity: isReady ? 1 : 0,
          backgroundColor: '#171717', 
          border: '1px solid #334155' // slate-700 for subtle border
        }}
      />
      
      {isReady && (
        <div className="absolute top-4 right-4 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
          Canvas Ready
        </div>
      )}
    </div>
  )
}