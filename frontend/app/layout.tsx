// app/layout.tsx
import type { Metadata } from "next";
import ClientRootLayout from "./ClientRootLayout";
import FarcasterReady from "../components/FarcasterReady";
import FarcasterDebug from "../components/FarcasterDebug";
import FarcasterSDKTest from "../components/FarcasterSDKTest";
import ManualReadyTrigger from "../components/ManualReadyTrigger";
import "./globals.css";

/* ------------------------------------------------------------------
   Site-wide metadata (Open Graph, Twitter, Farcaster frame tags, etc.)
-------------------------------------------------------------------*/
export const metadata: Metadata = {
  title: "BlockIQ - Blockchain IQ Quiz",
  description:
    "Test your blockchain IQ and pay to see your score! Challenge yourself with questions about Base, EVM, and general blockchain knowledge.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://www.blockiq.xyz"
  ),
  openGraph: {
    title: "BlockIQ Quiz",
    description: "Test your blockchain IQ and pay to see your score!",
    type: "website",
    siteName: "BlockIQ Quiz",
    images: [
      {
        url: "/BlockIQ.png",
        width: 512,
        height: 512,
        alt: "BlockIQ Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlockIQ Quiz",
    description: "Test your blockchain IQ and pay to see your score!",
    images: ["/BlockIQ.png"],
  },
  other: {
    // Mini App metadata - using the correct format
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://www.blockiq.xyz/BlockIQ.png",
      button: {
        title: "Start Quiz",
        action: {
          type: "launch_frame",
          url: "https://www.blockiq.xyz/",
          name: "BlockIQ Quiz",
          splashImageUrl: "https://www.blockiq.xyz/BlockIQ.png",
          splashBackgroundColor: "#e0f2ff"
        }
      }
    }),
    // Mobile viewport and PWA hints
    viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Ensure responsive viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Inject Geist font CSS variables */}
        <style>{`
          html {
            font-family: var(--font-sans);
          }
        `}</style>
      </head>
      <body>
        <ClientRootLayout>
          <FarcasterReady />
          {children}
        </ClientRootLayout>
        <FarcasterDebug />
        <FarcasterSDKTest />
        <ManualReadyTrigger />
      </body>
    </html>
  );
}
 