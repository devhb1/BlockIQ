// components/FarcasterReady.tsx
"use client";

import { useEffect, useState } from "react";
import { sdk } from '@farcaster/miniapp-sdk';

export default function FarcasterReady() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        console.log("🔄 FarcasterReady: Calling sdk.actions.ready()...");
        await sdk.actions.ready();
        console.log("✅ FarcasterReady: ready() called successfully");
        setIsLoaded(true);
      } catch (err) {
        console.error("❌ FarcasterReady: ready() failed:", err);
      }
    };

    if (sdk && !isLoaded) {
      load();
    }
  }, [isLoaded]);

  return null;
}
