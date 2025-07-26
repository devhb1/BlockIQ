// components/FarcasterReady.tsx
"use client";

import { useEffect, useState } from "react";

export default function FarcasterReady() {
  const [readyCalled, setReadyCalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return; // Only skip on server

    console.log("🔄 FarcasterReady mounted, initializing...");

    const initializeFarcaster = async () => {
      try {
        // Dynamically import the SDK to ensure it's available
        let sdk;
        try {
          const sdkModule = await import("@farcaster/miniapp-sdk");
          sdk = sdkModule.sdk;
        } catch (importErr) {
          console.error("❌ Failed to import Farcaster SDK:", importErr);
          return;
        }

        // Wait for the SDK to be available
        let attempts = 0;
        const maxAttempts = 15;
        
        while (attempts < maxAttempts) {
          try {
            // Check if SDK is available and ready function exists
            if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
              console.log(`✅ SDK found on attempt ${attempts + 1}`);
              break;
            }
            
            console.log(`⏳ Waiting for SDK... attempt ${attempts + 1}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, 300));
            attempts++;
          } catch (err) {
            console.log(`⚠️ SDK check failed on attempt ${attempts + 1}:`, err);
            attempts++;
          }
        }

        if (attempts >= maxAttempts) {
          console.error("❌ SDK not available after maximum attempts");
          return;
        }

        // Call sdk.actions.ready()
        console.log("🚀 Calling sdk.actions.ready()...");
        await sdk.actions.ready();
        console.log("✅ Farcaster splash screen dismissed successfully");
        setReadyCalled(true);
        
      } catch (err) {
        console.error("❌ sdk.actions.ready() failed:", err);
        
        // Retry once after a longer delay
        setTimeout(async () => {
          try {
            console.log("🔄 Retrying sdk.actions.ready()...");
            const sdkModule = await import("@farcaster/miniapp-sdk");
            await sdkModule.sdk.actions.ready();
            console.log("✅ Farcaster splash screen dismissed on retry");
            setReadyCalled(true);
          } catch (retryErr) {
            console.error("❌ sdk.actions.ready() failed on retry:", retryErr);
          }
        }, 2000);
      }
    };

    // Start initialization
    initializeFarcaster();
  }, []);

  // Additional effect to ensure ready is called even if component unmounts/remounts
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleVisibilityChange = async () => {
      if (!readyCalled && document.visibilityState === 'visible') {
        console.log("🔄 Page became visible, ensuring sdk.actions.ready() is called...");
        setTimeout(async () => {
          try {
            const sdkModule = await import("@farcaster/miniapp-sdk");
            await sdkModule.sdk.actions.ready();
            console.log("✅ sdk.actions.ready() called on visibility change");
            setReadyCalled(true);
          } catch (err) {
            console.error("❌ sdk.actions.ready() failed on visibility change:", err);
          }
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [readyCalled]);

  return null;
}
