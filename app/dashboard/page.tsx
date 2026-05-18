'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  Bot,
  History,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [showQuickOptions, setShowQuickOptions] = useState(false)
  const isDarkMode = theme === 'dark'

  const quickScanOptions = [
    { id: 'email', label: 'Scan Email', href: '/email-scanner', icon: Mail },
    { id: 'sms', label: 'Scan SMS', href: '/sms-scanner', icon: MessageSquare },
    { id: 'link', label: 'Check Link', href: '/link-detector', icon: LinkIcon }
  ]

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'email', label: 'Email Scanner', icon: Mail, href: '/email-scanner' },
    { id: 'sms', label: 'SMS Scanner', icon: MessageSquare, href: '/sms-scanner' },
    { id: 'links', label: 'Link Detector', icon: LinkIcon, href: '/link-detector' },
    { id: 'chatbot', label: 'AI Chatbot', icon: Bot, href: '/chatbot' },
    { id: 'reports', label: 'Reports', icon: PieChart, href: '/reports' },
    { id: 'history', label: 'History', icon: History, href: '/history' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }
  ]

  const stats = [
    { title: 'Total Scans', value: '12,847', change: '+12%', icon: Activity, color: 'text-blue-400' },
    { title: 'Frauds Detected', value: '3,421', change: '+8%', icon: AlertTriangle, color: 'text-red-400' },
    { title: 'Safe Messages', value: '9,426', change: '+15%', icon: CheckCircle, color: 'text-green-400' },
    { title: 'AI Accuracy', value: '99.7%', change: '+0.3%', icon: Zap, color: 'text-yellow-400' }
  ]

  const recentScans = [
    { type: 'Email', content: 'Subject: Urgent Account Update', result: 'Fraud', time: '2 min ago' },
    { type: 'SMS', content: 'You won $1,000,000! Click here...', result: 'Fraud', time: '15 min ago' },
    { type: 'Link', content: 'https://suspicious-bank.com/login', result: 'Safe', time: '1 hour ago' },
    { type: 'Email', content: 'Meeting reminder for tomorrow', result: 'Safe', time: '2 hours ago' }
  ]

  const pageThemeClasses = isDarkMode ? 'min-h-screen bg-slate-950 text-white' : 'min-h-screen bg-slate-50 text-slate-950'

  return (
    <div className={`${pageThemeClasses} flex`}>
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 relative">
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="w-8 h-8 text-cyan-400" />
          <span className="text-xl font-bold">FraudGuard AI</span>
        </div>

        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition"
                >
                  <item.icon className="w-5 h-5 text-slate-400" />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition ${
                    activeTab === item.id ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-8">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5 mr-2" /> : <Moon className="w-5 h-5 mr-2" />}
            <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="relative flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-400">Welcome back! Here's your security overview.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="relative z-50">
              <button
                onClick={() => setShowQuickOptions((prev) => !prev)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition"
              >
                Quick Scan
              </button>
              {showQuickOptions && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-lg z-50">
                  {quickScanOptions.map((option) => (
                    <Link
                      key={option.id}
                      href={option.href}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-100 hover:bg-slate-800 transition"
                      onClick={() => setShowQuickOptions(false)}
                    >
                      <option.icon className="w-4 h-4 text-cyan-400" />
                      {option.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.title}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Meter */}
          <motion.div
            className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-semibold mb-6">Risk Assessment</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Risk Level</span>
                <span className="text-green-400 font-medium">Low</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-yellow-500 h-3 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">25%</div>
                  <div className="text-sm text-slate-400">Low Risk</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">50%</div>
                  <div className="text-sm text-slate-400">Medium Risk</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">25%</div>
                  <div className="text-sm text-slate-400">High Risk</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Scans */}
          <motion.div
            className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-semibold mb-6">Recent Scans</h3>
            <div className="space-y-4">
              {recentScans.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {scan.type === 'Email' && <Mail className="w-5 h-5 text-blue-400" />}
                    {scan.type === 'SMS' && <MessageSquare className="w-5 h-5 text-green-400" />}
                    {scan.type === 'Link' && <LinkIcon className="w-5 h-5 text-purple-400" />}
                    <div>
                      <div className="font-medium">{scan.type}</div>
                      <div className="text-sm text-slate-400 truncate max-w-48">{scan.content}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${scan.result === 'Fraud' ? 'text-red-400' : 'text-green-400'}`}>
                      {scan.result}
                    </div>
                    <div className="text-sm text-slate-500">{scan.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mt-8 backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/email-scanner" className="flex flex-col items-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition">
              <Mail className="w-8 h-8 text-blue-400 mb-2" />
              <span className="text-sm font-medium">Scan Email</span>
            </Link>
            <Link href="/sms-scanner" className="flex flex-col items-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition">
              <MessageSquare className="w-8 h-8 text-green-400 mb-2" />
              <span className="text-sm font-medium">Scan SMS</span>
            </Link>
            <Link href="/link-detector" className="flex flex-col items-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition">
              <LinkIcon className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-sm font-medium">Check Link</span>
            </Link>
            <Link href="/chatbot" className="flex flex-col items-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition">
              <Bot className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-sm font-medium">AI Assistant</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}