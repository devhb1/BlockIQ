'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { useEffect, useState, useMemo } from 'react'
import '@rainbow-me/rainbowkit/styles.css'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// Robust Farcaster Mini App environment detection
function isFarcasterMiniApp() {
  if (typeof window === 'undefined') return false;
  // In iframe or user agent or global object
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

// Global flag to prevent multiple initializations
let isInitialized = false

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // Memoize config to prevent multiple initializations
  const config = useMemo(() => {
    if (isInitialized) {
      console.warn('Web3Provider: Config already initialized, reusing existing config');
      return null;
    }
    isInitialized = true;

    if (typeof window !== 'undefined' && isFarcasterMiniApp()) {
      // Use only the Farcaster farcasterMiniApp connector in Farcaster Mini App
      return createConfig({
        chains: [base, mainnet],
        connectors: [farcasterMiniApp()],
        transports: {
          [base.id]: http(),
          [mainnet.id]: http(),
        },
      });
    } else {
      // Use default RainbowKit config for regular browsers
      return getDefaultConfig({
        appName: 'IQ Quiz Contest',
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'default-project-id',
        chains: [base, mainnet],
        ssr: true,
      });
    }
  }, [])

  const queryClient = useMemo(() => new QueryClient(), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !config) {
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
