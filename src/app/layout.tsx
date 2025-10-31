import type { Metadata } from "next";
import { Orbitron, Fira_Code } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import RootLayoutContent from "@/components/RootLayoutContent";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "0xJerry's Lab - Cybersecurity Research & HTB Writeups",
    template: "%s | 0xJerry's Lab"
  },
  description: "Expert cybersecurity research, penetration testing tutorials, and detailed Hack The Box writeups. Learn offensive security techniques, exploit development, and ethical hacking with 0xJerry's comprehensive guides.",
  keywords: [
    "cybersecurity",
    "penetration testing",
    "ethical hacking",
    "HTB writeups",
    "hack the box",
    "exploit development",
    "OSCP preparation",
    "red team",
    "vulnerability research",
    "infosec",
    "CTF writeups",
    "security research",
    "bug bounty",
    "reverse engineering",
    "malware analysis"
  ],
  authors: [{ name: "0xJerry", url: "https://0xjerry.jerome.co.in" }],
  creator: "0xJerry",
  publisher: "0xJerry's Lab",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://0xjerry.jerome.co.in",
    title: "0xJerry's Lab - Cybersecurity Research & HTB Writeups",
    description: "Expert cybersecurity research, penetration testing tutorials, and detailed Hack The Box writeups. Learn offensive security with comprehensive guides.",
    siteName: "0xJerry's Lab",
    images: [
      {
        url: "https://securehive.securenotepad.tech/Gemini_Generated_Image_d1jhvwd1jhvwd1jh.png",
        width: 1200,
        height: 630,
        alt: "0xJerry's Lab - Cybersecurity Research Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "0xJerry's Lab - Cybersecurity Research & HTB Writeups",
    description: "Expert cybersecurity research, penetration testing tutorials, and detailed Hack The Box writeups.",
    images: ["https://securehive.securenotepad.tech/Gemini_Generated_Image_d1jhvwd1jhvwd1jh.png"],
    creator: "@0xJerry",
  },
  verification: {
    google: "rGGammldixgdv1c4AIfphZKC8aCsx3_CgXObrf4GIu4",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "technology",
  classification: "Cybersecurity Education",
  alternates: {
    canonical: "https://0xjerry.jerome.co.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${orbitron.variable} ${firaCode.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Google AdSense Script */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5661675622272159"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        {/* Umami Analytics */}
<Script
  src="https://cloud.umami.is/script.js"
  data-website-id="f6696075-8457-4c24-b1f4-32665790a4d0"
  data-domains="0xjerry.jerome.co.in"
  strategy="afterInteractive"
/>
        {/* EffectiveGate CPM Script 1 */}
        <Script
          src="//pl27944362.effectivegatecpm.com/e11a6fd2423d8ad4c4439e6d41db5710/invoke.js"
          strategy="lazyOnload"
        />

        {/* EffectiveGate CPM Script 2 */}
        <Script
          src="//pl27944422.effectivegatecpm.com/de/92/4e/de924e56af0c1b9f4c5ae9e1b295f6de.js"
          strategy="lazyOnload"
        />
        
        <div id="container-e11a6fd2423d8ad4c4439e6d41db5710"></div>
        
        {/* Ko-fi Widget */}
        <Script
          src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
          strategy="lazyOnload"
        />
        <Script
          id="kofi-widget"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              kofiWidgetOverlay.draw('andres__', {
                'type': 'floating-chat',
                'floating-chat.donateButton.text': 'Support me',
                'floating-chat.donateButton.background-color': '#5cb85c',
                'floating-chat.donateButton.text-color': '#fff'
              });
            `
          }}
        />
        
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
