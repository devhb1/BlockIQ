// app/layout.tsx
import type { Metadata } from "next";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/";

import { ClientWeb3Provider } from "@/components/ClientWeb3Provider";
import FarcasterReady from "@/components/FarcasterReady";

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
    // Farcaster frame metadata
    "fc:frame": "vNext",
    "fc:frame:image": "/BlockIQ.png",
    "fc:frame:button:1": "Start Quiz",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "/",
    "farcaster:manifest": "/.well-known/farcaster.json",
    // Mobile viewport and PWA hints
    viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

/* ------------------------------------------------------------------
   Root layout: embeds FarcasterReady so sdk.actions.ready() runs
-------------------------------------------------------------------*/
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Ensure responsive viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Inject Geist font CSS variables */}
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body>
        <ClientWeb3Provider>
          {/* This component calls await sdk.actions.ready() once per page load */}
          <FarcasterReady />
          {children}
        </ClientWeb3Provider>
      </body>
    </html>
  );
}
