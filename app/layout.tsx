import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FraudGuard AI - Advanced Cybersecurity Platform',
  description: 'Protect yourself from scams, phishing, and cyber threats with our advanced AI technology. Scan emails, SMS, and links in real-time.',
  keywords: 'fraud detection, cybersecurity, AI, phishing, scam protection',
  authors: [{ name: 'FraudGuard AI Team' }]
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.className} min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}