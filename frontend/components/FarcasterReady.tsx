// components/FarcasterReady.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { farcasterSDK } from "@/lib/farcaster-sdk";

export default function FarcasterReady() {
  const hasAttempted = useRef(false);
  const [status, setStatus] = useState("FarcasterReady: initializing...");

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const initializeApp = async () => {
      try {
        setStatus("Waiting for page load...");
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(undefined);
          } else {
            window.addEventListener('load', resolve, { once: true });
          }
        });

        setStatus("Page loaded, waiting for DOM...");
        await new Promise(resolve => setTimeout(resolve, 200));

        setStatus("Calling farcasterSDK.ensureReady()...");
        await farcasterSDK.ensureReady();
        setStatus("✅ FarcasterSDK ready() completed successfully!");
        console.log("✅ FarcasterReady: farcasterSDK.ensureReady() completed successfully");
      } catch (error) {
        setStatus("❌ FarcasterReady: Failed to initialize: " + error);
        console.error("❌ FarcasterReady: Failed to initialize:", error);
      }
    };

    initializeApp();
  }, []);

  // Visible debug indicator for testing
  return (
    <div style={{position: 'fixed', bottom: 8, right: 8, zIndex: 9999, background: '#fff', color: '#222', border: '1px solid #007aff', borderRadius: 8, padding: '8px 16px', fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)'}}>
      {status}
    </div>
  );
}
