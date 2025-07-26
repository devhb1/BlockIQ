// lib/farcaster-sdk.ts
"use client";

// Global singleton to ensure ready() is only called once per session
class FarcasterSDKManager {
    private static instance: FarcasterSDKManager;
    private readyCalled = false;
    private readyPromise: Promise<void> | null = null;
    private isInitializing = false; // New flag

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

        // Prevent multiple simultaneous calls
        if (this.isInitializing) {
            console.log("⏳ FarcasterSDK: Initialization in progress, waiting...");
            return new Promise((resolve) => {
                const checkReady = () => {
                    if (this.readyCalled) {
                        resolve();
                    } else {
                        setTimeout(checkReady, 50);
                    }
                };
                checkReady();
            });
        }

        this.isInitializing = true;

        // Create the promise for this ready() call
        this.readyPromise = this.callReady();

        try {
            await this.readyPromise;
            this.readyCalled = true; // Mark as called only on success
            console.log("✅ FarcasterSDK: ready() completed successfully");
        } catch (error) {
            // Reset on error so it can be retried
            this.readyCalled = false;
            this.readyPromise = null;
            this.isInitializing = false; // Reset on error
            console.error("❌ FarcasterSDK: ready() failed:", error);
            throw error;
        } finally {
            this.isInitializing = false; // Ensure reset
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

            // Enhanced environment detection
            const isInFarcaster = this.detectFarcasterEnvironment();

            if (!isInFarcaster) {
                console.log("ℹ️ FarcasterSDK: Not in Farcaster environment, skipping ready()");
                return;
            }

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

    private detectFarcasterEnvironment(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }

        // Check if we're in an iframe (common for Mini Apps)
        const isInIframe = window.parent !== window;
        
        // Check user agent for Farcaster indicators
        const userAgent = navigator.userAgent.toLowerCase();
        const hasFarcasterUA = userAgent.includes('farcaster') || 
                              userAgent.includes('warpcast') ||
                              userAgent.includes('nook');
        
        // Check for Farcaster-specific global objects
        const hasFarcasterGlobals = !!(window as any).FarcasterSDK || 
                                   !!(window as any).farcaster ||
                                   !!(window as any).warpcast;
        
        // Check URL parameters that might indicate Farcaster context
        const urlParams = new URLSearchParams(window.location.search);
        const hasFarcasterParams = urlParams.has('farcaster') || 
                                  urlParams.has('warpcast') ||
                                  urlParams.has('miniapp');
        
        // Check referrer for Farcaster domains
        const referrer = document.referrer;
        const hasFarcasterReferrer = referrer.includes('farcaster.xyz') || 
                                    referrer.includes('warpcast.com') ||
                                    referrer.includes('nook.xyz');

        const isFarcaster = isInIframe || hasFarcasterUA || hasFarcasterGlobals || hasFarcasterParams || hasFarcasterReferrer;
        
        console.log("🔍 FarcasterSDK: Environment detection:", {
            isInIframe,
            hasFarcasterUA,
            hasFarcasterGlobals,
            hasFarcasterParams,
            hasFarcasterReferrer,
            isFarcaster
        });

        return isFarcaster;
    }

    // Reset function for testing/development
    reset(): void {
        this.readyCalled = false;
        this.readyPromise = null;
        this.isInitializing = false; // Reset this flag too
        console.log("🔄 FarcasterSDK: Reset state for testing");
    }
}

export const farcasterSDK = FarcasterSDKManager.getInstance();
