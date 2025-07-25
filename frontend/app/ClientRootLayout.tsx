"use client";
import { ClientWeb3Provider } from "@/components/ClientWeb3Provider";
import FarcasterReady from "../components/FarcasterReady";

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientWeb3Provider>
      <FarcasterReady />
      {children}
    </ClientWeb3Provider>
  );
} 