// components/FarcasterReady.tsx
"use client";

import { useEffect, useRef } from "react";
import { farcasterSDK } from "@/lib/farcaster-sdk";

export default function FarcasterReady() {
  const hasAttempted = useRef(false);

  useEffect(() => {
    // Prevent multiple attempts from the same component instance
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const initializeApp = async () => {
      try {
        // Wait for the app to be fully loaded and ready
        // This ensures the splash screen doesn't hide until content is ready
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(undefined);
          } else {
            window.addEventListener('load', resolve, { once: true });
          }
        });

        // Additional small delay to ensure React components are fully rendered
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log("🏠 FarcasterReady: App fully loaded, calling ready()");
        await farcasterSDK.ensureReady();
        console.log("✅ FarcasterReady: ready() called successfully");
      } catch (error) {
        console.error("❌ FarcasterReady: Failed to initialize:", error);
      }
    };

    initializeApp();
  }, []); // Empty dependency array - only run once per component instance

  return null;
}
