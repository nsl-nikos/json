'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileJson, 
  Upload, 
  Globe, 
  Code, 
  Users, 
  Zap,
  ArrowRight,
  TreePine,
  Table2,
  Eye
} from 'lucide-react'

export default function Home() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/dashboard')
  }

  const features = [
    {
      icon: <Upload className="w-6 h-6 text-blue-500" />,
      title: "Multiple Input Methods",
      description: "Upload files, fetch from URLs, or create JSON manually with our smart editor"
    },
    {
      icon: <TreePine className="w-6 h-6 text-green-500" />,
      title: "Multiple View Modes", 
      description: "Switch between tree, table, and raw views to understand your data structure"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-500" />,
      title: "Real-time Collaboration",
      description: "Work together with live cursor tracking and instant updates"
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      title: "High Performance",
      description: "Handle large JSON files with intelligent loading and virtual scrolling"
    },
    {
      icon: <Eye className="w-6 h-6 text-cyan-500" />,
      title: "Advanced Search",
      description: "Find data quickly with powerful search and filtering capabilities"
    },
    {
      icon: <Code className="w-6 h-6 text-pink-500" />,
      title: "Developer Friendly",
      description: "Copy paths, export data, and integrate with your workflow"
    }
  ]

  const stats = [
    { label: "File Formats", value: "3+", description: "JSON, TXT, LOG" },
    { label: "View Modes", value: "3", description: "Tree, Table, Raw" },
    { label: "Collaboration", value: "∞", description: "Unlimited users" },
    { label: "File Size", value: "10MB", description: "Maximum supported" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer transition-all">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform">
                <FileJson className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  JSON Visualizer
                </h1>
                <Badge variant="secondary" className="text-xs px-2 py-1 animate-pulse">v1.0</Badge>
              </div>
            </div>
            
            <Button 
              onClick={handleGetStarted} 
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-muted/20 to-muted/5 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
                Visualize and
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                Collaborate on JSON
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              A powerful, real-time JSON visualization platform that transforms complex data structures 
              into <span className="font-medium text-foreground/80">interactive experiences</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary to-primary/90 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary/25 text-base font-medium"
              >
                <FileJson className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Start Visualizing
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="group px-8 py-4 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-base font-medium hover:scale-105"
              >
                <Globe className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                Try Sample Data
              </Button>
            </div>

            <div className="mt-16 text-sm text-muted-foreground animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Real-time collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <span>Multiple view modes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '1s' }} />
                  <span>High performance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo */}
          <div className="mt-20 max-w-5xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-muted/40 to-muted/20 border-muted/50 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group text-center hover:scale-105 transition-all duration-300">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all" />
                    <div className="relative w-full h-full rounded-xl bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:rotate-3 transition-transform" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Load Data</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">Upload, fetch, or create</p>
                </div>
                
                <div className="group text-center hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 group-hover:from-green-500/30 group-hover:to-green-600/20 transition-all" />
                    <div className="relative w-full h-full rounded-xl bg-green-50 dark:bg-green-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TreePine className="w-7 h-7 text-green-600 dark:text-green-400 group-hover:rotate-3 transition-transform" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Visualize</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">Multiple view modes</p>
                </div>
                
                <div className="group text-center hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-all" />
                    <div className="relative w-full h-full rounded-xl bg-purple-50 dark:bg-purple-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7 text-purple-600 dark:text-purple-400 group-hover:rotate-3 transition-transform" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Collaborate</h3>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">Real-time teamwork</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-gradient-to-b from-muted/10 to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Powerful Features</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to understand, manipulate, and collaborate on JSON data structures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border hover:border-primary/20">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="group text-center p-4 rounded-xl hover:bg-muted/30 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
                <div className="font-semibold mb-1 group-hover:text-primary transition-colors">{stat.label}</div>
                <div className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Start?</h2>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who trust JSON Visualizer for their data exploration needs
          </p>
          
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl text-lg font-semibold"
          >
            <FileJson className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 bg-gradient-to-t from-muted/40 to-background border-t border-border/30">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 group">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110">
                <FileJson className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-lg">JSON Visualizer</h3>
                <p className="text-xs text-muted-foreground">Modern JSON exploration</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Built with Next.js and Supabase for modern developers who need powerful JSON visualization and collaboration tools.
            </p>
            
            {/* Divider */}
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            
            {/* Copyright */}
            <div className="text-xs text-muted-foreground">
              © 2024 JSON Visualizer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
