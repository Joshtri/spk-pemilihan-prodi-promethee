import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard"; // pastikan path-nya sesuai

import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPK Pemilihan Jurusan",
  description: "Sistem Pendukung Keputusan Pemilihan Jurusan",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  themeColor: "#000000",
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://spk-pemilihan-jurusan.vercel.app"),
  openGraph: {
    title: "SPK Pemilihan Jurusan",
    description: "Sistem Pendukung Keputusan Pemilihan Jurusan",
    url: "https://spk-pemilihan-jurusan.vercel.app",
    siteName: "SPK Pemilihan Jurusan",
    images: [
      {
        url: "https://spk-pemilihan-jurusan.vercel.app/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

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
        <Toaster richColors position="top-right" />

        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
