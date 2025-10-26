"use client";

import AppHeader from "@/components/partials/AppHeader";
// import { ThemeProvider } from "@/providers/themes-provider";
import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState, ReactNode } from "react";
import "../globals.css";
import { AppSidebar } from "@/components/partials/AppSidebar";
import { ReactQueryProvider } from "@/providers/query-client-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const isNowMobile = window.innerWidth < 768;
      setIsMobile(isNowMobile);
      setIsSidebarOpen(!isNowMobile); // Buka sidebar jika desktop
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <AppSidebar
              role="SISWA"
              isOpen={isSidebarOpen}
              onToggleSidebar={toggleSidebar}
              isMobile={isMobile}
              onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main content area */}
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
              <AppHeader role="SISWA" onMenuClick={toggleSidebar} />
              <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
                {children}
              </main>
            </div>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
