'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileJson, AlertCircle, ArrowRight } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const errorCode = searchParams?.get('error')

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 blur-md rounded-lg" />
            <div className="relative bg-gradient-to-br from-white to-white/70 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <FileJson className="w-5 h-5 text-black" />
            </div>
          </div>
          <span className="text-xl font-semibold">JSON Visualizer</span>
        </Link>

        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Authentication Error</h1>
              <p className="text-white/60">
                Something went wrong during authentication
              </p>
            </div>
          </div>

          {errorCode && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400 font-mono">
                Error code: {errorCode}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full bg-white text-black hover:bg-white/90 font-medium h-11">
                Try Again
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white h-11">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}