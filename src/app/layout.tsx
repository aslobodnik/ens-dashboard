"use client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WagmiProvider } from "wagmi";
import { config } from "../../wagmi.config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "ENS DAO Dashboard",
//   description: "MVP",
// };

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VR46BKD059"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VR46BKD059');
          `}
        </Script>
      </head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <body className={inter.className}>{children}</body>
        </QueryClientProvider>
      </WagmiProvider>
    </html>
  );
}
