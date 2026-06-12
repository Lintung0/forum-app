'use client';

import { Post, Tag } from './type';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';

interface HomeViewProps {
  posts: Post[];
  tags: Tag[];
}

export default function HomeView({ posts, tags }: HomeViewProps) {
  return (
    /* PERBAIKAN: Menghapus class 'font-sans' yang bentrok agar otomatis mengikuti font Geist dari root layout */
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* KOLOM KIRI & TENGAH (WELCOME BANNER & LIST DISKUSI) */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Welcome Banner */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#1c122c] to-[#0f111a] border border-[#26193e] relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">
              ✨ Welcome to ForumX
            </h1>
            <p className="text-sm text-gray-400 max-w-xl leading-relaxed mb-6 font-normal">
              Join the most active developer community. Share knowledge, solve problems, and connect with experts from around the world.
            </p>
            {/* Info Mini-Stats di dalam Banner */}
            <div className="flex gap-4 md:gap-8">
              <div className="bg-[#161426] border border-[#2e234d] px-5 py-3 rounded-xl">
                <div className="text-xl font-bold tracking-tight text-white">142K+</div>
                <div className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">Members</div>
              </div>
              <div className="bg-[#161426] border border-[#2e234d] px-5 py-3 rounded-xl">
                <div className="text-xl font-bold tracking-tight text-white">45K+</div>
                <div className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">Discussions</div>
              </div>
              <div className="bg-[#161426] border border-[#2e234d] px-5 py-3 rounded-xl">
                <div className="text-xl font-bold tracking-tight text-white">28K+</div>
                <div className="text-[11px] font-medium text-gray-400 tracking-wide uppercase">Solved</div>
              </div>
            </div>
          </div>
        </div>

        {/* List Header & Filter Tab */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white tracking-tight">Trending Discussions</h2>
            <div className="flex gap-1 bg-[#16181d] p-1 rounded-xl border border-[#22252e]">
              <button className="bg-[#e95723] px-4 py-1.5 rounded-lg text-white text-xs font-semibold tracking-wide transition-all">Latest</button>
              <button className="px-4 py-1.5 text-gray-400 hover:text-white text-xs font-medium tracking-wide transition-all">Popular</button>
              <button className="px-4 py-1.5 text-gray-400 hover:text-white text-xs font-medium tracking-wide transition-all hidden sm:block">Unanswered</button>
            </div>
          </div>

          {/* Menampilkan Postingan dari Laravel */}
          {!Array.isArray(posts) || posts.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#16181d] border border-[#22252e] text-center text-sm font-normal text-gray-500">
              Belum ada diskusi tersedia. Pastikan API Laravel mengembalikan data berbentuk Array atau cek struktur pagination.
            </div>
          ) : (
            posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="block group">
                <Card className="p-5 bg-[#16181d] border-[#22252e] group-hover:border-[#333947] transition-all duration-200 rounded-xl">
                  <div className="flex gap-4 items-start">
                    {/* Vote Widget Box */}
                    <div className="flex flex-col items-center justify-center bg-[#1e222b] p-2 rounded-xl min-w-[46px] border border-[#2c323f]">
                      <ArrowUp className="h-4 w-4 text-gray-400 group-hover:text-[#e95723] transition-colors cursor-pointer" />
                      <span className="text-xs font-bold text-white my-1 tabular-nums">{post.vote_score || 0}</span>
                      <ArrowDown className="h-4 w-4 text-gray-400 hover:text-blue-500 transition-colors cursor-pointer" />
                    </div>
                    
                    {/* Konten Utama Card */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-normal">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={post.user?.avatar_url} />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-gray-300">@{post.user?.username || 'anonymous'}</span>
                        <span className="bg-[#8b5cf6]/20 text-[#a78bfa] font-medium px-1.5 py-0.5 rounded text-[10px]">Expert</span>
                        <span className="text-gray-500">• Discussion</span>
                      </div>
                      
                      <h3 className="text-base font-bold text-white group-hover:text-[#e95723] tracking-tight transition-colors line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-normal line-clamp-2 leading-relaxed">
                        {post.body}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* KOLOM KANAN (STATS & TRENDING TAGS WIDGET) */}
      <div className="space-y-6">
        {/* Community Stats Widget */}
        <Card className="p-5 bg-[#16181d] border-[#22252e] space-y-4 rounded-xl">
          <div className="font-semibold text-sm text-white flex items-center gap-2 tracking-tight">
            <span>📈</span> Community Stats
          </div>
          <div className="space-y-3 text-xs border-t border-[#22252e] pt-3 text-gray-400 font-normal">
            <div className="flex justify-between"><span>Total Members</span><span className="font-bold text-white tabular-nums">142,891</span></div>
            <div className="flex justify-between"><span>Online Now</span><span className="font-bold text-[#10b981] tabular-nums">8,432</span></div>
            <div className="flex justify-between"><span>Discussions</span><span className="font-bold text-white tabular-nums">45,678</span></div>
            <div className="flex justify-between"><span>Today's Posts</span><span className="font-bold text-white tabular-nums">1,234</span></div>
          </div>
        </Card>

        {/* Trending Tags Widget */}
        <Card className="p-5 bg-[#16181d] border-[#22252e] space-y-4 rounded-xl">
          <div className="font-semibold text-sm text-white flex items-center gap-2 tracking-tight">
            <span>#</span> Trending Tags
          </div>
          <div className="flex flex-col gap-2 border-t border-[#22252e] pt-3">
            {!Array.isArray(tags) || tags.length === 0 ? (
              <span className="text-xs font-normal text-gray-500">Tidak ada tag aktif.</span>
            ) : (
              tags.map((tag) => (
                <div key={tag.id} className="flex justify-between items-center text-xs text-gray-400 p-1 hover:bg-[#1e222b] rounded-lg transition-colors cursor-pointer group">
                  <span className="font-medium text-gray-300 group-hover:text-[#e95723]">#{tag.name}</span>
                  <span className="bg-[#1e222b] font-semibold text-gray-500 px-2 py-0.5 rounded text-[10px] tabular-nums">1240 posts</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}