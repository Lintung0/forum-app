'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, User, MessageSquare, Tag, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import PostCard from '@/app/posts/postcard';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_API_URL}/api/v1/posts?q=${encodeURIComponent(q)}`);
      const posts = await res.json();
      
      const userRes = await fetch(`${BACKEND_API_URL}/api/v1/users/${q}`).catch(() => null);
      let users: any[] = [];
      if (userRes && userRes.ok) {
        const userData = await userRes.json();
        if (userData.data) users = [userData.data];
      }

      return {
        posts: posts.data || [],
        users: users
      };
    },
    enabled: !!q
  });

  if (!q) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <Search className="w-12 h-12 mb-4 opacity-20" />
      <p className="font-black uppercase tracking-widest text-xs">Enter a search term above</p>
    </div>
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-[#e95723] mb-4" />
      <p className="font-black uppercase tracking-widest text-[10px] text-gray-500">Scanning Database...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-40">
      {}
      {(results?.users?.length ?? 0) > 0 && (
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e95723] px-2 flex items-center gap-3">
            <User className="w-3 h-3" /> User Identities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results!.users.map((user: any) => (
              <Link href={`/profile/${user.username}`} key={user.id}>
                <Card className="glass-card p-4 rounded-3xl hover:border-[#e95723]/40 transition-all group">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-white/[0.05] group-hover:border-[#e95723] transition-all">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-[#1a1d24] font-black uppercase">{user.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-black text-sm">@{user.username}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">LVL {user.level} Architect</p>
                    </div>
                    <ArrowRight className="ml-auto w-4 h-4 text-gray-700 group-hover:text-[#e95723] transition-all group-hover:translate-x-1" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 px-2 flex items-center gap-3">
          <MessageSquare className="w-3 h-3" /> Discussion Transmissions
        </h3>
        {results?.posts.length === 0 ? (
          <div className="p-20 rounded-[3rem] bg-[#0d0e12] border border-dashed border-white/[0.1] text-center">
            <p className="text-xs font-black text-gray-600 uppercase tracking-widest">No matching transmissions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {results?.posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="max-w-[1200px] mx-auto p-6 md:p-10 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter">Search Results</h1>
        <p className="text-gray-500 text-sm font-medium">Cross-referencing transmissions and identities</p>
      </div>

      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#e95723]" />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </div>
  );
}
