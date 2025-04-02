import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { ThemeProvider } from "@/app/page/components/theme-provider"
import { Navbar } from "@/app/page/components/navbar"
import { Footer } from "@/app/page/components/footer"
import { Toaster } from "@/app/page/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FinTrip Forum - Chia sẻ trải nghiệm du lịch",
  description: "Nền tảng chia sẻ trải nghiệm và kế hoạch du lịch cho cộng đồng",
  generator: 'Dunz'
}

export default function ForumLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            {/* <Navbar /> */}
            <main className="flex-1">{children}</main>
            {/* <Footer /> */}
          </div>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
 