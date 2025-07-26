// lib/farcaster-sdk.ts
"use client";

// Global singleton to ensure ready() is only called once per session
class FarcasterSDKManager {
    private static instance: FarcasterSDKManager;
    private readyCalled = false;
    private readyPromise: Promise<void> | null = null;

    private constructor() { }

    static getInstance(): FarcasterSDKManager {
        if (!FarcasterSDKManager.instance) {
            FarcasterSDKManager.instance = new FarcasterSDKManager();
        }
        return FarcasterSDKManager.instance;
    }

    async ensureReady(): Promise<void> {
        // If already called, return immediately
        if (this.readyCalled) {
            console.log("✓ FarcasterSDK: ready() already called, skipping");
            return;
        }

        // If currently calling, wait for the existing promise
        if (this.readyPromise) {
            console.log("⏳ FarcasterSDK: ready() in progress, waiting...");
            return this.readyPromise;
        }

        // Mark as called immediately to prevent race conditions
        this.readyCalled = true;

        // Create the promise for this ready() call
        this.readyPromise = this.callReady();

        try {
            await this.readyPromise;
        } catch (error) {
            // Reset on error so it can be retried
            this.readyCalled = false;
            this.readyPromise = null;
            throw error;
        }
    }

    private async callReady(): Promise<void> {
        try {
            // Wait for DOM to be fully ready
            if (typeof document !== 'undefined' && document.readyState !== 'complete') {
                await new Promise<void>(resolve => {
                    if (document.readyState === 'complete') {
                        resolve();
                    } else {
                        window.addEventListener('load', () => resolve(), { once: true });
                    }
                });
            }

            // Small delay to ensure everything is mounted
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log("🔄 FarcasterSDK: Calling sdk.actions.ready()...");

            // Try miniapp-sdk first (preferred for Mini Apps)
            try {
                const { sdk } = await import('@farcaster/miniapp-sdk');
                await sdk.actions.ready();
                console.log("✅ FarcasterSDK: miniapp-sdk ready() called successfully");
                return;
            } catch (miniappError) {
                console.warn("⚠️ FarcasterSDK: miniapp-sdk failed, trying frame-sdk fallback:", miniappError);
            }

            // Fallback to frame-sdk
            try {
                const { sdk } = await import('@farcaster/frame-sdk');
                await sdk.actions.ready();
                console.log("✅ FarcasterSDK: frame-sdk ready() called successfully");
                return;
            } catch (frameError) {
                console.warn("⚠️ FarcasterSDK: frame-sdk failed:", frameError);
            }

            // Last resort: global SDK
            if (typeof window !== 'undefined' && (window as any).FarcasterSDK) {
                await (window as any).FarcasterSDK.actions.ready();
                console.log("✅ FarcasterSDK: Global SDK ready() called successfully");
                return;
            }

            console.log("ℹ️ FarcasterSDK: No SDK available, running in non-Farcaster environment");

        } catch (error) {
            console.error("❌ FarcasterSDK: Critical error during ready() call:", error);
            throw error;
        }
    }

    // Reset function for testing/development
    reset(): void {
        this.readyCalled = false;
        this.readyPromise = null;
        console.log("🔄 FarcasterSDK: Reset state for testing");
    }
}

export const farcasterSDK = FarcasterSDKManager.getInstance();
