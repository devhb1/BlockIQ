import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get all headers from the request
  const headers: Record<string, string> = {}
  
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value
  })

  // Add some additional info
  const responseData = {
    headers,
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
  }

  return NextResponse.json(responseData)
} 