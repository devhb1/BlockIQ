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

        setStatus("Page loaded, calling ready()...");
        await new Promise(resolve => setTimeout(resolve, 200));

        // Force ready() call for debugging
        setStatus("Calling sdk.actions.ready() (forced)...");
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk');
          await sdk.actions.ready();
          setStatus("✅ sdk.actions.ready() called successfully!");
          console.log("✅ FarcasterReady: ready() called successfully (forced)");
        } catch (err) {
          setStatus("❌ Error calling sdk.actions.ready(): " + err);
          console.error("❌ FarcasterReady: Error calling sdk.actions.ready() (forced)", err);
        }
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
