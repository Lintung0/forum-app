"use client";

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { voteApi, VoteType } from '../services/vote-api';
import { cn } from '@/lib/utils';

interface VotePostProps {
  postId: string;
  initialScore: number;
  initialUserVote?: VoteType | null;
}

export const VotePost: React.FC<VotePostProps> = ({ postId, initialScore, initialUserVote }) => {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (type: VoteType) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await voteApi(postId, 'post', type);
      setScore(response.data.vote_score);
      
      
      if (userVote === type) {
        setUserVote(null);
      } else {
        setUserVote(type);
      }
    } catch (error) {
      console.error("Gagal melakukan vote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          userVote === 'upvote' ? "bg-orange-500/10 text-orange-400" : "text-gray-500 hover:bg-[#21262d] hover:text-white"
        )}
      >
        <ChevronUp className={cn("w-6 h-6", userVote === 'upvote' && "stroke-[3px]")} />
      </button>
      
      <span className={cn(
        "font-bold text-lg",
        userVote === 'upvote' ? "text-orange-400" : userVote === 'downvote' ? "text-blue-400" : "text-gray-300"
      )}>
        {score}
      </span>

      <button
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        className={cn(
          "p-1.5 rounded-lg transition-colors",
          userVote === 'downvote' ? "bg-blue-500/10 text-blue-400" : "text-gray-500 hover:bg-[#21262d] hover:text-white"
        )}
      >
        <ChevronDown className={cn("w-6 h-6", userVote === 'downvote' && "stroke-[3px]")} />
      </button>
    </div>
  );
};
