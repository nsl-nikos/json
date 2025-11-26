'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileJson, ArrowRight, Sparkles, TreePine, Users } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
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

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="text-white/60">Sign in to continue to your workspace</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/90">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-white/20"
                />
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
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="text-center text-sm text-white/60">
              Don't have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="text-white hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-white/5 to-white/0 border-l border-white/10 items-center justify-center p-12 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-md space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Modern JSON Workspace</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Visualize your data like never before
            </h2>
            <p className="text-lg text-white/60">
              Access powerful tools to explore, edit, and collaborate on JSON structures in real-time
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="p-2 rounded-lg bg-white/10 mt-1">
                <TreePine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Multiple View Modes</h3>
                <p className="text-sm text-white/60">Switch between tree, table, and raw views instantly</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="p-2 rounded-lg bg-white/10 mt-1">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real-time Collaboration</h3>
                <p className="text-sm text-white/60">Work together with live cursor tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}