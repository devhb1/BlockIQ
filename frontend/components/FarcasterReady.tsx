// components/FarcasterReady.tsx
"use client";

import { useEffect, useRef } from "react";

export default function FarcasterReady() {
  const hasCalledReady = useRef(false);

  useEffect(() => {
    // Prevent multiple calls
    if (hasCalledReady.current) return;

    const initializeApp = async () => {
      try {
        // Mark as called immediately to prevent race conditions
        hasCalledReady.current = true;

        // Wait for DOM to be fully ready
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(undefined);
            } else {
              window.addEventListener('load', resolve, { once: true });
            }
          });
        }

        // Additional small delay to ensure everything is mounted
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log("🔄 FarcasterReady: Attempting to call sdk.actions.ready()...");
        
        // Try dynamic import first
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk');
          await sdk.actions.ready();
          console.log("✅ FarcasterReady: sdk.actions.ready() called successfully");
        } catch (importError) {
          console.warn("⚠️ FarcasterReady: @farcaster/miniapp-sdk import failed, trying frame-sdk fallback:", importError);
          
          // Fallback to frame-sdk if miniapp-sdk fails
          try {
            const { sdk: frameSdk } = await import('@farcaster/frame-sdk');
            await frameSdk.actions.ready();
            console.log("✅ FarcasterReady: frame-sdk ready() called successfully as fallback");
          } catch (fallbackError) {
            console.warn("⚠️ FarcasterReady: Both SDK imports failed:", fallbackError);
            
            // Last resort: try global SDK if it exists
            if (typeof window !== 'undefined' && (window as any).FarcasterSDK) {
              await (window as any).FarcasterSDK.actions.ready();
              console.log("✅ FarcasterReady: Global SDK ready() called successfully");
            } else {
              console.log("ℹ️ FarcasterReady: No SDK available, app running in non-Farcaster environment");
            }
          }
        }
      } catch (error) {
        console.error("❌ FarcasterReady: Critical error during initialization:", error);
      }
    };

    initializeApp();
  }, []); // Empty dependency array - only run once

  return null;
}
