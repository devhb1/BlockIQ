// components/FarcasterReady.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { farcasterSDK } from "@/lib/farcaster-sdk";

export default function FarcasterReady() {
  const hasAttempted = useRef(false);
  // Remove status and debug indicator for production

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const initializeApp = async () => {
      try {
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(undefined);
          } else {
            window.addEventListener('load', resolve, { once: true });
          }
        });
        await new Promise(resolve => setTimeout(resolve, 200));
        await farcasterSDK.ensureReady();
        // Only log to console for debugging, no visible UI
        console.log("✅ FarcasterReady: farcasterSDK.ensureReady() completed successfully");
      } catch (error) {
        console.error("❌ FarcasterReady: Failed to initialize:", error);
      }
    };
    initializeApp();
  }, []);

  // Visible debug indicator for testing
  return null;
}
