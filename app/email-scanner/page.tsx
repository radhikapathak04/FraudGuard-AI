'use client'

import { useState, useRef, type DragEvent } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  Mail,
  Upload,
  Zap,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  ArrowLeft,
  Loader2,
  Eye,
  X,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { authFetch, dispatchScanCompleted, addLocalScan } from '../lib/api'
import { exportScanDetailsPdf } from '../lib/pdf'

export default function EmailScanner() {
  const [emailText, setEmailText] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [scanDetails, setScanDetails] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        setEmailText(result)
      }
    }
    reader.readAsText(file)
  }

  const handleScan = async () => {
    if (!emailText.trim()) return

    setErrorMessage('')
    setIsScanning(true)
    setResult(null)

    try {
      const response = await authFetch('/api/scan/email', {
        method: 'POST',
        body: JSON.stringify({ content: emailText })
      })

      const data = await response.json()

      if (response.ok) {
        const detailsText = data.details || 'No detailed analysis is available for this scan.'
        setResult({
          isFraud: data.result === 'fraud',
          confidence: Math.round(data.confidence * 100),
          indicators: data.details ? data.details.split('\n').slice(1).map((line: string) => line.trim().replace(/^[-•]\s*/, '')) : [
            data.result === 'fraud' ? 'Suspicious sender domain' : 'Verified sender',
            data.result === 'fraud' ? 'Urgent language detected' : 'Normal language patterns',
            data.result === 'fraud' ? 'Contains suspicious links' : 'No suspicious links found'
          ],
          riskLevel: data.result === 'fraud' ? (data.confidence > 0.8 ? 'High' : 'Medium') : 'Low',
          scanId: data.scanId,
          details: detailsText,
          type: 'Email',
          content: emailText,
          result: data.result === 'fraud' ? 'Fraud' : 'Safe'
        })
        setScanDetails(detailsText)
        // persist locally so history is available offline
        addLocalScan({
          id: data.scanId || Date.now(),
          type: 'Email',
          content: emailText,
          result: data.result === 'fraud' ? 'Fraud' : 'Safe',
          confidence: Math.round(data.confidence * 100),
          details: detailsText,
          createdAt: new Date().toISOString()
        })
        dispatchScanCompleted()
      } else {
        const msg = data.message || 'Scan failed. Please try again.'
        setErrorMessage(msg)
        setResult({
          error: msg,
          isFraud: false,
          confidence: 0,
          indicators: [],
          riskLevel: 'Unknown',
          result: 'Unknown'
        })
        // save a local record so history isn't empty when backend fails
        addLocalScan({
          id: data.scanId || Date.now(),
          type: 'Email',
          content: emailText,
          result: 'Unknown',
          confidence: 0,
          details: msg,
          createdAt: new Date().toISOString()
        })
        dispatchScanCompleted()
      }
    } catch (error) {
      const msg = 'Network error. Please try again.'
      setErrorMessage(msg)
      setResult({
        error: msg,
        isFraud: false,
        confidence: 0,
        indicators: [],
        riskLevel: 'Unknown',
        result: 'Unknown'
      })
      addLocalScan({
        id: Date.now(),
        type: 'Email',
        content: emailText,
        result: 'Unknown',
        confidence: 0,
        details: msg,
        createdAt: new Date().toISOString()
      })
      dispatchScanCompleted()
    } finally {
      setIsScanning(false)
    }
  }

  const handleExportDetails = () => {
    if (!result) return
    try {
      exportScanDetailsPdf({
        scanId: result.scanId,
        type: 'Email',
        result: result.isFraud ? 'Fraud' : 'Safe',
        confidence: result.confidence,
        riskLevel: result.riskLevel,
        content: emailText,
        details: scanDetails || result.details || 'No details available'
      })
    } catch (error) {
      console.error('PDF export error:', error)
      setErrorMessage('Unable to create PDF. Please try again.')
    }
  }

  const getStatusBadge = (label: string | undefined) => {
    const normalized = label?.toLowerCase() || ''
    if (normalized === 'fraud') return 'bg-red-500/20 text-red-300'
    if (normalized === 'safe') return 'bg-emerald-500/20 text-emerald-300'
    return 'bg-slate-600/20 text-slate-200'
  }

  const clearResult = () => {
    setResult(null)
    setEmailText('')
    setShowDetails(false)
    setErrorMessage('')
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
                  <h1 className="text-2xl font-bold">Email Scanner</h1>
                  <p className="text-slate-400 text-sm">AI-powered fraud detection</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="backdrop-blur-md bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h2 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Mail className="w-6 h-6 text-blue-400" />
                <span>Email Content</span>
              </h2>

              {/* Drag & Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.eml,.msg"
                  onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />

                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Drag & drop an email file here, or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  browse files
                </button>
                <p className="text-xs text-slate-500 mt-2">Supports .txt, .eml, .msg files</p>
              </div>

              {/* Text Input */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Or paste email content directly
                </label>
                <textarea
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Paste your email content here..."
                  className="w-full h-64 bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
                />
              </div>

              <button
                onClick={handleScan}
                disabled={!emailText.trim() || isScanning}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 font-medium"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Scanning with AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Scan Email</span>
                  </>
                )}
              </button>
              {errorMessage ? (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {errorMessage}
                </div>
              ) : null}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {result ? (
              <div className="space-y-6">
                {/* Result Card */}
                <div className={`backdrop-blur-md rounded-2xl p-8 border ${
                  result.isFraud
                    ? 'bg-red-500/10 border-red-500/20'
                    : 'bg-green-500/10 border-green-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                      {result.isFraud ? (
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                      ) : (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-semibold">
                            {result.isFraud ? 'Fraud Detected' : 'Email is Safe'}
                          </h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(result.result)}`}>
                            {result.result}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm">
                          AI Confidence: {result.confidence}%
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearResult}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Risk Level */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400">Risk Level</span>
                      <span className={`font-medium ${
                        result.riskLevel === 'High' ? 'text-red-400' :
                        result.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {result.riskLevel}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          result.riskLevel === 'High' ? 'bg-red-500' :
                          result.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Confidence Chart */}
                  <div className="mb-6 bg-slate-900/50 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-4">Detection Confidence</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { name: 'Fraud Score', value: result.isFraud ? result.confidence : 100 - result.confidence },
                        { name: 'Safe Score', value: result.isFraud ? 100 - result.confidence : result.confidence }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                          formatter={(value: any) => `${value}%`}
                        />
                        <Bar dataKey="value" fill={result.isFraud ? '#ef4444' : '#10b981'} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Analysis Indicators */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      Analysis Details
                    </h4>
                    <div className="space-y-3">
                      {result.indicators.map((indicator: string, index: number) => (
                        <div key={index} className={`flex items-center space-x-3 rounded-lg p-3 ${result.isFraud ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 ${result.isFraud ? 'text-red-400' : 'text-emerald-400'}`} />
                          <span className="text-slate-300 text-sm">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowDetails(true)}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition flex flex-col items-center space-y-2"
                  >
                    <Eye className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-medium">View Details</span>
                  </button>
                  <button
                    onClick={handleExportDetails}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition flex flex-col items-center space-y-2"
                  >
                    <FileText className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-medium">Generate Report</span>
                  </button>
                </div>
                {showDetails && result && (
                  <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">Detailed Analysis</h4>
                        <p className="text-slate-400 text-sm">Full analysis notes from the email scanner.</p>
                      </div>
                      <button
                        onClick={() => setShowDetails(false)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm"
                      >
                        Close
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm text-slate-200 leading-6">{scanDetails}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="backdrop-blur-md bg-slate-800/50 rounded-2xl p-8 border border-slate-700 h-full flex items-center justify-center">
                <div className="text-center">
                  <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">Ready to Scan</h3>
                  <p className="text-slate-500">Upload an email or paste content to begin AI analysis</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}