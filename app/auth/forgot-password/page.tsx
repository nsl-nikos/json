'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { FileJson, ArrowRight, Mail, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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

        {success ? (
          /* Success State */
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-flex p-4 rounded-full bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Check your email</h1>
                <p className="text-white/60">
                  We&apos;ve sent password reset instructions to <span className="text-white font-medium">{email}</span>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/60">
                If you don&apos;t see the email, check your spam folder or try again with a different email address.
              </p>
            </div>

            <Link href="/auth/login" >
              <Button className="w-full mt-6 bg-white text-black hover:bg-white/90 font-medium h-11">
                Back to Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        ) : (
          /* Form State */
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Reset your password</h1>
              <p className="text-white/60">
                Enter your email and we&apos;ll send you a link to reset your password
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/20 pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-white/90 font-medium h-11"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="text-center text-sm text-white/60">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="text-white hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}