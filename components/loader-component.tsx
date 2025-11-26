'use client'

import { FileJson } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Loader content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated logo */}
        <div className="relative w-20 h-20">
          {/* Spinning border ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-white/20 animate-spin" 
               style={{ 
                 borderTopColor: 'white',
                 animationDuration: '1.5s'
               }} 
          />
          
          {/* Logo background */}
          <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
            <FileJson className="w-8 h-8 text-black animate-pulse" />
          </div>
        </div>

        {/* Loading text */}
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm font-medium">Loading</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline loader for smaller contexts
export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { container: 'w-12 h-12', icon: 'w-6 h-6' },
    lg: { container: 'w-16 h-16', icon: 'w-8 h-8' }
  }

  const { container, icon } = sizes[size]

  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${container}`}>
        {/* Spinning border ring */}
        <div className="absolute inset-0 rounded-xl border-2 border-white/20 animate-spin" 
             style={{ 
               borderTopColor: 'white',
               animationDuration: '1.5s'
             }} 
        />
        
        {/* Logo background */}
        <div className="absolute inset-1 rounded-lg bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
          <FileJson className={`${icon} text-black animate-pulse`} />
        </div>
      </div>
    </div>
  )
}