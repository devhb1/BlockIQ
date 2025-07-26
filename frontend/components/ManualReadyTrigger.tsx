"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { farcasterSDK } from "@/lib/farcaster-sdk";

export default function ManualReadyTrigger() {
  const [status, setStatus] = useState("Ready to test");
  const [isLoading, setIsLoading] = useState(false);

  const handleManualReady = async () => {
    setIsLoading(true);
    setStatus("Calling ready()...");

    try {
      await farcasterSDK.ensureReady();
      setStatus("✅ Ready called successfully!");
    } catch (error) {
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    farcasterSDK.reset();
    setStatus("🔄 SDK reset - ready to test again");
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed top-4 left-4 bg-white border rounded-lg p-4 shadow-lg z-50">
      <h3 className="font-semibold mb-2">Manual Ready Test</h3>
      <div className="text-sm text-gray-600 mb-3">{status}</div>
      <div className="space-y-2">
        <Button 
          onClick={handleManualReady} 
          disabled={isLoading}
          size="sm"
          className="w-full"
        >
          {isLoading ? "Calling..." : "Call ready()"}
        </Button>
        <Button 
          onClick={handleReset} 
          variant="outline"
          size="sm"
          className="w-full"
        >
          Reset SDK
        </Button>
      </div>
    </div>
  );
} 