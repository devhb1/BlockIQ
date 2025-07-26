'use client'

import { useEffect, useState } from 'react'

export default function TestHeaders() {
  const [headers, setHeaders] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkHeaders() {
      try {
        const response = await fetch('/api/test-headers')
        const data = await response.json()
        setHeaders(data)
      } catch (error) {
        console.error('Error checking headers:', error)
      } finally {
        setLoading(false)
      }
    }

    checkHeaders()
  }, [])

  if (loading) {
    return <div className="p-8">Loading headers...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">CSP Headers Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Current Headers:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(headers, null, 2)}
        </pre>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="text-lg font-semibold mb-2">Key Headers to Check:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>X-Frame-Options:</strong> {headers?.['x-frame-options'] || 'Not found'}</li>
          <li><strong>Content-Security-Policy:</strong> {headers?.['content-security-policy'] ? 'Present' : 'Not found'}</li>
          <li><strong>Cache-Control:</strong> {headers?.['cache-control'] || 'Not found'}</li>
          <li><strong>X-Debug-Deploy:</strong> {headers?.['x-debug-deploy'] || 'Not found'}</li>
        </ul>
      </div>

      <div className="bg-green-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Expected Values:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>X-Frame-Options:</strong> Should be "ALLOWALL"</li>
          <li><strong>Content-Security-Policy:</strong> Should include frame-ancestors directive</li>
          <li><strong>Cache-Control:</strong> Should include "no-store"</li>
          <li><strong>X-Debug-Deploy:</strong> Should be a recent timestamp</li>
        </ul>
      </div>
    </div>
  )
} 