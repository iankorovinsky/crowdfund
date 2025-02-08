"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";

const story_testnet = {
  id: 43_115,
  name: "Story Testnet",
  iconUrl:
    "https://pbs.twimg.com/profile_images/1820303986349805569/MKfPfLtz_400x400.jpg",
  iconBackground: "#fff",
  nativeCurrency: { name: "Story Testnet", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://aeneid.storyrpc.io"] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer.story.foundation/" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 1516,
    },
  },
} as const;

const config = getDefaultConfig({
  appName: "crowdfund",
  projectId: "YOUR_PROJECT_ID", // walletconnect project id
  chains: [mainnet, polygon, optimism, arbitrum, base, story_testnet],
  ssr: true,
});

const queryClient = new QueryClient();
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <div className="min-h-screen bg-gray-950">
                <main>
                  <ReactFlowProvider>{children}</ReactFlowProvider>
                </main>
              </div>
              <Toaster
                position="bottom-right"
                theme="dark"
                closeButton
                richColors
              />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
