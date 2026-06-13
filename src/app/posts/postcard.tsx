'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, MessageSquare, Eye, CheckCircle2 } from 'lucide-react';
import { PostSummary } from './type';

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

export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link href={`/posts/${post.id}`} className="block group">
      <Card className="
        bg-[#13151a] border border-[#1e222b]
        hover:border-[#e95723]/30 hover:bg-[#16181d]
        transition-all duration-150 rounded-lg overflow-hidden
      ">
        <div className="flex gap-3 p-3">
          <VoteBox score={post.vote_score} />
          <div className="flex-1 min-w-0 space-y-1.5">
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

            <div className="flex items-start gap-2">
              <h2 className="text-sm font-semibold text-gray-100 leading-snug group-hover:text-white transition-colors line-clamp-2">
                {post.title}
              </h2>
              {post.is_answered && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
            </div>

            <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
              {post.body}
            </p>

            <div className="flex items-center gap-3 pt-0.5 flex-wrap">
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
  );
}