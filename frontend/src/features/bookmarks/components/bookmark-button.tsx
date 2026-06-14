"use client";

import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { addBookmarkApi, removeBookmarkApi, fetchBookmarksApi } from '../services/bookmark-api';
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

  useEffect(() => {
    setBookmarked(initialBookmarked);
    setBookmarkId(initialBookmarkId || null);
  }, [initialBookmarked, initialBookmarkId]);

  const syncBookmarkStatus = async () => {
    try {
      const res = await fetchBookmarksApi();
      const list = res?.data?.data || res?.data || [];
      const found = list.find((item: any) => item.post_id === postId || item.post?.id === postId);
      if (found) {
        setBookmarked(true);
        setBookmarkId(found.id);
        return found.id;
      }
    } catch (e) {
      console.warn("Gagal sinkronisasi data daftar bookmark");
    }
    return null;
  };

  const handleBookmark = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (bookmarked) {
        let currentId = bookmarkId;
        if (!currentId) {
          currentId = await syncBookmarkStatus();
        }

        if (currentId) {
          await removeBookmarkApi(currentId);
          setBookmarked(false);
          setBookmarkId(null);
        } else {
          setBookmarked(false);
        }
      } else {
        try {
          const response = await addBookmarkApi(postId);
          setBookmarked(true);
          const newId = response?.data?.id || response?.id;
          if (newId) setBookmarkId(newId);
        } catch (err: any) {
          if (err.response?.status === 422) {
            setBookmarked(true);
            await syncBookmarkStatus();
          } else {
            throw err;
          }
        }
      }
    } catch (error) {
      console.error("Gagal mengubah status bookmark:", error);
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