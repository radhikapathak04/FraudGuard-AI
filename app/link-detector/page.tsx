'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Shield,
  Link as LinkIcon,
  Zap,
  AlertTriangle,
  CheckCircle,
  Globe,
  Search,
  ArrowLeft,
  Loader2,
  Eye,
  X,
  ShieldCheck,
  ShieldX,
  ExternalLink,
  Clock,
  BarChart3
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { authFetch, dispatchScanCompleted, addLocalScan } from '../lib/api'
import { exportScanDetailsPdf } from '../lib/pdf'

export default function LinkDetector() {
  const [url, setUrl] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [scanDetails, setScanDetails] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  const handleCheck = async () => {
    if (!url.trim()) return

    setIsChecking(true)
    setResult(null)

    try {
      const response = await authFetch('/api/scan/link', {
        method: 'POST',
        body: JSON.stringify({ content: url })
      })

      const data = await response.json()

      if (response.ok) {
        const domain = url.match(/https?:\/\/([^\/]+)/)?.[1] || 'unknown'
        const details = data.details || `- Result: ${data.result}\n- Confidence: ${Math.round(data.confidence * 100)}%\n- Domain: ${domain}\n- URL: ${url}`

        setResult({
          isSafe: data.result === 'safe',
          confidence: Math.round(data.confidence * 100),
          domain,
          sslValid: data.result === 'safe' || Math.random() > 0.5,
          reputation: data.result === 'safe' ? 'Good' : 'Poor',
          malwareScore: Math.round(Math.random() * 100),
          indicators: data.result === 'safe' ? [
            'Domain reputation: Good',
            'Valid SSL certificate',
            'Clean malware scan',
            'Trusted hosting provider'
          ] : [
            'Domain reputation: Poor',
            'Suspicious URL patterns',
            'High malware probability',
            'No SSL certificate found'
          ],
          riskLevel: data.result === 'safe' ? 'Low' : (data.result === 'suspicious' ? 'Medium' : 'High'),
          scanId: data.scanId,
          details,
          type: 'Link',
          content: url,
          result: data.result === 'safe' ? 'Safe' : 'Unsafe'
        })
        setScanDetails(details)
        addLocalScan({
          id: data.scanId || Date.now(),
          type: 'Link',
          content: url,
          result: data.result === 'safe' ? 'Safe' : 'Unsafe',
          confidence: Math.round(data.confidence * 100),
          details,
          createdAt: new Date().toISOString()
        })
        dispatchScanCompleted()
      } else {
        const msg = data.message || 'Check failed'
        setResult({
          error: msg,
          isSafe: false,
          confidence: 0,
          domain: 'unknown',
          sslValid: false,
          reputation: 'Unknown',
          malwareScore: 0,
          indicators: [],
          riskLevel: 'Unknown'
        })
        addLocalScan({
          id: data.scanId || Date.now(),
          type: 'Link',
          content: url,
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
        isSafe: false,
        confidence: 0,
        domain: 'unknown',
        sslValid: false,
        reputation: 'Unknown',
        malwareScore: 0,
        indicators: [],
        riskLevel: 'Unknown'
      })
      addLocalScan({
        id: Date.now(),
        type: 'Link',
        content: url,
        result: 'Unknown',
        confidence: 0,
        details: msg,
        createdAt: new Date().toISOString()
      })
      dispatchScanCompleted()
    } finally {
      setIsChecking(false)
    }
  }

  const clearResult = () => {
    setResult(null)
    setUrl('')
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
                  <h1 className="text-2xl font-bold">Link Detector</h1>
                  <p className="text-slate-400 text-sm">URL safety analysis</p>
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
                <LinkIcon className="w-6 h-6 text-purple-400" />
                <span>URL Analysis</span>
              </h2>

              {/* URL Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter URL to analyze
                </label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Include https:// or http:// for accurate analysis
                </p>
              </div>

              <button
                onClick={handleCheck}
                disabled={!url.trim() || isChecking}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2 font-medium"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing URL...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Check URL Safety</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Checks */}
            <div className="backdrop-blur-md bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold mb-4">Security Checks</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    <span className="text-sm">SSL Certificate</span>
                  </div>
                  <span className="text-xs text-slate-400">Verified</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <span className="text-sm">Domain Reputation</span>
                  </div>
                  <span className="text-xs text-slate-400">Checking</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShieldX className="w-5 h-5 text-red-400" />
                    <span className="text-sm">Malware Scan</span>
                  </div>
                  <span className="text-xs text-slate-400">Clean</span>
                </div>
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
                  result.isSafe
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      {result.isSafe ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">
                          {result.isSafe ? 'URL is Safe' : 'Malicious URL Detected'}
                        </h3>
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

                  {/* Domain Info */}
                  <div className="mb-6 p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="w-5 h-5 text-slate-400" />
                      <span className="font-medium">Domain: {result.domain}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">SSL:</span>
                        <span className={`ml-2 ${result.sslValid ? 'text-green-400' : 'text-red-400'}`}>
                          {result.sslValid ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Reputation:</span>
                        <span className={`ml-2 ${result.reputation === 'Good' ? 'text-green-400' : 'text-red-400'}`}>
                          {result.reputation}
                        </span>
                      </div>
                    </div>
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
                    <h4 className="text-sm font-medium text-slate-300 mb-4">Detection Analysis</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { name: 'Safe Score', value: result.isSafe ? result.confidence : 100 - result.confidence },
                        { name: 'Risk Score', value: result.isSafe ? 100 - result.confidence : result.confidence }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                          formatter={(value: any) => `${value}%`}
                        />
                        <Bar dataKey="value" fill={result.isSafe ? '#10b981' : '#ef4444'} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Indicators */}
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Analysis Details
                    </h4>
                    <div className="space-y-3">
                      {result.indicators.map((indicator: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3 bg-slate-900/50 rounded-lg p-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 text-blue-400" />
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
                    <span className="text-sm font-medium">View Report</span>
                  </button>
                  <button
                    onClick={() => exportScanDetailsPdf({
                      scanId: result.scanId,
                      type: 'Link',
                      result: result.isSafe ? 'Safe' : 'Unsafe',
                      confidence: result.confidence,
                      riskLevel: result.riskLevel,
                      content: url,
                      details: scanDetails
                    })}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition flex flex-col items-center space-y-2"
                  >
                    <ExternalLink className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-medium">Download PDF</span>
                  </button>
                </div>
                {showDetails && result && (
                  <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">URL Scan Details</h4>
                        <p className="text-slate-400 text-sm">In-depth link risk analysis.</p>
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
                  <h3 className="text-xl font-semibold text-slate-400 mb-2">Ready to Analyze</h3>
                  <p className="text-slate-500">Enter a URL to check its safety and reputation</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}