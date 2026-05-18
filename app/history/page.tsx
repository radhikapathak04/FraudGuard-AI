'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  History as HistoryIcon,
  Search,
  Filter,
  Download,
  ArrowLeft,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Eye
} from 'lucide-react'
import { authFetch, getLocalScans } from '../lib/api'
import { exportScanHistoryPdf } from '../lib/pdf'

export default function History() {
  const [scans, setScans] = useState<any[]>([])
  const [filteredScans, setFilteredScans] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterResult, setFilterResult] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchHistory = async () => {
    setLoading(true)
    try {
      // try server first
      const response = await authFetch('/api/history', {
        method: 'GET'
      })

      if (response.ok) {
        const data = await response.json()
        const normalizedData = data.map((scan: any) => ({
          id: scan._id || scan.id,
          type: scan.type ? scan.type.charAt(0).toUpperCase() + scan.type.slice(1) : 'Unknown',
          content: scan.content || '',
          result: scan.result ? scan.result.charAt(0).toUpperCase() + scan.result.slice(1) : 'Unknown',
          confidence: Math.round((scan.confidence || 0) * 100),
          timestamp: new Date(scan.createdAt || scan.timestamp || Date.now()),
          details: scan.details || (scan.result === 'fraud' ? 'Suspicious content detected' : 'Scan result recorded')
        }))

        setScans(normalizedData)
        setFilteredScans(normalizedData)
        setError('')
      } else {
        // fallback to local storage if server fails
        const local = getLocalScans()
        const normalizedData = local.map((scan: any) => ({
          id: scan.id,
          type: scan.type,
          content: scan.content,
          result: scan.result,
          confidence: scan.confidence,
          timestamp: new Date(scan.createdAt || Date.now()),
          details: scan.details || ''
        }))
        setScans(normalizedData)
        setFilteredScans(normalizedData)
        setError('Loaded local history')
      }
    } catch (fetchError: any) {
      console.error('History load error:', fetchError)
      // fallback to local history
      const local = getLocalScans()
      const normalizedData = local.map((scan: any) => ({
        id: scan.id,
        type: scan.type,
        content: scan.content,
        result: scan.result,
        confidence: scan.confidence,
        timestamp: new Date(scan.createdAt || Date.now()),
        details: scan.details || ''
      }))
      setScans(normalizedData)
      setFilteredScans(normalizedData)
      setError('Loaded local history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()

    const handleScanCompleted = () => {
      fetchHistory()
    }

    window.addEventListener('scanCompleted', handleScanCompleted)
    return () => {
      window.removeEventListener('scanCompleted', handleScanCompleted)
    }
  }, [])

  useEffect(() => {
    let filtered = scans

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(scan =>
        scan.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(scan => scan.type.toLowerCase() === filterType)
    }

    // Filter by result
    if (filterResult !== 'all') {
      filtered = filtered.filter(scan => scan.result.toLowerCase() === filterResult)
    }

    setFilteredScans(filtered)
  }, [scans, searchTerm, filterType, filterResult])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email': return <Mail className="w-5 h-5 text-blue-400" />
      case 'SMS': return <MessageSquare className="w-5 h-5 text-green-400" />
      case 'Link': return <LinkIcon className="w-5 h-5 text-purple-400" />
      default: return <FileText className="w-5 h-5 text-slate-400" />
    }
  }

  const getResultColor = (result: string) => {
    const normalized = result.toLowerCase()
    if (normalized === 'fraud') return 'text-red-400 bg-red-500/20'
    if (normalized === 'safe') return 'text-emerald-400 bg-emerald-500/20'
    return 'text-slate-300 bg-slate-600/20'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-300'
    if (confidence >= 50) return 'text-amber-300'
    return 'text-slate-300'
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes} min ago`
    if (hours < 24) return `${hours} hours ago`
    return `${days} days ago`
  }

  const exportReport = () => {
    exportScanHistoryPdf(filteredScans)
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
                  <h1 className="text-2xl font-bold">Scan History</h1>
                  <p className="text-slate-400 text-sm">View and manage your security scans</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters and Search */}
        <div className="backdrop-blur-md bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search scans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-9 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="link">Link</option>
              </select>
            </div>

            {/* Result Filter */}
            <div className="relative">
              <select
                value={filterResult}
                onChange={(e) => setFilterResult(e.target.value)}
                className="pl-4 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              >
                <option value="all">All Results</option>
                <option value="fraud">Fraud</option>
                <option value="safe">Safe</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={exportReport}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg font-medium transition flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {(loading || error) && (
          <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-slate-100">
            {loading && <p>Loading scan history...</p>}
            {error && <p className="text-red-300">{error}</p>}
          </div>
        )}

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3">
              <HistoryIcon className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold">{filteredScans.length}</div>
                <div className="text-slate-400 text-sm">Total Scans</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold">
                  {filteredScans.filter(s => s.result === 'Fraud').length}
                </div>
                <div className="text-slate-400 text-sm">Frauds Detected</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold">
                  {filteredScans.filter(s => s.result === 'Safe').length}
                </div>
                <div className="text-slate-400 text-sm">Safe Results</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(filteredScans.reduce((acc, s) => acc + s.confidence, 0) / filteredScans.length) || 0}%
                </div>
                <div className="text-slate-400 text-sm">Avg Confidence</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scan History Table */}
        <div className="backdrop-blur-md bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold">Scan History</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Result</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredScans.map((scan) => (
                  <motion.tr
                    key={scan.id || scan._id}
                    className="hover:bg-slate-700/30 transition"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(scan.type)}
                        <span className="text-slate-100 font-medium">{scan.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-100 max-w-xs truncate">{scan.content}</div>
                      <div className="text-slate-400 text-sm">{scan.details}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getResultColor(scan.result)}`}>
                        {scan.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-100">
                      {scan.confidence}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {formatTime(scan.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredScans.length === 0 && (
            <div className="p-12 text-center">
              <HistoryIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">No scans found</h3>
              <p className="text-slate-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}