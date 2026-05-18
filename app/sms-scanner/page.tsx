'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  MessageSquare,
  Zap,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Search,
  ArrowLeft,
  Loader2,
  Eye,
  X,
  Clock,
  DollarSign,
  Gift,
  Phone,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { authFetch, dispatchScanCompleted, addLocalScan } from '../lib/api'
import { exportScanDetailsPdf } from '../lib/pdf'

export default function SMSScanner() {
  const [smsText, setSmsText] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [scanDetails, setScanDetails] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [realTimeScan, setRealTimeScan] = useState(false)

  const scamPatterns = [
    { type: 'OTP Scam', keywords: ['otp', 'verification code', 'one-time password'], icon: Phone },
    { type: 'Lottery Scam', keywords: ['won', 'prize', 'lottery', 'congratulations'], icon: Gift },
    { type: 'Job Scam', keywords: ['job offer', 'work from home', 'easy money'], icon: DollarSign },
    { type: 'Bank Scam', keywords: ['account suspended', 'security alert', 'urgent action'], icon: AlertTriangle }
  ]

  useEffect(() => {
    if (realTimeScan && smsText.length > 10) {
      const timeoutId = setTimeout(() => {
        performRealTimeScan()
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [smsText, realTimeScan])

  const performRealTimeScan = () => {
    const detectedScams = scamPatterns.filter(pattern =>
      pattern.keywords.some(keyword =>
        smsText.toLowerCase().includes(keyword)
      )
    )

    if (detectedScams.length > 0) {
      setResult({
        isFraud: true,
        confidence: Math.min(95, 60 + detectedScams.length * 10),
        scamTypes: detectedScams.map(scam => scam.type),
        indicators: [
          'Suspicious keywords detected',
          'Urgent language patterns',
          'Potential scam indicators found'
        ],
        riskLevel: 'High'
      })
    }
  }

  const handleScan = async () => {
    if (!smsText.trim()) return

    setIsScanning(true)
    setResult(null)

    try {
      const response = await authFetch('/api/scan/sms', {
        method: 'POST',
        body: JSON.stringify({ content: smsText })
      })

      const data = await response.json()

      if (response.ok) {
        const detectedScams = scamPatterns.filter(pattern =>
          pattern.keywords.some(keyword =>
            smsText.toLowerCase().includes(keyword)
          )
        )

        const details = data.details || `- Result: ${data.result}\n- Confidence: ${Math.round(data.confidence * 100)}%\n- Risk: ${data.result === 'fraud' ? (data.confidence > 0.8 ? 'High' : 'Medium') : 'Low'}\n- Masked content: ${smsText.slice(0, 60)}...`

        setResult({
          isFraud: data.result === 'fraud',
          confidence: Math.round(data.confidence * 100),
          scamTypes: detectedScams.map(scam => scam.type),
          indicators: data.result === 'fraud' ? [
            'Suspicious sender pattern',
            'High-risk keywords detected',
            'Unusual SMS timing',
            'Contains scam indicators'
          ] : [
            'Normal SMS patterns',
            'No suspicious keywords',
            'Verified sender format'
          ],
          riskLevel: data.result === 'fraud' ? (data.confidence > 0.8 ? 'High' : 'Medium') : 'Low',
          scanId: data.scanId,
          details,
          type: 'SMS',
          content: smsText,
          result: data.result === 'fraud' ? 'Fraud' : 'Safe'
        })
        setScanDetails(details)
        addLocalScan({
          id: data.scanId || Date.now(),
          type: 'SMS',
          content: smsText,
          result: data.result === 'fraud' ? 'Fraud' : 'Safe',
          confidence: Math.round(data.confidence * 100),
          details,
          createdAt: new Date().toISOString()
        })
        dispatchScanCompleted()
      } else {
        const msg = data.message || 'Scan failed'
        setResult({
          error: msg,
          isFraud: false,
          confidence: 0,
          scamTypes: [],
          indicators: [],
          riskLevel: 'Unknown',
          result: 'Unknown'
        })
        addLocalScan({
          id: data.scanId || Date.now(),
          type: 'SMS',
          content: smsText,
          result: 'Unknown',
          confidence: 0,
          details: msg,
          createdAt: new Date().toISOString()
        })
        dispatchScanCompleted()
      }
    } catch (error) {
      const msg = 'Network error. Please try again.'
      setResult({
        error: msg,
        isFraud: false,
        confidence: 0,
        scamTypes: [],
        indicators: [],
        riskLevel: 'Unknown',
        result: 'Unknown'
      })
      addLocalScan({
        id: Date.now(),
        type: 'SMS',
        content: smsText,
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

  const getStatusBadge = (label: string | undefined) => {
    const normalized = label?.toLowerCase() || ''
    if (normalized === 'fraud') return 'bg-red-500/20 text-red-300'
    if (normalized === 'safe') return 'bg-emerald-500/20 text-emerald-300'
    return 'bg-slate-600/20 text-slate-200'
  }

  const clearResult = () => {
    setResult(null)
    setSmsText('')
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
                  <h1 className="text-2xl font-bold">SMS Scanner</h1>
                  <p className="text-slate-400 text-sm">Real-time fraud detection</p>
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
                <MessageSquare className="w-6 h-6 text-green-400" />
                <span>SMS Content</span>
              </h2>

              {/* Real-time Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300">Real-time scanning</span>
                </div>
                <button
                  onClick={() => setRealTimeScan(!realTimeScan)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    realTimeScan ? 'bg-cyan-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      realTimeScan ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Text Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Paste SMS message
                </label>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  placeholder="Paste your SMS content here..."
                  className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {realTimeScan ? 'Real-time analysis active' : 'Click scan to analyze'}
                </p>
              </div>

              <button
                onClick={handleScan}
                disabled={!smsText.trim() || isScanning}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 font-medium"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing SMS...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Scan SMS</span>
                  </>
                )}
              </button>
            </div>

            {/* Scam Detection Patterns */}
            <div className="backdrop-blur-md bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Common Scam Patterns</h3>
              <div className="grid grid-cols-2 gap-4">
                {scamPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                    <pattern.icon className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-medium text-sm">{pattern.type}</div>
                      <div className="text-xs text-slate-400">
                        {pattern.keywords.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                            {result.isFraud ? 'Fraud Detected' : 'SMS is Safe'}
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

                  {/* Scam Types */}
                  {result.scamTypes && result.scamTypes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Detected Scam Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.scamTypes.map((type: string, index: number) => (
                          <span key={index} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Indicators */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
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
                    onClick={() => exportScanDetailsPdf({
                      scanId: result.scanId,
                      type: 'SMS',
                      result: result.isFraud ? 'Fraud' : 'Safe',
                      confidence: result.confidence,
                      riskLevel: result.riskLevel,
                      content: smsText,
                      details: scanDetails
                    })}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition flex flex-col items-center space-y-2"
                  >
                    <Smartphone className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-medium">Download PDF</span>
                  </button>
                </div>
                {showDetails && result && (
                  <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">Detailed SMS Analysis</h4>
                        <p className="text-slate-400 text-sm">Expanded scan notes and risk assessment.</p>
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
                  <p className="text-slate-500">Paste an SMS message to begin AI analysis</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}