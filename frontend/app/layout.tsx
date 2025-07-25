// Import Next.js metadata type for static site metadata
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ClientWeb3Provider } from '@/components/ClientWeb3Provider'
import './globals.css'


// App-wide metadata for SEO, social sharing, and Farcaster integration
export const metadata: Metadata = {
  title: 'BlockIQ - Blockchain IQ Quiz',
  description: 'Test your blockchain IQ and pay to see your score! Challenge yourself with questions about Base, EVM, and general blockchain knowledge.',
  // Used for generating absolute URLs in meta tags
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.blockiq.xyz'),
  // Open Graph config for rich link previews (Twitter, Discord, etc.)
  openGraph: {
    title: 'BlockIQ Quiz',
    description: 'Test your blockchain IQ and pay to see your score!',
    type: 'website',
    siteName: 'BlockIQ Quiz',
    images: [
      {
        url: '/BlockIQ.png', // Social preview image
        width: 512,
        height: 512,
        alt: 'BlockIQ Logo',
      },
    ],
  },
  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'BlockIQ Quiz',
    description: 'Test your blockchain IQ and pay to see your score!',
    images: ['/BlockIQ.png'],
  },
  // Farcaster Mini App and Frame integration metadata
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/BlockIQ.png',
    'fc:frame:button:1': 'Start Quiz',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': '/',
    // Farcaster Mini App manifest
    'farcaster:manifest': '/.well-known/farcaster.json',
    // Mobile optimization for Farcaster
    'viewport': 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
}


// ---
// RootLayout: wraps all pages, sets up fonts, global styles, and Web3 context
// ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Responsive meta tag for mobile support */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        // ...existing code...
        
        {/* Inject custom font variables for Geist fonts */}
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {/* Web3Provider gives access to wallet connection and blockchain features throughout the app */}
        <ClientWeb3Provider>
          {children}
        </ClientWeb3Provider>
      </body>
    </html>
  )
}
