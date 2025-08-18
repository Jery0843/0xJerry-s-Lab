import type { Metadata } from "next";
import { Orbitron, Fira_Code } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  authors: [{ name: "0xJerry", url: "https://jerry.securenotepad.tech" }],
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
    url: "https://jerry.securenotepad.tech",
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
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "technology",
  classification: "Cybersecurity Education",
  alternates: {
    canonical: "https://jerry.securenotepad.tech",
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
        <ThemeProvider defaultTheme="dark" storageKey="0xjerrys-lab-theme">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
