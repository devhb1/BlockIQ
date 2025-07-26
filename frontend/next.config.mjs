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
    
    return [
      {
        source: '/(.*)',
        // Force cache invalidation with updated CSP - Deployment #3
        headers: [
          // Aggressive cache busting
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'Surrogate-Control',
            value: 'no-store',
          },
          // Frame embedding headers
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          // Comprehensive CSP for Farcaster Mini Apps
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.farcaster.xyz https://*.warpcast.com https://*.walletconnect.com https://*.rainbow.me https://*.privy.io https://explorer-api.walletconnect.com https://relay.walletconnect.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.rainbow.me",
              "font-src 'self' https://fonts.gstatic.com https://*.rainbow.me",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.farcaster.xyz https://*.warpcast.com https://*.walletconnect.com https://*.rainbow.me https://*.privy.io https://*.rpc.privy.systems https://relay.walletconnect.com https://*.infura.io https://*.alchemy.com https://*.quicknode.com https://*.cloudflare.com https://*.coinbase.com https://explorer-api.walletconnect.com https://cca-lite.coinbase.com https://api.walletconnect.com",
              "frame-src 'self' https://*.farcaster.xyz https://*.warpcast.com https://*.walletconnect.com https://*.rainbow.me https://*.privy.io",
              "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com",
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
            value: '3',
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
