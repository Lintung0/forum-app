// src/app/posts/page.tsx
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowUp,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  TrendingUp,
  Filter,
  Flame,
} from 'lucide-react';

interface PostSummary {
  id: string;
  title: string;
  body: string;
  status: string;
  vote_score: number;
  view_count: number;
  is_answered: boolean;
  comments_count: number;
  user?: {
    username: string;
    avatar_url?: string | null;
    reputation_points: number;
    level: number;
  };
  category?: {
    name: string;
    slug: string;
  };
  tags?: {
    id: string;
    name: string;
    color: string;
  }[];
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function VoteBox({ score }: { score: number }) {
  return (
    <div className="flex flex-col items-center justify-start pt-0.5 min-w-[36px]">
      <ArrowUp className="h-4 w-4 text-gray-600 hover:text-[#e95723] cursor-pointer transition-colors" />
      <span
        className={`text-xs font-bold my-0.5 tabular-nums ${
          score > 0 ? 'text-[#e95723]' : score < 0 ? 'text-blue-400' : 'text-gray-500'
        }`}
      >
        {score}
      </span>
      <ArrowUp className="h-4 w-4 text-gray-600 hover:text-blue-400 cursor-pointer transition-colors rotate-180" />
    </div>
  );
}

export default async function PostsPage() {
  let posts: PostSummary[] = [];

  try {
  const response = await fetch('http://127.0.0.1:8000/api/v1/posts', {
    cache: 'no-store',
  });

  if (response.ok) {
    const text = await response.text();

    // Buang deprecated warning PHP yang nempel di depan JSON
    const jsonStart = text.indexOf('{');
    if (jsonStart === -1) throw new Error('Response bukan JSON');

    const data = JSON.parse(text.slice(jsonStart));
    posts = data.data ?? [];
  }
} catch (error) {
  console.error('Gagal fetch posts:', error);
}

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-[#e95723]" />
          <h1 className="text-sm font-semibold text-white">Discussions</h1>
          <span className="text-[10px] text-gray-500 bg-[#1e222b] border border-[#2c323f] px-1.5 py-0.5 rounded-full tabular-nums">
            {posts.length}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e222b] transition-colors text-[#e95723]">
            <TrendingUp className="h-3 w-3" /> Hot
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e222b] transition-colors">
            <Clock className="h-3 w-3" /> New
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e222b] transition-colors">
            <Filter className="h-3 w-3" /> Filter
          </button>
        </div>
      </div>

      <Separator className="bg-[#22252e]" />

      {/* Post List */}
      {posts.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <MessageSquare className="h-8 w-8 text-gray-600 mx-auto" />
          <p className="text-sm text-gray-500">Belum ada diskusi.</p>
          <p className="text-xs text-gray-600">Jadilah yang pertama memulai!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <Link href={`/posts/${post.id}`} key={post.id} className="block group">
              <Card className="
                bg-[#13151a] border border-[#1e222b]
                hover:border-[#e95723]/30 hover:bg-[#16181d]
                transition-all duration-150 rounded-lg overflow-hidden
              ">
                <div className="flex gap-3 p-3">

                  {/* Vote */}
                  <VoteBox score={post.vote_score} />

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">

                    {/* Meta top row */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-gray-500">
                      {post.category && (
                        <>
                          <span className="text-[#e95723] font-medium hover:underline">
                            d/{post.category.slug}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <Avatar className="w-3.5 h-3.5 inline-flex">
                        <AvatarImage src={post.user?.avatar_url ?? undefined} />
                        <AvatarFallback className="text-[8px] bg-[#2c323f]">
                          {post.user?.username?.[0]?.toUpperCase() ?? 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span>@{post.user?.username ?? 'author'}</span>
                      <span>•</span>
                      <span>{timeAgo(post.created_at)}</span>
                    </div>

                    {/* Title */}
                    <div className="flex items-start gap-2">
                      <h2 className="text-sm font-semibold text-gray-100 leading-snug group-hover:text-white transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.is_answered && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                    </div>

                    {/* Body preview */}
                    <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
                      {post.body}
                    </p>

                    {/* Bottom row */}
                    <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                      {/* Tags */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {post.tags?.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 border-[#2c323f] bg-transparent font-normal"
                            style={{ color: tag.color, borderColor: `${tag.color}40` }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-[10px] text-gray-600 ml-auto">
                        <span className="flex items-center gap-1 hover:text-gray-400 transition-colors">
                          <MessageSquare className="h-3 w-3" />
                          {post.comments_count}
                          <span className="hidden sm:inline">comments</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.view_count}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Solved badge */}
                  {post.is_answered && (
                    <div className="hidden sm:flex flex-col justify-center">
                      <span className="text-[9px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded whitespace-nowrap">
                        SOLVED
                      </span>
                    </div>
                  )}

                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}