'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Bot,
  Send,
  Mic,
  MicOff,
  ArrowLeft,
  MessageCircle,
  X,
  User,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react'

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm FraudGuard AI, your cybersecurity assistant. I can help you identify potential scams, explain security concepts, and provide safety tips. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const suggestedPrompts = [
    "How do I spot a phishing email?",
    "What are common SMS scams?",
    "How to check if a link is safe?",
    "What should I do if I suspect fraud?"
  ]

  const handleSend = async (text = input) => {
    if (!text.trim()) return

    const userMessage = { text, sender: 'user', timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      })

      const data = await response.json()

      if (!response.ok || !data.response) {
        throw new Error('AI service unavailable')
      }

      const botMessage = {
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'response'
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      // try a local fallback responder with heuristic answers for common queries
      const fallback = generateFallbackAnswer(text)
      const botMessage = {
        text: fallback,
        sender: 'bot',
        timestamp: new Date(),
        type: 'response'
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const generateFallbackAnswer = (q: string) => {
    const msg = q.toLowerCase()
    if (msg.includes('phish') || msg.includes('phishing')) {
      return 'Phishing emails often impersonate trusted sources and ask for urgent action. Check the sender domain, look for generic greetings, avoid clicking links, and verify via a separate channel. If unsure, do not reply and report it.'
    }
    if (msg.includes('sms') || msg.includes('message')) {
      return 'Common SMS scams include lottery/win notices, OTP requests, or urgent action from your bank. Do not share OTPs, do not click links, and verify sender identity via official channels.'
    }
    if (msg.includes('link') || msg.includes('url') || msg.includes('safe')) {
      return 'To check a link, inspect the domain, avoid shortened links, ensure HTTPS with valid certificate, and hover to preview links. If a site asks for credentials unexpectedly, treat it as suspicious.'
    }
    if (msg.includes('report') || msg.includes('suspicious')) {
      return 'If you suspect fraud, collect the message or email, do not engage, report it to your security team or the platform provider, and preserve headers or screenshots for investigation.'
    }
    return 'I could not reach the AI service right now, but here are general safety tips: verify senders, do not click unknown links, do not share OTPs, and report suspicious messages to the platform or security team.'
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
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
                  <h1 className="text-2xl font-bold">AI Assistant</h1>
                  <p className="text-slate-400 text-sm">FraudGuard AI Chatbot</p>
                </div>
              </div>
            </div>
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Chat Container */}
        <div className="backdrop-blur-md bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">FraudGuard AI</h2>
                <p className="text-slate-400 text-sm">Online • Ready to help</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-3 max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex space-x-3 max-w-md">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="px-6 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(prompt)}
                    className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-left text-sm text-slate-300 hover:text-white transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me about cybersecurity..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 pr-12 text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  onClick={handleVoiceInput}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition ${
                    isListening ? 'text-red-400 bg-red-500/20' : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 rounded-xl font-medium transition flex items-center space-x-2 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Help */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="font-semibold">Report Suspicious Activity</h3>
            </div>
            <p className="text-slate-400 text-sm">Found something suspicious? Report it immediately for analysis.</p>
          </motion.div>

          <motion.div
            className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="font-semibold">Security Tips</h3>
            </div>
            <p className="text-slate-400 text-sm">Get the latest cybersecurity best practices and safety guidelines.</p>
          </motion.div>

          <motion.div
            className="backdrop-blur-md bg-slate-800/50 rounded-xl p-6 border border-slate-700"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <HelpCircle className="w-6 h-6 text-blue-400" />
              <h3 className="font-semibold">FAQ</h3>
            </div>
            <p className="text-slate-400 text-sm">Find answers to frequently asked questions about online security.</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}