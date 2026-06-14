'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostAuthor } from '../type';
import { CheckCircle2, FileText, Star } from 'lucide-react';

export function AuthorSidebar({ author }: { author: PostAuthor }) {
  return (
    <div className="bg-[#0f1115] border border-[#1e2129] rounded-xl p-4 space-y-4">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Dibuat oleh</p>

      <Link href={`/profile/${author.username}`} className="flex items-center gap-3 group">
        <Avatar className="w-10 h-10 border border-[#22252e] group-hover:border-[#e95723] transition-colors">
          <AvatarImage src={author.avatar_url ?? undefined} />
          <AvatarFallback className="text-sm bg-[#16181d] text-gray-300 font-bold">
            {author.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-bold text-gray-200 group-hover:text-[#e95723] transition-colors">
            @{author.username}
          </p>
          <p className="text-[10px] text-gray-500">Level {author.level}</p>
        </div>
      </Link>

      <div className="grid grid-cols-3 gap-2 border-t border-[#1e2129] pt-3">
        <div className="text-center">
          <p className="text-xs font-black text-white">{author.reputation_points}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Rep</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-[#e95723]">{author.accepted_answers_count ?? 0}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Solusi</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-black text-white">{author.posts_count}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Posts</p>
        </div>
      </div>
    </div>
  );
}
