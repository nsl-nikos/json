'use client'

import { useLoading } from '@/app/loadingProvider'

export function TestLoader() {
  const { setIsLoading } = useLoading()

  const handleShowLoader = async () => {
    setIsLoading(true)
    // Simulate a 3-second load
    setTimeout(() => setIsLoading(false), 3000)
  }

  return (
    <button 
      onClick={handleShowLoader}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Show Loader
    </button>
  )
}