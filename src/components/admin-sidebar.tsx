"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Map,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { state, toggleSidebar } = useSidebar();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    {
      title: "Users",
      icon: Users,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      title: "Destinations",
      icon: Map,
      href: "admin/destinations",
      active: pathname === "admin/destinations",
    },
    {
      title: "Statistics",
      icon: BarChart3,
      href: "admin/statistics",
      active: pathname === "admin/statistics",
    },
  ];

  const handleLogout = () => {
    // In a real application, you would implement actual logout logic here
    console.log("Logging out...");
    // window.location.href = "/login"
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        state === "expanded" ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-2 overflow-hidden">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
            <span className="text-lg font-bold">F</span>
          </div>
          {state === "expanded" && (
            <span className="text-xl font-bold text-blue-600 transition-opacity duration-300">
              FinTrip
            </span>
          )}
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-full hover:bg-gray-100"
        >
          {state === "expanded" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Menu */}
      <div className="py-4">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className={`flex items-center rounded-md px-3 py-2 transition-colors hover:bg-gray-100 ${
                  item.active ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${
                    item.active ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                {state === "expanded" && (
                  <span className="ml-3 transition-opacity duration-300">
                    {item.title}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 w-full border-t border-gray-100 p-4">
        <Button
          variant="outline"
          className={`w-full justify-start hover:bg-gray-100 ${
            state === "expanded" ? "px-3" : "px-2"
          }`}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 text-gray-500" />
          {state === "expanded" && (
            <span className="ml-3 transition-opacity duration-300">Logout</span>
          )}
        </Button>
      </div>
    </div>
  );
}
