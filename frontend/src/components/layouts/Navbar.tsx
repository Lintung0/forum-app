"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Plus, LogIn, UserPlus, Menu, X, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

async function fetchUnreadCount(token: string) {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/v1/notifications/unread-count`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return 0;
    const json = await res.json();
    return json.data?.unread_count ?? 0;
  } catch (e) {
    console.error("Failed to fetch unread count:", e);
    return 0;
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string>("");
  const [authUser, setAuthUser] = useState<{ username: string; avatar_url?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      const stored = localStorage.getItem("auth_user");
      setIsLoggedIn(!!token);
      setAuthToken(token ?? "");
      try {
        setAuthUser(stored ? JSON.parse(stored) : null);
      } catch {
        setAuthUser(null);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    checkAuth();
    
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", checkAuth);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);

  const { data: unreadCount } = useQuery({
    queryKey: ["unreadCount", authToken],
    queryFn: () => fetchUnreadCount(authToken),
    enabled: isLoggedIn && !!authToken,
    refetchInterval: 15000, 
    staleTime: 1000 * 10,
  });

  const profileHref = authUser?.username ? `/profile/${authUser.username}` : "/profile";

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-700 h-20 flex items-center",
      isScrolled 
        ? "bg-[#090a0f]/70 backdrop-blur-2xl border-b border-white/[0.05] shadow-[0_10px_50px_rgba(0,0,0,0.5)] h-16" 
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="max-w-[1440px] mx-auto w-full px-6 md:px-10 flex items-center justify-between gap-10">
        
        {}
        <Link
          href="/home"
          className="flex items-center gap-4 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#e95723] rounded-2xl blur-xl opacity-20 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e95723] to-[#ff8a5c] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 active:scale-95">
              <Sparkles className="text-white w-6 h-6" />
            </div>
          </div>
          <span className="text-2xl font-black text-white tracking-tighter hidden sm:block selection:text-[#e95723]">Voxra</span>
        </Link>

        {}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl group hidden md:block">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-[#e95723] transition-colors duration-300" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions, users, tags..."
            className="pl-12 bg-white/[0.03] border-white/[0.08] text-white placeholder-gray-600 rounded-2xl h-12 focus-visible:ring-1 focus-visible:ring-[#e95723]/30 focus-visible:bg-white/[0.06] transition-all duration-300 shadow-inner"
          />
        </form>

        {}
        <div className="flex items-center gap-3 md:gap-6">
          {mounted &&
            (isLoggedIn ? (
              <>
                <Link href="/notifications">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-11 h-11 rounded-2xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition-all duration-300 group/nav"
                  >
                    <Bell className="h-5 w-5 transition-transform group-hover/nav:scale-110" />
                    {(unreadCount ?? 0) > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-[#e95723] text-white font-black text-[9px] flex items-center justify-center rounded-full ring-4 ring-[#090a0f] animate-in zoom-in duration-300">
                        {unreadCount! > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Link href="/posts/create" className="hidden sm:block">
                  <Button className="h-11 px-6 bg-[#e95723] hover:bg-[#d0481b] text-white flex items-center gap-3 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(233,87,35,0.2)] active:scale-95">
                    <Plus className="h-4 w-4 stroke-[4px]" />
                    <span>Create</span>
                  </Button>
                </Link>

                <div className="w-px h-8 bg-white/[0.08] mx-2 hidden lg:block" />

                <Link href={profileHref}>
                  <div className="flex items-center gap-4 group cursor-pointer selection:bg-transparent">
                    <div className="text-right hidden lg:block">
                      <p className="text-[12px] font-black text-white leading-none group-hover:text-[#e95723] transition-colors">@{authUser?.username}</p>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1.5 opacity-60">Architect</p>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#e95723] rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity" />
                      <Avatar className="h-11 w-11 border-2 border-white/[0.08] group-hover:border-[#e95723] transition-all duration-500 shadow-2xl relative z-10">
                        <AvatarImage src={authUser?.avatar_url ?? undefined} />
                        <AvatarFallback className="bg-[#1a1d24] text-gray-400 font-black text-xs uppercase">
                          {authUser?.username?.[0] ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/pages/login">
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white font-black text-[11px] uppercase tracking-[0.2em] px-6 h-11 rounded-2xl transition-all"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/pages/register">
                  <Button className="bg-white text-black hover:bg-gray-200 font-black text-[11px] uppercase tracking-[0.2em] px-8 h-11 rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.1)] transition-all active:scale-95">
                    Join
                  </Button>
                </Link>
              </div>
            ))}
        </div>
      </div>
    </header>
  );
}
