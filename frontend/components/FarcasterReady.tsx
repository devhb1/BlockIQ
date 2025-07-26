// components/FarcasterReady.tsx
"use client";

import { useEffect } from "react";

export default function FarcasterReady() {
  useEffect(() => {
    if (typeof window === "undefined") return; // Only skip on server

    console.log("🔄 FarcasterReady mounted, calling ready()...");

    const callReady = async () => {
      try {
        // Import the SDK
        const { sdk } = await import("@farcaster/frame-sdk");
        
        // Call ready() immediately
        await sdk.actions.ready();
        console.log("✅ Farcaster ready() called successfully");
      } catch (err) {
        console.error("❌ Farcaster ready() failed:", err);
        
        // Try again with miniapp-sdk as fallback
        try {
          console.log("🔄 Trying with miniapp-sdk as fallback...");
          const { sdk: miniappSdk } = await import("@farcaster/miniapp-sdk");
          await miniappSdk.actions.ready();
          console.log("✅ Farcaster ready() called successfully with miniapp-sdk");
        } catch (fallbackErr) {
          console.error("❌ Both SDKs failed:", fallbackErr);
        }
      }
    };

    // Call ready immediately
    callReady();
  }, []);

  return null;
}
