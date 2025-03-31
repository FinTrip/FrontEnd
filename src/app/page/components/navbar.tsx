"use client"

import Link from "next/link"
import { Button } from "@/app/page/components/ui/button"
import { ModeToggle } from "@/app/page/components/mode-toggle"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">FinTrip</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/forum" className="transition-colors hover:text-foreground/80 text-foreground">
              Forum
            </Link>
            <Link href="/forum/create-post" className="transition-colors hover:text-foreground/80 text-foreground">
              Tạo bài viết
            </Link>
            <Link href="/forum/my-posts" className="transition-colors hover:text-foreground/80 text-foreground">
              Bài viết của tôi
            </Link>
            <Link href="/forum/profile" className="transition-colors hover:text-foreground/80 text-foreground">
              Hồ sơ
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            <Button variant="ghost" size="sm">
              Đăng nhập
            </Button>
            <Button size="sm">Đăng ký</Button>
          </nav>
        </div>
      </div>
    </header>
  )
} 