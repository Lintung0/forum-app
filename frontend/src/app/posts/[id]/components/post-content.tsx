'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PostDetail } from '../type';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Eye, MessageSquare, ChevronUp, ChevronDown, MoreHorizontal, Flag } from 'lucide-react';
import { BookmarkButton } from '@/features/bookmarks/components/bookmark-button';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ReportModal } from './report-modal';

interface PostContentProps {
  post: PostDetail;
  onVote: (type: 'upvote' | 'downvote') => void;
  isVoting: boolean;
}

export function PostContent({ post, onVote, isVoting }: PostContentProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: localeId,
  });

  const isUpvoted = post.user_vote === 'upvote';
  const isDownvoted = post.user_vote === 'downvote';

  const handleUpvote = () => {
    if (isVoting) return;
    onVote('upvote');
  };

  const handleDownvote = () => {
    if (isVoting) return;
    onVote('downvote');
  };

  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-[#0f1115] border border-[#1e2129] rounded-xl p-5 space-y-4 relative">
      
      <div className="flex items-center justify-between pb-2 border-b border-[#1e2129]">
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-gray-500">
          <span className="text-[#e95723] font-medium">{post.category?.name}</span>
          <span>•</span>
          <span>@{post.user.username}</span>
          <span>•</span>
          <span>{timeAgo}</span>
          {post.is_answered && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Solved
              </span>
            </>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-1 hover:bg-[#161b22] text-gray-500 hover:text-white rounded-md transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-1 w-36 bg-[#0f1115] border border-[#1e2129] rounded-lg shadow-xl py-1 z-10 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setShowReportModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>Laporkan Konten</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-xl font-bold text-white leading-snug">{post.title}</h1>

      <div className="flex gap-4 items-start pt-2">
        <div className="flex flex-col items-center gap-2 sticky top-4">
          <button
            onClick={handleUpvote}
            disabled={isVoting}
            className={cn(
              "p-1.5 rounded-full border border-[#1e2129] transition-colors",
              isUpvoted ? "bg-orange-500/10 text-orange-400 border-orange-500/30" : "text-gray-500 hover:bg-[#21262d] hover:text-white"
            )}
          >
            <ChevronUp className={cn("w-5 h-5", isUpvoted && "stroke-[3px]")} />
          </button>
          
          <span className={cn(
            "font-bold text-base min-w-[24px] text-center",
            isUpvoted ? "text-orange-400" : isDownvoted ? "text-blue-400" : "text-gray-300"
          )}>
            {post.vote_score}
          </span>

          <button
            onClick={handleDownvote}
            disabled={isVoting}
            className={cn(
              "p-1.5 rounded-full border border-[#1e2129] transition-colors",
              isDownvoted ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "text-gray-500 hover:bg-[#21262d] hover:text-white"
            )}
          >
            <ChevronDown className={cn("w-5 h-5", isDownvoted && "stroke-[3px]")} />
          </button>

          <div className="pt-2">
            <BookmarkButton
              postId={post.id}
              initialBookmarked={post.is_bookmarked ?? false}
              bookmarkId={post.bookmark_id}
            />
          </div>
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          <div
            className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {(post.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {post.tags!.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-[10px] px-2 py-0 h-5 border-[#2c323f] font-normal"
                  style={{ color: tag.color, borderColor: `${tag.color}40` }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-3 border-t border-[#1e2129] text-gray-500 text-xs pl-1">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" /> {post.comments_count} komentar
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" /> {post.view_count} views
        </span>
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={post.id}
        targetType="post"
      />

    </div>
  );
}