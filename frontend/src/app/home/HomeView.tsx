'use client';

import { useState, useMemo } from 'react';
import { Post, Tag } from './type';
import { Card } from '@/components/ui/card';
import PostCard from '@/app/posts/postcard';

interface HomeViewProps {
  posts: Post[];
  tags: Tag[];
}

type Tab = 'latest' | 'popular' | 'unanswered';

export default function HomeView({ posts, tags }: HomeViewProps) {
  const [tab, setTab] = useState<Tab>('latest');

  const filtered = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    if (tab === 'popular') return [...posts].sort((a, b) => (b.vote_score ?? 0) - (a.vote_score ?? 0));
    if (tab === 'unanswered') return posts.filter((p) => !p.is_answered);
    return [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [posts, tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'latest', label: 'Latest' },
    { key: 'popular', label: 'Popular' },
    { key: 'unanswered', label: 'Unanswered' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 p-5">
      <div className="xl:col-span-2 space-y-5">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1c122c] to-[#0f111a] border border-[#26193e] relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">✨ Welcome to Voxra</h1>
            <p className="text-sm text-gray-400 max-w-xl leading-relaxed mb-4 font-normal">
              Join the most active developer community. Share knowledge, solve problems, and connect with experts from around the world.
            </p>
            <div className="flex gap-3 md:gap-5">
              {[['142K+', 'Members'], ['45K+', 'Discussions'], ['28K+', 'Solved']].map(([val, label]) => (
                <div key={label} className="bg-[#161426] border border-[#2e234d] px-4 py-2 rounded-xl">
                  <div className="text-lg font-bold tracking-tight text-white">{val}</div>
                  <div className="text-[10px] font-medium text-gray-400 tracking-wide uppercase">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-white tracking-tight">Trending Discussions</h2>
            <div className="flex gap-1 bg-[#16181d] p-1 rounded-xl border border-[#22252e]">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    tab === key ? 'bg-[#e95723] text-white' : 'text-gray-400 hover:text-white'
                  } ${key === 'unanswered' ? 'hidden sm:block' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#16181d] border border-[#22252e] text-center text-sm text-gray-500">
              {posts.length === 0 ? 'Belum ada diskusi. Pastikan API Laravel aktif.' : 'Tidak ada post di kategori ini.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <Card className="p-5 bg-[#16181d] border-[#22252e] space-y-4 rounded-xl">
          <div className="font-semibold text-sm text-white flex items-center gap-2 tracking-tight">
            <span>📈</span> Community Stats
          </div>
          <div className="space-y-3 text-xs border-t border-[#22252e] pt-3 text-gray-400 font-normal">
            {[['Total Members', '142,891', 'white'], ['Online Now', '8,432', '#10b981'], ['Discussions', '45,678', 'white'], ["Today's Posts", '1,234', 'white']].map(([label, val, color]) => (
              <div key={label as string} className="flex justify-between">
                <span>{label}</span>
                <span className="font-bold tabular-nums" style={{ color: color as string }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 bg-[#16181d] border-[#22252e] space-y-4 rounded-xl">
          <div className="font-semibold text-sm text-white flex items-center gap-2 tracking-tight">
            <span>#</span> Trending Tags
          </div>
          <div className="flex flex-col gap-2 border-t border-[#22252e] pt-3">
            {!Array.isArray(tags) || tags.length === 0 ? (
              <span className="text-xs text-gray-500">Tidak ada tag aktif.</span>
            ) : (
              tags.slice(0, 10).map((tag) => (
                <div key={tag.id} className="flex justify-between items-center text-xs text-gray-400 p-1 hover:bg-[#1e222b] rounded-lg cursor-pointer group">
                  <span className="font-medium text-gray-300 group-hover:text-[#e95723]">#{tag.name}</span>
                  <span className="bg-[#1e222b] font-semibold text-gray-500 px-2 py-0.5 rounded text-[10px] tabular-nums">
                    {(tag as any).posts_count ?? 0} posts
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
