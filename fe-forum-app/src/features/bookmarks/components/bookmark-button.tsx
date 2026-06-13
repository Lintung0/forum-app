"use client";

import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { addBookmarkApi, removeBookmarkApi } from '../services/bookmark-api';
import { cn } from '@/lib/utils';

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked: boolean;
  bookmarkId?: string | null;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  postId, 
  initialBookmarked, 
  bookmarkId: initialBookmarkId 
}) => {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [bookmarkId, setBookmarkId] = useState<string | null>(initialBookmarkId || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBookmark = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (bookmarked && bookmarkId) {
        await removeBookmarkApi(bookmarkId);
        setBookmarked(false);
        setBookmarkId(null);
      } else {
        const response = await addBookmarkApi(postId);
        setBookmarked(true);
        setBookmarkId(response.data.id);
      }
    } catch (error) {
      console.error("Gagal mengubah bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={cn(
        "p-2 rounded-lg transition-colors",
        bookmarked 
          ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" 
          : "text-gray-400 bg-[#21262d] hover:bg-[#30363d] hover:text-white border border-transparent"
      )}
      title={bookmarked ? "Hapus dari Bookmark" : "Simpan ke Bookmark"}
    >
      <Bookmark className={cn("w-5 h-5", bookmarked && "fill-current")} />
    </button>
  );
};
