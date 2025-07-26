# CSP Fix for Farcaster Mini App

## Problem Analysis

The "Ready not called" error in Farcaster preview is caused by **Content Security Policy (CSP) violations** that prevent the app from loading properly in the Farcaster iframe environment.

### Root Cause

1. **Frame Embedding Blocked**: Farcaster can't embed your site due to CSP restrictions
2. **Network Connections Blocked**: WalletConnect and other services can't connect due to CSP restrictions
3. **CDN Caching**: Vercel's CDN is serving stale headers, preventing the new CSP from taking effect

### Error Messages

```
Refused to frame 'https://www.blockiq.xyz/' because an ancestor violates the following Content Security Policy directive: "frame-ancestors 'self' https://*.farcaster.xyz https://*.warpcast.com"

Refused to connect to 'https://explorer-api.walletconnect.com/v3/wallets?projectId=...' because it violates the following Content Security Policy directive: "connect-src 'self' https://farcaster.xyz ..."
```

## Solution Implemented

### 1. Enhanced CSP Configuration

Updated `next.config.mjs` with comprehensive CSP headers:

```javascript
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
}
```

### 2. Aggressive Cache Busting

Added multiple cache-busting headers to force Vercel to serve fresh content:

```javascript
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
```

### 3. Frame Embedding Headers

Ensured proper iframe embedding:

```javascript
{
  key: 'X-Frame-Options',
  value: 'ALLOWALL',
}
```

### 4. Debug Headers

Added debug headers to track deployments:

```javascript
{
  key: 'X-Debug-Deploy',
  value: timestamp,
},
{
  key: 'X-CSP-Version',
  value: '3',
}
```

## Testing

### 1. Local Testing

```bash
cd frontend
npm run build
npm run start
```

Visit `http://localhost:3000/test-headers` to verify headers are applied.

### 2. Production Testing

After deployment, check headers:

```bash
curl -I https://www.blockiq.xyz/
```

Expected headers:
- `X-Frame-Options: ALLOWALL`
- `Content-Security-Policy: ...` (with frame-ancestors directive)
- `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0`

### 3. Farcaster Preview Testing

1. Deploy to production
2. Wait 5-10 minutes for CDN cache to clear
3. Test in Farcaster preview tool
4. Check console for CSP errors

## Troubleshooting

### If CSP errors persist:

1. **Force new deployment**: Make a small change to trigger rebuild
2. **Check CDN cache**: Use `curl -I` to verify headers
3. **Clear browser cache**: Hard refresh in Farcaster preview
4. **Check manifest**: Ensure `/.well-known/farcaster.json` is accessible

### If ready() still not called:

1. **Check console logs**: Look for SDK initialization errors
2. **Verify environment detection**: Ensure app detects Farcaster environment
3. **Test singleton pattern**: Verify `FarcasterSDKManager` is working

## Key Points

- **CSP is the root cause**: The "Ready not called" error is a symptom of CSP violations
- **Cache busting is critical**: Vercel's CDN aggressively caches headers
- **Frame embedding must be allowed**: `frame-ancestors` directive is essential
- **Network connections must be permitted**: WalletConnect and other services need `connect-src` access

## Next Steps

1. Deploy this fix
2. Wait for CDN cache to clear
3. Test in Farcaster preview
4. Monitor for any remaining CSP violations
5. Remove debug components once confirmed working 