'use client'

import { useEffect, useState, useMemo } from 'react'
import { base, mainnet } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Robust Farcaster Mini App environment detection
function isFarcasterMiniApp() {
  if (typeof window === 'undefined') return false;
  const isIframe = window.parent !== window;
  const ua = navigator.userAgent || '';
  const hasFarcaster = (window as any).farcaster !== undefined;
  const urlParams = new URLSearchParams(window.location.search);
  const isMiniAppParam = urlParams.has('frame') || urlParams.has('miniapp');
  return (
    isIframe ||
    /Farcaster|Warpcast/i.test(ua) ||
    hasFarcaster ||
    isMiniAppParam
  );
}

let isInitialized = false

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [RainbowKitProvider, setRainbowKitProvider] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    if (isInitialized) return
    isInitialized = true

    if (typeof window !== 'undefined' && isFarcasterMiniApp()) {
      // Only Farcaster connector in Mini App context
      const farcasterConnector = farcasterMiniApp();
      setConfig(createConfig({
        chains: [base, mainnet],
        connectors: [farcasterConnector],
        transports: {
          [base.id]: http(),
          [mainnet.id]: http(),
        },
      }))
      setRainbowKitProvider(null)
    } else {
      // Dynamically import RainbowKit and getDefaultConfig for regular web
      (async () => {
        const { getDefaultConfig, RainbowKitProvider: RKP } = await import('@rainbow-me/rainbowkit')
        const config = getDefaultConfig({
          appName: 'IQ Quiz Contest',
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'default-project-id',
          chains: [base, mainnet],
          ssr: true,
        })
        setConfig(config)
        setRainbowKitProvider(() => RKP)
      })()
    }
  }, [])

  const queryClient = useMemo(() => new QueryClient(), [])

  if (!mounted || !config) {
    return <>{children}</>
  }

  if (RainbowKitProvider) {
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

  // Mini App: No RainbowKitProvider
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
