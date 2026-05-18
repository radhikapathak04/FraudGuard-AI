'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  ArrowLeft,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react'
import { authFetch } from '../lib/api'
import { exportReportPdf } from '../lib/pdf'

export default function Reports() {
  const [reports, setReports] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const defaultReports = {
    totalScans: 12456,
    fraudScans: 842,
    safeScans: 11614,
    accuracy: 98.7,
    emailScans: 7200,
    smsScans: 3000,
    linkScans: 2256,
    recent: [
      { title: 'Phishing SMS targeting Mumbai users', region: 'India', details: 'Multiple reports of OTP phishing via SMS.' },
      { title: 'Bank impersonation emails', region: 'India', details: 'Emails mimicking banks asking to update credentials.' },
      { title: 'Malicious marketing links', region: 'India', details: 'Spam links circulated via social platforms.' }
    ]
  }

  useEffect(() => {
    fetchReports()

    const handleScanCompleted = () => {
      fetchReports()
    }

    window.addEventListener('scanCompleted', handleScanCompleted)
    return () => window.removeEventListener('scanCompleted', handleScanCompleted)
  }, [])

  const fetchReports = async () => {
    try {
      const response = await authFetch('/api/reports')

      if (response.ok) {
        const data = await response.json()
        setReports(data)
      } else {
        // fall back to built-in sample reports
        setReports(defaultReports)
        setError('Showing sample reports')
      }
    } catch (error) {
      // show fallback sample reports when network/backend isn't available
      setReports(defaultReports)
      setError('Loaded offline sample reports')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!reports) return
    exportReportPdf(reports)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p>Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error && !reports) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Reports</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Link href="/dashboard" className="px-6 py-2 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-cyan-400" />
                <div>
                  <h1 className="text-2xl font-bold">Security Reports</h1>
                  <p className="text-slate-400 text-sm">Detailed analysis of your security scans</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchReports}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={exportReport}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{reports?.totalScans || 0}</span>
            </div>
            <h3 className="font-semibold mb-1">Total Scans</h3>
            <p className="text-sm text-slate-400">All security checks performed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-red-400">{reports?.fraudScans || 0}</span>
            </div>
            <h3 className="font-semibold mb-1">Fraud Detected</h3>
            <p className="text-sm text-slate-400">Potential security threats</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">{reports?.safeScans || 0}</span>
            </div>
            <h3 className="font-semibold mb-1">Safe Content</h3>
            <p className="text-sm text-slate-400">Verified secure messages</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{reports?.accuracy || 0}%</span>
            </div>
            <h3 className="font-semibold mb-1">AI Accuracy</h3>
            <p className="text-sm text-slate-400">Detection success rate</p>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scan Type Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <h3 className="text-xl font-semibold mb-6">Scan Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Email Scans</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${reports?.totalScans ? (reports.emailScans / reports.totalScans) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-400 w-8">{reports?.emailScans || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>SMS Scans</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${reports?.totalScans ? (reports.smsScans / reports.totalScans) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-400 w-8">{reports?.smsScans || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Link Scans</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${reports?.totalScans ? (reports.linkScans / reports.totalScans) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-400 w-8">{reports?.linkScans || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Risk Assessment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
          >
            <h3 className="text-xl font-semibold mb-6">Risk Assessment</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Low Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm text-slate-400 w-8">60%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Medium Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-sm text-slate-400 w-8">30%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>High Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 transition-all duration-500" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm text-slate-400 w-8">10%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700"
        >
          <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="font-medium">Email scan completed</p>
                  <p className="text-sm text-slate-400">Result: Safe</p>
                </div>
              </div>
              <span className="text-sm text-slate-400">2 hours ago</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="font-medium">SMS scan completed</p>
                  <p className="text-sm text-slate-400">Result: Fraud detected</p>
                </div>
              </div>
              <span className="text-sm text-slate-400">5 hours ago</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium">Link scan completed</p>
                  <p className="text-sm text-slate-400">Result: Safe</p>
                </div>
              </div>
              <span className="text-sm text-slate-400">1 day ago</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}