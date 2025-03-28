import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/theme-provider";
import AdminSidebar from "@/components/admin-sidebar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinTrip Admin",
  description: "Admin dashboard for FinTrip travel planning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden">
              <AdminSidebar />
              <main className="flex-1 overflow-auto bg-gray-50">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
