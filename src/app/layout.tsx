"use client";
import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WagmiProvider } from "wagmi";
import { config } from "../../wagmi.config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Script from "next/script";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

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
          <body className={`${libreBaskerville.variable} ${sourceSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
            {children}
          </body>
        </QueryClientProvider>
      </WagmiProvider>
    </html>
  );
}
