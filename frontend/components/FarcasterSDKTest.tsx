// components/FarcasterSDKTest.tsx - For testing purposes only
"use client";

import { useEffect, useState } from "react";
import { farcasterSDK } from "@/lib/farcaster-sdk";

export default function FarcasterSDKTest() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testSDK = async () => {
      addLog("Starting SDK test...");
      
      try {
        // Test the singleton behavior
        addLog("Calling ensureReady() first time...");
        await farcasterSDK.ensureReady();
        addLog("First ensureReady() completed");
        
        // Test that second call is skipped
        addLog("Calling ensureReady() second time...");
        await farcasterSDK.ensureReady();
        addLog("Second ensureReady() completed (should be skipped)");
        
        // Test that third call is also skipped
        addLog("Calling ensureReady() third time...");
        await farcasterSDK.ensureReady();
        addLog("Third ensureReady() completed (should be skipped)");
        
      } catch (error) {
        addLog(`Error: ${error}`);
      }
    };

    testSDK();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 right-4 bg-black/90 text-white text-xs p-3 rounded z-50 max-w-sm max-h-64 overflow-auto">
      <div className="font-bold mb-2">🧪 SDK Test Results:</div>
      {logs.map((log, i) => (
        <div key={i} className="mb-1 text-xs">
          {log}
        </div>
      ))}
      <button 
        onClick={() => {
          farcasterSDK.reset();
          setLogs([]);
          addLog("SDK reset, you can refresh to test again");
        }}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
      >
        Reset & Test Again
      </button>
    </div>
  );
}
