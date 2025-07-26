"use client";

import { useEffect, useState } from "react";
import { farcasterSDK } from "@/lib/farcaster-sdk";

export default function TestReadyPage() {
  const [status, setStatus] = useState("Initializing...");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testReady = async () => {
      addLog("Starting ready() test...");
      setStatus("Testing ready() call...");

      try {
        // Wait for page to be fully loaded
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(undefined);
          } else {
            window.addEventListener('load', resolve, { once: true });
          }
        });

        addLog("Page fully loaded");
        setStatus("Page loaded, calling ready()...");

        // Call ready()
        await farcasterSDK.ensureReady();
        
        addLog("ready() called successfully");
        setStatus("✅ Ready called successfully!");
        
        // Wait a bit and check if splash screen is hidden
        setTimeout(() => {
          addLog("Checking if splash screen is hidden...");
          setStatus("✅ Ready called - splash should be hidden");
        }, 1000);

      } catch (error) {
        addLog(`Error: ${error}`);
        setStatus("❌ Error calling ready()");
      }
    };

    testReady();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Ready() Test Page</h1>
        
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="text-lg font-semibold mb-2">Status: {status}</h2>
          <p className="text-sm text-gray-600">
            This page tests the sdk.actions.ready() call. If you see this content,
            the splash screen should be hidden.
          </p>
        </div>

        <div className="bg-black text-white p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Logs:</h3>
          <div className="text-sm space-y-1 max-h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="font-mono">{log}</div>
            ))}
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">What to check:</h3>
          <ul className="text-sm space-y-1">
            <li>• Is the splash screen hidden?</li>
            <li>• Can you see this content?</li>
            <li>• Check browser console for SDK logs</li>
            <li>• In Farcaster preview, should show app content</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 