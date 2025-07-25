'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors'
import { useEffect, useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css'

// Create a custom connector for Farcaster in-app wallet
const farcasterWallet = () => {
  return injected({
    target: {
      id: 'farcaster',
      name: 'Farcaster',
      provider: typeof window !== 'undefined' ? (window as any)?.ethereum : undefined,
    },
  })
}

const config = getDefaultConfig({
  appName: 'IQ Quiz Contest',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'default-project-id',
  chains: [base, mainnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
