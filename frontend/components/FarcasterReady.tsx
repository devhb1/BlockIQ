// components/FarcasterReady.tsx
"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function FarcasterReady() {
  useEffect(() => {
    if (typeof window === "undefined" || window.parent === window) return;

    (async () => {
      try {
        await sdk.actions.ready();
        console.log("✅ Farcaster splash screen dismissed");
      } catch (err) {
        console.error("❌ sdk.actions.ready() failed", err);
      }
    })();
  }, []);

  return null;
}
