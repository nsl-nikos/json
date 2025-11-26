'use client'

import { useRef, useState } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Code, Sparkles } from 'lucide-react'
import { JsonDocument } from '@/types'

interface JsonEditorProps {
  initialValue?: string
  onJsonLoad: (document: JsonDocument) => void
  className?: string
}

export default function JsonEditor({ initialValue = '', onJsonLoad, className }: JsonEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setIsValid(true)
      setError(null)
      return
    }

    try {
      JSON.parse(jsonString)
      setIsValid(true)
      setError(null)
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const handleEditorChange = (newValue: string | undefined) => {
    const content = newValue || ''
    setValue(content)
    validateJson(content)
  }

  const handleLoadJson = () => {
    if (!value.trim()) return
    
    try {
      const jsonContent = JSON.parse(value)
      const document: JsonDocument = {
        id: crypto.randomUUID(),
        title: 'Manual Entry',
        content: jsonContent,
        lastModified: new Date(),
        size: new Blob([value]).size,
        isValid: true
      }
      onJsonLoad(document)
    } catch (err) {
      const document: JsonDocument = {
        id: crypto.randomUUID(),
        title: 'Manual Entry',
        content: null,
        lastModified: new Date(),
        size: new Blob([value]).size,
        isValid: false,
        errorMessage: err instanceof Error ? err.message : 'Invalid JSON'
      }
      onJsonLoad(document)
    }
  }

  const generateSampleJson = () => {
    const sample = JSON.stringify({
      users: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          active: true,
          roles: ["admin", "user"],
          profile: {
            age: 30,
            location: "New York",
            preferences: {
              theme: "dark",
              notifications: true
            }
          }
        },
        {
          id: 2,
          name: "Jane Smith", 
          email: "jane@example.com",
          active: false,
          roles: ["user"],
          profile: {
            age: 25,
            location: "San Francisco",
            preferences: {
              theme: "light",
              notifications: false
            }
          }
        }
      ],
      metadata: {
        total: 2,
        lastUpdated: new Date().toISOString()
      }
    }, null, 2)
    setValue(sample)
    validateJson(sample)
  }

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor
    
    editor.getModel()?.updateOptions({
      tabSize: 2,
      insertSpaces: true
    })
  }

  return (
    <Card className={className}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4" />
          <h3 className="font-semibold">JSON Editor</h3>
          <Badge 
            variant={isValid ? "default" : "destructive"}
            className="ml-2"
          >
            {isValid ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Valid
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Invalid
              </>
            )}
          </Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateSampleJson}
            className="text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Sample
          </Button>
          <Button
            size="sm"
            onClick={handleLoadJson}
            disabled={!value.trim() || !isValid}
          >
            Load JSON
          </Button>
        </div>
      </div>

      <div className="relative h-[400px]">
        <Editor
          height="400px"
          defaultLanguage="json"
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            formatOnType: true,
            formatOnPaste: true,
            folding: true,
            wordWrap: 'on',
            bracketPairColorization: {
              enabled: true
            }
          }}
        />
      </div>

      {error && (
        <div className="p-3 border-t bg-destructive/5">
          <p className="text-sm text-destructive">
            <XCircle className="inline w-4 h-4 mr-1" />
            {error}
          </p>
        </div>
      )}
    </Card>
  )
}