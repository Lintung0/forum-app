'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PostDetail } from '../type';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Eye, MessageSquare, ChevronUp, ChevronDown, MoreHorizontal, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookmarkButton } from '@/features/bookmarks/components/bookmark-button';
import { ReportModal } from './report-modal';

interface PostContentProps {
  post: PostDetail;
  onVote?: (type: 'upvote' | 'downvote') => Promise<void>;
  isVoting?: boolean;
}

export function PostContent({ post, onVote, isVoting: externalIsVoting }: PostContentProps) {
  const [isUpvoted, setIsUpvoted] = useState(post.user_vote === 'upvote');
  const [isDownvoted, setIsDownvoted] = useState(post.user_vote === 'downvote');
  const [internalIsVoting, setInternalIsVoting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isVoting = externalIsVoting ?? internalIsVoting;

  const timeAgo = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpvote = async () => {
    if (onVote) {
      await onVote('upvote');
      setIsUpvoted(!isUpvoted);
      setIsDownvoted(false);
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) return alert('Please login to vote');
    if (isVoting) return;
    setInternalIsVoting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/api/v1/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ target_id: post.id, target_type: 'post', vote_type: 'upvote' })
      });
      if (res.ok) {
        setIsUpvoted(!isUpvoted);
        setIsDownvoted(false);
        const json = await res.json();
        post.vote_score = json.data.vote_score;
      }
    } finally { setInternalIsVoting(false); }
  };

  const handleDownvote = async () => {
    if (onVote) {
      await onVote('downvote');
      setIsDownvoted(!isDownvoted);
      setIsUpvoted(false);
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) return alert('Please login to vote');
    if (isVoting) return;
    setInternalIsVoting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'}/api/v1/votes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ target_id: post.id, target_type: 'post', vote_type: 'downvote' })
      });
      if (res.ok) {
        setIsDownvoted(!isDownvoted);
        setIsUpvoted(false);
        const json = await res.json();
        post.vote_score = json.data.vote_score;
      }
    } finally { setInternalIsVoting(false); }
  };

  return (
    <div className="relative bg-[#0d0e12] border border-gray-800 rounded-xl p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800/50">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className="bg-[#e95723]/10 text-[#e95723] hover:bg-[#e95723]/20 px-3 py-1 rounded-md border border-[#e95723]/10 text-[10px] font-bold uppercase tracking-wider transition-all">
            d/{post.category?.slug}
          </Badge>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 border border-gray-800">
              <AvatarImage src={post.user.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gray-800 text-gray-500 font-bold text-[10px]">
                {post.user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white leading-none">@{post.user.username}</span>
              <span className="text-[9px] text-gray-500 font-medium uppercase mt-0.5">{timeAgo}</span>
            </div>
          </div>
          {post.is_answered && (
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/5 px-3 py-1 rounded-md border border-emerald-400/10">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-wider">SOLVED</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <BookmarkButton
            postId={post.id}
            initialBookmarked={post.is_bookmarked ?? false}
            bookmarkId={post.bookmark_id}
          />
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 flex items-center justify-center bg-gray-900 border border-gray-800 rounded-lg text-gray-500 hover:text-white transition-all"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0d0e12] border border-gray-800 rounded-xl shadow-xl py-1 z-20">
                <button
                  onClick={() => { setShowDropdown(false); setShowReportModal(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>Report Content</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex lg:flex-col items-center gap-2 p-1.5 bg-gray-900 border border-gray-800 rounded-lg shrink-0">
          <button
            onClick={handleUpvote}
            disabled={isVoting}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-md transition-all",
              isUpvoted ? "bg-[#e95723] text-white" : "text-gray-500 hover:text-gray-200 hover:bg-gray-800"
            )}
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          
          <span className={cn(
            "text-lg font-bold min-w-[32px] text-center tabular-nums",
            isUpvoted ? "text-[#e95723]" : isDownvoted ? "text-blue-400" : "text-gray-400"
          )}>
            {post.vote_score}
          </span>

          <button
            onClick={handleDownvote}
            disabled={isVoting}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-md transition-all",
              isDownvoted ? "bg-blue-500 text-white" : "text-gray-500 hover:text-gray-200 hover:bg-gray-800"
            )}
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 space-y-6 min-w-0">
          <h1 className="text-3xl font-black text-white leading-tight tracking-tight">{post.title}</h1>
          
          <div
            className="prose prose-invert prose-base max-w-none text-gray-300 leading-relaxed font-normal"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {(post.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags!.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border-gray-800 bg-gray-900 text-gray-400 hover:border-[#e95723]/40 hover:text-[#e95723] transition-all cursor-pointer rounded-md"
                  style={{ color: tag.color }}
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 pt-6 border-t border-gray-800/50 text-gray-500 text-[9px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
          <MessageSquare className="h-3.5 w-3.5 text-[#e95723]" />
          <span>{post.comments_count} Responses</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-800">
          <Eye className="h-3.5 w-3.5 text-purple-400" />
          <span>{post.view_count} Visuals</span>
        </div>
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