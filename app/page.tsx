'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { 
  FileJson, 
  Upload, 
  Globe, 
  Code, 
  Users, 
  Zap,
  ArrowRight,
  TreePine,
  Eye,
  Sparkles,
  Github,
  ChevronRight,
  Table2,
  Search
} from 'lucide-react'

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    
    // Setup Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    // Observe all elements with data-animate attribute
    const elements = document.querySelectorAll('[data-animate]')
    elements.forEach((el) => observerRef.current?.observe(el))
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      observerRef.current?.disconnect()
    }
  }, [])

  const features = [
    {
      icon: <Upload className="w-5 h-5" />,
      title: "Smart Import",
      description: "Drag, drop, paste, or fetch—we handle the rest"
    },
    {
      icon: <TreePine className="w-5 h-5" />,
      title: "Adaptive Views", 
      description: "Tree, table, or raw—see your data your way"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Live Collab",
      description: "Real-time cursors and instant sync"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Blazing Fast",
      description: "Handles massive files without breaking a sweat"
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Deep Search",
      description: "Find anything instantly in nested structures"
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Dev Tools",
      description: "Copy paths, export, integrate seamlessly"
    }
  ]

  const handleGetStarted = () => {
    window.location.href = '/auth/sign-up'
  }

  const handleLogin = () => {
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInHeader {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out forwards;
        }

        .animate-fade-in-left {
          animation: fadeInLeft 0.6s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .animate-slide-in-header {
          animation: slideInHeader 0.6s ease-out forwards;
        }

        /* Only animate scroll-triggered elements */
        [data-animate]:not(.hero-element) {
          opacity: 0;
        }

        [data-animate].visible {
          animation-fill-mode: forwards;
        }
      `}</style>

      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-[0.15] blur-3xl"
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)',
            left: `${mousePosition.x - 400}px`,
            top: `${mousePosition.y - 400}px`,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Header - slides down on load */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full px-6 animate-slide-in-header">
        <div className="max-w-6xl mx-auto">
          <div className="border border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl px-6 py-4 transition-all duration-300 hover:border-white/20 hover:bg-black/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/20 blur-md rounded-lg group-hover:bg-white/30 transition-all" />
                  <div className="relative bg-gradient-to-br from-white to-white/70 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <FileJson className="w-5 h-5 text-black" />
                  </div>
                </div>
                <span className="text-lg font-semibold">JSON Visualizer</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost"
                  onClick={handleLogin}
                  className="text-white/70 hover:text-white hover:bg-white/10 transition-all hover:scale-105"
                >
                  Sign In
                </Button>
                <Link href={'dashboard'}>
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-white text-black hover:bg-white/90 font-medium transition-all hover:scale-105"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hero-element animate-scale-in"
              style={{ animationDelay: '0.1s' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium">Open Source Side Project</span>
            </div>

            {/* Headline */}
            <h1 
              className="text-6xl md:text-8xl font-bold tracking-tight hero-element animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <span className="block mb-2">JSON made</span>
              <span className="block bg-gradient-to-r from-white via-white/90 to-white/70 text-transparent bg-clip-text">
                simple
              </span>
            </h1>

            {/* Subheadline */}
            <p 
              className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed hero-element animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              A clean, powerful way to visualize and collaborate on JSON data structures
            </p>

            {/* CTA Buttons */}
            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 hero-element animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              <Link href={'dashboard'}>
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="bg-white text-black hover:bg-white/90 border-0 px-8 h-12 text-base font-semibold"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 h-12 text-base"
              >
                <Globe className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </div>
          </div>

          {/* Feature Showcase Cards - stagger animation from left, center, right */}
          <div className="mt-24 grid md:grid-cols-3 gap-4">
            {/* Tree View - from left */}
            <Card 
              id="card-tree"
              data-animate
              className={`bg-white/5 border-white/10 backdrop-blur-sm p-6 hover:bg-white/[0.07] transition-all ${isVisible['card-tree'] ? 'visible animate-fade-in-left' : ''}`}
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <TreePine className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Tree View</h3>
              </div>
              <div className="space-y-2 font-mono text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  <span>data</span>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <ChevronRight className="w-3 h-3" />
                  <span>users [3]</span>
                </div>
                <div className="flex items-center gap-2 pl-8">
                  <span className="text-white/40">→</span>
                  <span>name: &quot;John&quot;</span>
                </div>
                <div className="flex items-center gap-2 pl-8">
                  <span className="text-white/40">→</span>
                  <span>age: 25</span>
                </div>
              </div>
            </Card>

            {/* Table View - from center/scale */}
            <Card 
              id="card-table"
              data-animate
              className={`bg-white/5 border-white/10 backdrop-blur-sm p-6 hover:bg-white/[0.07] transition-all ${isVisible['card-table'] ? 'visible animate-scale-in' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <Table2 className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Table View</h3>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pb-2 border-b border-white/10">
                  <span className="text-white/60">Name</span>
                  <span className="text-white/60">Status</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-white/60">
                  <span>John</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-white/60">
                  <span>Sarah</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </Card>

            {/* Search - from right */}
            <Card 
              id="card-search"
              data-animate
              className={`bg-white/5 border-white/10 backdrop-blur-sm p-6 hover:bg-white/[0.07] transition-all ${isVisible['card-search'] ? 'visible animate-fade-in-right' : ''}`}
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-white/10">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-semibold">Deep Search</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <Search className="w-3 h-3 text-white/40" />
                  <span className="text-xs text-white/60">Search nested data...</span>
                </div>
                <div className="text-xs text-white/40 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-white/60" />
                    <span>Find any key or value</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-white/60" />
                    <span>Instant results</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Section header - fades in from bottom */}
          <div 
            id="features-header"
            data-animate
            className={`text-center mb-16 ${isVisible['features-header'] ? 'visible animate-fade-in-up' : ''}`}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What it offers
            </h2>
            <p className="text-lg text-white/60">
              Everything you need to work with JSON effectively
            </p>
          </div>

          {/* Feature cards - stagger from bottom */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card 
                key={index}
                id={`feature-${index}`}
                data-animate
                className={`group relative bg-white/5 border-white/10 hover:bg-white/[0.07] transition-all duration-300 p-6 overflow-hidden ${isVisible[`feature-${index}`] ? 'visible animate-fade-in-up' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-3">
                  <div className="inline-flex p-2 rounded-lg bg-white/10 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-white/60 text-sm">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack - scales in */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div 
            id="tech-stack"
            data-animate
            className={`rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden ${isVisible['tech-stack'] ? 'visible animate-scale-in' : ''}`}
          >
            <div className="text-center p-12 pb-8">
              <h2 className="text-3xl font-bold mb-3">Built with modern tools</h2>
              <p className="text-white/60">Powered by Next.js, React, and Supabase</p>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-12 pt-8">
              {[
                { value: "Real-time", label: "Collaboration" },
                { value: "Multiple", label: "View Modes" },
                { value: "10MB", label: "Max File Size" },
                { value: "Fast", label: "Performance" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - fades in from bottom */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <div 
            id="final-cta"
            data-animate
            className={`relative rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-16 overflow-hidden ${isVisible['final-cta'] ? 'visible animate-fade-in-up' : ''}`}
          >
            {/* Subtle background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
            
            <div className="relative text-center space-y-8">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Ready to dive in?
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Visualize complex JSON structures, collaborate in real-time, 
                and explore your data like never before
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href={'dashboard'}>
                  <Button 
                    size="lg" 
                    onClick={handleGetStarted}
                    className="bg-white text-black hover:bg-white/90 border-0 px-8 h-12 text-base font-semibold hover:scale-105 transition-all"
                  >
                    Get Started Free
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 h-12 text-base hover:scale-105 transition-all"
                >
                  <Github className="w-5 h-5 mr-2" />
                  <a href="https://github.com/nsl-nikos/json">
                    View on GitHub
                  </a>
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 pt-4 text-sm text-white/40">
                <span>Free to use</span>
                <span>•</span>
                <span>Open source</span>
                <span>•</span>
                <span>Modern interface</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - fades in from bottom */}
      <footer 
        id="footer"
        data-animate
        className={`border-t border-white/5 py-12 px-6 ${isVisible['footer'] ? 'visible animate-fade-in-up' : ''}`}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-white to-white/70 p-2 rounded-lg">
                <FileJson className="w-4 h-4 text-black" />
              </div>
              <span className="font-semibold">JSON Visualizer</span>
            </div>
            
            <div className="text-sm text-white/40">
              Made with <span className='text-white'>🤍</span> by <a href="https://github.com/nsl-nikos" target='_blank' className='text-white/80 hover:text-white duration-300'>nsl-nikos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}