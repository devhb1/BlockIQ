'use client'

import { useEffect, useState } from 'react'

export default function CSPTest() {
  const [headers, setHeaders] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkHeaders() {
      try {
        // Force cache refresh by adding timestamp
        const timestamp = Date.now()
        const response = await fetch(`/api/test-headers?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setHeaders(data)
      } catch (error) {
        console.error('Error checking headers:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    checkHeaders()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CSP headers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const cspHeader = headers?.headers?.['content-security-policy']
  const frameAncestors = cspHeader?.includes('frame-ancestors')
  const connectSrc = cspHeader?.includes('explorer-api.walletconnect.com')
  const xFrameOptions = headers?.headers?.['x-frame-options']
  const cacheControl = headers?.headers?.['cache-control']
  const deploymentId = headers?.headers?.['x-deployment-id']

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CSP Headers Test - Version 4</h1>
        
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg border ${frameAncestors ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
            <h3 className="font-semibold">Frame Ancestors</h3>
            <p className={frameAncestors ? 'text-green-700' : 'text-red-700'}>
              {frameAncestors ? '✅ Present' : '❌ Missing'}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${connectSrc ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
            <h3 className="font-semibold">WalletConnect</h3>
            <p className={connectSrc ? 'text-green-700' : 'text-red-700'}>
              {connectSrc ? '✅ Allowed' : '❌ Blocked'}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${xFrameOptions === 'ALLOWALL' ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
            <h3 className="font-semibold">X-Frame-Options</h3>
            <p className={xFrameOptions === 'ALLOWALL' ? 'text-green-700' : 'text-red-700'}>
              {xFrameOptions === 'ALLOWALL' ? '✅ ALLOWALL' : `❌ ${xFrameOptions || 'Missing'}`}
            </p>
          </div>
          
          <div className={`p-4 rounded-lg border ${cacheControl?.includes('no-store') ? 'bg-green-100 border-green-400' : 'bg-yellow-100 border-yellow-400'}`}>
            <h3 className="font-semibold">Cache Control</h3>
            <p className={cacheControl?.includes('no-store') ? 'text-green-700' : 'text-yellow-700'}>
              {cacheControl?.includes('no-store') ? '✅ No Cache' : '⚠️ May Cache'}
            </p>
          </div>
        </div>

        {/* Deployment Info */}
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
          <h3 className="font-semibold mb-2">Deployment Information:</h3>
          <p><strong>Deployment ID:</strong> {deploymentId || 'Not found'}</p>
          <p><strong>Timestamp:</strong> {headers?.timestamp || 'Not found'}</p>
          <p><strong>URL:</strong> {headers?.url || 'Not found'}</p>
        </div>

        {/* Raw Headers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Headers Response:</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(headers, null, 2)}
            </pre>
          </div>
        </div>

        {/* CSP Analysis */}
        {cspHeader && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">CSP Analysis:</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2">✅</span>
                <span className="font-mono text-sm">{cspHeader}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh Headers
          </button>
          <button 
            onClick={() => window.open('https://www.blockiq.xyz/csp-test', '_blank')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Test Live Site
          </button>
          <a 
            href="https://miniapps.farcaster.xyz/docs/guides/agents-checklist"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded inline-block"
          >
            Farcaster Docs
          </a>
        </div>
      </div>
    </div>
  )
} 