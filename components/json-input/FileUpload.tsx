'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { JsonDocument } from '@/types'

interface FileUploadProps {
  onFileLoad: (document: JsonDocument) => void
  className?: string
}

export default function FileUpload({ onFileLoad, className }: FileUploadProps) {
  const parseJsonSafely = (text: string): { content: unknown; isValid: boolean; error?: string } => {
    try {
      const cleanText = text.replace(/^\uFEFF/, '')
      const trimmedText = cleanText.trim()
      
      if (!trimmedText) {
        return { content: null, isValid: false, error: 'File is empty' }
      }
      
      const jsonContent = JSON.parse(trimmedText)
      return { content: jsonContent, isValid: true }
      
    } catch (error) {
      try {
        const cleanText = text.replace(/^\uFEFF/, '').trim()
        
        // might be JSONL format, try first line
        if (cleanText.includes('\n') && !cleanText.startsWith('[') && !cleanText.startsWith('{')) {
          const firstLine = cleanText.split('\n')[0].trim()
          if (firstLine) {
            const jsonContent = JSON.parse(firstLine)
            return { 
              content: jsonContent, 
              isValid: true,
              error: 'Note: Only parsed the first line of JSONL format'
            }
          }
        }
        
        // Try to extract JSON from text that might have extra content
        const jsonMatch = cleanText.match(/^(\{[\s\S]*\}|\[[\s\S]*\])$/)
        if (jsonMatch) {
          const jsonContent = JSON.parse(jsonMatch[1])
          return { content: jsonContent, isValid: true }
        }
        
        // Try to find JSON within the text
        const possibleJsonMatches = cleanText.match(/(\{[^}]*\}|\[[^\]]*\])/g)
        if (possibleJsonMatches && possibleJsonMatches.length > 0) {
          for (const match of possibleJsonMatches) {
            try {
              const jsonContent = JSON.parse(match)
              return { 
                content: jsonContent, 
                isValid: true,
                error: 'Extracted JSON from mixed content'
              }
            } catch {
              continue
            }
          }
        }
        
      } catch {
        // Ignore second error
      }
      
      return { 
        content: null, 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid JSON format'
      }
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        const text = await file.text()
        const parseResult = parseJsonSafely(text)
        
        const document: JsonDocument = {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.(json|txt|log)$/i, ''),
          content: parseResult.content,
          lastModified: new Date(file.lastModified),
          size: file.size,
          isValid: parseResult.isValid,
          errorMessage: parseResult.error
        }
        
        onFileLoad(document)
      } catch (error) {
        const document: JsonDocument = {
          id: crypto.randomUUID(),
          title: file.name,
          content: null,
          lastModified: new Date(file.lastModified),
          size: file.size,
          isValid: false,
          errorMessage: `File reading error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
        
        onFileLoad(document)
      }
    }
  }, [onFileLoad])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/plain': ['.txt', '.log']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  return (
    <Card className={cn(
      'relative transition-colors border-2 border-dashed cursor-pointer',
      isDragActive && !isDragReject ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
      isDragReject ? 'border-destructive bg-destructive/5' : '',
      className
    )}>
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]"
      >
        <input {...getInputProps()} />
        
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-muted">
          {isDragReject ? (
            <AlertCircle className="w-6 h-6 text-destructive" />
          ) : (
            <Upload className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {isDragActive ? (
            isDragReject ? 'Invalid file type' : 'Drop files here'
          ) : (
            'Upload JSON Files'
          )}
        </h3>

        <p className="text-sm text-muted-foreground mb-4">
          {isDragActive ? (
            'Release to upload'
          ) : (
            'Drag & drop JSON files here, or click to browse'
          )}
        </p>

        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>Supports .json, .txt, .log files</span>
          <span>•</span>
          <span>Max 10MB per file</span>
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="p-4 border-t bg-destructive/5">
          <p className="text-sm text-destructive font-medium mb-1">
            Some files were rejected:
          </p>
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="text-xs text-destructive">
              {file.name}: {errors.map(e => e.message).join(', ')}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
