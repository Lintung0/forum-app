"use client";

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { voteApi, VoteType } from '../services/vote-api';
import { cn } from '@/lib/utils';

interface VoteCommentProps {
  commentId: string;
  initialScore: number;
  initialUserVote?: VoteType | null;
}

export const VoteComment: React.FC<VoteCommentProps> = ({ commentId, initialScore, initialUserVote }) => {
  const [score, setScore] = useState(initialScore);
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (type: VoteType) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const response = await voteApi(commentId, 'comment', type);
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
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('upvote')}
        disabled={isLoading}
        className={cn(
          "p-1 rounded-md transition-colors",
          userVote === 'upvote' ? "text-orange-400 bg-orange-500/10" : "text-gray-500 hover:text-gray-300 hover:bg-[#21262d]"
        )}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      
      <span className={cn(
        "text-sm font-semibold min-w-[1rem] text-center",
        userVote === 'upvote' ? "text-orange-400" : userVote === 'downvote' ? "text-blue-400" : "text-gray-400"
      )}>
        {score}
      </span>

      <button
        onClick={() => handleVote('downvote')}
        disabled={isLoading}
        className={cn(
          "p-1 rounded-md transition-colors",
          userVote === 'downvote' ? "text-blue-400 bg-blue-500/10" : "text-gray-500 hover:text-gray-300 hover:bg-[#21262d]"
        )}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
};
