'use client';

import { useState, useMemo } from 'react';
import { Post, Tag } from './type';
import { Card } from '@/components/ui/card';
import PostCard from '@/app/posts/postcard';
import { Flame, TrendingUp, Clock, MessageSquare, Plus, ArrowRight, Sparkles, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HomeViewProps {
  posts: Post[];
  tags: Tag[];
  stats?: {
    total_members: number;
    online_now: number;
    discussions: number;
    today_posts: number;
    solved: number;
  };
}

type Tab = 'latest' | 'popular' | 'unanswered';

export default function HomeView({ posts, tags, stats }: HomeViewProps) {
  const [tab, setTab] = useState<Tab>('latest');

  const communityStats = [
    { label: 'Total Members', val: stats?.total_members?.toLocaleString() ?? '1,240', color: 'text-white' },
    { label: 'Online Now', val: stats?.online_now?.toLocaleString() ?? '84', color: 'text-emerald-400' },
    { label: 'Discussions', val: stats?.discussions?.toLocaleString() ?? '456', color: 'text-white' },
    { label: "Today's Posts", val: stats?.today_posts?.toLocaleString() ?? '12', color: 'text-white' }
  ];

  const filtered = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    if (tab === 'popular') return [...posts].sort((a, b) => (b.vote_score ?? 0) - (a.vote_score ?? 0));
    if (tab === 'unanswered') return posts.filter((p) => !p.is_answered);
    return [...posts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [posts, tab]);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'latest', label: 'Latest', icon: Clock },
    { key: 'popular', label: 'Popular', icon: TrendingUp },
    { key: 'unanswered', label: 'Unanswered', icon: MessageSquare },
  ];

  return (
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8 p-6 md:p-8 pb-40">
      <div className="space-y-12">
        <section className="relative overflow-hidden rounded-xl bg-[#0d0e12] border border-gray-800">
          <div className="relative z-10 p-8 md:p-12 space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Forge the future <br />
                <span className="text-[#e95723]">
                  of development.
                </span>
              </h1>
              <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-relaxed">
                Connect with the world's most innovative developers. Solve challenges, share insights, and accelerate your growth in our elite community.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <Link href="/posts/create">
                <Button className="h-12 px-8 rounded-lg bg-[#e95723] text-white hover:bg-[#d0481b] font-bold text-sm uppercase tracking-widest transition-all">
                  Start Discussion <Plus className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-end gap-4 px-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                Community Feed
                <span className="text-[10px] font-bold bg-gray-800 text-gray-400 px-3 py-1 rounded-md uppercase">
                  {posts.length} Active
                </span>
              </h2>
            </div>
            
            <div className="flex gap-1 p-1 bg-[#16181d] rounded-lg border border-gray-800">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                    tab === key 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-500 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filtered.length === 0 ? (
              <div className="p-16 rounded-xl bg-[#0d0e12] border border-dashed border-gray-800 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mx-auto border border-gray-800">
                  <MessageSquare className="w-8 h-8 text-gray-700" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-white uppercase tracking-widest">Digital Silence</p>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">No discussions found in this sector.</p>
                </div>
                <Link href="/posts/create" className="inline-block">
                  <Button className="rounded-lg bg-[#e95723] font-bold uppercase tracking-widest px-8 h-10 text-xs">Broadcast Post</Button>
                </Link>
              </div>
            ) : (
              filtered.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <Card className="overflow-hidden bg-[#0d0e12] rounded-xl border-gray-800">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Activity className="w-4 h-4 text-[#e95723]" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Pulse</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {communityStats.map((stat, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-lg bg-gray-900/50 border border-gray-800">
                  <span className="text-[9px] font-bold text-gray-500 uppercase">{stat.label}</span>
                  <span className={`text-sm font-black ${stat.color}`}>{stat.val}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="bg-[#0d0e12] rounded-xl border-gray-800">
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Sectors</h3>
            </div>
            
            <div className="flex flex-col gap-2">
              {!Array.isArray(tags) || tags.length === 0 ? (
                <div className="py-6 text-center bg-gray-900/50 rounded-lg border border-dashed border-gray-800">
                  <span className="text-[9px] font-bold text-gray-600 uppercase">No active sectors</span>
                </div>
              ) : (
                tags.slice(0, 8).map((tag) => (
                  <Link href={`/posts?tag=${tag.slug}`} key={tag.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-800 transition-all border border-transparent hover:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color || '#e95723' }}></div>
                      <span className="text-xs font-bold text-gray-300">#{tag.name}</span>
                    </div>
                    <span className="bg-gray-800 text-[9px] font-bold text-gray-500 px-2 py-0.5 rounded border border-gray-700">
                      {tag.posts_count ?? 0}
                    </span>
                  </Link>
                ))
              )}
            </div>

            <Button variant="ghost" className="w-full rounded-lg h-10 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-gray-800">
              All Sectors <ArrowRight className="ml-2 w-3 h-3" />
            </Button>
          </div>
        </Card>
      </aside>
    </div>
  );
}