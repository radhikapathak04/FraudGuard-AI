'use client'

import Link from 'next/link'
import { Shield, ArrowLeft, User, Lock, Bell, ShieldCheck } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-slate-400 text-sm">Manage your account preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold">Account</h2>
            </div>
            <p className="text-slate-400 text-sm">View and manage your account settings, change password, or update profile information.</p>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold">Security</h2>
            </div>
            <p className="text-slate-400 text-sm">Configure two-factor authentication, session control, and sign-out options.</p>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <p className="text-slate-400 text-sm">Set email alerts for suspicious activity and security updates.</p>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold">Privacy</h2>
            </div>
            <p className="text-slate-400 text-sm">Review privacy controls and how scan data is stored securely.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
