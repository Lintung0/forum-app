"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Plus, LogIn, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:8000";

async function fetchUnreadCount(token: string) {
  const res = await fetch(`${BACKEND_API_URL}/api/v1/notifications/unread-count`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.data?.unread_count ?? 0;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string>("");
  const [authUser, setAuthUser] = useState<{ username: string; avatar_url?: string } | null>(null);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      const stored = localStorage.getItem("auth_user");
      setIsLoggedIn(!!token);
      setAuthToken(token ?? "");
      setAuthUser(stored ? JSON.parse(stored) : null);
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [pathname]);

  const { data: unreadCount } = useQuery({
    queryKey: ["unreadCount", authToken],
    queryFn: () => fetchUnreadCount(authToken),
    enabled: isLoggedIn && !!authToken,
    refetchInterval: 30000, 
    staleTime: 1000 * 25,
  });

  
  const profileHref = authUser?.username ? `/profile/${authUser.username}` : "/home";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f1115] border-b border-[#1e2129] z-50 px-6 flex items-center justify-between">
      {}
      <Link
        href="/home"
        className="flex items-center gap-2 font-bold text-xl text-white tracking-tight"
      >
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e95723] to-[#8b5cf6] flex items-center justify-center text-sm shadow-md text-white">
          F
        </span>
        Voxra
      </Link>

      {}
      <div className="relative w-full max-w-md hidden md:block">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search discussions, tags, users..."
          className="pl-9 bg-[#16181d] border-[#22252e] text-white placeholder-gray-500 rounded-xl focus-visible:ring-1 focus-visible:ring-[#e95723] focus-visible:ring-offset-0"
        />
      </div>

      {}
      <div className="flex items-center gap-4">
        {mounted &&
          (isLoggedIn ? (
            <>
              {}
              <Link href="/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-400 hover:text-white hover:bg-transparent"
                >
                  <Bell className="h-5 w-5" />
                  {(unreadCount ?? 0) > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#e95723] text-white font-bold text-[9px] flex items-center justify-center rounded-full">
                      {unreadCount! > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/bookmarks">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-transparent"
                  title="Bookmarks"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                </Button>
              </Link>

              <Link href="/posts/create">
                <Button className="bg-[#e95723] hover:bg-[#d0481b] text-white flex items-center gap-2 font-medium rounded-xl px-4 py-2 transition-all">
                  <Plus className="h-4 w-4" /> Create Post
                </Button>
              </Link>

              {}
              <Link href={profileHref}>
                <Avatar className="h-9 w-9 border border-[#22252e] cursor-pointer hover:border-[#e95723] transition-colors">
                  <AvatarImage src={authUser?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-[#16181d] text-gray-300 font-bold text-xs">
                    {authUser?.username?.[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {}
              <Link href="/pages/login">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white flex items-center gap-2 font-medium px-4 py-2 transition-all"
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </Button>
              </Link>
              <Link href="/pages/register">
                <Button className="bg-[#e95723] hover:bg-[#d0481b] text-white flex items-center gap-2 font-medium rounded-xl px-4 py-2 shadow-md transition-all">
                  <UserPlus className="h-4 w-4" /> Sign Up
                </Button>
              </Link>
            </div>
          ))}
      </div>
    </header>
  );
}