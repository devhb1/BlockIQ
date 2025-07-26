/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    const timestamp = new Date().toISOString();
    const deploymentId = `deploy-${Date.now()}`;
    
    return [
      {
        source: '/(.*)',
        // Force cache invalidation with updated CSP - Deployment #4
        headers: [
          // Ultra aggressive cache busting
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, private',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: 'Thu, 01 Jan 1970 00:00:00 GMT',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          {
            key: 'Clear-Site-Data',
            value: '"cache", "cookies", "storage"',
          },
          // Frame embedding headers
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          // Comprehensive CSP for Farcaster Mini Apps - Version 4
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.farcaster.xyz https://*.warpcast.com https://*.walletconnect.com https://*.rainbow.me https://*.privy.io https://explorer-api.walletconnect.com https://relay.walletconnect.com https://api.walletconnect.com https://*.coinbase.com https://pulse.walletconnect.org https://api.web3modal.org",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.rainbow.me https://*.walletconnect.com",
              "font-src 'self' https://fonts.gstatic.com https://*.rainbow.me https://*.walletconnect.com",
              "img-src 'self' data: https: blob: https://*.walletconnect.com https://*.rainbow.me https://pulse.walletconnect.org https://api.web3modal.org",
              "connect-src 'self' https://*.farcaster.xyz https://*.warpcast.com https://*.walletconnect.com https://*.rainbow.me https://*.privy.io https://*.rpc.privy.systems https://relay.walletconnect.com https://*.infura.io https://*.alchemy.com https://*.quicknode.com https://*.cloudflare.com https://*.coinbase.com https://explorer-api.walletconnect.com https://cca-lite.coinbase.com https://api.walletconnect.com https://*.warpcast.com https://client.warpcast.com https://client.farcaster.xyz https://pulse.walletconnect.org https://api.web3modal.org",
              "frame-src 'self' https://*.farcaster.xyz https://*.warpcast.com https://*.walletconnect.com https://*.rainbow.me https://*.privy.io https://*.coinbase.com",
              "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com https://farcaster.xyz https://warpcast.com https://client.farcaster.xyz https://client.warpcast.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
          // Debug headers
          {
            key: 'X-Debug-Deploy',
            value: timestamp,
          },
          {
            key: 'X-CSP-Version',
            value: '4',
          },
          {
            key: 'X-Deployment-ID',
            value: deploymentId,
          }
        ],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

export default nextConfig
