'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Zap, Eye, TrendingUp, Award, Mail, MessageSquare, Link as LinkIcon, Bot, History, Settings, Star, Sun, Moon } from 'lucide-react'
import { useTheme } from './context/ThemeContext'

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const pageThemeClasses = isDark ? 'min-h-screen bg-slate-950 text-white' : 'min-h-screen bg-slate-50 text-slate-950'
  const [animatedStats, setAnimatedStats] = useState({ scans: 0, frauds: 0, accuracy: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedStats(prev => ({
        scans: Math.min(prev.scans + 1234, 5000000),
        frauds: Math.min(prev.frauds + 567, 2500000),
        accuracy: Math.min(prev.accuracy + 0.5, 99.7)
      }))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { icon: Mail, title: 'Email Scanner', desc: 'Advanced AI-powered email fraud detection' },
    { icon: MessageSquare, title: 'SMS Scanner', desc: 'Real-time SMS scam detection' },
    { icon: LinkIcon, title: 'Link Detector', desc: 'Malicious URL analysis and verification' },
    { icon: Bot, title: 'AI Chatbot', desc: 'Intelligent cybersecurity assistant' },
    { icon: History, title: 'Scan History', desc: 'Complete fraud detection history' },
    { icon: Settings, title: 'Settings', desc: 'Customize your security preferences' }
  ]

  const testimonials = [
    { name: 'Sarah Johnson', role: 'Cybersecurity Analyst', content: 'This platform has revolutionized how we detect fraud. The AI accuracy is incredible.' },
    { name: 'Mike Chen', role: 'IT Manager', content: 'Saved our company thousands by catching sophisticated phishing attempts.' },
    { name: 'Emily Davis', role: 'Security Consultant', content: 'The best fraud detection tool I\'ve used. Intuitive and powerful.' }
  ]

  return (
    <div className={pageThemeClasses}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/2 h-[380px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Shield className="h-7 w-7 text-cyan-400" />
            <span className="text-lg font-bold">FraudGuard AI</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 text-sm">
            <a href="#features" className="text-slate-300 hover:text-cyan-300 transition">Features</a>
            <a href="#about" className="text-slate-300 hover:text-cyan-300 transition">About</a>
            <a href="#testimonials" className="text-slate-300 hover:text-cyan-300 transition">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800 transition"
            >
              {isDark ? <Sun className="h-4 w-4 text-cyan-300" /> : <Moon className="h-4 w-4 text-yellow-300" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link href="/dashboard" className="px-5 py-2 rounded-full bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition text-sm">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Protect Your Business from Fraud
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              FraudGuard AI combines intelligent threat detection, real-time scanning, and advanced analytics to stop scams before they impact your operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full transition transform hover:scale-105 inline-block">
                Launch Dashboard
              </Link>
              <a href="#features" className="px-8 py-4 border border-white/20 text-white hover:border-white/40 hover:bg-white/5 rounded-full transition inline-block">
                Learn More
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
          <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl bg-slate-950 border border-white/10 p-8 text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{animatedStats.scans.toLocaleString()}+</div>
            <div className="text-slate-400">Scans Performed</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl bg-slate-950 border border-white/10 p-8 text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">{animatedStats.frauds.toLocaleString()}+</div>
            <div className="text-slate-400">Frauds Detected</div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl bg-slate-950 border border-white/10 p-8 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">{animatedStats.accuracy.toFixed(1)}%</div>
            <div className="text-slate-400">AI Accuracy</div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Core Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="rounded-xl bg-slate-900 border border-white/10 p-6 hover:border-cyan-400/20 transition hover:-translate-y-1">
                <f.icon className="h-8 w-8 text-cyan-400 mb-3" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 py-20 bg-slate-900/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Trusted by Teams</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="rounded-xl bg-slate-950 border border-white/10 p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4 text-sm">"{t.content}"</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-white/10 p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-slate-300 mb-8">Launch the dashboard to begin scanning and protecting your organization.</p>
          <Link href="/dashboard" className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-full transition inline-block">
            Explore the Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="mx-auto max-w-6xl text-center text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold text-white">FraudGuard AI</span>
          </div>
          <p className="mb-6 text-sm">Advanced AI security for modern teams</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-cyan-300 transition">Privacy</a>
            <a href="#" className="hover:text-cyan-300 transition">Terms</a>
            <a href="#" className="hover:text-cyan-300 transition">Contact</a>
          </div>
          <p className="mt-6 text-xs text-slate-500">© 2026 FraudGuard AI</p>
        </div>
      </footer>
    </div>
  )
}
