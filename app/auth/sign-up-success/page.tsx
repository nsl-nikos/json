'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileJson, Mail, ArrowRight } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
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
            <div className="inline-flex p-4 rounded-full bg-white/10 border border-white/20">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Check your email</h1>
              <p className="text-white/60">
                We&apos;ve sent you a confirmation link. Please check your email to verify your account before signing in.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 flex flex-col">
                <span className="text-white font-medium">Next steps:</span>
               
                <span className="pt-2">1. Check your email inbox (and spam folder)</span>
                <br />
                <span className="pt-1">2. Click the verification link</span>
                <br />
                <span className="pt-1">3. Return here to sign in</span>
              </p>
            </div>

            <Link href="/auth/login">
              <Button className="w-full mt-6 bg-white text-black hover:bg-white/90 font-medium h-11">
                Go to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
