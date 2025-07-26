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
        await farcasterSDK.ensureReady();
      } catch (error) {
        console.error("❌ FarcasterReady: Failed to initialize:", error);
      }
    };

    initializeApp();
  }, []); // Empty dependency array - only run once per component instance

  return null;
}
