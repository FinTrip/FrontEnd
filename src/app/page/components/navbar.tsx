"use client";

import React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/app/page/components/ui/button";
import { Input } from "@/app/page/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/app/page/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/app/page/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/page/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/app/page/components/ui/sheet";
import {
  Search,
  Menu,
  Bell,
  PlusCircle,
  Plus,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để tạo bài viết!");
      router.push("/page/auth/login");
      return;
    }
    router.push("/forum/create-post");
  };

  const handleNavigation = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      alert("Vui lòng đăng nhập để truy cập tính năng này!");
      router.push("/page/auth/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl">
            FinTrip
          </Link>

          {isAuthenticated && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        pathname === "/" && "bg-accent text-accent-foreground"
                      )}
                    >
                      Trang chủ
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      pathname.startsWith("/destinations") &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    Điểm đến
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {destinations.map((destination) => (
                        <ListItem
                          key={destination.title}
                          title={destination.title}
                          href={destination.href}
                          className={cn(
                            pathname === destination.href &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          {destination.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(
                      pathname.startsWith("/categories") &&
                        "bg-accent text-accent-foreground"
                    )}
                  >
                    Chủ đề
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {categories.map((category) => (
                        <ListItem
                          key={category.title}
                          title={category.title}
                          href={category.href}
                          className={cn(
                            pathname === category.href &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          {category.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        {/* Center Section */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/forum"
            onClick={handleNavigation}
            className={cn(
              "px-6 py-2 text-base font-medium transition-colors hover:text-primary rounded-md hover:bg-accent",
              pathname === "/forum"
                ? "text-foreground bg-accent"
                : "text-muted-foreground"
            )}
          >
            Forum
          </Link>
          <Link
            href="/findFH"
            onClick={handleNavigation}
            className={cn(
              "px-6 py-2 text-base font-medium transition-colors hover:text-primary rounded-md hover:bg-accent",
              pathname === "/findFH"
                ? "text-foreground bg-accent"
                : "text-muted-foreground"
            )}
          >
            Flight & Hotel
          </Link>
          <Link
            href="/homepage"
            onClick={handleNavigation}
            className={cn(
              "px-6 py-2 text-base font-medium transition-colors hover:text-primary rounded-md hover:bg-accent",
              pathname === "/homepage"
                ? "text-foreground bg-accent"
                : "text-muted-foreground"
            )}
          >
            Home
          </Link>
          <Link
            href="/plan"
            onClick={handleNavigation}
            className={cn(
              "px-6 py-2 text-base font-medium transition-colors hover:text-primary rounded-md hover:bg-accent",
              pathname === "/plan"
                ? "text-foreground bg-accent"
                : "text-muted-foreground"
            )}
          >
            Plan
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {
            <>
              <div className="relative w-60">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm kiếm..." className="pl-8" />
              </div>

              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleCreatePost}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo bài viết
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/avatars/01.png" alt={user?.fullName || "User"} />
                          <AvatarFallback>{user?.fullName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.fullName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <Link href="/profile">
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/settings">
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/page/auth/login">Đăng nhập</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/page/auth/register">Đăng ký</Link>
                  </Button>
                </>
              )}
            </>
          }

          {
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm kiếm..." className="pl-8" />
                  </div>

                  <div className="grid gap-2">
                    <Link href="/">
                      <Button variant="ghost" className="w-full justify-start">
                        Trang chủ
                      </Button>
                    </Link>
                    <Link href="/destinations">
                      <Button variant="ghost" className="w-full justify-start">
                        Điểm đến
                      </Button>
                    </Link>
                    <Link href="/categories">
                      <Button variant="ghost" className="w-full justify-start">
                        Chủ đề
                      </Button>
                    </Link>

                    {isAuthenticated ? (
                      <>
                        <Link href="/create-post">
                          <Button className="w-full mt-2">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            <span>Tạo bài viết</span>
                          </Button>
                        </Link>
                        <Link href="/profile">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            Hồ sơ cá nhân
                          </Button>
                        </Link>
                        <Link href="/my-posts">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            Bài viết của tôi
                          </Button>
                        </Link>
                        <Link href="/saved">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            Đã lưu
                          </Button>
                        </Link>
                        <Link href="/callvideo">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            Video Call
                          </Button>
                        </Link>
                        <Link href="/settings">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            Cài đặt
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          Đăng xuất
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full mt-2">Đăng nhập</Button>
                        <Button variant="outline" className="w-full">
                          Đăng ký
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          }
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const destinations = [
  {
    title: "Miền Bắc",
    href: "/destinations/north",
    description:
      "Khám phá vẻ đẹp của Hà Nội, Sapa, Hạ Long, Ninh Bình và các điểm đến miền Bắc",
  },
  {
    title: "Miền Trung",
    href: "/destinations/central",
    description:
      "Khám phá vẻ đẹp của Huế, Đà Nẵng, Hội An, Nha Trang và các điểm đến miền Trung",
  },
  {
    title: "Miền Nam",
    href: "/destinations/south",
    description:
      "Khám phá vẻ đẹp của TP.HCM, Vũng Tàu, Phú Quốc, Cần Thơ và các điểm đến miền Nam",
  },
  {
    title: "Quốc tế",
    href: "/destinations/international",
    description:
      "Khám phá các điểm đến nổi tiếng trên thế giới từ châu Á đến châu Âu, châu Mỹ",
  },
];

const categories = [
  {
    title: "Du lịch biển",
    href: "/categories/beach",
    description:
      "Những bãi biển đẹp nhất với cát trắng, nước xanh và hoàng hôn tuyệt đẹp",
  },
  {
    title: "Du lịch núi",
    href: "/categories/mountain",
    description:
      "Khám phá những dãy núi hùng vĩ, những cung đường trekking thử thách",
  },
  {
    title: "Du lịch văn hóa",
    href: "/categories/culture",
    description:
      "Tìm hiểu về văn hóa, lịch sử và con người ở các vùng miền khác nhau",
  },
  {
    title: "Ẩm thực",
    href: "/categories/food",
    description:
      "Khám phá nền ẩm thực phong phú từ các vùng miền trong nước và quốc tế",
  },
];
