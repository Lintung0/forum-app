"use client";

import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { toggleLikePostApi, toggleLikeCommentApi } from '../services/like-api';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  targetId: string;
  targetType: 'post' | 'comment';
  postId?: string; // required if targetType is comment
  initialLiked: boolean;
  initialLikesCount: number;
  showCount?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ 
  targetId, 
  targetType, 
  postId, 
  initialLiked, 
  initialLikesCount,
  showCount = true
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      let response;
      if (targetType === 'post') {
        response = await toggleLikePostApi(targetId);
      } else if (targetType === 'comment' && postId) {
        response = await toggleLikeCommentApi(postId, targetId);
      } else {
        throw new Error("Invalid target type or missing postId for comment");
      }
      
      setLiked(response.data.liked);
      setLikesCount(response.data.likes_count);
    } catch (error) {
      console.error("Gagal melakukan like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm",
        liked 
          ? "bg-pink-500/10 text-pink-500 border border-pink-500/20" 
          : "text-gray-400 bg-[#21262d] hover:bg-[#30363d] hover:text-white border border-transparent"
      )}
    >
      <Heart className={cn("w-4 h-4", liked && "fill-current")} />
      {showCount && <span>{likesCount}</span>}
    </button>
  );
};
