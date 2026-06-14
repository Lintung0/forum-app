'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface VoteBlockProps {
  score: number;
}

export function VoteBlock({ score }: VoteBlockProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const displayed = score + (vote === 'up' ? 1 : vote === 'down' ? -1 : 0);

  return (
    <div className="flex flex-col items-center gap-1 font-sans">
        <button
          type="button"
          onClick={() => setVote(vote === 'up' ? null : 'up')}
          className={`p-1 rounded transition-colors ${
            vote === 'up'
              ? 'text-[#e95723] bg-[#e95723]/10'
              : 'text-gray-500 hover:text-[#e95723] hover:bg-[#e95723]/10'
          }`}
        >
        <ArrowUp className="h-4 w-4" />
      </button>
      <span
        className={`text-xs font-bold tabular-nums min-w-[20px] text-center ${
          displayed > 0 ? 'text-[#e95723]' : displayed < 0 ? 'text-blue-400' : 'text-gray-400'
        }`}
      >
        {displayed}
      </span>
        <button
          type="button"
          onClick={() => setVote(vote === 'down' ? null : 'down')}
          className={`p-1 rounded transition-colors ${
            vote === 'down'
              ? 'text-blue-400 bg-blue-400/10'
              : 'text-gray-500 hover:text-blue-400 hover:bg-blue-400/10'
          }`}
        >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}