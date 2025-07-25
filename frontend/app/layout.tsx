import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { ClientWeb3Provider } from '@/components/ClientWeb3Provider'
import './globals.css'

export const metadata: Metadata = {
  title: ' BlockIQ - Blockchain IQ Quiz',
  description: 'Test your blockchain IQ and pay to see your score! Challenge yourself with questions about Base, EVM, and general blockchain knowledge.',
  generator: 'v0.dev',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'),
  openGraph: {
    title: 'IQ Quiz Contest',
    description: 'Test your blockchain IQ and pay to see your score!',
    type: 'website',
    siteName: 'IQ Quiz Contest',
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/placeholder-logo.png',
    'fc:frame:button:1': 'Start Quiz',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ClientWeb3Provider>
          {children}
        </ClientWeb3Provider>
      </body>
    </html>
  )
}
