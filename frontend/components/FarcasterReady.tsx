// components/FarcasterReady.tsx
"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterReady() {
  useEffect(() => {
    if (typeof window === "undefined") return; // Only skip on server

    console.log("🔄 FarcasterReady mounted, calling sdk.actions.ready()...");

    (async () => {
      try {
        // Add a small delay to ensure SDK is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await sdk.actions.ready();
        console.log("✅ Farcaster splash screen dismissed successfully");
      } catch (err) {
        console.error("❌ sdk.actions.ready() failed:", err);
        // Try again after a delay in case of timing issues
        setTimeout(async () => {
          try {
            await sdk.actions.ready();
            console.log("✅ Farcaster splash screen dismissed on retry");
          } catch (retryErr) {
            console.error("❌ sdk.actions.ready() failed on retry:", retryErr);
          }
        }, 1000);
      }
    })();
  }, []);

  return null;
}
