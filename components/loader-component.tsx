'use client'

import { FileJson } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Loader content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Simple spinning logo */}
        <div className="relative w-16 h-16">
          {/* Single spinning ring */}
          <div 
            className="absolute inset-0 rounded-2xl border-2 border-white/20 animate-spin" 
            style={{ 
              borderTopColor: 'white',
              animationDuration: '1s'
            }} 
          />
          
          {/* Logo center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FileJson className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Loading text */}
        <span className="text-white/80 text-sm font-medium">Loading...</span>
      </div>
    </div>
  )
}

// Inline loader for smaller contexts
export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { container: 'w-6 h-6', icon: 'w-3 h-3' },
    md: { container: 'w-8 h-8', icon: 'w-4 h-4' },
    lg: { container: 'w-12 h-12', icon: 'w-5 h-5' }
  }

  const { container, icon } = sizes[size]

  return (
    <div className="inline-flex items-center justify-center">
      <div className={`relative ${container}`}>
        <div 
          className="absolute inset-0 rounded-lg border-2 border-white/20 animate-spin" 
          style={{ 
            borderTopColor: 'white',
            animationDuration: '1s'
          }} 
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileJson className={`${icon} text-white`} />
        </div>
      </div>
    </div>
  )
}

// Simple spinner for buttons
export function ButtonLoader() {
  return (
    <div className="inline-flex items-center justify-center">
      <div className="relative w-4 h-4">
        <div 
          className="absolute inset-0 rounded-full border-2 border-transparent animate-spin" 
          style={{ 
            borderTopColor: 'currentColor',
            borderRightColor: 'currentColor',
            animationDuration: '0.8s'
          }} 
        />
      </div>
    </div>
  )
}