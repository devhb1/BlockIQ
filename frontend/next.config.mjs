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
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.farcaster.xyz https://*.warpcast.com https://*.walletconnect.com https://*.rainbow.me https://*.privy.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.rainbow.me",
              "font-src 'self' https://fonts.gstatic.com https://*.rainbow.me",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.farcaster.xyz https://*.warpcast.com https://*.walletconnect.com https://*.rainbow.me https://*.privy.io https://*.rpc.privy.systems https://explorer-api.walletconnect.com https://relay.walletconnect.com https://*.infura.io https://*.alchemy.com https://*.quicknode.com https://*.cloudflare.com https://*.coinbase.com",
              "frame-src 'self' https://*.farcaster.xyz https://*.warpcast.com https://*.walletconnect.com https://*.rainbow.me https://*.privy.io",
              "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
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
