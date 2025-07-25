"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

/**
 * Root-level side-effect component.
 * Fires exactly once per page load to dismiss Warpcast’s splash screen.
 */
export default function FarcasterReady() {
  useEffect(() => {
    // Skip when the app is not inside Warpcast.
    if (typeof window === "undefined" || window.parent === window) return;

    (async () => {
      try {
        await sdk.actions.ready();          // ← crucial “await”
        console.log("✅ Farcaster splash screen dismissed");
      } catch (err) {
        console.error("❌ sdk.actions.ready() failed", err);
      }
    })();
  }, []);

  return null; // Nothing visual—side effect only
}
