'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Key,
  Clock
} from 'lucide-react'
import { JsonDocument } from '@/types'

interface UrlFetchProps {
  onJsonLoad: (document: JsonDocument) => void
  className?: string
}

interface FetchState {
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string
  responseSize?: number
  responseTime?: number
}

export default function UrlFetch({ onJsonLoad, className }: UrlFetchProps) {
  const [url, setUrl] = useState('')
  const [headers, setHeaders] = useState('')
  const [state, setState] = useState<FetchState>({ status: 'idle' })
  const [showHeaders, setShowHeaders] = useState(false)

  const parseHeaders = (headersText: string): Record<string, string> => {
    const headers: Record<string, string> = {}
    
    if (!headersText.trim()) return headers
    
    try {
      return JSON.parse(headersText)
    } catch {
      // maybe it's key: value format instead
      headersText.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length > 0) {
          headers[key.trim()] = valueParts.join(':').trim()
        }
      })
    }
    
    return headers
  }

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  const fetchFromUrl = async () => {
    if (!url.trim() || !isValidUrl(url)) {
      setState({ status: 'error', error: 'Please enter a valid URL' })
      return
    }

    setState({ status: 'loading' })
    const startTime = Date.now()

    try {
      const requestHeaders = parseHeaders(headers)
      
      const response = await fetch('/api/fetch-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url,
          headers: requestHeaders
        })
      })

      const responseTime = Date.now() - startTime
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const responseSize = JSON.stringify(data).length
      
      setState({ 
        status: 'success', 
        responseSize,
        responseTime
      })

      const document: JsonDocument = {
        id: crypto.randomUUID(),
        title: new URL(url).pathname.split('/').pop() || 'URL Data',
        content: data,
        lastModified: new Date(),
        size: responseSize,
        isValid: true
      }

      onJsonLoad(document)
      
    } catch (error) {
      setState({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to fetch URL'
      })
    }
  }

  const popularApis = [
    'https://jsonplaceholder.typicode.com/users',
    'https://jsonplaceholder.typicode.com/posts',
    'https://api.github.com/repos/microsoft/vscode',
    'https://httpbin.org/json'
  ]

  return (
    <Card className={className}>
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4" />
          <h3 className="font-semibold">Fetch from URL</h3>
          {state.status === 'success' && (
            <Badge variant="default">
              <CheckCircle className="w-3 h-3 mr-1" />
              Success
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="url-input">JSON URL</Label>
            <Input
              id="url-input"
              type="url"
              placeholder="https://api.example.com/data.json"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={!isValidUrl(url) && url ? 'border-destructive' : ''}
            />
          </div>

          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHeaders(!showHeaders)}
              className="h-8 px-0 text-xs text-muted-foreground hover:text-foreground"
            >
              <Key className="w-3 h-3 mr-1" />
              {showHeaders ? 'Hide' : 'Add'} Headers
            </Button>
            
            {showHeaders && (
              <div>
                <Label htmlFor="headers-input" className="text-xs">
                  Headers (JSON format or Key: Value per line)
                </Label>
                <textarea
                  id="headers-input"
                  className="w-full px-3 py-2 text-xs border rounded-md resize-y bg-background h-20"
                  placeholder={`{"Authorization": "Bearer token"}\n\nOr:\nAuthorization: Bearer token\nContent-Type: application/json`}
                  value={headers}
                  onChange={(e) => setHeaders(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button
            onClick={fetchFromUrl}
            disabled={!url.trim() || !isValidUrl(url) || state.status === 'loading'}
            className="w-full"
          >
            {state.status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Fetch JSON
              </>
            )}
          </Button>
        </div>

        {state.status === 'success' && state.responseSize && state.responseTime && (
          <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-muted rounded">
            <div className="flex items-center space-x-3">
              <span>{(state.responseSize / 1024).toFixed(1)} KB</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{state.responseTime}ms</span>
              </div>
            </div>
          </div>
        )}

        {state.status === 'error' && state.error && (
          <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-md">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-destructive mt-1">{state.error}</p>
          </div>
        )}

        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            Popular APIs to try:
          </Label>
          <div className="flex flex-wrap gap-2">
            {popularApis.map((apiUrl) => (
              <Button
                key={apiUrl}
                variant="outline"
                size="sm"
                onClick={() => setUrl(apiUrl)}
                className="text-xs h-7"
              >
                {new URL(apiUrl).pathname}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}