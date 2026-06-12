'use client';

import { Bell, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f1115] border-b border-[#1e2129] z-50 px-6 flex items-center justify-between">
      {/* Brand Logo */}
      <Link href="/home" className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e95723] to-[#8b5cf6] flex items-center justify-center text-sm shadow-md">
          F
        </span>
        Voxra<span className="text-[#e95723]"></span>
      </Link>

      {/* Search Bar */}
      <div className="relative w-full max-w-md hidden md:block">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input 
          placeholder="Search discussions, tags, users..." 
          className="pl-9 bg-[#16181d] border-[#22252e] text-white placeholder-gray-500 rounded-xl focus-visible:ring-1 focus-visible:ring-[#e95723] focus-visible:ring-offset-0"
        />
      </div>

      {/* Action Right */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-transparent">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#e95723] text-white font-bold text-[9px] flex items-center justify-center rounded-full">
            3
          </span>
        </Button>
        
        {/* Navigasi ke halaman create post */}
        <Link href="/posts/create">
          <Button className="bg-[#e95723] hover:bg-[#d0481b] text-white flex items-center gap-2 font-medium rounded-xl px-4 py-2">
            <Plus className="h-4 w-4" /> Create Post
          </Button>
        </Link>

        <Avatar className="h-9 w-9 border border-[#22252e]">
          <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" />
          <AvatarFallback>UX</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}