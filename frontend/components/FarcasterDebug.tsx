"use client";

import { useEffect, useState } from "react";
import { farcasterSDK } from "@/lib/farcaster-sdk";

export default function FarcasterDebug() {
  const [status, setStatus] = useState<string>("Initializing...");
  const [context, setContext] = useState<any>(null);

  useEffect(() => {
    const checkFarcasterSDK = async () => {
      try {
        // Check if we're in a Farcaster environment
        const userAgent = navigator.userAgent;
        const isInFarcaster = userAgent.includes('Farcaster') || window.parent !== window;
        
        setStatus(`Environment: ${isInFarcaster ? 'Farcaster Mini App' : 'Regular Browser'}`);
        
        // Ensure ready() has been called
        try {
          await farcasterSDK.ensureReady();
          setStatus(prev => prev + ' | Ready: Called');
        } catch (readyError) {
          setStatus(prev => prev + ' | Ready: Failed');
          console.warn('Ready call failed:', readyError);
        }
        
        // Try to get SDK context
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk');
          const ctx = await sdk.context;
          setContext(ctx);
          setStatus(prev => prev + ' | Context: Available');
        } catch (err) {
          setStatus(prev => prev + ' | Context: Failed');
          console.warn('SDK context check failed:', err);
        }
      } catch (error) {
        setStatus('Error checking Farcaster SDK');
        console.error('Farcaster debug error:', error);
      }
    };

    checkFarcasterSDK();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded z-50 max-w-xs">
      <div>🔧 Debug: {status}</div>
      {context && (
        <div>
          User: {context.user?.username || 'Not available'}
        </div>
      )}
      <div className="mt-1 text-xs text-gray-300">
        Build: {process.env.NODE_ENV}
      </div>
    </div>
  );
}
