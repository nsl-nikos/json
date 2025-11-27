'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoader } from '@/components/loader-component'

const LoadingContext = createContext<{
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}>({ isLoading: false, setIsLoading: () => {} })

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => {
      setIsLoading(true)
    }

    const handleStop = () => {
      // Add a minimum delay so loader is visible
      setTimeout(() => setIsLoading(false), 500)
    }

    // Listen for route changes
    window.addEventListener('beforeunload', handleStart)

    return () => {
      window.removeEventListener('beforeunload', handleStart)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <PageLoader />}
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => useContext(LoadingContext)