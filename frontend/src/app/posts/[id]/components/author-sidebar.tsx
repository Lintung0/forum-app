'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostAuthor } from '../type';
import { CheckCircle2, FileText, Star } from 'lucide-react';

export function AuthorSidebar({ author }: { author: PostAuthor }) {
  return (
    <div className="bg-[#13151a] border border-[#1e222b] rounded-2xl p-6 space-y-6 shadow-xl shadow-black/20">
      <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest text-center border-b border-[#1e222b] pb-3">Author Information</p>

      <Link href={`/profile/${author.username}`} className="flex flex-col items-center gap-4 group">
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-[#1e222b] group-hover:border-[#e95723] transition-all duration-300 shadow-2xl">
            <AvatarImage src={author.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl bg-[#1a1d24] text-white font-black">
              {author.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-[#e95723] text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#13151a]">
            LVL {author.level}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-lg font-black text-white group-hover:text-[#e95723] transition-colors leading-tight">
            @{author.username}
          </p>
          <p className="text-[11px] text-gray-500 font-bold mt-1 uppercase tracking-tight">Active Contributor</p>
        </div>
      </Link>

      <div className="grid grid-cols-3 gap-2 bg-[#0f1115] p-4 rounded-xl border border-[#1e222b]">
        <div className="text-center">
          <p className="text-sm font-black text-white tabular-nums">{author.reputation_points}</p>
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">Rep</p>
        </div>
        <div className="text-center border-x border-[#1e222b]">
          <p className="text-sm font-black text-[#e95723] tabular-nums">{author.accepted_answers_count ?? 0}</p>
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">Solusi</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-white tabular-nums">{author.posts_count}</p>
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">Posts</p>
        </div>
      </div>

      <Link 
        href={`/profile/${author.username}`}
        className="block w-full text-center py-2.5 rounded-xl bg-[#1a1d24] border border-[#22252e] text-xs font-bold text-gray-300 hover:bg-[#e95723] hover:text-white hover:border-[#e95723] transition-all"
      >
        View Full Profile
      </Link>
    </div>
  );
}
