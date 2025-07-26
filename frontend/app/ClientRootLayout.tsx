"use client";
import { ClientWeb3Provider } from "@/components/ClientWeb3Provider";

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientWeb3Provider>
      {children}
    </ClientWeb3Provider>
  );
} 