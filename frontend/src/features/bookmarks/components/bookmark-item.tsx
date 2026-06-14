"use client";

import React from 'react';
import { Trash2, ArrowUp, MessageSquare, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BookmarkItemData {
  id: string;
  title: string;
  author: string;
  timeAgo: string;
  category: string;
  tags: string[];
  votes: number;
  comments: number;
  views: number;
}

interface BookmarkItemProps {
  item: BookmarkItemData;
  onRemove: () => void;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({ item, onRemove }) => {
  return (
    <div className="bg-[#161b22]/40 border border-gray-800 rounded-xl p-5 hover:border-gray-700/80 transition-all space-y-4">
      
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white hover:text-orange-400 cursor-pointer transition-colors leading-snug">
            {item.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
            <span className="text-gray-300 font-medium">{item.author}</span>
            <span>•</span>
            <span>{item.timeAgo}</span>
            <span>•</span>
            <span className="px-2 py-0.5 text-xs bg-[#21262d] text-orange-400 border border-orange-500/20 rounded-md font-medium">
              {item.category}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {item.tags.map((tag, idx) => (
          <span 
            key={idx} 
            className="px-2.5 py-0.5 text-xs bg-[#21262d] text-gray-300 rounded-md hover:bg-[#30363d] cursor-pointer"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-800/60 pt-3 text-sm text-gray-400">
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
            <ArrowUp className="w-4 h-4 text-gray-500" />
            <span>{item.votes}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <span>{item.comments}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-gray-500" />
            <span>{item.views}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg gap-2 font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Hapus
        </Button>
      </div>

    </div>
  );
};