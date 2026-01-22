import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Providers } from "@/components/providers";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://wallets.ens.domains"),
  title: "ENS Wallets",
  description: "ENS DAO Treasury Dashboard - View wallet balances and multisig configurations",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "ENS Wallets",
    description: "ENS DAO Treasury Dashboard - View wallet balances and multisig configurations",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ENS Wallets",
    description: "ENS DAO Treasury Dashboard",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className={`${libreBaskerville.variable} ${sourceSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
