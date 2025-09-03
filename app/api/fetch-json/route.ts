import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url, headers = {} } = await request.json()

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Security: Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      )
    }

    // Security: Block private IP ranges
    const hostname = parsedUrl.hostname
    const privateRanges = [
      /^127\./, // 127.x.x.x
      /^10\./, // 10.x.x.x  
      /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.x.x - 172.31.x.x
      /^192\.168\./, // 192.168.x.x
      /^localhost$/i
    ]

    if (privateRanges.some(range => range.test(hostname))) {
      return NextResponse.json(
        { error: 'Access to private IP ranges is not allowed' },
        { status: 403 }
      )
    }

    // Prepare request headers
    const requestHeaders: HeadersInit = {
      'User-Agent': 'JSON Visualizer/1.0',
      'Accept': 'application/json, application/javascript, text/plain, */*',
      ...headers
    }

    // Fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(url, {
        headers: requestHeaders,
        signal: controller.signal,
        // Prevent following too many redirects
        redirect: 'follow'
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return NextResponse.json(
          { error: `HTTP ${response.status}: ${response.statusText}` },
          { status: response.status }
        )
      }

      // Check content type
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json') && 
          !contentType.includes('application/javascript') &&
          !contentType.includes('text/')) {
        return NextResponse.json(
          { error: 'Response is not JSON or text content' },
          { status: 400 }
        )
      }

      // Check response size (limit to 10MB)
      const contentLength = response.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Response too large (max 10MB)' },
          { status: 413 }
        )
      }

      const text = await response.text()
      
      // Try to parse as JSON
      let jsonData
      try {
        jsonData = JSON.parse(text)
      } catch {
        // If JSON parsing fails, try to detect if it's JSONP
        const jsonpMatch = text.match(/^\w+\((.*)\)$/)
        if (jsonpMatch) {
          try {
            jsonData = JSON.parse(jsonpMatch[1])
          } catch {
            return NextResponse.json(
              { error: 'Response is not valid JSON or JSONP' },
              { status: 400 }
            )
          }
        } else {
          return NextResponse.json(
            { error: 'Response is not valid JSON' },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(jsonData)

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Request timeout (10 seconds)' },
            { status: 408 }
          )
        }
        
        return NextResponse.json(
          { error: `Fetch error: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: 'Unknown fetch error' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}