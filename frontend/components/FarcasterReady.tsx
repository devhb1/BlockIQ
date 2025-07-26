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
        const { sdk } = await import("@farcaster/miniapp-sdk"); // Primary SDK
        
        // Call ready() immediately
        await sdk.actions.ready();
        console.log("✅ Farcaster ready() called successfully");
      } catch (err) {
        console.error("❌ Farcaster ready() failed:", err);
      }
    };

    // Call ready immediately
    callReady();
  }, []);

  return null;
}
