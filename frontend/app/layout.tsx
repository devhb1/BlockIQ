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
        url: '/images/BlockIQ.png', // Social preview image
        width: 800,
        height: 600,
        alt: 'BlockIQ Logo',
      },
    ],
  },
  // Custom meta tags for Farcaster Frames integration
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/images/BlockIQ.png',
    'fc:frame:button:1': 'Start Quiz',
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
