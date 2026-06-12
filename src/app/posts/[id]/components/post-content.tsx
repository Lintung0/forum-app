'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Share2, Flag, Eye, MessageSquare, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { PostDetail } from '../type';
import { VoteBlock } from './vote-block';

interface PostContentProps {
  post: PostDetail;
}

export function PostContent({ post }: PostContentProps) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <Card className="bg-[#13151a] border border-[#1e222b] rounded-xl overflow-hidden w-full">
      <div className="flex">
        {/* Side Actions Area */}
        <div className="flex flex-col items-center gap-1 bg-[#0f1115] px-2.5 py-4 border-r border-[#1e222b]">
          <VoteBlock score={post.vote_score ?? 0} />
          <Separator className="bg-[#1e222b] my-1 w-full" />
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className={`p-1 rounded transition-colors ${
              bookmarked ? 'text-[#e95723]' : 'text-gray-500 hover:text-[#e95723]'
            }`}
          >
            <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button className="p-1 rounded text-gray-500 hover:text-gray-300 transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
          <button className="p-1 rounded text-gray-500 hover:text-gray-300 transition-colors">
            <Flag className="h-4 w-4" />
          </button>
        </div>

        {/* Text Details Area */}
        <div className="flex-1 p-5 space-y-4 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <Avatar className="w-5 h-5">
              <AvatarImage src={post.user?.avatar_url ?? undefined} />
              <AvatarFallback className="text-[10px] bg-[#2c323f] text-gray-300 font-bold">
                {post.user?.username?.[0]?.toUpperCase() ?? 'A'}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-gray-300">@{post.user?.username ?? 'author'}</span>
            <span className="text-[9px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1 py-0.2 rounded">
              Expert
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">2d ago</span>
            {post.category && (
              <>
                <span className="text-gray-600">in</span>
                <span className="text-[#e95723] font-semibold">{post.category.name}</span>
              </>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-snug flex-1">
                {post.title}
              </h1>
              {post.is_answered && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-[10px] px-2 py-0 h-4 border-[#2c323f] bg-transparent font-medium tracking-wide uppercase"
                    style={{ color: tag.color, borderColor: `${tag.color}40` }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator className="bg-[#1e222b]" />

          <p className="text-sm text-gray-300 font-normal leading-relaxed whitespace-pre-line">
            {post.body}
          </p>

          <div className="flex items-center gap-4 text-[10px] font-medium text-gray-400 pt-1 tracking-wide">
            <span className="flex items-center gap-1 tabular-nums">
              <Eye className="h-3 w-3 text-gray-500" /> {post.view_count ?? 0} views
            </span>
            <span className="flex items-center gap-1 tabular-nums">
              <MessageSquare className="h-3 w-3 text-gray-500" /> {post.comments?.length ?? 0} responses
            </span>
            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors ml-auto">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}